import { length } from "circuit-json"
import { z } from "zod"

export type RectSolderMaskFields = {
  soldermask_margin?: number
  soldermask_margin_left?: number
  soldermask_margin_right?: number
  soldermask_margin_top?: number
  soldermask_margin_bottom?: number
}

export type UniformSolderMaskFields = {
  soldermask_margin?: number
}

const stripOuterParens = (value: unknown): unknown =>
  typeof value === "string"
    ? value.trim().replace(/^\(([^()]*)\)$/, "$1")
    : value

export const cleanLength = (value: number): number =>
  Number(value.toPrecision(12))

export const soldermaskMarginLength = z.preprocess(
  stripOuterParens,
  length.refine((value) => Number.isFinite(value), {
    message: "Solder mask margin must be a finite length",
  }),
)

export const positiveMaskLength = z.preprocess(
  stripOuterParens,
  length.refine((value) => Number.isFinite(value) && value > 0, {
    message: "Solder mask opening dimensions must be positive finite lengths",
  }),
)

const parsedDimensions = z.object({
  x: z.number(),
  y: z.number(),
})

export const maskOpening2d = z
  .union([
    parsedDimensions,
    z.number().transform((value) => ({ x: value, y: value })),
    z.string().transform((raw, ctx) => {
      const stripped = String(stripOuterParens(raw)).trim()
      const parts = stripped.split(/[x ]+/).filter(Boolean)
      if (parts.length === 1) {
        const parsed = length.safeParse(parts[0])
        if (!parsed.success) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Invalid solder mask opening dimension",
          })
          return z.NEVER
        }
        return { x: parsed.data, y: parsed.data }
      }
      if (parts.length === 2) {
        const parsedX = length.safeParse(parts[0])
        const parsedY = length.safeParse(parts[1])
        if (!parsedX.success || !parsedY.success) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Invalid solder mask opening dimensions",
          })
          return z.NEVER
        }
        return { x: parsedX.data, y: parsedY.data }
      }
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Invalid solder mask opening dimensions",
      })
      return z.NEVER
    }),
  ])
  .refine(
    ({ x, y }) => Number.isFinite(x) && Number.isFinite(y) && x > 0 && y > 0,
    "Solder mask opening dimensions must be positive finite lengths",
  )

export const resolveAlias = <T>(
  entries: Array<[string, T | undefined]>,
  isEqual: (a: T, b: T) => boolean = (a, b) => a === b,
): T | undefined => {
  let resolvedName: string | undefined
  let resolvedValue: T | undefined
  for (const [name, value] of entries) {
    if (value === undefined) continue
    if (resolvedValue === undefined) {
      resolvedName = name
      resolvedValue = value
      continue
    }
    if (!isEqual(resolvedValue, value)) {
      throw new Error(
        `Conflicting ${resolvedName} (${JSON.stringify(resolvedValue)}) and ${name} (${JSON.stringify(value)})`,
      )
    }
  }
  return resolvedValue
}

export const isDim2dEqual = (
  a: { x: number; y: number },
  b: { x: number; y: number },
): boolean => Math.abs(a.x - b.x) <= 1e-9 && Math.abs(a.y - b.y) <= 1e-9

export const isNumberEqual = (a: number, b: number): boolean =>
  Math.abs(a - b) <= 1e-9

