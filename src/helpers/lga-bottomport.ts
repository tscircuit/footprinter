import type {
  AnyCircuitElement,
  PcbCourtyardOutline,
  PcbSilkscreenPath,
  PcbSmtPad,
} from "circuit-json"
import type { z } from "zod"
import type { lga_def } from "../fn/lga"
import { annularpad } from "./annularpad"
import { getQuadPinMap } from "./get-quad-pin-map"
import { rectpad } from "./rectpad"
import { silkscreenRef } from "./silkscreenRef"

/** Shared six-contact bottom-port LGA convention, numbered through the existing perimeter map. */
export const makeBottomPortLga = (
  parameters: z.output<typeof lga_def>,
): AnyCircuitElement[] => {
  const pinMap = getQuadPinMap({
    ...parameters,
    sidePinCounts: { left: 2, right: 2, top: 1, bottom: 1 },
  })
  const horizontalPitch = parameters.px!
  const verticalPitch = parameters.py!
  const rowY = parameters.rowoffsety!
  const portX = parameters.portoffsetx!
  const portY = parameters.portoffsety!
  const innerDiameter = parameters.id!
  const outerDiameter = parameters.od!
  const holeDiameter = parameters.holed!
  type RectangularLand = PcbSmtPad & {
    shape: "rect"
    x: number
    y: number
    width: number
    height: number
  }
  const rectangles: RectangularLand[] = []
  let pin = 1
  const addRectangularLand = (x: number, y: number) => {
    rectangles.push(
      rectpad(
        pinMap[pin++]!,
        x,
        y,
        parameters.pw,
        parameters.pl,
      ) as RectangularLand,
    )
  }
  // Traverse left, bottom, right, then top as ordinary LGA numbering does.
  // The top contact is annular; the five rectangular lands share one orientation.
  for (let row = 0; row < 2; row++) {
    addRectangularLand(-horizontalPitch, rowY + (1 - row) * verticalPitch)
  }
  addRectangularLand(0, rowY)
  for (let row = 0; row < 2; row++) {
    addRectangularLand(horizontalPitch, rowY + row * verticalPitch)
  }

  // Copper dimensions are independent of the acoustic drill. Separate physical
  // contacts must clear one another and the continuous ground ring.
  for (const [index, rectangle] of rectangles.entries()) {
    for (const other of rectangles.slice(index + 1)) {
      if (
        Math.abs(rectangle.x - other.x) <= parameters.pw &&
        Math.abs(rectangle.y - other.y) <= parameters.pl
      ) {
        throw new Error(
          "Bottom-port LGA lands for different contacts must not touch or overlap",
        )
      }
    }
    const dx = Math.abs(rectangle.x - portX)
    const dy = Math.abs(rectangle.y - portY)
    const nearest = Math.hypot(
      Math.max(dx - parameters.pw / 2, 0),
      Math.max(dy - parameters.pl / 2, 0),
    )
    const farthest = Math.hypot(dx + parameters.pw / 2, dy + parameters.pl / 2)
    if (
      nearest <= outerDiameter / 2 &&
      farthest >= (innerDiameter / 2) * Math.cos(Math.PI / 128)
    ) {
      throw new Error("Bottom-port LGA lands must clear the ground ring copper")
    }
    if (nearest <= holeDiameter / 2) {
      throw new Error(
        "Bottom-port LGA lands must clear the unplated sound opening",
      )
    }
  }
  const ring = annularpad(
    pinMap[pin]!,
    portX,
    portY,
    innerDiameter,
    outerDiameter,
  )
  const copperHalfWidth = Math.max(
    ...rectangles.map((pad) => Math.abs(pad.x) + parameters.pw / 2),
    Math.abs(portX) + outerDiameter / 2,
  )
  const copperHalfHeight = Math.max(
    ...rectangles.map((pad) => Math.abs(pad.y) + parameters.pl / 2),
    Math.abs(portY) + outerDiameter / 2,
  )
  const halfWidth = Math.max(parameters.bodywidth! / 2, copperHalfWidth)
  const halfHeight = Math.max(parameters.bodyheight! / 2, copperHalfHeight)
  const courtyard: PcbCourtyardOutline = {
    type: "pcb_courtyard_outline",
    pcb_courtyard_outline_id: "",
    pcb_component_id: "",
    layer: "top",
    outline: [
      { x: -halfWidth - 0.25, y: -halfHeight - 0.25 },
      { x: halfWidth + 0.25, y: -halfHeight - 0.25 },
      { x: halfWidth + 0.25, y: halfHeight + 0.25 },
      { x: -halfWidth - 0.25, y: halfHeight + 0.25 },
      { x: -halfWidth - 0.25, y: -halfHeight - 0.25 },
    ],
  }
  const pin1 = rectangles.find((pad) => pad.port_hints?.[0] === "1")
  const pin1Center = pin1 ?? { x: portX, y: portY }
  const xSign = pin1Center.x < 0 ? -1 : 1
  const ySign = pin1Center.y < 0 ? -1 : 1
  const marker: PcbSilkscreenPath = {
    type: "pcb_silkscreen_path",
    pcb_silkscreen_path_id: "pin1_marker",
    pcb_component_id: "",
    layer: "top",
    stroke_width: 0.1,
    route: [
      { x: xSign * (halfWidth + 0.15), y: ySign * (halfHeight - 0.15) },
      { x: xSign * (halfWidth + 0.15), y: ySign * (halfHeight + 0.15) },
      { x: xSign * (halfWidth - 0.15), y: ySign * (halfHeight + 0.15) },
    ],
  }

  return [
    ...rectangles,
    ...ring,
    {
      type: "pcb_hole" as const,
      pcb_hole_id: "sound_opening",
      pcb_component_id: "",
      hole_shape: "circle" as const,
      hole_diameter: holeDiameter,
      x: portX,
      y: portY,
    },
    marker,
    silkscreenRef(0, halfHeight + 0.65, 0.3),
    courtyard,
  ]
}
