import { type AnyCircuitElement, length } from "circuit-json"
import { determinePinlabelAnchorSide } from "src/helpers/determine-pin-label-anchor-side"
import { silkscreenPin } from "src/helpers/silkscreenPin"
import { type SilkscreenRef, silkscreenRef } from "src/helpers/silkscreenRef"
import { z } from "zod"
import { platedHoleWithRectPad } from "../helpers/platedHoleWithRectPad"
import { platedhole } from "../helpers/platedhole"
import { rectpad } from "../helpers/rectpad"
import { silkscreenpath } from "../helpers/silkscreenpath"
import { base_def } from "../helpers/zod/base_def"

export const mountedpcbmodule_def = base_def
  .extend({
    fn: z.string(),
    numPins: z.number().optional().default(0),
    rows: z
      .union([z.string(), z.number()])
      .transform((val) => Number(val))
      .optional()
      .default(1)
      .describe("number of rows"),
    p: length.default("2.54mm").describe("pitch"),
    id: length.default("1.0mm").describe("inner diameter"),
    od: length.default("1.5mm").describe("outer diameter"),
    male: z.boolean().optional().describe("the module uses male headers"),
    female: z.boolean().optional().describe("the module uses female headers"),
    smd: z.boolean().optional().describe("surface mount device"),
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
    pinRowSide: z
      .enum(["left", "right", "top", "bottom"])
      .optional()
      .default("left"),
    pinrowleft: z.boolean().optional().default(false),
    pinrowright: z.boolean().optional().default(false),
    pinrowtop: z.boolean().optional().default(false),
    pinrowbottom: z.boolean().optional().default(false),
    width: length.optional(),
    height: length.optional(),
    pinRowHoleEdgeToEdgeDist: length.default("2mm"),
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
    holeXDist: length.optional(),
    holeYDist: length.optional(),
    holeInset: length.default("1mm"),
    pinrow: z.union([z.string(), z.number()]).optional(),
    usbposition: z
      .enum(["left", "right", "top", "bottom"])
      .optional()
      .default("left"),
    usbleft: z.boolean().optional().default(false),
    usbtop: z.boolean().optional().default(false),
    usbright: z.boolean().optional().default(false),
    usbbottom: z.boolean().optional().default(false),
    usbtype: z.enum(["micro", "c"]).optional(),
    usbmicro: z.boolean().optional().default(false),
    usbc: z.boolean().optional().default(false),
  })
  .transform((data) => {
    const pinlabelAnchorSide = determinePinlabelAnchorSide(data)
    let pinRowSide = data.pinRowSide
    if (data.pinrowleft) pinRowSide = "left"
    if (data.pinrowright) pinRowSide = "right"
    if (data.pinrowtop) pinRowSide = "top"
    if (data.pinrowbottom) pinRowSide = "bottom"

    let usbposition = data.usbposition
    if (data.usbleft) usbposition = "left"
    if (data.usbtop) usbposition = "top"
    if (data.usbright) usbposition = "right"
    if (data.usbbottom) usbposition = "bottom"

    let usbtype = data.usbtype
    if (data.usbmicro) usbtype = "micro"
    if (data.usbc) usbtype = "c"

    if (data.pinrow !== undefined) {
      data.numPins = Number(data.pinrow)
    }

    const numPinsPerRow = Math.ceil(data.numPins / data.rows)
    let calculatedWidth: number
    let calculatedHeight: number
    if (pinRowSide === "left" || pinRowSide === "right") {
      calculatedWidth =
        (data.rows - 1) * data.p + 2 * data.pinRowHoleEdgeToEdgeDist
      calculatedHeight =
        (numPinsPerRow - 1) * data.p + 2 * data.pinRowHoleEdgeToEdgeDist
    } else {
      calculatedHeight =
        (data.rows - 1) * data.p + 2 * data.pinRowHoleEdgeToEdgeDist
      calculatedWidth =
        (numPinsPerRow - 1) * data.p + 2 * data.pinRowHoleEdgeToEdgeDist
    }
    if (data.numPins === 0) {
      calculatedWidth = 10
      calculatedHeight = 10
    }

    return {
      ...data,
      pinlabelAnchorSide,
      pinRowSide,
      male: data.male ?? !data.female,
      female: data.female ?? false,
      width: data.width ?? calculatedWidth,
      height: data.height ?? calculatedHeight,
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
    numPins,
    pinlabelAnchorSide,
    pinlabelverticallyinverted,
    pinlabelorthogonal,
    pinlabeltextalignleft,
    pinlabeltextalignright,
    nopinlabels,
    doublesidedpinlabel,
    bottomsidepinlabel,
    pinRowSide,
    width,
    height,
    pinRowHoleEdgeToEdgeDist,
    holes,
    holeXDist,
    holeYDist,
    holeInset,
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

  const numPinsPerRow = Math.ceil(numPins / rows)

  // Determine pin row orientation
  if (pinRowSide === "left" || pinRowSide === "right") {
    pinStartX =
      pinRowSide === "left"
        ? -width / 2 + pinRowHoleEdgeToEdgeDist
        : width / 2 - pinRowHoleEdgeToEdgeDist
    pinStartY = ((numPinsPerRow - 1) / 2) * pinSpacing
    pinDirectionX = 0
    pinDirectionY = -pinSpacing
    rowDirectionX = pinRowSide === "left" ? pinSpacing : -pinSpacing // stack towards center
    rowDirectionY = 0
  } else {
    // top or bottom
    pinStartX = (-(numPinsPerRow - 1) / 2) * pinSpacing
    pinStartY =
      pinRowSide === "top"
        ? height / 2 - pinRowHoleEdgeToEdgeDist
        : -height / 2 + pinRowHoleEdgeToEdgeDist
    pinDirectionX = pinSpacing
    pinDirectionY = 0
    rowDirectionX = 0
    rowDirectionY = pinRowSide === "top" ? -pinSpacing : pinSpacing // stack towards center
  }

  // Add pins
  let pinNumber = 1
  for (let row = 0; row < rows && pinNumber <= numPins; row++) {
    for (let col = 0; col < numPinsPerRow && pinNumber <= numPins; col++) {
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
          xoff + (pinRowSide === "left" ? -od : pinRowSide === "right" ? od : 0)
        const anchor_y =
          yoff + (pinRowSide === "top" ? od : pinRowSide === "bottom" ? -od : 0)
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
        hx = -width / 2 + holeInset
        hy = height / 2 - holeInset
      } else if (pos === "topright") {
        hx = width / 2 - holeInset
        hy = height / 2 - holeInset
      } else if (pos === "bottomleft") {
        hx = -width / 2 + holeInset
        hy = -height / 2 + holeInset
      } else if (pos === "bottomright") {
        hx = width / 2 - holeInset
        hy = -height / 2 + holeInset
      } else if (pos === "center") {
        hx = 0
        hy = 0
      }
      // If hole_x_dist/hole_y_dist provided, use as offsets
      if (holeXDist !== undefined) hx += holeXDist
      if (holeYDist !== undefined) hy += holeYDist
      elements.push(
        platedhole(numPins + holes.indexOf(pos) + 1, hx, hy, id, od),
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
