import type { AnyCircuitElement, PcbSilkscreenPath } from "circuit-json"

/** Add explicit + marks at anodes, using pad identities rather than a fixed body side.
 * Run before footprint rotation, origin translation and nosilkscreen filtering.
 */
export const addPolaritySilkscreen = (
  elements: AnyCircuitElement[],
  { anodePins }: { anodePins: readonly number[] },
): AnyCircuitElement[] => {
  if (anodePins.length === 0) return elements
  const pads = elements.filter(
    (e) => e.type === "pcb_smtpad" || e.type === "pcb_plated_hole",
  )
  let minX = Number.POSITIVE_INFINITY
  let maxX = Number.NEGATIVE_INFINITY
  const padCenterX =
    (Math.min(...pads.map((pad) => pad.x)) +
      Math.max(...pads.map((pad) => pad.x))) /
    2
  for (const pad of pads) {
    const width =
      pad.type === "pcb_smtpad"
        ? pad.width
        : (pad.outer_diameter ?? pad.rect_pad_width)
    minX = Math.min(minX, pad.x - width / 2)
    maxX = Math.max(maxX, pad.x + width / 2)
  }
  // Also stay outside the body outline, not just the copper.
  for (const element of elements) {
    if (element.type !== "pcb_silkscreen_path") continue
    for (const point of element.route) {
      minX = Math.min(minX, point.x - element.stroke_width / 2)
      maxX = Math.max(maxX, point.x + element.stroke_width / 2)
    }
  }
  if (!Number.isFinite(minX) || !Number.isFinite(maxX)) {
    throw new Error("Could not determine diode silkscreen bounds")
  }
  const marks: PcbSilkscreenPath[] = anodePins.flatMap((pin) => {
    const pad = pads.find((e) => e.port_hints?.includes(String(pin)))
    if (!pad) throw new Error(`Could not find diode anode pad ${pin}`)
    // 0.25 mm edge clearance with a 0.15 mm printed stroke.
    const left = pad.x < padCenterX
    const x = left ? minX - 0.625 : maxX + 0.625
    const y = pad.y
    const routes = [
      [
        { x: x - 0.3, y },
        { x: x + 0.3, y },
      ],
      [
        { x, y: y - 0.3 },
        { x, y: y + 0.3 },
      ],
    ]
    return routes.map((route, index) => ({
      type: "pcb_silkscreen_path",
      pcb_silkscreen_path_id: `polarity_anode_${pin}_${index}`,
      pcb_component_id: "",
      layer: "top",
      stroke_width: 0.15,
      route,
    }))
  })
  return [...elements, ...marks]
}
