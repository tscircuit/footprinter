import type { AnyCircuitElement, PcbSilkscreenPath } from "circuit-json"

export const isPin1Silkscreen = (element: AnyCircuitElement) =>
  element.type === "pcb_silkscreen_path" &&
  /(?:pin1(?:_marker|_indicator)?|pin_marker_1|assembly_pin1)/i.test(
    element.pcb_silkscreen_path_id,
  )

/** A physical pin-1 indicator, distinct from electrical polarity. */
export const addPin1Silkscreen = (
  elements: AnyCircuitElement[],
  fn: string,
): AnyCircuitElement[] => {
  if (/^(res|cap|diode|led|testpoint|array)/.test(fn)) return elements
  const pads = elements.filter(
    (e) => e.type === "pcb_smtpad" || e.type === "pcb_plated_hole",
  )
  if (pads.length < 3 || elements.some(isPin1Silkscreen)) return elements
  const pin1 =
    pads.find((p) => p.port_hints?.some((h) => /^(?:pin)?1$/i.test(h))) ??
    pads.find((p) => p.port_hints?.includes("A1"))
  if (!pin1) return elements
  const pinCenter =
    pin1.type === "pcb_smtpad" && pin1.shape === "polygon"
      ? {
          x:
            (Math.min(...pin1.points.map((p) => p.x)) +
              Math.max(...pin1.points.map((p) => p.x))) /
            2,
          y:
            (Math.min(...pin1.points.map((p) => p.y)) +
              Math.max(...pin1.points.map((p) => p.y))) /
            2,
        }
      : { x: pin1.x, y: pin1.y }
  let minX = Infinity,
    minY = Infinity,
    maxX = -Infinity,
    maxY = -Infinity
  const point = (x: number, y: number) => {
    minX = Math.min(minX, x)
    maxX = Math.max(maxX, x)
    minY = Math.min(minY, y)
    maxY = Math.max(maxY, y)
  }
  for (const pad of pads) {
    if (pad.type === "pcb_smtpad" && pad.shape === "polygon") {
      for (const p of pad.points) point(p.x, p.y)
      continue
    }
    let width =
      pad.type === "pcb_smtpad"
        ? pad.shape === "circle"
          ? pad.radius * 2
          : pad.width
        : (pad.rect_pad_width ?? pad.outer_width ?? pad.outer_diameter)
    let height =
      pad.type === "pcb_smtpad"
        ? pad.shape === "circle"
          ? pad.radius * 2
          : pad.height
        : (pad.rect_pad_height ?? pad.outer_height ?? pad.outer_diameter)
    if (pad.type === "pcb_smtpad" && pad.shape === "rotated_rect") {
      const radians = (pad.ccw_rotation * Math.PI) / 180
      const c = Math.abs(Math.cos(radians)),
        s = Math.abs(Math.sin(radians))
      ;[width, height] = [width * c + height * s, width * s + height * c]
    }
    point(pad.x - width / 2, pad.y - height / 2)
    point(pad.x + width / 2, pad.y + height / 2)
  }
  for (const e of elements) {
    if (e.type === "pcb_silkscreen_path") {
      for (const p of e.route) {
        point(p.x - e.stroke_width / 2, p.y - e.stroke_width / 2)
        point(p.x + e.stroke_width / 2, p.y + e.stroke_width / 2)
      }
    }
  }
  if (![minX, minY, maxX, maxY].every(Number.isFinite))
    throw new Error(`Could not determine pin-1 marker bounds for ${fn}`)
  const sides = [
    {
      distance: pinCenter.x - minX,
      x: minX - 0.325,
      y: pinCenter.y,
      nx: -1,
      ny: 0,
    },
    {
      distance: maxX - pinCenter.x,
      x: maxX + 0.325,
      y: pinCenter.y,
      nx: 1,
      ny: 0,
    },
    {
      distance: pinCenter.y - minY,
      x: pinCenter.x,
      y: minY - 0.325,
      nx: 0,
      ny: -1,
    },
    {
      distance: maxY - pinCenter.y,
      x: pinCenter.x,
      y: maxY + 0.325,
      nx: 0,
      ny: 1,
    },
  ]
  const { x, y, nx, ny } = sides.sort((a, b) => a.distance - b.distance)[0]!
  const tip = { x, y }
  const marker: PcbSilkscreenPath = {
    type: "pcb_silkscreen_path",
    pcb_silkscreen_path_id: "assembly_pin1_marker",
    pcb_component_id: "",
    layer: "top",
    stroke_width: 0.15,
    route: [
      tip,
      { x: x + nx * 0.45 - ny * 0.25, y: y + ny * 0.45 + nx * 0.25 },
      { x: x + nx * 0.45 + ny * 0.25, y: y + ny * 0.45 - nx * 0.25 },
      { ...tip },
    ],
  }
  return [...elements, marker]
}
