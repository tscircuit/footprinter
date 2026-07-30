import { test, expect } from "bun:test"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { fp } from "../src/footprinter"

const getRouteBoundsCenter = (
  route: Array<{
    x: number
    y: number
  }>,
) => {
  const xs = route.map((point) => point.x)
  const ys = route.map((point) => point.y)

  return {
    x: (Math.min(...xs) + Math.max(...xs)) / 2,
    y: (Math.min(...ys) + Math.max(...ys)) / 2,
  }
}

test("to92 (triangular)", () => {
  const circuitJson = fp.string("to92").circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(circuitJson)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path)
})
test("to92_2", () => {
  const circuitJson = fp.string("to92_2").circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(circuitJson)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "to92_2")
})

test("to92_inline (inline)", () => {
  const circuitJson = fp.string("to92_inline").circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(circuitJson)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "to92_inline")
})

test.each(["to92", "to92_2", "to92_inline"])(
  "%s body and courtyard are centered around the footprint origin",
  (footprint) => {
    const circuitJson = fp.string(footprint).circuitJson()
    const silkscreenBody = circuitJson.find(
      (element) => element.type === "pcb_silkscreen_path",
    )
    const courtyard = circuitJson.find(
      (element) => element.type === "pcb_courtyard_outline",
    )

    if (silkscreenBody?.type !== "pcb_silkscreen_path") {
      throw new Error(`${footprint} is missing a silkscreen body`)
    }
    if (courtyard?.type !== "pcb_courtyard_outline") {
      throw new Error(`${footprint} is missing a courtyard outline`)
    }

    const bodyCenter = getRouteBoundsCenter(silkscreenBody.route)
    const courtyardCenter = getRouteBoundsCenter(courtyard.outline)

    expect(bodyCenter.x).toBeCloseTo(0)
    expect(bodyCenter.y).toBeCloseTo(0)
    expect(courtyardCenter.x).toBeCloseTo(0)
    expect(courtyardCenter.y).toBeCloseTo(0)
  },
)
