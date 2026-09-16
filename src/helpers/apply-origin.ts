export type OriginMode =
  | "center"
  | "bottomleft"
  | "pin1"
  | "bottomcenter"
  | "centerbottom"
  | "topcenter"
  | "centertop"
  | "leftcenter"
  | "centerleft"
  | "rightcenter"
  | "centerright"

import type {
  AnyCircuitElement,
  PcbSmtPadRotatedPill,
  PcbSmtPadRotatedRect,
} from "circuit-json"

const getRotatedSmtPadBounds = (
  pad: PcbSmtPadRotatedRect | PcbSmtPadRotatedPill,
) => {
  const rotationRadians = ((pad.ccw_rotation ?? 0) * Math.PI) / 180
  const cosine = Math.abs(Math.cos(rotationRadians))
  const sine = Math.abs(Math.sin(rotationRadians))
  const cornerRadius = Math.min(
    Math.max(
      pad.shape === "rotated_pill"
        ? pad.radius
        : (pad.corner_radius ?? pad.rect_border_radius ?? 0),
      0,
    ),
    pad.width / 2,
    pad.height / 2,
  )
  return {
    width:
      (pad.width - 2 * cornerRadius) * cosine +
      (pad.height - 2 * cornerRadius) * sine +
      2 * cornerRadius,
    height:
      (pad.width - 2 * cornerRadius) * sine +
      (pad.height - 2 * cornerRadius) * cosine +
      2 * cornerRadius,
  }
}

export const applyOrigin = (
  elements: AnyCircuitElement[],
  origin: OriginMode | undefined,
): AnyCircuitElement[] => {
  if (!origin) return elements

  const pads = elements.filter(
    (el) => el.type === "pcb_smtpad" || el.type === "pcb_plated_hole",
  ) as Array<any>

  if (pads.length === 0) return elements

  let minX = Number.POSITIVE_INFINITY
  let maxX = Number.NEGATIVE_INFINITY
  let minY = Number.POSITIVE_INFINITY
  let maxY = Number.NEGATIVE_INFINITY

  const updateBounds = (x: number, y: number, w = 0, h = 0) => {
    const left = x - w / 2
    const right = x + w / 2
    const bottom = y - h / 2
    const top = y + h / 2
    minX = Math.min(minX, left)
    maxX = Math.max(maxX, right)
    minY = Math.min(minY, bottom)
    maxY = Math.max(maxY, top)
  }

  for (const pad of pads) {
    if (pad.type === "pcb_smtpad") {
      if (pad.shape === "rotated_rect" || pad.shape === "rotated_pill") {
        const bounds = getRotatedSmtPadBounds(pad)
        updateBounds(pad.x, pad.y, bounds.width, bounds.height)
      } else {
        const w = pad.shape === "circle" ? pad.radius * 2 : pad.width
        const h = pad.shape === "circle" ? pad.radius * 2 : pad.height
        updateBounds(pad.x, pad.y, w, h)
      }
    } else if (pad.type === "pcb_plated_hole") {
      const d = pad.outer_diameter ?? pad.hole_diameter
      updateBounds(pad.x, pad.y, d, d)
    }
  }

  let dx = 0
  let dy = 0
  switch (origin) {
    case "center":
      dx = (minX + maxX) / 2
      dy = (minY + maxY) / 2
      break
    case "bottomleft":
      dx = minX
      dy = minY
      break
    case "bottomcenter":
    case "centerbottom":
      dx = (minX + maxX) / 2
      dy = minY
      break
    case "topcenter":
    case "centertop":
      dx = (minX + maxX) / 2
      dy = maxY
      break
    case "leftcenter":
    case "centerleft":
      dx = minX
      dy = (minY + maxY) / 2
      break
    case "rightcenter":
    case "centerright":
      dx = maxX
      dy = (minY + maxY) / 2
      break
    case "pin1": {
      const pin1 = pads.find((p) => p.port_hints?.[0] === "1") || pads[0]
      dx = pin1.x
      dy = pin1.y
      break
    }
  }

  if (dx === 0 && dy === 0) return elements

  for (const el of elements as Array<any>) {
    if (typeof el.x === "number") el.x -= dx
    if (typeof el.y === "number") el.y -= dy

    if (el.center && typeof el.center.x === "number") {
      el.center.x -= dx
      el.center.y -= dy
    }

    if (el.type === "pcb_silkscreen_path") {
      for (const pt of el.route) {
        pt.x -= dx
        pt.y -= dy
      }
    }

    if (el.type === "pcb_silkscreen_text" && el.anchor_position) {
      el.anchor_position.x -= dx
      el.anchor_position.y -= dy
    }
  }

  return elements
}
