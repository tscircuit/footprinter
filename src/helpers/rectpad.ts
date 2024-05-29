import type { PCBSMTPad } from "@tscircuit/soup"
export const rectpad = (
  pn: number | Array<string | number>,
  x: number,
  y: number,
  w: number,
  h: number
): PCBSMTPad => {
  return {
    type: "pcb_smtpad",
    x,
    y,
    width: w,
    height: h,
    layer: "top",
    shape: "rect",
    pcb_smtpad_id: "",
    port_hints: Array.isArray(pn)
      ? pn.map((item) => item.toString())
      : [pn.toString()],
  }
}