export const getRectSolderMaskFields = ({
  width,
  height,
  margin,
  maskWidth,
  maskHeight,
}: {
  width: number
  height: number
  margin?: number
  maskWidth?: number
  maskHeight?: number
}): RectSolderMaskFields => {
  if (margin !== undefined && !Number.isFinite(margin)) {
    throw new Error("Solder mask margin must be a finite length")
  }
  if (
    maskWidth !== undefined &&
    (!Number.isFinite(maskWidth) || maskWidth <= 0)
  ) {
    throw new Error(
      "Solder mask opening width must be a positive finite length",
    )
  }
  if (
    maskHeight !== undefined &&
    (!Number.isFinite(maskHeight) || maskHeight <= 0)
  ) {
    throw new Error(
      "Solder mask opening height must be a positive finite length",
    )
  }

  const marginFromWidth =
    maskWidth !== undefined ? cleanLength((maskWidth - width) / 2) : undefined
  const marginFromHeight =
    maskHeight !== undefined
      ? cleanLength((maskHeight - height) / 2)
      : undefined

  if (margin !== undefined) {
    if (
      marginFromWidth !== undefined &&
      Math.abs(marginFromWidth - margin) > 1e-9
    ) {
      throw new Error("Conflicting solder mask margin and mask opening width")
    }
    if (
      marginFromHeight !== undefined &&
      Math.abs(marginFromHeight - margin) > 1e-9
    ) {
      throw new Error("Conflicting solder mask margin and mask opening height")
    }
  }

  const marginX = marginFromWidth ?? margin
  const marginY = marginFromHeight ?? margin

  if (marginX === undefined && marginY === undefined) {
    return {}
  }

  if (marginX !== undefined && width + 2 * marginX <= 1e-9) {
    throw new Error("Solder mask opening width must be positive")
  }
  if (marginY !== undefined && height + 2 * marginY <= 1e-9) {
    throw new Error("Solder mask opening height must be positive")
  }

  if (marginX !== undefined && marginY !== undefined) {
    if (Math.abs(marginX - marginY) <= 1e-9) {
      return { soldermask_margin: cleanLength(marginX) }
    }
    return {
      soldermask_margin_left: cleanLength(marginX),
      soldermask_margin_right: cleanLength(marginX),
      soldermask_margin_top: cleanLength(marginY),
      soldermask_margin_bottom: cleanLength(marginY),
    }
  }

  if (marginX !== undefined) {
    return {
      soldermask_margin_left: cleanLength(marginX),
      soldermask_margin_right: cleanLength(marginX),
    }
  }

  return {
    soldermask_margin_top: cleanLength(marginY!),
    soldermask_margin_bottom: cleanLength(marginY!),
  }
}

export const getCircleSolderMaskFields = ({
  radius,
  margin,
  maskRadius,
}: {
  radius: number
  margin?: number
  maskRadius?: number
}): UniformSolderMaskFields => {
  if (margin !== undefined && !Number.isFinite(margin)) {
    throw new Error("Solder mask margin must be a finite length")
  }
  if (
    maskRadius !== undefined &&
    (!Number.isFinite(maskRadius) || maskRadius <= 0)
  ) {
    throw new Error(
      "Solder mask opening radius must be a positive finite length",
    )
  }

  const marginFromRadius =
    maskRadius !== undefined ? cleanLength(maskRadius - radius) : undefined

  if (
    margin !== undefined &&
    marginFromRadius !== undefined &&
    Math.abs(marginFromRadius - margin) > 1e-9
  ) {
    throw new Error("Conflicting solder mask margin and mask opening radius")
  }

  const resolved = marginFromRadius ?? margin
  if (resolved === undefined) {
    return {}
  }

  if (radius + resolved <= 1e-9) {
    throw new Error("Solder mask opening radius must be positive")
  }

  return { soldermask_margin: cleanLength(resolved) }
}

export const getPillSolderMaskFields = ({
  width,
  height,
  margin,
  maskWidth,
  maskHeight,
}: {
  width: number
  height: number
  margin?: number
  maskWidth?: number
  maskHeight?: number
}): UniformSolderMaskFields => {
  if (margin !== undefined && !Number.isFinite(margin)) {
    throw new Error("Solder mask margin must be a finite length")
  }
  if (
    maskWidth !== undefined &&
    (!Number.isFinite(maskWidth) || maskWidth <= 0)
  ) {
    throw new Error(
      "Solder mask opening width must be a positive finite length",
    )
  }
  if (
    maskHeight !== undefined &&
    (!Number.isFinite(maskHeight) || maskHeight <= 0)
  ) {
    throw new Error(
      "Solder mask opening height must be a positive finite length",
    )
  }

  const marginX =
    maskWidth !== undefined ? cleanLength((maskWidth - width) / 2) : undefined
  const marginY =
    maskHeight !== undefined
      ? cleanLength((maskHeight - height) / 2)
      : undefined

  if (
    marginX !== undefined &&
    marginY !== undefined &&
    Math.abs(marginX - marginY) > 1e-9
  ) {
    throw new Error(
      "Pill pad solder mask opening requires uniform width and height margins",
    )
  }

  const marginFromMask = marginX ?? marginY
  if (
    margin !== undefined &&
    marginFromMask !== undefined &&
    Math.abs(marginFromMask - margin) > 1e-9
  ) {
    throw new Error(
      "Conflicting solder mask margin and mask opening dimensions",
    )
  }

  const resolved = marginFromMask ?? margin
  if (resolved === undefined) {
    return {}
  }

  if (width + 2 * resolved <= 1e-9 || height + 2 * resolved <= 1e-9) {
    throw new Error("Solder mask opening dimensions must be positive")
  }

  return { soldermask_margin: cleanLength(resolved) }
}
