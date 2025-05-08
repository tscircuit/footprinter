import { test, expect } from "bun:test"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { solderjumper } from "../src/fn/solderjumper"

test("solderjumper 2-pin no bridge", () => {
  const result = solderjumper({ num_pins: 2 })
  expect(result.circuitJson.filter((e) => e.type === "pcb_smtpad").length).toBe(
    2,
  )
  expect(result.circuitJson.find((e) => e.type === "pcb_trace")).toBeUndefined()
})

test("solderjumper 3-pin no bridge", () => {
  const result = solderjumper({ num_pins: 3 })
  expect(result.circuitJson.filter((e) => e.type === "pcb_smtpad").length).toBe(
    3,
  )
  expect(result.circuitJson.find((e) => e.type === "pcb_trace")).toBeUndefined()
})

test("solderjumper 2-pin bridge 1-2", () => {
  const result = solderjumper({ num_pins: 2, bridged: "12" })
  expect(result.circuitJson.filter((e) => e.type === "pcb_smtpad").length).toBe(
    2,
  )
  const trace = result.circuitJson.find((e) => e.type === "pcb_trace")
  expect(trace).toBeDefined()
  if (trace && Array.isArray(trace.route) && trace.route[0] && trace.route[1]) {
    expect(trace.route[0].x).toBe(0)
    expect(trace.route[1].x).toBe(2.54)
  }
})

test("solderjumper 3-pin bridge 1-2", () => {
  const result = solderjumper({ num_pins: 3, bridged: "12" })
  expect(result.circuitJson.filter((e) => e.type === "pcb_smtpad").length).toBe(
    3,
  )
  const trace = result.circuitJson.find((e) => e.type === "pcb_trace")
  expect(trace).toBeDefined()
  if (trace && Array.isArray(trace.route) && trace.route[0] && trace.route[1]) {
    expect(trace.route[0].x).toBe(0)
    expect(trace.route[1].x).toBe(2.54)
  }
})

test("solderjumper 3-pin bridge 2-3", () => {
  const result = solderjumper({ num_pins: 3, bridged: "23" })
  expect(result.circuitJson.filter((e) => e.type === "pcb_smtpad").length).toBe(
    3,
  )
  const trace = result.circuitJson.find((e) => e.type === "pcb_trace")
  expect(trace).toBeDefined()
  if (trace && Array.isArray(trace.route) && trace.route[0] && trace.route[1]) {
    expect(trace.route[0].x).toBe(2.54)
    expect(trace.route[1].x).toBe(2.54 * 2)
  }
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
    expect(traces[0].route[0].x).toBe(0)
    expect(traces[0].route[1].x).toBe(2.54)
    expect(traces[1].route[0].x).toBe(2.54)
    expect(traces[1].route[1].x).toBe(2.54 * 2)
  }
})

test("solderjumper 2-pin no bridge snapshot", () => {
  const soup = solderjumper({ num_pins: 2 }).circuitJson
  const svg = convertCircuitJsonToPcbSvg(soup)
  expect(svg).toMatchSvgSnapshot(import.meta.path, "solderjumper2")
})

test("solderjumper 3-pin no bridge snapshot", () => {
  const soup = solderjumper({ num_pins: 3 }).circuitJson
  const svg = convertCircuitJsonToPcbSvg(soup)
  expect(svg).toMatchSvgSnapshot(import.meta.path, "solderjumper3")
})

test("solderjumper 3-pin bridge 1-2 snapshot", () => {
  const soup = solderjumper({ num_pins: 3, bridged: "12" }).circuitJson
  const svg = convertCircuitJsonToPcbSvg(soup)
  expect(svg).toMatchSvgSnapshot(import.meta.path, "solderjumper3bridged12")
})

test("solderjumper 3-pin bridge 1-2-3 snapshot", () => {
  const soup = solderjumper({ num_pins: 3, bridged: "123" }).circuitJson
  const svg = convertCircuitJsonToPcbSvg(soup)
  expect(svg).toMatchSvgSnapshot(import.meta.path, "solderjumper3bridged123")
})

test("solderjumper 2-pin bridge 1-2 snapshot", () => {
  const soup = solderjumper({ num_pins: 2, bridged: "12" }).circuitJson
  const svg = convertCircuitJsonToPcbSvg(soup)
  expect(svg).toMatchSvgSnapshot(import.meta.path, "solderjumper2bridged12")
})

test("solderjumper 3-pin bridge 2-3 snapshot", () => {
  const soup = solderjumper({ num_pins: 3, bridged: "23" }).circuitJson
  const svg = convertCircuitJsonToPcbSvg(soup)
  expect(svg).toMatchSvgSnapshot(import.meta.path, "solderjumper3bridged23")
})
