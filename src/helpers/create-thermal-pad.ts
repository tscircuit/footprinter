import type { PcbSmtPad } from "circuit-json"
import { length } from "circuit-json"
import { rectpad } from "./rectpad"
import {
  type RectSolderMaskFields,
  getRectSolderMaskFields,
  isDim2dEqual,
  isNumberEqual,
  maskOpening2d,
  resolveAlias,
  soldermaskMarginLength,
} from "./solder-mask"

export const thermalPadOffsetFields = {
  thermalpadcenteroffsetx: length.optional().default(0),
  thermalpadcenteroffsety: length.optional().default(0),
  thermalpadmask: maskOpening2d.optional(),
  tpmask: maskOpening2d.optional(),
  thermalpadmaskopening: maskOpening2d.optional(),
  thermalpadsoldermaskmargin: soldermaskMarginLength.optional(),
  thermalpadmaskmargin: soldermaskMarginLength.optional(),
  tpsmm: soldermaskMarginLength.optional(),
}

export type ThermalPadSolderMaskInput = {
  thermalpadmask?: { x: number; y: number }
  tpmask?: { x: number; y: number }
  thermalpadmaskopening?: { x: number; y: number }
  thermalpadsoldermaskmargin?: number
  thermalpadmaskmargin?: number
  tpsmm?: number
  soldermaskmargin?: number
  maskmargin?: number
  smm?: number
}

export const hasExplicitThermalPadSolderMask = (
  params: ThermalPadSolderMaskInput,
): boolean =>
  params.thermalpadmask !== undefined ||
  params.tpmask !== undefined ||
  params.thermalpadmaskopening !== undefined ||
  params.thermalpadsoldermaskmargin !== undefined ||
  params.thermalpadmaskmargin !== undefined ||
  params.tpsmm !== undefined

export const getThermalPadSolderMask = (
  dimensions: { x: number; y: number },
  params?: ThermalPadSolderMaskInput,
): RectSolderMaskFields => {
  if (!params) return {}
  const mask = resolveAlias(
    [
      ["thermalpadmask", params.thermalpadmask],
      ["tpmask", params.tpmask],
      ["thermalpadmaskopening", params.thermalpadmaskopening],
    ],
    isDim2dEqual,
  )
  const explicitMargin = resolveAlias(
    [
      ["thermalpadsoldermaskmargin", params.thermalpadsoldermaskmargin],
      ["thermalpadmaskmargin", params.thermalpadmaskmargin],
      ["tpsmm", params.tpsmm],
    ],
    isNumberEqual,
  )
  const fallbackMargin = resolveAlias(
    [
      ["soldermaskmargin", params.soldermaskmargin],
      ["maskmargin", params.maskmargin],
      ["smm", params.smm],
    ],
    isNumberEqual,
  )

  return getRectSolderMaskFields({
    width: dimensions.x,
    height: dimensions.y,
    margin:
      mask !== undefined ? explicitMargin : (explicitMargin ?? fallbackMargin),
    maskWidth: mask?.x,
    maskHeight: mask?.y,
  })
}

export const createThermalPad = (
  dimensions: {
    x: number
    y: number
  },
  offset: {
    x: number
    y: number
  },
  solderMask?: RectSolderMaskFields,
): PcbSmtPad =>
  rectpad(
    ["thermalpad"],
    offset.x,
    offset.y,
    dimensions.x,
    dimensions.y,
    undefined,
    solderMask,
  )
