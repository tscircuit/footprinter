import { type AnyCircuitElement, length } from "circuit-json"
import { dim2d } from "./zod/dim-2d"

const parseMaskDimensions = (
  value: unknown,
): { x: number; y: number } | undefined => {
  if (value === undefined || value === null || value === false) return undefined
  if (
    typeof value === "object" &&
    "x" in value &&
    "y" in value &&
    typeof (value as any).x === "number" &&
    typeof (value as any).y === "number"
  ) {
    return { x: (value as any).x, y: (value as any).y }
  }
  const str = String(value).replace(/^\(([^()]*)\)$/, "$1")
  if (/[x ]/.test(str)) {
    return dim2d.parse(str)
  }
  const parsed = length.parse(str)
  return { x: parsed, y: parsed }
}

const applyPadMaskMargins = (
  element: Extract<AnyCircuitElement, { type: "pcb_smtpad" }>,
  marginX: number,
  marginY: number,
) => {
  if (Math.abs(marginX - marginY) < 1e-9) {
    element.soldermask_margin = Number(marginX.toPrecision(12))
    return
  }
  element.soldermask_margin = Number(Math.min(marginX, marginY).toPrecision(12))
  if (element.shape === "rect" || element.shape === "rotated_rect") {
    element.soldermask_margin_left = Number(marginX.toPrecision(12))
    element.soldermask_margin_right = Number(marginX.toPrecision(12))
    element.soldermask_margin_top = Number(marginY.toPrecision(12))
    element.soldermask_margin_bottom = Number(marginY.toPrecision(12))
  }
}

export const applySolderMask = (
  elements: AnyCircuitElement[],
  target: Record<string, any>,
): AnyCircuitElement[] => {
  const rawPadMargin = target.soldermaskmargin ?? target.smm
  const rawThermalPadMargin = target.thermalpadsoldermaskmargin
  const padMaskDims = parseMaskDimensions(target.padmask)
  const thermalPadMaskDims = parseMaskDimensions(target.thermalpadmask)

  if (
    rawPadMargin === undefined &&
    rawThermalPadMargin === undefined &&
    padMaskDims === undefined &&
    thermalPadMaskDims === undefined
  ) {
    return elements
  }

  const padMargin =
    rawPadMargin !== undefined ? length.parse(rawPadMargin) : undefined
  const thermalPadMargin =
    rawThermalPadMargin !== undefined
      ? length.parse(rawThermalPadMargin)
      : undefined

  for (const element of elements) {
    if (element.type !== "pcb_smtpad") continue

    const isThermalPad = element.port_hints?.includes("thermalpad") ?? false

    if (isThermalPad) {
      if (
        thermalPadMaskDims !== undefined &&
        "width" in element &&
        "height" in element
      ) {
        const marginX = (thermalPadMaskDims.x - element.width) / 2
        const marginY = (thermalPadMaskDims.y - element.height) / 2
        applyPadMaskMargins(element, marginX, marginY)
      } else if (thermalPadMargin !== undefined) {
        element.soldermask_margin = thermalPadMargin
      } else if (padMargin !== undefined) {
        element.soldermask_margin = padMargin
      }
      continue
    }

    if (padMaskDims !== undefined) {
      if ("width" in element && "height" in element) {
        let maskX = padMaskDims.x
        let maskY = padMaskDims.y
        if (
          maskX !== maskY &&
          element.width !== element.height &&
          element.width > element.height !== maskX > maskY
        ) {
          ;[maskX, maskY] = [maskY, maskX]
        }
        const marginX = (maskX - element.width) / 2
        const marginY = (maskY - element.height) / 2
        applyPadMaskMargins(element, marginX, marginY)
      } else if ("radius" in element) {
        element.soldermask_margin = Number(
          (padMaskDims.x / 2 - element.radius).toPrecision(12),
        )
      }
    } else if (padMargin !== undefined) {
      element.soldermask_margin = padMargin
    }
  }

  return elements
}
