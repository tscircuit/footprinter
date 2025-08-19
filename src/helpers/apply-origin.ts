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

import type { AnySoupElement } from "circuit-json"

export const applyOrigin = (
  elements: AnySoupElement[],
  origin: OriginMode | undefined,
): AnySoupElement[] => {
  if (!origin) return elements

  const pads = elements.filter(
    (el) =>
      el.type === "pcb_smtpad" ||
      el.type === "pcb_plated_hole" ||
      el.type === "pcb_thtpad",
  ) as Array<any>

  if (pads.length === 0) return elements

  let minX = Infinity
  let maxX = -Infinity
  let minY = Infinity
  let maxY = -Infinity

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
      const w = pad.shape === "circle" ? pad.radius * 2 : pad.width
      const h = pad.shape === "circle" ? pad.radius * 2 : pad.height
      updateBounds(pad.x, pad.y, w, h)
    } else if (pad.type === "pcb_plated_hole") {
      const d = pad.outer_diameter ?? pad.hole_diameter
      updateBounds(pad.x, pad.y, d, d)
    } else if (pad.type === "pcb_thtpad") {
      const d = pad.diameter
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
    case "pin1":
      const pin1 = pads.find((p) => p.port_hints?.[0] === "1") || pads[0]
      dx = pin1.x
      dy = pin1.y
      break
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
