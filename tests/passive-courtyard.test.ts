import { expect, test } from "bun:test"
import type {
  AnyCircuitElement,
  PcbCourtyardRect,
  PcbPlatedHole,
  PcbSmtPad,
} from "circuit-json"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { fp } from "../src/footprinter"

const COURTYARD_CLEARANCE_MM = 0.25

type CopperGeometry =
  | {
      type: "pcb_smtpad"
      x: number
      y: number
      width: number
      height: number
    }
  | {
      type: "pcb_plated_hole"
      x: number
      y: number
      hole_diameter: number
      outer_diameter: number
    }

type FallbackCase = {
  name: string
  footprint: string
  expectedCopper: CopperGeometry[]
  body?: { width: number; height: number }
}

const fallbackCases: FallbackCase[] = [
  {
    name: "dimensioned resistor 0.8656 mm pitch",
    footprint: "res_p0.8656mm_pw0.5657mm_ph0.54mm",
    expectedCopper: [
      {
        type: "pcb_smtpad",
        x: -0.4328,
        y: 0,
        width: 0.5657,
        height: 0.54,
      },
      {
        type: "pcb_smtpad",
        x: 0.4328,
        y: 0,
        width: 0.5657,
        height: 0.54,
      },
    ],
  },
  {
    name: "dimensioned resistor 1.5067 mm pitch",
    footprint: "res_p1.5067mm_pw0.8065mm_ph0.864mm",
    expectedCopper: [
      {
        type: "pcb_smtpad",
        x: -0.75335,
        y: 0,
        width: 0.8065,
        height: 0.864,
      },
      {
        type: "pcb_smtpad",
        x: 0.75335,
        y: 0,
        width: 0.8065,
        height: 0.864,
      },
    ],
  },
  {
    name: "generic capacitor",
    footprint: "cap_p1.2mm_pw0.4mm_ph0.7mm",
    expectedCopper: [
      {
        type: "pcb_smtpad",
        x: -0.6,
        y: 0,
        width: 0.4,
        height: 0.7,
      },
      {
        type: "pcb_smtpad",
        x: 0.6,
        y: 0,
        width: 0.4,
        height: 0.7,
      },
    ],
  },
  {
    name: "generic diode",
    footprint: "diode_p1.4mm_pw0.5mm_ph0.8mm",
    expectedCopper: [
      {
        type: "pcb_smtpad",
        x: -0.7,
        y: 0,
        width: 0.5,
        height: 0.8,
      },
      {
        type: "pcb_smtpad",
        x: 0.7,
        y: 0,
        width: 0.5,
        height: 0.8,
      },
    ],
  },
  {
    name: "generic LED",
    footprint: "led_p1.6mm_pw0.6mm_ph0.9mm",
    expectedCopper: [
      {
        type: "pcb_smtpad",
        x: -0.8,
        y: 0,
        width: 0.6,
        height: 0.9,
      },
      {
        type: "pcb_smtpad",
        x: 0.8,
        y: 0,
        width: 0.6,
        height: 0.9,
      },
    ],
  },
  {
    name: "generic resistor with body dimensions",
    footprint: "res_p1mm_pw0.4mm_ph0.5mm_w2mm_h1mm",
    expectedCopper: [
      {
        type: "pcb_smtpad",
        x: -0.5,
        y: 0,
        width: 0.4,
        height: 0.5,
      },
      {
        type: "pcb_smtpad",
        x: 0.5,
        y: 0,
        width: 0.4,
        height: 0.5,
      },
    ],
    body: { width: 2, height: 1 },
  },
  {
    name: "generic THT resistor",
    footprint: "res_p2mm_pw0.8mm_ph0.5mm_tht",
    expectedCopper: [
      {
        type: "pcb_plated_hole",
        x: -1,
        y: 0,
        hole_diameter: 0.8,
        outer_diameter: 1,
      },
      {
        type: "pcb_plated_hole",
        x: 1,
        y: 0,
        hole_diameter: 0.8,
        outer_diameter: 1,
      },
    ],
  },
]

const getCopperGeometry = (
  circuitJson: AnyCircuitElement[],
): CopperGeometry[] =>
  circuitJson
    .filter(
      (element): element is PcbSmtPad | PcbPlatedHole =>
        element.type === "pcb_smtpad" || element.type === "pcb_plated_hole",
    )
    .map((element) =>
      element.type === "pcb_smtpad"
        ? {
            type: element.type,
            x: element.x,
            y: element.y,
            width: element.width,
            height: element.height,
          }
        : {
            type: element.type,
            x: element.x,
            y: element.y,
            hole_diameter: element.hole_diameter,
            outer_diameter: element.outer_diameter,
          },
    )

const getCopperBounds = (copper: CopperGeometry[]) => {
  const bounds = copper.map((element) => {
    const width =
      element.type === "pcb_smtpad" ? element.width : element.outer_diameter
    const height =
      element.type === "pcb_smtpad" ? element.height : element.outer_diameter
    return {
      minX: element.x - width / 2,
      maxX: element.x + width / 2,
      minY: element.y - height / 2,
      maxY: element.y + height / 2,
    }
  })

  return {
    minX: Math.min(...bounds.map(({ minX }) => minX)),
    maxX: Math.max(...bounds.map(({ maxX }) => maxX)),
    minY: Math.min(...bounds.map(({ minY }) => minY)),
    maxY: Math.max(...bounds.map(({ maxY }) => maxY)),
  }
}

