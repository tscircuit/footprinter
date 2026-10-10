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

import type { AnyCircuitElement } from "circuit-json"

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

  const boundsForPad = (pad: any) => {
    if (pad.shape === "polygon") {
      return {
        minX: Math.min(...pad.points.map((p: any) => p.x)),
        maxX: Math.max(...pad.points.map((p: any) => p.x)),
        minY: Math.min(...pad.points.map((p: any) => p.y)),
        maxY: Math.max(...pad.points.map((p: any) => p.y)),
      }
    }
    let w: number
    let h: number
    if (pad.type === "pcb_smtpad") {
      w = pad.shape === "circle" ? pad.radius * 2 : pad.width
      h = pad.shape === "circle" ? pad.radius * 2 : pad.height
    } else {
      const d = pad.outer_diameter ?? pad.hole_diameter
      w = pad.outer_width ?? pad.rect_pad_width ?? d
      h = pad.outer_height ?? pad.rect_pad_height ?? d
    }
    const angle = ((pad.ccw_rotation ?? 0) * Math.PI) / 180
    const rotatedWidth =
      Math.abs(w * Math.cos(angle)) + Math.abs(h * Math.sin(angle))
    const rotatedHeight =
      Math.abs(w * Math.sin(angle)) + Math.abs(h * Math.cos(angle))
    return {
      minX: pad.x - rotatedWidth / 2,
      maxX: pad.x + rotatedWidth / 2,
      minY: pad.y - rotatedHeight / 2,
      maxY: pad.y + rotatedHeight / 2,
    }
  }

  for (const pad of pads) {
    const bounds = boundsForPad(pad)
    updateBounds(bounds.minX, bounds.minY)
    updateBounds(bounds.maxX, bounds.maxY)
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
      const pin1 = pads.filter((p) =>
        p.port_hints?.some((hint: string) => /^(?:pin)?1$/i.test(hint)),
      )
      const terminal = pin1.length ? pin1 : [pads[0]]
      if (
        terminal.length === 1 &&
        typeof terminal[0].x === "number" &&
        typeof terminal[0].y === "number"
      ) {
        dx = terminal[0].x
        dy = terminal[0].y
        break
      }
      const terminalBounds = terminal.map(boundsForPad)
      dx =
        (Math.min(...terminalBounds.map((b) => b.minX)) +
          Math.max(...terminalBounds.map((b) => b.maxX))) /
        2
      dy =
        (Math.min(...terminalBounds.map((b) => b.minY)) +
          Math.max(...terminalBounds.map((b) => b.maxY))) /
        2
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

    if (el.type === "pcb_smtpad" && el.shape === "polygon") {
      for (const point of el.points) {
        point.x -= dx
        point.y -= dy
      }
    }

    if (el.type === "pcb_silkscreen_text" && el.anchor_position) {
      el.anchor_position.x -= dx
      el.anchor_position.y -= dy
    }
  }

  return elements
}
