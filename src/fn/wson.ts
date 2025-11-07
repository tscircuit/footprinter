import type { AnyCircuitElement, PcbSilkscreenPath } from "circuit-json"
import { z } from "zod"
import { length } from "circuit-json"
import { rectpad } from "../helpers/rectpad"
import { silkscreenRef, type SilkscreenRef } from "src/helpers/silkscreenRef"
import type { NowDefined } from "../helpers/zod/now-defined"

export const base_wson_def = z.object({
  fn: z.string(),
  num_pins: z.number().default(6),
  w: length.optional(),
  h: length.optional(),
  p: length.default(length.parse("0.95mm")),
  pl: length.optional(),
  pw: length.optional(),
  epw: length.optional(),
  eph: length.optional(),
  ep: z.coerce.boolean().default(false),
  string: z.string().optional(),
})

export const wsonTransform = <T extends z.infer<typeof base_wson_def>>(
  v: T,
) => {
  // Set default dimensions if not provided
  if (!v.w && !v.h) {
    v.w = 3.0
    v.h = 3.0
  } else if (v.w && !v.h) {
    v.h = v.w
  } else if (!v.w && v.h) {
    v.w = v.h
  }

  // Calculate pin length and width based on pitch and pin count
  if (!v.pl) {
    if (v.p! >= 0.65) {
      v.pl = 0.4
    } else {
      v.pl = 0.6
    }
  }

  if (!v.pw) {
    if (v.p! >= 0.65) {
      v.pw = 0.375
    } else {
      v.pw = 0.25
    }
  }

  // Set thermal pad dimensions if needed
  if (v.ep) {
    if (!v.epw) {
      v.epw = v.w! * 0.5
    }
    if (!v.eph) {
      v.eph = v.h! * 0.6
    }
  }

  return v as NowDefined<T, "w" | "h" | "pl" | "pw">
}

export const wson_def = base_wson_def.transform(wsonTransform)

export const getWsonPadCoord = (
  num_pins: number,
  pn: number,
  w: number,
  p: number,
) => {
  const half = num_pins / 2
  const rowIndex = (pn - 1) % half
  const col = pn <= half ? -1 : 1
  const row = (half - 1) / 2 - rowIndex

  // Position pads with inset from package edge
  const inset = 0.1
  const xOffset = w / 2 - inset

  return {
    x: col * xOffset,
    y: row * p,
  }
}

export const wson = (
  raw_params: z.input<typeof wson_def>,
): { circuitJson: AnyCircuitElement[]; parameters: any } => {
  // Parse dimensions from string if present
  if (raw_params.string) {
    const dimMatch = raw_params.string.match(
      /(\d+(?:\.\d+)?)x(\d+(?:\.\d+)?)mm/,
    )
    if (dimMatch) {
      if (!raw_params.w) raw_params.w = `${dimMatch[1]}mm`
      if (!raw_params.h) raw_params.h = `${dimMatch[2]}mm`
    }

    // Parse thermal pad dimensions
    const epMatch = raw_params.string.match(
      /ep(\d+(?:\.\d+)?)x(\d+(?:\.\d+)?)mm/,
    )
    if (epMatch) {
      raw_params.epw = `${epMatch[1]}mm`
      raw_params.eph = `${epMatch[2]}mm`
      raw_params.ep = true
    }

    // Parse pitch
    const pitchMatch = raw_params.string.match(/p(\d+(?:\.\d+)?)mm/)
    if (pitchMatch) {
      raw_params.p = `${pitchMatch[1]}mm`
    }
  }

  const parameters = wson_def.parse(raw_params)

  const w = parameters.w
  const h = parameters.h
  const p = parameters.p
  const pl = parameters.pl
  const pw = parameters.pw
  const epw = parameters.epw ?? 0
  const eph = parameters.eph ?? 0

  const pads: AnyCircuitElement[] = []

  // Generate pins on left and right sides
  for (let i = 0; i < parameters.num_pins; i++) {
    const { x, y } = getWsonPadCoord(parameters.num_pins, i + 1, w, p)
    pads.push(rectpad(i + 1, x, y, pl, pw))
  }

  // Add thermal pad if specified
  if (parameters.ep) {
    pads.push(rectpad(parameters.num_pins + 1, 0, 0, epw, eph))
  }

  // Silkscreen corners
  const silkscreen_corners: PcbSilkscreenPath[] = []

  for (const [corner, dx, dy] of [
    ["top-left", -1, 1],
    ["bottom-left", -1, -1],
    ["bottom-right", 1, -1],
    ["top-right", 1, 1],
  ] as const) {
    const corner_x = (w / 2) * dx
    const corner_y = (h / 2) * dy
    let arrow: "none" | "in1" = "none"

    /** corner size */
    const csz = pw * 2

    // Pin 1 is always on the left side for WSON
    if (corner === "top-left") {
      arrow = "in1"
    }

    // Normal Corner
    if (arrow === "none") {
      silkscreen_corners.push({
        layer: "top",
        pcb_component_id: "",
        pcb_silkscreen_path_id: `pcb_silkscreen_path_${corner}`,
        route: [
          {
            x: corner_x - csz * dx,
            y: corner_y,
          },
          {
            x: corner_x,
            y: corner_y,
          },
          {
            x: corner_x,
            y: corner_y - csz * dy,
          },
        ],
        type: "pcb_silkscreen_path",
        stroke_width: 0.1,
      })
    }

    // Two lines nearly forming a corner, used when the arrow needs to overlap
    if (arrow === "in1") {
      silkscreen_corners.push(
        {
          layer: "top",
          pcb_component_id: "",
          pcb_silkscreen_path_id: `pcb_silkscreen_path_${corner}_1`,
          route: [
            {
              x: corner_x - csz * dx,
              y: corner_y,
            },
            {
              x: corner_x - (csz * dx) / 2,
              y: corner_y,
            },
          ],
          type: "pcb_silkscreen_path",
          stroke_width: 0,
        },
        {
          layer: "top",
          pcb_component_id: "",
          pcb_silkscreen_path_id: `pcb_silkscreen_path_${corner}_2`,
          route: [
            {
              x: corner_x,
              y: corner_y - (csz * dy) / 2,
            },
            {
              x: corner_x,
              y: corner_y - csz * dy,
            },
          ],
          type: "pcb_silkscreen_path",
          stroke_width: 0.1,
        },
      )

      // Pin 1 arrow indicator
      silkscreen_corners.push({
        layer: "top",
        pcb_component_id: "",
        pcb_silkscreen_path_id: `pcb_silkscreen_path_${corner}_3`,
        route: [
          {
            x: corner_x - 0.2 * -dx,
            y: corner_y + 0.2,
          },
          {
            x: corner_x,
            y: corner_y,
          },
          {
            x: corner_x + 0.2 * -dx,
            y: corner_y + 0.2,
          },
          {
            x: corner_x - 0.2 * -dx,
            y: corner_y + 0.2,
          },
        ],
        type: "pcb_silkscreen_path",
        stroke_width: 0.1,
      })
    }
  }

  const silkscreenRefText: SilkscreenRef = silkscreenRef(0, h / 2 + 0.5, 0.3)

  return {
    circuitJson: [...pads, ...silkscreen_corners, silkscreenRefText],
    parameters,
  }
}
