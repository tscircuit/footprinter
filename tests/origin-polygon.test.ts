import { expect, test } from "bun:test"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { fp } from "../src/footprinter"

test.each([
  ["bottomleft", -2.6, -1.95],
  ["center", -0.3, 0],
  ["pin1", -1.95, 1.5],
] as const)(
  "sot89 polygon pads follow %s origin",
  (origin, offsetX, offsetY) => {
    const original = fp.string("sot89_3").circuitJson()
    const originalSnapshot = structuredClone(original)
    const shifted = fp.string("sot89_3").origin(origin).circuitJson()

    for (const [index, element] of shifted.entries()) {
      const sourceElement = originalSnapshot[index]!
      if (
        element.type === "pcb_smtpad" &&
        sourceElement.type === "pcb_smtpad"
      ) {
        if (element.shape === "polygon" && sourceElement.shape === "polygon") {
          for (const [pointIndex, point] of element.points.entries()) {
            expect(point.x).toBeCloseTo(
              sourceElement.points[pointIndex]!.x - offsetX,
            )
            expect(point.y).toBeCloseTo(
              sourceElement.points[pointIndex]!.y - offsetY,
            )
          }
        } else if (element.shape === "rect" && sourceElement.shape === "rect") {
          expect(element.x).toBeCloseTo(sourceElement.x - offsetX)
          expect(element.y).toBeCloseTo(sourceElement.y - offsetY)
        }
      }
      if (
        element.type === "pcb_silkscreen_path" &&
        sourceElement.type === "pcb_silkscreen_path"
      ) {
        for (const [pointIndex, point] of element.route.entries()) {
          expect(point.x).toBeCloseTo(
            sourceElement.route[pointIndex]!.x - offsetX,
          )
          expect(point.y).toBeCloseTo(
            sourceElement.route[pointIndex]!.y - offsetY,
          )
        }
      }
    }

    // SOT89 reuses module-level polygon points between generated footprints.
    expect(original).toEqual(originalSnapshot)
    expect(fp.string("sot89_3").circuitJson()).toEqual(originalSnapshot)
    expect(fp.string("sot89_3").origin(origin).circuitJson()).toEqual(shifted)
    expect(convertCircuitJsonToPcbSvg(shifted)).toMatchSvgSnapshot(
      import.meta.path,
      `sot89_${origin}`,
    )
  },
)

test("dfn polygon pin1 is centered at the pin1 origin", () => {
  const circuitJson = fp
    .string(
      "dfn4_w1.2mm_p0.8mm_pl0.3mm_pw0.5mm_cornerpads_cornerpadcutlength0.1mm_thermalpad0.6mmx0.7mm",
    )
    .origin("pin1")
    .circuitJson()
  const pin1 = circuitJson.find(
    (element) =>
      element.type === "pcb_smtpad" && element.port_hints?.[0] === "1",
  )
  expect(pin1?.type).toBe("pcb_smtpad")
  if (pin1?.type !== "pcb_smtpad" || pin1.shape !== "polygon") {
    throw new Error("Expected a polygon pad for pin1")
  }
  const xs = pin1.points.map((point) => point.x)
  const ys = pin1.points.map((point) => point.y)
  expect((Math.min(...xs) + Math.max(...xs)) / 2).toBeCloseTo(0)
  expect((Math.min(...ys) + Math.max(...ys)) / 2).toBeCloseTo(0)
  const thermalPad = circuitJson.find(
    (element) => element.type === "pcb_smtpad" && element.shape === "rect",
  )
  if (thermalPad?.type !== "pcb_smtpad" || thermalPad.shape !== "rect") {
    throw new Error("Expected a rectangular thermal pad")
  }
  expect(thermalPad.x).toBeCloseTo(0.45)
  expect(thermalPad.y).toBeCloseTo(-0.4)
  expect(convertCircuitJsonToPcbSvg(circuitJson)).toMatchSvgSnapshot(
    import.meta.path,
    "dfn_polygon_pin1",
  )
})
