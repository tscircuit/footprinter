import { z } from "zod"
import { length, type AnyCircuitElement } from "circuit-json"
import { platedhole } from "../helpers/platedhole"
import { platedHoleWithRectPad } from "../helpers/platedHoleWithRectPad"
import { rectpad } from "../helpers/rectpad"
import { silkscreenRef, type SilkscreenRef } from "src/helpers/silkscreenRef"
import { silkscreenPin } from "src/helpers/silkscreenPin"
import { determinePinlabelAnchorSide } from "src/helpers/determine-pin-label-anchor-side"
import { base_def } from "../helpers/zod/base_def"
import { silkscreenpath } from "../helpers/silkscreenpath"

export const mountedpcbmodule_def = base_def
  .extend({
    fn: z.string(),
    num_pins: z.number().optional().default(5),
    rows: z
      .union([z.string(), z.number()])
      .transform((val) => Number(val))
      .optional()
      .default(1)
      .describe("number of rows"),
    p: length.default("2.54mm").describe("pitch"),
    id: length.default("1.0mm").describe("inner diameter"),
    od: length.default("1.5mm").describe("outer diameter"),
    male: z.boolean().optional().describe("for male pin headers"),
    female: z.boolean().optional().describe("for female pin headers"),
    smd: z.boolean().optional().describe("surface mount device"),
    surfacemount: z
      .boolean()
      .optional()
      .describe("surface mount device (verbose)"),
    pinlabeltextalignleft: z.boolean().optional().default(false),
    pinlabeltextaligncenter: z.boolean().optional().default(false),
    pinlabeltextalignright: z.boolean().optional().default(false),
    pinlabelverticallyinverted: z.boolean().optional().default(false),
    pinlabelorthogonal: z.boolean().optional().default(false),
    nopinlabels: z
      .boolean()
      .optional()
      .default(false)
      .describe("omit silkscreen pin labels"),
    doublesidedpinlabel: z
      .boolean()
      .optional()
      .default(false)
      .describe("add silkscreen pins in top and bottom layers"),
    bottomsidepinlabel: z
      .boolean()
      .optional()
      .default(false)
      .describe(
        "place the silkscreen reference text on the bottom layer instead of top",
      ),
    pin_row_side: z
      .enum(["left", "right", "top", "bottom"])
      .optional()
      .default("left"),
    pinrowleft: z.boolean().optional().default(false),
    pinrowright: z.boolean().optional().default(false),
    pinrowtop: z.boolean().optional().default(false),
    pinrowbottom: z.boolean().optional().default(false),
    width: length.default("10mm"),
    height: length.default("10mm"),
    pin_row_hole_edge_to_edge_dist: length.default("2mm"),
    holes: z
      .union([z.string(), z.array(z.string())])
      .optional()
      .transform((val) => {
        if (!val) return val
        if (Array.isArray(val)) return val
        if (val.startsWith("(") && val.endsWith(")")) {
          return val
            .slice(1, -1)
            .split(",")
            .map((s) => s.trim())
        }
        return [val]
      }),
    hole_x_dist: length.optional(),
    hole_y_dist: length.optional(),
    pinrow: z.union([z.string(), z.number()]).optional(),
  })
  .transform((data) => {
    const pinlabelAnchorSide = determinePinlabelAnchorSide(data)
    let pin_row_side = data.pin_row_side
    if (data.pinrowleft) pin_row_side = "left"
    if (data.pinrowright) pin_row_side = "right"
    if (data.pinrowtop) pin_row_side = "top"
    if (data.pinrowbottom) pin_row_side = "bottom"

    if (data.pinrow !== undefined) {
      data.num_pins = Number(data.pinrow)
    }

    return {
      ...data,
      pinlabelAnchorSide,
      pin_row_side,
      male: data.male ?? !data.female,
      female: data.female ?? false,
      smd: data.smd ?? data.surfacemount ?? false,
    }
  })
  .superRefine((data, ctx) => {
    if (data.male && data.female) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          "'male' and 'female' cannot both be true; it should be male or female.",
        path: ["male", "female"],
      })
    }
  })

