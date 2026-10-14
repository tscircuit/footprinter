import type { AnyCircuitElement, PcbSilkscreenPath } from "circuit-json"

const diodeFamilies = new Set([
  "diode",
  "led",
  "led2835",
  "led5050",
  "melf",
  "micromelf",
  "minimelf",
  "sma",
  "smb",
  "smbf",
  "smc",
  "smf",
  "do219ad",
  "sod110",
  "sod123",
  "sod123f",
  "sod123fl",
  "sod123w",
  "sod128",
  "sod323",
  "sod323f",
  "sod323fl",
  "sod323w",
  "sod323he",
  "sod523",
  "sod723",
  "sod80",
  "sod882",
  "sod882d",
  "sod923",
])

/** Add explicit K marks, using pad identities rather than a fixed body side.
 * Run before footprint rotation, origin translation and nosilkscreen filtering.
 */
export const addPolaritySilkscreen = (
  elements: AnyCircuitElement[],
  parameters: { fn: string; cathodepin?: number; anodepin?: number },
): AnyCircuitElement[] => {
  const axialDiode =
    parameters.fn === "axial" &&
    (parameters.anodepin !== undefined || parameters.cathodepin !== undefined)
  if (!diodeFamilies.has(parameters.fn) && !axialDiode) return elements
  const pads = elements.filter(
    (e) => e.type === "pcb_smtpad" || e.type === "pcb_plated_hole",
  )
  const cathodePins =
    parameters.fn === "led5050"
      ? [4, 5, 6]
      : [parameters.cathodepin ?? (parameters.anodepin === 2 ? 1 : 2)]
  if (
    parameters.fn === "led5050" &&
    (parameters.cathodepin !== undefined || parameters.anodepin !== undefined)
  ) {
    throw new Error(
      "led5050 has three fixed anode/cathode pairs; two-pin polarity overrides are not supported",
    )
  }
  let minX = Infinity
  let maxX = -Infinity
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
  const marks: PcbSilkscreenPath[] = cathodePins.flatMap((pin) => {
    const pad = pads.find((e) => e.port_hints?.includes(String(pin)))
    if (!pad) throw new Error(`Could not find diode cathode pad ${pin}`)
    // 0.25 mm edge clearance with a 0.15 mm printed stroke.
    const left = pad.x < padCenterX
    const x = left ? minX - 0.325 - 0.45 : maxX + 0.325
    const y = pad.y
    const routes = [
      [
        { x, y: y - 0.4 },
        { x, y: y + 0.4 },
      ],
      [
        { x: x + 0.45, y: y + 0.4 },
        { x, y },
        { x: x + 0.45, y: y - 0.4 },
      ],
    ]
    return routes.map((route, index) => ({
      type: "pcb_silkscreen_path",
      pcb_silkscreen_path_id: `polarity_cathode_${pin}_${index}`,
      pcb_component_id: "",
      layer: "top",
      stroke_width: 0.15,
      route,
    }))
  })
  return [...elements, ...marks]
}
