import { type AnyCircuitElement, length } from "circuit-json"
import { z } from "zod"
import { hardKeepoutRect } from "../helpers/hard-keepout-rect"
import { rectpad } from "../helpers/rectpad"
import { base_def } from "../helpers/zod/base_def"

// Strict decimal lengths: partial length parses must not shrink a restriction.
const dimension = z
  .union([
    z.number(),
    z
      .string()
      .trim()
      .regex(
        /^[+-]?(?:\d+(?:\.\d*)?|\.\d+)\s*(?:nm|[µμu]m|mm|cm|dm|m|km|in|ft|yd|mi|mil|IN|FT)?$/,
        "U.FL dimensions must be decimal lengths",
      ),
  ])
  .pipe(length)
  .refine(Number.isFinite, "U.FL dimensions must be finite")
const size = dimension.refine(
  (value) => value > 0,
  "dimension must be positive",
)

export const ufl_def = base_def
  .extend({
    fn: z.literal("ufl"),
    num_pins: z.literal(3).default(3),
    p: size.default("2.95mm").describe("ground-land center pitch"),
    pw: size.default("2.2mm").describe("ground-land width"),
    ph: size.default("1.05mm").describe("ground-land height"),
    signalw: size.default("1.05mm").describe("signal-land width"),
    signalh: size.default("1mm").describe("signal-land height"),
    signalx: dimension
      .default("-1.525mm")
      .describe("signal center from ground-row datum"),
  })
  .superRefine(({ p, pw, ph, signalw, signalh, signalx }, ctx) => {
    if (p <= ph || signalh >= p - ph) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "U.FL signal land must fit between separated ground lands",
      })
    }
    if (
      signalx - signalw / 2 > -pw / 2 ||
      signalx + signalw / 2 <= -pw / 2 ||
      signalx + signalw / 2 >= pw / 2
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          "U.FL signal land must enter the left edge of the ground-land gap",
      })
    }
  })

export const ufl = (
  rawParams: z.input<typeof ufl_def>,
): {
  circuitJson: AnyCircuitElement[]
  parameters: z.output<typeof ufl_def>
} => {
  const parameters = ufl_def.parse(rawParams)
  const { p, pw, ph, signalw, signalh, signalx } = parameters
  const clean = (value: number) => Number(value.toFixed(12))
  const left = Math.min(-pw / 2, signalx - signalw / 2)
  const offset = -(left + pw / 2) / 2
  const gapLeft = -pw / 2
  const gapRight = pw / 2
  const gapHeight = p - ph
  const signalRight = signalx + signalw / 2
  const shoulderWidth = signalRight - gapLeft
  const shoulderHeight = (gapHeight - signalh) / 2

  // Hirose U.FL catalog p3: no conductive traces in the central ground gap.
  // The warning arrow is not a dimensioned closed polygon. This conservative
  // interpretation covers the dimensioned gap, subtracting signal copper.
  const keepouts = [
    hardKeepoutRect(
      clean((signalRight + gapRight) / 2 + offset),
      0,
      clean(gapRight - signalRight),
      clean(gapHeight),
    ),
    ...[1, -1].map((side) =>
      hardKeepoutRect(
        clean((gapLeft + signalRight) / 2 + offset),
        clean(side * (signalh / 2 + shoulderHeight / 2)),
        clean(shoulderWidth),
        clean(shoulderHeight),
      ),
    ),
  ]

  return {
    circuitJson: [
      rectpad(1, clean(offset), clean(p / 2), pw, ph),
      rectpad(2, clean(signalx + offset), 0, signalw, signalh),
      rectpad(3, clean(offset), clean(-p / 2), pw, ph),
      ...keepouts,
    ],
    parameters,
  }
}
