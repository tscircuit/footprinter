import type { PcbSmtPad } from "circuit-json"
import type { UniformSolderMaskFields } from "./solder-mask"

export const circlepad = (
  pn: number | Array<string | number>,
  {
    x,
    y,
    radius,
    solderMask,
  }: {
    x: number
    y: number
    radius: number
    solderMask?: UniformSolderMaskFields
  },
): PcbSmtPad => {
  return {
    type: "pcb_smtpad",
    x,
    y,
    radius,
    layer: "top",
    shape: "circle",
    ...solderMask,
    pcb_smtpad_id: "",
    port_hints: Array.isArray(pn)
      ? pn.map((item) => item.toString())
      : [pn.toString()],
  }
}
