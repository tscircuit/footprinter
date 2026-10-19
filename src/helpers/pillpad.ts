import type { PcbSmtPad } from "circuit-json"
import type { UniformSolderMaskFields } from "./solder-mask"

export const pillpad = (
  pn: number | Array<string | number>,
  x: number,
  y: number,
  w: number,
  h: number,
  solderMask?: UniformSolderMaskFields,
): PcbSmtPad => {
  return {
    type: "pcb_smtpad",
    x,
    y,
    width: w,
    height: h,
    radius: Math.min(w, h) / 2,
    layer: "top",
    shape: "pill",
    ...solderMask,
    pcb_smtpad_id: "",
    port_hints: Array.isArray(pn)
      ? pn.map((item) => item.toString())
      : [pn.toString()],
  }
}
