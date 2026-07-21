import type { AnyCircuitElement } from "circuit-json"

// Copper dimensions below come from EasyEDA footprints imported with
// `tsci import --jlcpcb <part number>` on 2026-07-13.

type RectCopper = {
  kind: "rect"
  x: number
  y: number
  width: number
  height: number
}

type PillRingCopper = {
  kind: "pill-ring"
  x: number
  y: number
  holeWidth: number
  holeHeight: number
  outerWidth: number
  outerHeight: number
}

export type CopperShape = RectCopper | PillRingCopper

const rect = (
  x: number,
  y: number,
  width: number,
  height: number,
): RectCopper => ({ kind: "rect", x, y, width, height })

const pillRing = (
  x: number,
  y: number,
  holeWidth: number,
  holeHeight: number,
  outerWidth: number,
  outerHeight: number,
): PillRingCopper => ({
  kind: "pill-ring",
  x,
  y,
  holeWidth,
  holeHeight,
  outerWidth,
  outerHeight,
})

const symmetricShell = ({
  x,
  topY,
  bottomY,
  topHoleWidth,
  topHoleHeight,
  topOuterWidth,
  topOuterHeight,
  bottomHoleWidth,
  bottomHoleHeight,
  bottomOuterWidth,
  bottomOuterHeight,
}: {
  x: number
  topY: number
  bottomY: number
  topHoleWidth: number
  topHoleHeight: number
  topOuterWidth: number
  topOuterHeight: number
  bottomHoleWidth: number
  bottomHoleHeight: number
  bottomOuterWidth: number
  bottomOuterHeight: number
}): PillRingCopper[] => [
  pillRing(
    -x,
    topY,
    topHoleWidth,
    topHoleHeight,
    topOuterWidth,
    topOuterHeight,
  ),
  pillRing(x, topY, topHoleWidth, topHoleHeight, topOuterWidth, topOuterHeight),
  pillRing(
    -x,
    -bottomY,
    bottomHoleWidth,
    bottomHoleHeight,
    bottomOuterWidth,
    bottomOuterHeight,
  ),
  pillRing(
    x,
    -bottomY,
    bottomHoleWidth,
    bottomHoleHeight,
    bottomOuterWidth,
    bottomOuterHeight,
  ),
]

const contactRow = (
  xs: number[],
  y: number,
  widths: number[],
  height: number,
): RectCopper[] => xs.map((x, index) => rect(x, y, widths[index]!, height))

const mergedXs = [
  -3.2, -2.4, -1.75, -1.25, -0.75, -0.25, 0.25, 0.75, 1.25, 1.75, 2.4, 3.2,
]
const mergedWidths55 = [
  0.55, 0.55, 0.3, 0.3, 0.3, 0.3, 0.3, 0.3, 0.3, 0.3, 0.55, 0.55,
]
const splitXs = [
  -3.35, -3.05, -2.55, -2.25, -1.75, -1.25, -0.75, -0.25, 0.25, 0.75, 1.25,
  1.75, 2.25, 2.55, 3.05, 3.35,
]

