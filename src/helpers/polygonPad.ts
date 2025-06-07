import type { PcbSmtPadPolygon } from "circuit-json"

export const polygonPad = (
  pn: number | Array<string | number>,

  points: Array<{ x: number; y: number }>,
): PcbSmtPadPolygon => {
  return {
    type: "pcb_smtpad",
    layer: "top",
    shape: "polygon",
    pcb_smtpad_id: "",
    port_hints: Array.isArray(pn)
      ? pn.map((item) => item.toString())
      : [pn.toString()],
    points,
  }
}
