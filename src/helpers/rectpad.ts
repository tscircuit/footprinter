import type { PcbSmtPad } from "circuit-json"

export const rectpad = (
  pn: number | Array<string | number>,
  x: number,
  y: number,
  w: number,
  h: number,
  cornerRadius?: number,
): PcbSmtPad => {
  return {
    type: "pcb_smtpad",
    x,
    y,
    width: w,
    height: h,
    layer: "top",
    shape: "rect",
    ...(cornerRadius !== undefined && {
      corner_radius: cornerRadius,
    }),
    pcb_smtpad_id: "",
    port_hints: Array.isArray(pn)
      ? pn.map((item) => item.toString())
      : [pn.toString()],
  }
}
