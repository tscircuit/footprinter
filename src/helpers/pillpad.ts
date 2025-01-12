import type { PCBSMTPad } from "circuit-json"

export const pillpad = (
  pn: number | Array<string | number>,
  x: number,
  y: number,
  w: number,
  h: number,
): PCBSMTPad => {
  return {
    type: "pcb_smtpad",
    x,
    y,
    width: w,
    height: h,
    radius: h / 2,
    layer: "top",
    shape: "pill",
    pcb_smtpad_id: "",
    port_hints: Array.isArray(pn)
      ? pn.map((item) => item.toString())
      : [pn.toString()],
  }
}
