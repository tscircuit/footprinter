import { expect, test } from "bun:test"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { fp } from "../src/footprinter"
import { wson } from "../src/fn/wson"

test("wson6 matches the TPS746 DRV0006A recommended land pattern", () => {
  // TI TPS746, drawing 4222173/C, example board layout (PDF page 33).
  const circuit = fp.string("wson6").circuitJson()
  const pads = circuit.filter((e) => e.type === "pcb_smtpad")
  expect(pads).toHaveLength(7)
  for (const [pin, x, y, width, height] of [
    [1, -0.975, 0.65, 0.45, 0.3],
    [2, -0.975, 0, 0.45, 0.3],
    [3, -0.975, -0.65, 0.45, 0.3],
    [4, 0.975, -0.65, 0.45, 0.3],
    [5, 0.975, 0, 0.45, 0.3],
    [6, 0.975, 0.65, 0.45, 0.3],
    [7, 0, 0, 1, 1.6],
  ]) {
    const pad = pads.find((e) => e.port_hints?.includes(String(pin)))!
    expect(pad).toMatchObject({ x, y, width, height })
  }
  expect(circuit.find((e) => e.type === "pcb_courtyard_rect")).toMatchObject({
    center: { x: 0, y: 0 },
    width: 2.9,
    height: 2.5,
  })
  expect(
    convertCircuitJsonToPcbSvg(circuit, { showCourtyards: true }),
  ).toMatchSvgSnapshot(import.meta.path, "wson6_drv")
})

test("wson6 builder supports unit overrides and exposed-pad omission", () => {
  const circuit = fp()
    .wson(6)
    .p("0.07cm")
    .rowspan(2.2)
    .pl(0.5)
    .pw(0.35)
    .w(2.4)
    .h(2.6)
    .ep(false)
    .circuitJson()
  const pads = circuit.filter((e) => e.type === "pcb_smtpad")
  expect(pads).toHaveLength(6)
  expect(pads.find((e) => e.port_hints?.includes("1"))).toMatchObject({
    x: -1.1,
    width: 0.5,
    height: 0.35,
  })
  expect(pads.find((e) => e.port_hints?.includes("1"))!.y).toBeCloseTo(0.7, 10)
  expect(circuit.find((e) => e.type === "pcb_courtyard_rect")).toMatchObject({
    width: 3.2,
    height: 3.1,
  })
  expect(
    convertCircuitJsonToPcbSvg(circuit, { showCourtyards: true }),
  ).toMatchSvgSnapshot(import.meta.path, "wson6_custom_no_ep")
})

test("wson6 courtyard encloses an enlarged exposed pad", () => {
  const circuit = fp().wson(6).rowspan(5).epw(3).eph(4).circuitJson()
  expect(circuit.find((e) => e.type === "pcb_courtyard_rect")).toMatchObject({
    width: 5.95,
    height: 4.5,
  })
  expect(
    circuit.find((e) => e.type === "pcb_smtpad" && e.port_hints?.includes("7")),
  ).toMatchObject({ width: 3, height: 4 })
  expect(
    convertCircuitJsonToPcbSvg(circuit, { showCourtyards: true }),
  ).toMatchSvgSnapshot(import.meta.path, "wson6_large_ep")
})

test("wson6 rejects nonpositive and nonfinite mechanical dimensions", () => {
  for (const key of [
    "p",
    "rowspan",
    "pl",
    "pw",
    "w",
    "h",
    "epw",
    "eph",
  ] as const) {
    for (const value of [0, -1, Infinity, NaN]) {
      // The fluent API intentionally ignores falsy w/h/p; test generator validation.
      expect(() => wson({ fn: "wson", num_pins: 6, [key]: value })).toThrow()
    }
  }
  expect(() => fp().wson(7).circuitJson()).toThrow()
})

test("wson6 rejects copper overlaps caused by custom dimensions", () => {
  for (const options of [{ p: 0.2 }, { rowspan: 0.4 }, { epw: 1.6 }]) {
    expect(() => wson({ fn: "wson", num_pins: 6, ...options })).toThrow()
  }
})
