import { expect, test } from "bun:test"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { fp } from "../src/footprinter"
import { dip_def } from "../src/fn/dip"

test("DIP string and builder convert inch dimensions to millimeters", () => {
  const circuitJson = fp
    .string("dip4_w0.3in_p0.1in_id0.03in_od0.06in")
    .circuitJson()
  expect(circuitJson).toEqual(
    fp().dip(4).w("0.3in").p("0.1in").id("0.03in").od("0.06in").circuitJson(),
  )
  const holes = circuitJson.filter(
    (element) => element.type === "pcb_plated_hole",
  )

  expect(holes).toHaveLength(4)
  const expectedCenters = [
    { x: -3.81, y: 1.27 },
    { x: -3.81, y: -1.27 },
    { x: 3.81, y: -1.27 },
    { x: 3.81, y: 1.27 },
  ]
  for (const [index, expectedCenter] of expectedCenters.entries()) {
    expect(holes[index]?.x).toBeCloseTo(expectedCenter.x)
    expect(holes[index]?.y).toBeCloseTo(expectedCenter.y)
  }
  const [pin1, pin2] = holes
  if (
    pin1?.shape !== "circular_hole_with_rect_pad" ||
    pin2?.shape !== "circle"
  ) {
    throw new Error("Expected a rectangular pin 1 pad and a circular pin 2 pad")
  }
  expect(pin1.hole_diameter).toBeCloseTo(0.762)
  expect(pin1.rect_pad_width).toBeCloseTo(1.524)
  expect(pin1.rect_pad_height).toBeCloseTo(1.524)
  expect(pin2.hole_diameter).toBeCloseTo(0.762)
  expect(pin2.outer_diameter).toBeCloseTo(1.524)
  expect(convertCircuitJsonToPcbSvg(circuitJson)).toMatchSvgSnapshot(
    import.meta.path,
    "dip-inch-dimensions",
  )
})

test("DIP builder converts centimeter dimensions to millimeters", () => {
  const circuitJson = fp()
    .dip(4)
    .w("0.762cm")
    .p("0.254cm")
    .id("0.08cm")
    .od("0.16cm")
    .circuitJson()

  expect(circuitJson).toEqual(fp.string("dip4").circuitJson())
  expect(convertCircuitJsonToPcbSvg(circuitJson)).toMatchSvgSnapshot(
    import.meta.path,
    "dip-centimeter-dimensions",
  )
})

test.each([7.62, "7.62mm", "300mil", "300MIL", "300Mil", "0.3in", "0.762cm"])(
  "DIP dimensions accept %s using the shared length conversion",
  (dimension) => {
    const parameters = dip_def.parse({
      fn: "dip",
      w: dimension,
      p: dimension,
      id: dimension,
      od: dimension,
    })

    for (const dimensionName of ["w", "p", "id", "od"] as const) {
      expect(parameters[dimensionName]).toBeCloseTo(7.62)
    }
  },
)