const getOnlyCourtyard = (
  circuitJson: AnyCircuitElement[],
): PcbCourtyardRect => {
  const courtyards = circuitJson.filter((element) =>
    element.type.startsWith("pcb_courtyard_"),
  )
  expect(courtyards).toHaveLength(1)
  expect(courtyards[0]?.type).toBe("pcb_courtyard_rect")
  return courtyards[0] as PcbCourtyardRect
}

for (const testCase of fallbackCases) {
  test(`fallback courtyard: ${testCase.name}`, () => {
    const circuitJson = fp.string(testCase.footprint).circuitJson()
    const copper = getCopperGeometry(circuitJson)
    const courtyard = getOnlyCourtyard(circuitJson)
    const copperBounds = getCopperBounds(copper)
    const copperWidth = copperBounds.maxX - copperBounds.minX
    const copperHeight = copperBounds.maxY - copperBounds.minY
    const envelopeWidth = Math.max(copperWidth, testCase.body?.width ?? 0)
    const envelopeHeight = Math.max(copperHeight, testCase.body?.height ?? 0)
    const portHints = circuitJson
      .filter(
        (element): element is PcbSmtPad | PcbPlatedHole =>
          element.type === "pcb_smtpad" || element.type === "pcb_plated_hole",
      )
      .map((element) => element.port_hints)

    expect(copper).toEqual(testCase.expectedCopper)
    expect(portHints).toEqual(
      copper[0]?.type === "pcb_plated_hole"
        ? [["1"], ["2"]]
        : [
            ["1", "left"],
            ["2", "right"],
          ],
    )
    expect(courtyard).toMatchObject({
      center: { x: 0, y: 0 },
      layer: "top",
    })
    expect(Number.isFinite(courtyard.width)).toBe(true)
    expect(Number.isFinite(courtyard.height)).toBe(true)
    expect(courtyard.width).toBeGreaterThan(0)
    expect(courtyard.height).toBeGreaterThan(0)
    expect(courtyard.width).toBeCloseTo(
      envelopeWidth + 2 * COURTYARD_CLEARANCE_MM,
      12,
    )
    expect(courtyard.height).toBeCloseTo(
      envelopeHeight + 2 * COURTYARD_CLEARANCE_MM,
      12,
    )
    expect(-courtyard.width / 2).toBeLessThanOrEqual(copperBounds.minX)
    expect(courtyard.width / 2).toBeGreaterThanOrEqual(copperBounds.maxX)
    expect(-courtyard.height / 2).toBeLessThanOrEqual(copperBounds.minY)
    expect(courtyard.height / 2).toBeGreaterThanOrEqual(copperBounds.maxY)

    expect(
      convertCircuitJsonToPcbSvg(circuitJson, { showCourtyards: true }),
    ).toMatchSvgSnapshot(import.meta.path, testCase.footprint)
  })
}

for (const predefined of [
  {
    footprint: "res0402",
    width: 1.86,
    height: 0.94,
    p: 1.02,
    pw: 0.54,
    ph: 0.64,
  },
  {
    footprint: "res0603",
    width: 2.96,
    height: 1.46,
    p: 1.65,
    pw: 0.8,
    ph: 0.95,
  },
]) {
  test(`${predefined.footprint} keeps its predefined courtyard`, () => {
    const circuitJson = fp.string(predefined.footprint).circuitJson()
    const copper = getCopperGeometry(circuitJson)
    const courtyard = getOnlyCourtyard(circuitJson)
    const copperBounds = getCopperBounds(copper)

    expect(copper).toEqual([
      {
        type: "pcb_smtpad",
        x: -predefined.p / 2,
        y: 0,
        width: predefined.pw,
        height: predefined.ph,
      },
      {
        type: "pcb_smtpad",
        x: predefined.p / 2,
        y: 0,
        width: predefined.pw,
        height: predefined.ph,
      },
    ])
    expect(courtyard).toMatchObject({
      center: { x: 0, y: 0 },
      width: predefined.width,
      height: predefined.height,
      layer: "top",
    })
    expect(Number.isFinite(courtyard.width)).toBe(true)
    expect(Number.isFinite(courtyard.height)).toBe(true)
    expect(courtyard.width).toBeGreaterThan(0)
    expect(courtyard.height).toBeGreaterThan(0)
    expect(-courtyard.width / 2).toBeLessThanOrEqual(copperBounds.minX)
    expect(courtyard.width / 2).toBeGreaterThanOrEqual(copperBounds.maxX)
    expect(-courtyard.height / 2).toBeLessThanOrEqual(copperBounds.minY)
    expect(courtyard.height / 2).toBeGreaterThanOrEqual(copperBounds.maxY)

    expect(
      convertCircuitJsonToPcbSvg(circuitJson, { showCourtyards: true }),
    ).toMatchSvgSnapshot(import.meta.path, predefined.footprint)
  })
}
