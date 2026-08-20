import { expect, test } from "bun:test"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { fp } from "../src/footprinter"

const passiveCourtyardCases = [
  {
    component: "resistor",
    reference: "R1",
    footprint: "res_p0.8656mm_pw0.5657mm_ph0.54mm",
    expectedCenterX: -0.125,
    expectedWidth: 1.6813,
    expectedHeight: 1.44,
  },
  {
    component: "capacitor",
    reference: "C1",
    footprint: "cap_p0.8402mm_pw0.5mm_ph0.54mm",
    expectedCenterX: -0.125,
    expectedWidth: 1.5902,
    expectedHeight: 1.44,
  },
  {
    component: "diode",
    reference: "D1",
    footprint: "diode_p1.4mm_pw0.5mm_ph0.8mm",
    expectedCenterX: -0.125,
    expectedWidth: 2.15,
    expectedHeight: 1.7,
  },
  {
    component: "led",
    reference: "LED1",
    footprint: "led_p1.6mm_pw0.6mm_ph0.9mm",
    expectedCenterX: 0.125,
    expectedWidth: 2.45,
    expectedHeight: 1.8,
  },
] as const

for (const testCase of passiveCourtyardCases) {
  test(`${testCase.component} PCB snapshot shows a silk-enclosing courtyard`, () => {
    const circuitJson = fp.string(testCase.footprint).circuitJson()
    const courtyards = circuitJson.filter((element) =>
      element.type.startsWith("pcb_courtyard_"),
    )
    const courtyard = courtyards[0]

    expect(courtyards).toHaveLength(1)
    expect(courtyard?.type).toBe("pcb_courtyard_rect")
    if (courtyard?.type !== "pcb_courtyard_rect") return

    expect(courtyard.center.x).toBeCloseTo(testCase.expectedCenterX)
    expect(courtyard.center.y).toBeCloseTo(0)
    expect(courtyard.width).toBeCloseTo(testCase.expectedWidth)
    expect(courtyard.height).toBeCloseTo(testCase.expectedHeight)
    expect(courtyard.layer).toBe("top")

    const courtyardLeft = courtyard.center.x - courtyard.width / 2
    const courtyardRight = courtyard.center.x + courtyard.width / 2
    const courtyardBottom = courtyard.center.y - courtyard.height / 2
    const courtyardTop = courtyard.center.y + courtyard.height / 2
    const silkscreenPaths = circuitJson.filter(
      (element) => element.type === "pcb_silkscreen_path",
    )

    for (const path of silkscreenPaths) {
      const halfStroke = path.stroke_width / 2
      for (const point of path.route) {
        expect(point.x - halfStroke - courtyardLeft).toBeGreaterThanOrEqual(
          -1e-12,
        )
        expect(courtyardRight - (point.x + halfStroke)).toBeGreaterThanOrEqual(
          -1e-12,
        )
        expect(point.y - halfStroke - courtyardBottom).toBeGreaterThanOrEqual(
          -1e-12,
        )
        expect(courtyardTop - (point.y + halfStroke)).toBeGreaterThanOrEqual(
          -1e-12,
        )
      }
    }

    const renderedCircuitJson = circuitJson.map((element) =>
      element.type === "pcb_silkscreen_text" && element.text === "{REF}"
        ? { ...element, text: testCase.reference }
        : element,
    )
    const svgContent = convertCircuitJsonToPcbSvg(renderedCircuitJson, {
      showCourtyards: true,
      viewport: { minX: -2.4, minY: -1.6, maxX: 2.4, maxY: 1.6 },
    })

    expect(svgContent).toContain('data-type="pcb_courtyard_rect"')
    expect(svgContent).toMatchSvgSnapshot(
      import.meta.path,
      `passive-courtyard-${testCase.component}`,
    )
  })
}
