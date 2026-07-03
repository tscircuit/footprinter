import type { PcbSmtPad, Point } from "circuit-json"

export const polygonpad = (
  pn: number | Array<string | number>,
  points: Point[],
): PcbSmtPad => {
  return {
    type: "pcb_smtpad",
    points,
    layer: "top",
    shape: "polygon",
    pcb_smtpad_id: "",
    port_hints: Array.isArray(pn)
      ? pn.map((item) => item.toString())
      : [pn.toString()],
  }
}
