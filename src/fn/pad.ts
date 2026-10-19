import { mm } from "@tscircuit/mm"
import type { AnySoupElement } from "circuit-json"
import { length } from "circuit-json"
import type { z } from "zod"
import { rectpad } from "../helpers/rectpad"
import { silkscreenRef } from "../helpers/silkscreenRef"
import {
  getRectSolderMaskFields,
  isDim2dEqual,
  isNumberEqual,
  maskOpening2d,
  positiveMaskLength,
  resolveAlias,
  soldermaskMarginLength,
} from "../helpers/solder-mask"
import { base_def } from "../helpers/zod/base_def"

export const pad_def = base_def.extend({
  w: length,
  h: length,
  soldermaskmargin: soldermaskMarginLength.optional(),
  maskmargin: soldermaskMarginLength.optional(),
  smm: soldermaskMarginLength.optional(),
  maskw: positiveMaskLength.optional(),
  mw: positiveMaskLength.optional(),
  maskwidth: positiveMaskLength.optional(),
  maskh: positiveMaskLength.optional(),
  mh: positiveMaskLength.optional(),
  maskheight: positiveMaskLength.optional(),
  mask: maskOpening2d.optional(),
  maskopening: maskOpening2d.optional(),
  soldermaskopening: maskOpening2d.optional(),
})

export type PadDef = z.input<typeof pad_def>

export const pad = (
  params: PadDef,
): { circuitJson: AnySoupElement[]; parameters: PadDef } => {
  const parsed = pad_def.parse(params)
  const width = mm(parsed.w)
  const height = mm(parsed.h)

  const margin = resolveAlias(
    [
      ["soldermaskmargin", parsed.soldermaskmargin],
      ["maskmargin", parsed.maskmargin],
      ["smm", parsed.smm],
    ],
    isNumberEqual,
  )
  const mask2d = resolveAlias(
    [
      ["mask", parsed.mask],
      ["maskopening", parsed.maskopening],
      ["soldermaskopening", parsed.soldermaskopening],
    ],
    isDim2dEqual,
  )
  const maskWidth = resolveAlias(
    [
      ["maskw", parsed.maskw],
      ["mw", parsed.mw],
      ["maskwidth", parsed.maskwidth],
      ["mask", mask2d?.x],
    ],
    isNumberEqual,
  )
  const maskHeight = resolveAlias(
    [
      ["maskh", parsed.maskh],
      ["mh", parsed.mh],
      ["maskheight", parsed.maskheight],
      ["mask", mask2d?.y],
    ],
    isNumberEqual,
  )

  const solderMask = getRectSolderMaskFields({
    width,
    height,
    margin,
    maskWidth,
    maskHeight,
  })

  return {
    circuitJson: [
      rectpad(1, 0, 0, width, height, undefined, solderMask),
      silkscreenRef(0, height / 2 + 0.5, 0.2),
    ],
    parameters: {
      ...params,
      w: width,
      h: height,
      ...(margin !== undefined && { soldermaskmargin: margin }),
      ...(maskWidth !== undefined && { maskw: maskWidth }),
      ...(maskHeight !== undefined && { maskh: maskHeight }),
    },
  }
}
