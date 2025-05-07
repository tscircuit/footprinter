import { test, expect } from "bun:test"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { jumper } from "../src/fn/jumper"

test("jumper 2-pin no bridge", () => {
  const result = jumper({ num_pins: 2 })
  expect(result.circuitJson.filter((e) => e.type === "pcb_smtpad").length).toBe(
    2,
  )
  expect(result.circuitJson.find((e) => e.type === "pcb_trace")).toBeUndefined()
})

test("jumper 3-pin no bridge", () => {
  const result = jumper({ num_pins: 3 })
  expect(result.circuitJson.filter((e) => e.type === "pcb_smtpad").length).toBe(
    3,
  )
  expect(result.circuitJson.find((e) => e.type === "pcb_trace")).toBeUndefined()
})

test("jumper 2-pin bridge 1-2", () => {
  const result = jumper({ num_pins: 2, bridged: "12" })
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

test("jumper 3-pin bridge 1-2", () => {
  const result = jumper({ num_pins: 3, bridged: "12" })
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

test("jumper 3-pin bridge 2-3", () => {
  const result = jumper({ num_pins: 3, bridged: "23" })
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

test("jumper 3-pin bridge 1-2-3", () => {
  const result = jumper({ num_pins: 3, bridged: "123" })
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

test("jumper 2-pin no bridge snapshot", () => {
  const soup = jumper({ num_pins: 2 }).circuitJson
  const svg = convertCircuitJsonToPcbSvg(soup)
  expect(svg).toMatchSvgSnapshot(import.meta.path, "jumper2")
})

test("jumper 3-pin no bridge snapshot", () => {
  const soup = jumper({ num_pins: 3 }).circuitJson
  const svg = convertCircuitJsonToPcbSvg(soup)
  expect(svg).toMatchSvgSnapshot(import.meta.path, "jumper3")
})

test("jumper 3-pin bridge 1-2 snapshot", () => {
  const soup = jumper({ num_pins: 3, bridged: "12" }).circuitJson
  const svg = convertCircuitJsonToPcbSvg(soup)
  expect(svg).toMatchSvgSnapshot(import.meta.path, "jumper3bridged12")
})

test("jumper 3-pin bridge 1-2-3 snapshot", () => {
  const soup = jumper({ num_pins: 3, bridged: "123" }).circuitJson
  const svg = convertCircuitJsonToPcbSvg(soup)
  expect(svg).toMatchSvgSnapshot(import.meta.path, "jumper3bridged123")
})

test("jumper 2-pin bridge 1-2 snapshot", () => {
  const soup = jumper({ num_pins: 2, bridged: "12" }).circuitJson
  const svg = convertCircuitJsonToPcbSvg(soup)
  expect(svg).toMatchSvgSnapshot(import.meta.path, "jumper2bridged12")
})

test("jumper 3-pin bridge 2-3 snapshot", () => {
  const soup = jumper({ num_pins: 3, bridged: "23" }).circuitJson
  const svg = convertCircuitJsonToPcbSvg(soup)
  expect(svg).toMatchSvgSnapshot(import.meta.path, "jumper3bridged23")
})
