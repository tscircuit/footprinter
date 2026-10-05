import { expect, test } from "bun:test"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { fp } from "../src/footprinter"

test("soic8_package(D0008A) matches TI drawing 4214825/C example copper lands", () => {
  const circuit = fp.string("soic8_package(D0008A)").circuitJson()
  const pads = circuit.filter((el) => el.type === "pcb_smtpad")
  // Independent top-view coordinates from TI's 5.4 mm row spacing and
  // 1.27 mm pitch, with counterclockwise numbering starting at top left.
  const expected = [
    [-2.7, 1.905],
    [-2.7, 0.635],
    [-2.7, -0.635],
    [-2.7, -1.905],
    [2.7, -1.905],
    [2.7, -0.635],
    [2.7, 0.635],
    [2.7, 1.905],
  ]
  expect(pads).toHaveLength(8)
  pads.forEach((pad, i) => {
    expect(pad.shape).toBe("rect")
    if (pad.shape !== "rect") throw new Error("Expected rectangular pad")
    expect(pad.port_hints).toEqual([String(i + 1)])
    expect(pad.layer).toBe("top")
    expect(pad.x).toBeCloseTo(expected[i]![0]!, 6)
    expect(pad.y).toBeCloseTo(expected[i]![1]!, 6)
    expect(pad.width).toBeCloseTo(1.55, 6)
    expect(pad.height).toBeCloseTo(0.6, 6)
    expect(pad.corner_radius).toBeCloseTo(0.05, 6)
  })
  expect(convertCircuitJsonToPcbSvg(circuit)).toMatchSvgSnapshot(
    import.meta.path,
    "soic8-ti-d0008a",
  )
})

test("soic8_package(D0008A) supports string and typed builder APIs", () => {
  expect(fp().soic(8).package("D0008A").circuitJson()).toEqual(
    fp.string("soic8_package(D0008A)").circuitJson(),
  )
  expect(fp.string("soic8_package(D0008A)").json()).toMatchObject({
    fn: "soic",
    package: "D0008A",
    num_pins: 8,
    w: 6.95,
    p: 1.27,
    pl: 1.55,
    pw: 0.6,
  })
  expect(() => fp.string("soic16_package(D0008A)").circuitJson()).toThrow(
    "requires 8 pins",
  )
  expect(() => fp.string("soic8_package(UNKNOWN)").circuitJson()).toThrow()
  expect(fp.string("soic8_package(d0008a)").json()).toEqual(
    fp.string("soic8_package(D0008A)").json(),
  )
  for (const definition of [
    "soic8_package(D0008A)_pl1.6mm",
    "soic8_pl1.6mm_package(D0008A)",
  ]) {
    expect(fp.string(definition).json()).toMatchObject({
      package: "D0008A",
      pl: 1.6,
      w: 6.95,
    })
  }
})

test("soic8_package(D0008A) supports common footprint options", () => {
  const circuit = fp()
    .soic(8)
    .package("D0008A")
    .norefdes()
    .pin1location("rightside", "bottom")
    .circuitJson()
  expect(circuit).toEqual(
    fp
      .string("soic8_package(D0008A)_norefdes_pin1location(rightside,bottom)")
      .circuitJson(),
  )
  expect(
    circuit
      .filter((el) => el.type === "pcb_silkscreen_text")
      .every((el) => el.text === ""),
  ).toBe(true)
  const pin1 = circuit.find(
    (el) => el.type === "pcb_smtpad" && el.port_hints?.includes("1"),
  )
  expect(pin1).toMatchObject({ x: 2.7, y: -1.905 })
  expect(convertCircuitJsonToPcbSvg(circuit)).toMatchSvgSnapshot(
    import.meta.path,
    "soic8-ti-d0008a-rightside-norefdes",
  )
})