export const jlcpcbUsbCMidMountVariants: Array<{
  part: string
  manufacturerPartNumber: string
  definition: string
  targetCopper: CopperShape[]
}> = [
  {
    part: "C2765186",
    manufacturerPartNumber: "TYPE-C 16PIN 2MD(073)",
    definition: "usbcmidmount16_pinstart13",
    targetCopper: [
      ...symmetricShell({
        x: 4.324985,
        topY: 1.57511755,
        bottomY: 2.62502645,
        topHoleWidth: 0.5999988,
        topHoleHeight: 1.499997,
        topOuterWidth: 1.0999978,
        topOuterHeight: 1.999996,
        bottomHoleWidth: 0.5999988,
        bottomHoleHeight: 1.1999976,
        bottomOuterWidth: 1.1999976,
        bottomOuterHeight: 1.7999964,
      }),
      ...contactRow(mergedXs, 2.12502755, mergedWidths55, 1.0999978),
    ],
  },
  {
    part: "C2906289",
    manufacturerPartNumber: "TYPE-C 16P CB0.8 073",
    definition:
      "usbcmidmount16_noholes_powerx3.21mm_powerpw0.6mm_rowy2.386mm_ph1mm_shellx5.6mm_topy1.164mm_bottomy2.836mm_tophh1.4mm_topring0.3mm_bottomhh1.8mm_bodybottom4.876mm",
    targetCopper: [
      ...symmetricShell({
        x: 5.600065,
        topY: 1.1638725,
        bottomY: 2.8361195,
        topHoleWidth: 0.5999988,
        topHoleHeight: 1.3999972,
        topOuterWidth: 1.1999976,
        topOuterHeight: 1.999996,
        bottomHoleWidth: 0.5999988,
        bottomHoleHeight: 1.7999964,
        bottomOuterWidth: 1.1999976,
        bottomOuterHeight: 2.3999952,
      }),
      ...contactRow(
        [
          -3.209925, -2.409825, -1.749679, -1.249807, -0.749681, -0.249809,
          0.250317, 0.750189, 1.250315, 1.750187, 2.410079, 3.209925,
        ],
        2.3858665,
        [
          0.5999988, 0.5999988, 0.2999994, 0.2999994, 0.2999994, 0.2999994,
          0.2999994, 0.2999994, 0.2999994, 0.2999994, 0.5999988, 0.5999988,
        ],
        0.999998,
      ),
    ],
  },
  {
    part: "C2906290",
    manufacturerPartNumber: "TYPE-C 16P CB1.6 073",
    definition:
      "usbcmidmount16_split_reverse_noholes_pinstart25_rowy2.325mm_shellx5.62mm_topy1.175mm_bottomy2.825mm_tophh1.3mm_topring0.2mm_bottomhh1.7mm_bottomring0.2mm_bodybottom4.925mm",
    targetCopper: [
      ...symmetricShell({
        x: 5.620004,
        topY: 1.17494055,
        bottomY: 2.82505145,
        topHoleWidth: 0.5999988,
        topHoleHeight: 1.2999974,
        topOuterWidth: 0.999998,
        topOuterHeight: 1.6999966,
        bottomHoleWidth: 0.5999988,
        bottomHoleHeight: 1.6999966,
        bottomOuterWidth: 0.999998,
        bottomOuterHeight: 2.0999958,
      }),
      ...contactRow(
        splitXs,
        2.32505255,
        splitXs.map(() => 0.2999994),
        1.0999978,
      ),
    ],
  },
  {
    part: "C709357",
    manufacturerPartNumber: "KH-TYPE-C-16P",
    definition:
      "usbcmidmount16_split_pinstart1_rowy2.115mm_ph1.3mm_shellx4.32mm_topy1.465mm_bottomy2.715mm_tophh1.6mm_topring0.2mm_bottomhh1.4mm_bottomring0.2mm_holey0.935mm_bodybottom5.38mm",
    targetCopper: [
      ...symmetricShell({
        x: 4.320032,
        topY: 1.46503395,
        bottomY: 2.71504405,
        topHoleWidth: 0.5999988,
        topHoleHeight: 1.5999968,
        topOuterWidth: 0.999998,
        topOuterHeight: 1.999996,
        bottomHoleWidth: 0.5999988,
        bottomHoleHeight: 1.3999972,
        bottomOuterWidth: 0.999998,
        bottomOuterHeight: 1.7999964,
      }),
      ...contactRow(
        splitXs,
        2.11501995,
        splitXs.map(() => 0.2999994),
        1.2999974,
      ),
    ],
  },
  {
    part: "C319148",
    manufacturerPartNumber: "U262-161N-4BVC11",
    definition:
      "usbcmidmount16_reverse_pinstart13_rowy2.161mm_ph1.3mm_powerpw0.6mm_shellx4.32mm_topy1.419mm_bottomy2.761mm_tophw0.7mm_tophh1.7mm_topring0.25mm_bottomhw0.7mm_bottomhh1.3mm_bottomring0.25mm_holey0.919mm_bodybottom5.4mm",
    targetCopper: [
      ...symmetricShell({
        x: 4.320032,
        topY: 1.41881865,
        bottomY: 2.76125935,
        topHoleWidth: 0.700024,
        topHoleHeight: 1.700022,
        topOuterWidth: 1.1999976,
        topOuterHeight: 2.1999956,
        bottomHoleWidth: 0.700024,
        bottomHoleHeight: 1.3000228,
        bottomOuterWidth: 1.1999976,
        bottomOuterHeight: 1.7999964,
      }),
      ...contactRow(
        mergedXs,
        2.16126065,
        [
          0.5999988, 0.5999988, 0.2999994, 0.2999994, 0.2999994, 0.2999994,
          0.2999994, 0.2999994, 0.2999994, 0.2999994, 0.5999988, 0.5999988,
        ],
        1.2999974,
      ),
    ],
  },
]

