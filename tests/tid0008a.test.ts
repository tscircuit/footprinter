import { expect, test } from "bun:test"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { fp, getFootprintNames } from "../src/footprinter"
import { tid0008a_def } from "../src/fn/tid0008a"

test("tid0008a matches TI drawing 4214825/C example copper lands", () => {
  const circuit = fp.string("tid0008a").circuitJson()
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
    "tid0008a",
  )
})

test("tid0008a is discoverable and supports string and typed builder APIs", () => {
  expect(getFootprintNames()).toContain("tid0008a")
  expect(fp().tid0008a().circuitJson()).toEqual(
    fp.string("tid0008a").circuitJson(),
  )
  expect(fp.string("tid0008a").json()).toMatchObject({
    fn: "tid0008a",
    num_pins: 8,
    w: 6.95,
    p: 1.27,
    pl: 1.55,
    pw: 0.6,
  })
  expect(tid0008a_def.safeParse({ fn: "tid0008a", num_pins: 16 }).success).toBe(
    false,
  )
})

test("tid0008a supports common footprint options", () => {
  const circuit = fp()
    .tid0008a()
    .norefdes()
    .pin1location("rightside", "bottom")
    .circuitJson()
  expect(circuit).toEqual(
    fp.string("tid0008a_norefdes_pin1location(rightside,bottom)").circuitJson(),
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
    "tid0008a-rightside-norefdes",
  )
})
