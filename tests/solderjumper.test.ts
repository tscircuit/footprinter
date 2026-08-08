import { test, expect } from "bun:test"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { solderjumper } from "../src/fn/solderjumper"
import { fp } from "src"

test("solderjumper 2-pin no bridge", () => {
  const result = solderjumper({ num_pins: 2 })
  expect(result.circuitJson.filter((e) => e.type === "pcb_smtpad").length).toBe(
    2,
  )
  expect(result.circuitJson.find((e) => e.type === "pcb_trace")).toBeUndefined()
  const svg = convertCircuitJsonToPcbSvg(result.circuitJson, {
    showCourtyards: true,
  })
  expect(svg).toMatchSvgSnapshot(import.meta.path, "solderjumper2")
})

test("solderjumper 3-pin bridge 1-2", () => {
  const result = solderjumper({ num_pins: 3, bridged: "12" })
  expect(result.circuitJson.filter((e) => e.type === "pcb_smtpad").length).toBe(
    3,
  )
  const trace = result.circuitJson.find((e) => e.type === "pcb_trace")
  expect(trace).toBeDefined()
  if (trace && Array.isArray(trace.route) && trace.route[0] && trace.route[1]) {
    expect(trace.route[0].x).toBe(0.75)
    expect(trace.route[1].x).toBe(1.79)
  }
  const svg = convertCircuitJsonToPcbSvg(result.circuitJson, {
    showCourtyards: true,
  })
  expect(svg).toMatchSvgSnapshot(import.meta.path, "solderjumper3_bridged12")
})

test("solderjumper 3-pin bridge 1-2-3", () => {
  const result = solderjumper({ num_pins: 3, bridged: "123" })
  expect(result.circuitJson.filter((e) => e.type === "pcb_smtpad").length).toBe(
    3,
  )
  const traces = result.circuitJson.filter((e) => e.type === "pcb_trace")
  expect(traces.length).toBe(2)
  if (
    traces[0] &&
    Array.isArray(traces[0].route) &&
    traces[0].route[0] &&
    traces[0].route[1] &&
    traces[1] &&
    Array.isArray(traces[1].route) &&
    traces[1].route[0] &&
    traces[1].route[1]
  ) {
    expect(traces[0].route[0].x).toBe(0.75)
    expect(traces[0].route[1].x).toBe(1.79)
    expect(traces[1].route[0].x).toBe(3.29)
    expect(traces[1].route[1].x).toBe(4.33)
  }
  const svg = convertCircuitJsonToPcbSvg(result.circuitJson)
  expect(svg).toMatchSvgSnapshot(import.meta.path, "solderjumper3_bridged123")
})

test("solderjumper 2-pin custom pitch", () => {
  const circuitJson = solderjumper({
    num_pins: 2,
    bridged: "12",
    p: 6.0,
  }).circuitJson
  const trace = circuitJson.find((e) => e.type === "pcb_trace")
  expect(trace).toBeDefined()
  if (trace && Array.isArray(trace.route) && trace.route[0] && trace.route[1]) {
    expect(trace.route[0].x).toBe(0.75)
    expect(trace.route[1].x).toBe(5.25)
  }
  const svg = convertCircuitJsonToPcbSvg(circuitJson, { showCourtyards: true })
  expect(svg).toMatchSvgSnapshot(import.meta.path, "solderjumper2bridged12p6")
})

test("solderjumper 2-pin custom pad size", () => {
  const circuitJson = fp
    .string("solderjumper2_bridged12_pw2_ph0.5")
    .circuitJson()
  const pads = circuitJson.filter((e) => e.type === "pcb_smtpad")
  expect(pads.length).toBe(2)
  const svg = convertCircuitJsonToPcbSvg(circuitJson)
  expect(svg).toMatchSvgSnapshot(
    import.meta.path,
    "solderjumper2bridged12pw2ph0.5",
  )
})

test("solderjumper without a pin count defaults to 2 pins (no NaN geometry)", () => {
  const circuitJson = fp.string("solderjumper").circuitJson()

  const pads = circuitJson.filter((e) => e.type === "pcb_smtpad")
  expect(pads.length).toBe(2)

  const courtyard = circuitJson.find(
    (e) => e.type === "pcb_courtyard_rect",
  ) as any
  expect(courtyard).toBeDefined()
  expect(Number.isFinite(courtyard.width)).toBe(true)
  expect(Number.isFinite(courtyard.height)).toBe(true)
  expect(Number.isFinite(courtyard.center.x)).toBe(true)
  expect(Number.isFinite(courtyard.center.y)).toBe(true)

  const silkscreenText = circuitJson.find(
    (e) => e.type === "pcb_silkscreen_text",
  ) as any
  expect(silkscreenText).toBeDefined()
  expect(Number.isFinite(silkscreenText.anchor_position.x)).toBe(true)
  expect(Number.isFinite(silkscreenText.anchor_position.y)).toBe(true)

  // a bare solderjumper renders the same pad count as the explicit solderjumper2
  const twoPin = fp.string("solderjumper2").circuitJson()
  expect(pads.length).toBe(twoPin.filter((e) => e.type === "pcb_smtpad").length)
})

test("solderjumper default snapshot", () => {
  const circuitJson = fp.string("solderjumper").circuitJson()
  const svg = convertCircuitJsonToPcbSvg(circuitJson, { showCourtyards: true })
  expect(svg).toMatchSvgSnapshot(import.meta.path, "solderjumper_default")
})