export const circuitJsonToCopperShapes = (
  circuitJson: AnyCircuitElement[],
): CopperShape[] =>
  circuitJson.flatMap((element): CopperShape[] => {
    if (element.type === "pcb_smtpad" && element.shape === "rect") {
      return [rect(element.x, element.y, element.width, element.height)]
    }
    if (element.type === "pcb_plated_hole" && element.shape === "pill") {
      return [
        pillRing(
          element.x,
          element.y,
          element.hole_width,
          element.hole_height,
          element.outer_width,
          element.outer_height,
        ),
      ]
    }
    return []
  })

const containsPill = (
  x: number,
  y: number,
  centerX: number,
  centerY: number,
  width: number,
  height: number,
) => {
  const radius = width / 2
  const straightHalfHeight = Math.max((height - width) / 2, 0)
  const dx = Math.abs(x - centerX)
  const dy = Math.max(Math.abs(y - centerY) - straightHalfHeight, 0)
  return dx * dx + dy * dy <= radius * radius
}

const containsCopper = (shape: CopperShape, x: number, y: number) => {
  if (shape.kind === "rect") {
    return (
      Math.abs(x - shape.x) <= shape.width / 2 &&
      Math.abs(y - shape.y) <= shape.height / 2
    )
  }
  return (
    containsPill(x, y, shape.x, shape.y, shape.outerWidth, shape.outerHeight) &&
    !containsPill(x, y, shape.x, shape.y, shape.holeWidth, shape.holeHeight)
  )
}

const shapeBounds = (shape: CopperShape) => {
  const width = shape.kind === "rect" ? shape.width : shape.outerWidth
  const height = shape.kind === "rect" ? shape.height : shape.outerHeight
  return {
    left: shape.x - width / 2,
    right: shape.x + width / 2,
    bottom: shape.y - height / 2,
    top: shape.y + height / 2,
  }
}

export const calculateCopperIou = (
  actual: CopperShape[],
  target: CopperShape[],
  resolution = 0.01,
) => {
  const allShapes = [...actual, ...target]
  const bounds = allShapes.map(shapeBounds)
  const left = Math.min(...bounds.map((bound) => bound.left))
  const right = Math.max(...bounds.map((bound) => bound.right))
  const bottom = Math.min(...bounds.map((bound) => bound.bottom))
  const top = Math.max(...bounds.map((bound) => bound.top))
  let intersectionSamples = 0
  let unionSamples = 0

  for (let y = bottom + resolution / 2; y < top; y += resolution) {
    for (let x = left + resolution / 2; x < right; x += resolution) {
      const inActual = actual.some((shape) => containsCopper(shape, x, y))
      const inTarget = target.some((shape) => containsCopper(shape, x, y))
      if (inActual || inTarget) unionSamples += 1
      if (inActual && inTarget) intersectionSamples += 1
    }
  }

  return intersectionSamples / unionSamples
}
