import { mm } from "@tscircuit/mm"
import { length } from "circuit-json"
import type { AnyCircuitElement } from "circuit-json"
import { z } from "zod"
import { circlepad } from "../helpers/circlepad"
import { pillpad } from "../helpers/pillpad"
import { rectpad } from "../helpers/rectpad"
import { silkscreenRef } from "../helpers/silkscreenRef"
import {
  getCircleSolderMaskFields,
  getPillSolderMaskFields,
  getRectSolderMaskFields,
  isDim2dEqual,
  isNumberEqual,
  maskOpening2d,
  positiveMaskLength,
  resolveAlias,
  soldermaskMarginLength,
} from "../helpers/solder-mask"
import { base_def } from "../helpers/zod/base_def"

export const smtpad_def = base_def
  .extend({
    fn: z.string(),
    shape: z.enum(["circle", "rect", "square", "pill"]).optional(),
    circle: z.boolean().optional(),
    rect: z.boolean().optional(),
    square: z.boolean().optional(),
    pill: z.boolean().optional(),
    d: length.optional(),
    pd: length.optional(),
    diameter: length.optional(),
    r: length.optional(),
    pr: length.optional(),
    radius: length.optional(),
    w: length.optional(),
    pw: length.optional(),
    width: length.optional(),
    h: length.optional(),
    ph: length.optional(),
    height: length.optional(),
    s: length.optional(),
    size: length.optional(),
    soldermaskmargin: soldermaskMarginLength.optional(),
    maskmargin: soldermaskMarginLength.optional(),
    smm: soldermaskMarginLength.optional(),
    maskd: positiveMaskLength.optional(),
    md: positiveMaskLength.optional(),
    maskdiameter: positiveMaskLength.optional(),
    maskr: positiveMaskLength.optional(),
    mr: positiveMaskLength.optional(),
    maskradius: positiveMaskLength.optional(),
    maskw: positiveMaskLength.optional(),
    mw: positiveMaskLength.optional(),
    maskwidth: positiveMaskLength.optional(),
    maskh: positiveMaskLength.optional(),
    mh: positiveMaskLength.optional(),
    maskheight: positiveMaskLength.optional(),
    masks: positiveMaskLength.optional(),
    ms: positiveMaskLength.optional(),
    masksize: positiveMaskLength.optional(),
    mask: maskOpening2d.optional(),
    maskopening: maskOpening2d.optional(),
    soldermaskopening: maskOpening2d.optional(),
    string: z.string().optional(),
  })
  .transform((v) => {
    let shape: "circle" | "rect" | "square" | "pill" = v.shape ?? "rect"
    if (v.circle) shape = "circle"
    if (v.square) shape = "square"
    if (v.rect) shape = "rect"
    if (v.pill) shape = "pill"

    let radius: number | undefined
    let width: number | undefined
    let height: number | undefined

    if (shape === "circle") {
      if (v.r !== undefined) radius = mm(v.r)
      else if (v.pr !== undefined) radius = mm(v.pr)
      else if (v.radius !== undefined) radius = mm(v.radius)
      else if (v.d !== undefined) radius = mm(v.d) / 2
      else if (v.pd !== undefined) radius = mm(v.pd) / 2
      else if (v.diameter !== undefined) radius = mm(v.diameter) / 2
      else radius = mm("1mm") / 2
    } else {
      // For rect, square, and pill shapes
      if (v.w !== undefined) width = mm(v.w)
      else if (v.pw !== undefined) width = mm(v.pw)
      else if (v.width !== undefined) width = mm(v.width)
      else if (v.s !== undefined) width = mm(v.s)
      else if (v.size !== undefined) width = mm(v.size)
      else width = mm("1mm")

      if (v.h !== undefined) height = mm(v.h)
      else if (v.ph !== undefined) height = mm(v.ph)
      else if (v.height !== undefined) height = mm(v.height)
      else if (shape === "square") height = width
      else if (shape === "rect")
        height = width // rect defaults to square when only width specified
      else height = mm("1mm") // pill default
    }

    const soldermaskmargin = resolveAlias(
      [
        ["soldermaskmargin", v.soldermaskmargin],
        ["maskmargin", v.maskmargin],
        ["smm", v.smm],
      ],
      isNumberEqual,
    )
    const mask2d = resolveAlias(
      [
        ["mask", v.mask],
        ["maskopening", v.maskopening],
        ["soldermaskopening", v.soldermaskopening],
      ],
      isDim2dEqual,
    )

    let maskradius: number | undefined
    let maskw: number | undefined
    let maskh: number | undefined

    if (shape === "circle") {
      if (
        v.maskw !== undefined ||
        v.mw !== undefined ||
        v.maskwidth !== undefined ||
        v.maskh !== undefined ||
        v.mh !== undefined ||
        v.maskheight !== undefined ||
        (mask2d !== undefined && Math.abs(mask2d.x - mask2d.y) > 1e-9)
      ) {
        throw new Error(
          "Circular smtpad requires a circular solder mask opening",
        )
      }
      const maskDiameter = resolveAlias(
        [
          ["maskd", v.maskd],
          ["md", v.md],
          ["maskdiameter", v.maskdiameter],
          ["masks", v.masks],
          ["ms", v.ms],
          ["masksize", v.masksize],
          ["mask", mask2d?.x],
        ],
        isNumberEqual,
      )
      maskradius = resolveAlias(
        [
          ["maskr", v.maskr],
          ["mr", v.mr],
          ["maskradius", v.maskradius],
          [
            "maskdiameter",
            maskDiameter !== undefined ? maskDiameter / 2 : undefined,
          ],
        ],
        isNumberEqual,
      )
      getCircleSolderMaskFields({
        radius: radius!,
        margin: soldermaskmargin,
        maskRadius: maskradius,
      })
    } else {
      if (
        v.maskr !== undefined ||
        v.mr !== undefined ||
        v.maskradius !== undefined ||
        v.maskd !== undefined ||
        v.md !== undefined ||
        v.maskdiameter !== undefined
      ) {
        throw new Error(
          "Non-circular smtpad does not accept circular mask radius or diameter",
        )
      }
      const maskSize = resolveAlias(
        [
          ["masks", v.masks],
          ["ms", v.ms],
          ["masksize", v.masksize],
        ],
        isNumberEqual,
      )
      maskw = resolveAlias(
        [
          ["maskw", v.maskw],
          ["mw", v.mw],
          ["maskwidth", v.maskwidth],
          ["masksize", maskSize],
          ["mask", mask2d?.x],
        ],
        isNumberEqual,
      )
      maskh = resolveAlias(
        [
          ["maskh", v.maskh],
          ["mh", v.mh],
          ["maskheight", v.maskheight],
          ["masksize", maskSize],
          ["mask", mask2d?.y],
        ],
        isNumberEqual,
      )
      if (shape === "square") {
        if (
          maskw !== undefined &&
          maskh !== undefined &&
          Math.abs(maskw - maskh) > 1e-9
        ) {
          throw new Error(
            "Square smtpad requires equal solder mask opening width and height",
          )
        }
        maskw = maskw ?? maskh
        maskh = maskh ?? maskw
      }
      if (shape === "pill") {
        getPillSolderMaskFields({
          width: width!,
          height: height!,
          margin: soldermaskmargin,
          maskWidth: maskw,
          maskHeight: maskh,
        })
      } else {
        getRectSolderMaskFields({
          width: width!,
          height: height!,
          margin: soldermaskmargin,
          maskWidth: maskw,
          maskHeight: maskh,
        })
      }
    }

    return {
      fn: v.fn,
      shape,
      radius,
      width,
      height,
      ...(soldermaskmargin !== undefined && { soldermaskmargin }),
      ...(maskradius !== undefined && { maskr: maskradius }),
      ...(maskw !== undefined && { maskw }),
      ...(maskh !== undefined && { maskh }),
    }
  })

