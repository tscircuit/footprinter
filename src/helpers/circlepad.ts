import type { PCBSMTPad } from "circuit-json"

export const circlepad = (
  pn: number | Array<string | number>,
  x: number,
  y: number,
  radius: number,
): PCBSMTPad => {
  return {
    type: "pcb_smtpad",
    x,
    y,
    radius,
    layer: "top",
    shape: "circle",
    pcb_smtpad_id: "",
    port_hints: Array.isArray(pn)
      ? pn.map((item) => item.toString())
      : [pn.toString()],
  }
}
