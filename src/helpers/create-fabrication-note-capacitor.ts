import type { PcbFabricationNotePath } from "circuit-json"

type PadCenter = { x: number; y: number }

/** Draw polarity marks in footprint-local millimetres (+X right, +Y up).
 * Pad centres are points before origin/rotation or board-side transforms.
 */
export const createFabricationNoteCapacitor = (
  positivePadCenter: PadCenter,
  negativePadCenter: PadCenter,
): PcbFabricationNotePath[] => {
  const size = Math.min(
    0.6,
    Math.hypot(
      positivePadCenter.x - negativePadCenter.x,
      positivePadCenter.y - negativePadCenter.y,
    ) * 0.25,
  )
  const halfSize = size / 2
  const { x: px, y: py } = positivePadCenter
  const { x: nx, y: ny } = negativePadCenter
  return [
    {
      name: "positive_horizontal",
      route: [
        { x: px - halfSize, y: py },
        { x: px + halfSize, y: py },
      ],
    },
    {
      name: "positive_vertical",
      route: [
        { x: px, y: py - halfSize },
        { x: px, y: py + halfSize },
      ],
    },
    {
      name: "negative",
      route: [
        { x: nx - halfSize, y: ny },
        { x: nx + halfSize, y: ny },
      ],
    },
  ].map(({ name, route }) => ({
    type: "pcb_fabrication_note_path",
    pcb_fabrication_note_path_id: `capacitor_fabrication_note_${name}`,
    pcb_component_id: "",
    layer: "top",
    stroke_width: size / 6,
    route,
  }))
}