export type SmtPadDef = z.input<typeof smtpad_def>

export const smtpad = (
  raw_params: SmtPadDef,
): { circuitJson: AnyCircuitElement[]; parameters: any } => {
  const params = smtpad_def.parse(raw_params)
  const {
    shape,
    radius,
    width,
    height,
    soldermaskmargin,
    maskr,
    maskw,
    maskh,
  } = params

  let pad: AnyCircuitElement
  let silkscreenOffset: number

  if (shape === "circle") {
    const solderMask = getCircleSolderMaskFields({
      radius: radius!,
      margin: soldermaskmargin,
      maskRadius: maskr,
    })
    pad = circlepad(1, {
      x: 0,
      y: 0,
      radius: radius!,
      solderMask,
    }) as AnyCircuitElement
    silkscreenOffset = radius! + 0.5
  } else if (shape === "pill") {
    const solderMask = getPillSolderMaskFields({
      width: width!,
      height: height!,
      margin: soldermaskmargin,
      maskWidth: maskw,
      maskHeight: maskh,
    })
    pad = pillpad(1, 0, 0, width!, height!, solderMask) as AnyCircuitElement
    silkscreenOffset = Math.max(width!, height!) / 2 + 0.5
  } else {
    // rect or square
    const solderMask = getRectSolderMaskFields({
      width: width!,
      height: height!,
      margin: soldermaskmargin,
      maskWidth: maskw,
      maskHeight: maskh,
    })
    pad = rectpad(
      1,
      0,
      0,
      width!,
      height!,
      undefined,
      solderMask,
    ) as AnyCircuitElement
    silkscreenOffset = height! / 2 + 0.5
  }

  return {
    circuitJson: [
      pad,
      silkscreenRef(0, silkscreenOffset, 0.2) as AnyCircuitElement,
    ],
    parameters: params,
  }
}
