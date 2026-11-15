import type { PcbSmtPad } from "circuit-json"

export interface RectPadOptions {
  cornerRadius?: number
  solder_mask_margin?: number
  covered_with_solder_mask?: boolean
}

export const rectpad = (
  pn: number | Array<string | number>,
  x: number,
  y: number,
  w: number,
  h: number,
  cornerRadiusOrOpts?: number | RectPadOptions,
  opts?: RectPadOptions,
): PcbSmtPad => {
  const cornerRadius =
    typeof cornerRadiusOrOpts === "number"
      ? cornerRadiusOrOpts
      : (cornerRadiusOrOpts?.cornerRadius ?? opts?.cornerRadius)
  const solderMaskMargin =
    typeof cornerRadiusOrOpts === "object" && cornerRadiusOrOpts !== null
      ? cornerRadiusOrOpts.solder_mask_margin
      : opts?.solder_mask_margin
  const coveredWithSolderMask =
    typeof cornerRadiusOrOpts === "object" && cornerRadiusOrOpts !== null
      ? cornerRadiusOrOpts.covered_with_solder_mask
      : opts?.covered_with_solder_mask

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
    ...(solderMaskMargin !== undefined && {
      solder_mask_margin: solderMaskMargin,
    }),
    ...(coveredWithSolderMask !== undefined && {
      is_covered_with_solder_mask: coveredWithSolderMask,
    }),
    pcb_smtpad_id: "",
    port_hints: Array.isArray(pn)
      ? pn.map((item) => item.toString())
      : [pn.toString()],
  }
}
