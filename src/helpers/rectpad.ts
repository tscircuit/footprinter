import type { PcbSmtPad } from "circuit-json"
import type { RectSolderMaskFields } from "./solder-mask"

export const rectpad = (
  pn: number | Array<string | number>,
  x: number,
  y: number,
  w: number,
  h: number,
  cornerRadius?: number,
  solderMask?: RectSolderMaskFields,
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
    ...solderMask,
    pcb_smtpad_id: "",
    port_hints: Array.isArray(pn)
      ? pn.map((item) => item.toString())
      : [pn.toString()],
  }
}
