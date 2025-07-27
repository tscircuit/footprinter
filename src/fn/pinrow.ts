import { z } from "zod"
import { length, rotation, type AnySoupElement } from "circuit-json"
import { platedhole } from "../helpers/platedhole"
import { platedHoleWithRectPad } from "../helpers/platedHoleWithRectPad"
import { silkscreenRef, type SilkscreenRef } from "src/helpers/silkscreenRef"
import { silkscreenPin } from "src/helpers/silkscreenPin"
import { mm } from "@tscircuit/mm"
import { determinePinlabelAnchorSide } from "src/helpers/determine-pin-label-anchor-side"
import { pin_order_specifier } from "src/helpers/zod/pin-order-specifier"

export const pinrow_def = z
  .object({
    fn: z.string(),
    num_pins: z.number().optional().default(6),
    rows: z
      .union([z.string(), z.number()])
      .transform((val) => Number(val))
      .optional()
      .default(1)
      .describe("number of rows"),
    p: length.default("0.1in").describe("pitch"),
    id: length.default("1.0mm").describe("inner diameter"),
    od: length.default("1.5mm").describe("outer diameter"),
    male: z.boolean().optional().describe("for male pin headers"),
    female: z.boolean().optional().describe("for female pin headers"),
    pinlabeltextalignleft: z.boolean().optional().default(false),
    pinlabeltextaligncenter: z.boolean().optional().default(false),
    pinlabeltextalignright: z.boolean().optional().default(false),
    pinlabelverticallyinverted: z.boolean().optional().default(false),
    pinlabelorthogonal: z.boolean().optional().default(false),
    startingpin: z
      .string()
      .or(z.array(pin_order_specifier))
      .transform((a) => (typeof a === "string" ? a.slice(1, -1).split(",") : a))
      .pipe(z.array(pin_order_specifier))
      .optional(),
    nosquareplating: z
      .boolean()
      .optional()
      .default(false)
      .describe("do not use rectangular pad for pin 1"),
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
  })
  .transform((data) => {
    const pinlabelAnchorSide = determinePinlabelAnchorSide(data)
    return {
      ...data,
      pinlabelAnchorSide,
      male: data.male ?? (data.female ? false : true),
      female: data.female ?? false,
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

export const pinrow = (
  raw_params: z.input<typeof pinrow_def>,
): { circuitJson: AnySoupElement[]; parameters: any } => {
  const parameters = pinrow_def.parse(raw_params)
  const {
    p,
    id,
    od,
    rows,
    num_pins,
    startingpin,
    pinlabelAnchorSide,
    pinlabelverticallyinverted,
    pinlabelorthogonal,
    pinlabeltextalignleft,
    pinlabeltextalignright,
    nopinlabels,
    doublesidedpinlabel,
    bottomsidepinlabel,
  } = parameters
  let pinlabelTextAlign: "center" | "left" | "right" = "center"
  if (pinlabeltextalignleft) pinlabelTextAlign = "left"
  else if (pinlabeltextalignright) pinlabelTextAlign = "right"

  const holes: AnySoupElement[] = []
  const positions: { x: number; y: number }[] = []
  const numPinsPerRow = Math.ceil(num_pins / rows)
  const ySpacing = -p

  const calculateAnchorPosition = ({
    xoff,
    yoff,
    od,
    anchorSide,
  }: {
    xoff: number
    yoff: number
    od: number
    anchorSide: "top" | "bottom" | "left" | "right"
  }): { anchor_x: number; anchor_y: number } => {
    let dx = 0,
      dy = 0
    const offset = od * 0.75
    switch (anchorSide) {
      case "right":
        dx = offset
        break
      case "top":
        dy = offset
        break
      case "bottom":
        dy = -offset
        break
      case "left":
        dx = -offset
        break
    }
    return { anchor_x: xoff + dx, anchor_y: yoff + dy }
  }

  // Helper to add plated hole and silkscreen label
  const addPin = (pinNumber: number, xoff: number, yoff: number) => {
    if (pinNumber === 1 && !parameters.nosquareplating) {
      // Always use square plating for pin 1 (no need to check nosquareplating anymore)
      holes.push(platedHoleWithRectPad(pinNumber, xoff, yoff, id, od, od))
    } else {
      // Other pins with standard circular pad
      holes.push(platedhole(pinNumber, xoff, yoff, id, od))
    }
    const { anchor_x, anchor_y } = calculateAnchorPosition({
      xoff,
      yoff,
      od,
      anchorSide: pinlabelAnchorSide,
    })
    if (!nopinlabels) {
      if (!bottomsidepinlabel) {
        holes.push(
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
      } else {
        holes.push(
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
      if (doublesidedpinlabel) {
        holes.push(
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
  }

  const getStartingIndex = (
    posArr: { x: number; y: number }[],
    starting: z.infer<typeof pin_order_specifier>[] | undefined,
  ): number => {
    if (!starting || starting.length === 0) return 0

    const flags: Record<
      z.infer<typeof pin_order_specifier>,
      boolean
    > = {} as any
    for (const s of starting) flags[s] = true

    if (
      !flags.leftside &&
      !flags.topside &&
      !flags.rightside &&
      !flags.bottomside
    )
      flags.leftside = true

    if (
      !flags.toppin &&
      !flags.bottompin &&
      !flags.leftpin &&
      !flags.rightpin
    ) {
      if (flags.leftside) flags.toppin = true
      else if (flags.topside) flags.rightpin = true
      else if (flags.rightside) flags.bottompin = true
      else if (flags.bottomside) flags.leftpin = true
    }

    const xs = posArr.map((p) => p.x)
    const ys = posArr.map((p) => p.y)
    const minX = Math.min(...xs)
    const maxX = Math.max(...xs)
    const minY = Math.min(...ys)
    const maxY = Math.max(...ys)
    const eps = 1e-6

    for (let i = 0; i < posArr.length; i++) {
      const { x, y } = posArr[i]
      const onLeft = Math.abs(x - minX) < eps
      const onRight = Math.abs(x - maxX) < eps
      const onBottom = Math.abs(y - minY) < eps
      const onTop = Math.abs(y - maxY) < eps
      let side: z.infer<typeof pin_order_specifier> | undefined
      let pin: z.infer<typeof pin_order_specifier> | undefined
      if (onLeft) {
        side = "leftside"
        pin = onTop ? "toppin" : onBottom ? "bottompin" : undefined
      } else if (onRight) {
        side = "rightside"
        pin = onTop ? "toppin" : onBottom ? "bottompin" : undefined
      } else if (onBottom) {
        side = "bottomside"
        pin = onLeft ? "leftpin" : onRight ? "rightpin" : undefined
      } else if (onTop) {
        side = "topside"
        pin = onLeft ? "leftpin" : onRight ? "rightpin" : undefined
      }
      if (side && pin && flags[side] && flags[pin]) return i
    }
    return 0
  }

  // Track used positions to prevent overlaps
  const usedPositions = new Set<string>()

  // Check if BGA-style numbering should be used
  const useBGAStyle = rows > 2 && numPinsPerRow > 2

  if (rows === 1) {
    // Single row: left to right, pin 1 to num_pins
    const xStart = -((num_pins - 1) / 2) * p
    for (let i = 0; i < num_pins; i++) {
      const xoff = xStart + i * p
      const posKey = `${xoff},${0}`
      if (usedPositions.has(posKey)) throw new Error(`Overlap at ${posKey}`)
      usedPositions.add(posKey)
      positions.push({ x: xoff, y: 0 })
    }
  } else if (useBGAStyle) {
    // BGA-style: row-major numbering (left to right, top to bottom)
    const xStart = -((numPinsPerRow - 1) / 2) * p
    for (let row = 0; row < rows && positions.length < num_pins; row++) {
      for (
        let col = 0;
        col < numPinsPerRow && positions.length < num_pins;
        col++
      ) {
        const xoff = xStart + col * p
        const yoff = row * ySpacing
        const posKey = `${xoff},${yoff}`
        if (usedPositions.has(posKey)) throw new Error(`Overlap at ${posKey}`)
        usedPositions.add(posKey)
        positions.push({ x: xoff, y: yoff })
      }
    }
  } else {
    // Multi-row: counterclockwise spiral traversal
    const xStart = -((numPinsPerRow - 1) / 2) * p
    let top = 0
    let bottom = rows - 1
    let left = 0
    let right = numPinsPerRow - 1

    while (positions.length < num_pins && top <= bottom && left <= right) {
      // Left column: top to bottom
      for (let row = top; row <= bottom && positions.length < num_pins; row++) {
        const xoff = xStart + left * p
        const yoff = row * ySpacing
        const posKey = `${xoff},${yoff}`
        if (usedPositions.has(posKey)) throw new Error(`Overlap at ${posKey}`)
        usedPositions.add(posKey)
        positions.push({ x: xoff, y: yoff })
      }
      left++

      // Bottom row: left to right
      for (let col = left; col <= right && positions.length < num_pins; col++) {
        const xoff = xStart + col * p
        const yoff = bottom * ySpacing
        const posKey = `${xoff},${yoff}`
        if (usedPositions.has(posKey)) throw new Error(`Overlap at ${posKey}`)
        usedPositions.add(posKey)
        positions.push({ x: xoff, y: yoff })
      }
      bottom--

      if (left <= right) {
        // Right column: bottom to top
        for (
          let row = bottom;
          row >= top && positions.length < num_pins;
          row--
        ) {
          const xoff = xStart + right * p
          const yoff = row * ySpacing
          const posKey = `${xoff},${yoff}`
          if (usedPositions.has(posKey)) throw new Error(`Overlap at ${posKey}`)
          usedPositions.add(posKey)
          positions.push({ x: xoff, y: yoff })
        }
        right--
      }

      if (top <= bottom) {
        // Top row: right to left
        for (
          let col = right;
          col >= left && positions.length < num_pins;
          col--
        ) {
          const xoff = xStart + col * p
          const yoff = top * ySpacing
          const posKey = `${xoff},${yoff}`
          if (usedPositions.has(posKey)) throw new Error(`Overlap at ${posKey}`)
          usedPositions.add(posKey)
          positions.push({ x: xoff, y: yoff })
        }
        top++
      }
    }

    // Verify all pins were assigned
    if (positions.length < num_pins) {
      throw new Error(
        `Missing pins: assigned ${positions.length}, expected ${num_pins}`,
      )
    }
  }

  const startIndex = getStartingIndex(positions, startingpin)
  positions.forEach(({ x, y }, idx) => {
    const pinNumber = ((idx - startIndex + num_pins) % num_pins) + 1
    addPin(pinNumber, x, y)
  })

  // Add centered silkscreen reference text
  const refText: SilkscreenRef = silkscreenRef(0, p, 0.5)

  return {
    circuitJson: [...holes, refText],
    parameters,
  }
}