export const mountedpcbmodule = (
  raw_params: z.input<typeof mountedpcbmodule_def>,
): { circuitJson: AnyCircuitElement[]; parameters: any } => {
  const parameters = mountedpcbmodule_def.parse(raw_params)
  const {
    p,
    id,
    od,
    rows,
    num_pins,
    pinlabelAnchorSide,
    pinlabelverticallyinverted,
    pinlabelorthogonal,
    pinlabeltextalignleft,
    pinlabeltextalignright,
    nopinlabels,
    doublesidedpinlabel,
    bottomsidepinlabel,
    pin_row_side,
    width,
    height,
    pin_row_hole_edge_to_edge_dist,
    holes,
    hole_x_dist,
    hole_y_dist,
  } = parameters
  let pinlabelTextAlign: "center" | "left" | "right" = "center"
  if (pinlabeltextalignleft) pinlabelTextAlign = "left"
  else if (pinlabeltextalignright) pinlabelTextAlign = "right"

  const elements: AnyCircuitElement[] = []

  // Calculate pin positions
  const pinSpacing = p
  let pinStartX = 0
  let pinStartY = 0
  let pinDirectionX = 0
  let pinDirectionY = 0
  let rowDirectionX = 0
  let rowDirectionY = 0

  const numPinsPerRow = Math.ceil(num_pins / rows)

  // Determine pin row orientation
  if (pin_row_side === "left" || pin_row_side === "right") {
    pinStartX =
      pin_row_side === "left"
        ? -width / 2 - pin_row_hole_edge_to_edge_dist
        : width / 2 + pin_row_hole_edge_to_edge_dist
    pinStartY = ((numPinsPerRow - 1) / 2) * pinSpacing
    pinDirectionX = 0
    pinDirectionY = -pinSpacing
    rowDirectionX = pin_row_side === "left" ? pinSpacing : -pinSpacing // stack towards center
    rowDirectionY = 0
  } else {
    // top or bottom
    pinStartX = (-(numPinsPerRow - 1) / 2) * pinSpacing
    pinStartY =
      pin_row_side === "top"
        ? height / 2 + pin_row_hole_edge_to_edge_dist
        : -height / 2 - pin_row_hole_edge_to_edge_dist
    pinDirectionX = pinSpacing
    pinDirectionY = 0
    rowDirectionX = 0
    rowDirectionY = pin_row_side === "top" ? pinSpacing : -pinSpacing // stack away from center
  }

  // Add pins
  let pinNumber = 1
  for (let row = 0; row < rows && pinNumber <= num_pins; row++) {
    for (let col = 0; col < numPinsPerRow && pinNumber <= num_pins; col++) {
      const xoff = pinStartX + col * pinDirectionX + row * rowDirectionX
      const yoff = pinStartY + col * pinDirectionY + row * rowDirectionY

      if (parameters.smd) {
        // SMD pads
        elements.push(
          rectpad(pinNumber, xoff, yoff, parameters.od, parameters.od),
        ) // Assuming pw/pl same as od for simplicity
      } else {
        // Through-hole
        if (pinNumber === 1) {
          elements.push(
            platedHoleWithRectPad({
              pn: pinNumber,
              x: xoff,
              y: yoff,
              holeDiameter: id,
              rectPadWidth: od,
              rectPadHeight: od,
            }),
          )
        } else {
          elements.push(platedhole(pinNumber, xoff, yoff, id, od))
        }
      }

      if (!nopinlabels) {
        const anchor_x =
          xoff +
          (pin_row_side === "left" ? -od : pin_row_side === "right" ? od : 0)
        const anchor_y =
          yoff +
          (pin_row_side === "top" ? od : pin_row_side === "bottom" ? -od : 0)
        if (!bottomsidepinlabel) {
          elements.push(
            silkscreenPin({
              fs: od / 5,
              pn: pinNumber,
              anchor_x,
              anchor_y,
              anchorplacement: pinlabelAnchorSide,
              textalign: pinlabelTextAlign,
              orthogonal: pinlabelorthogonal,
              verticallyinverted: pinlabelverticallyinverted,
              layer: "top",
            }),
          )
        }
        if (doublesidedpinlabel || bottomsidepinlabel) {
          elements.push(
            silkscreenPin({
              fs: od / 5,
              pn: pinNumber,
              anchor_x,
              anchor_y,
              anchorplacement: pinlabelAnchorSide,
              textalign: pinlabelTextAlign,
              orthogonal: pinlabelorthogonal,
              verticallyinverted: pinlabelverticallyinverted,
              layer: "bottom",
            }),
          )
        }
      }

      pinNumber++
    }
  }

  // Add mounting holes
  if (holes) {
    for (const pos of holes) {
      let hx = 0
      let hy = 0
      if (pos === "topleft") {
        hx = -width / 2
        hy = height / 2
      } else if (pos === "topright") {
        hx = width / 2
        hy = height / 2
      } else if (pos === "bottomleft") {
        hx = -width / 2
        hy = -height / 2
      } else if (pos === "bottomright") {
        hx = width / 2
        hy = -height / 2
      } else if (pos === "center") {
        hx = 0
        hy = 0
      }
      // If hole_x_dist/hole_y_dist provided, use as offsets
      if (hole_x_dist !== undefined) hx += hole_x_dist
      if (hole_y_dist !== undefined) hy += hole_y_dist
      elements.push(
        platedhole(num_pins + holes.indexOf(pos) + 1, hx, hy, id, od),
      )
    }
  }

  // Add silkscreen outline
  if (!parameters.nosilkscreen) {
    const outline = [
      { x: -width / 2, y: -height / 2 },
      { x: width / 2, y: -height / 2 },
      { x: width / 2, y: height / 2 },
      { x: -width / 2, y: height / 2 },
      { x: -width / 2, y: -height / 2 },
    ]
    elements.push(silkscreenpath(outline, { stroke_width: 0.1, layer: "top" }))
  }

  // Add silkscreen reference text
  const refText: SilkscreenRef = silkscreenRef(0, height / 2 + 1, 0.5)
  elements.push(refText)

  return {
    circuitJson: elements,
    parameters,
  }
}
