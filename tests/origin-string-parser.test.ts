import { test, expect } from "bun:test"
import { fp } from "../src/footprinter"

test("origin(pin1) works in string parser for dip8", () => {
  const circuit = fp.string("dip8_origin(pin1)").circuitJson()
  const pad1 = circuit.find(
    (el: any) =>
      el.type === "pcb_plated_hole" &&
      (el.port_hints?.[0] === "1" || el.port_hints?.[0] === 1),
  ) as any
  expect(pad1).toBeDefined()
  expect(pad1.x).toBeCloseTo(0)
  expect(pad1.y).toBeCloseTo(0)
})

test("origin(center) works in string parser for soic8", () => {
  const circuit = fp.string("soic8_origin(center)").circuitJson()
  const pads = circuit.filter((el: any) => el.type === "pcb_smtpad") as any[]
  expect(pads.length).toBe(8)
  // With center origin, the average position should be near (0, 0)
  const avgX = pads.reduce((s: number, p: any) => s + p.x, 0) / pads.length
  const avgY = pads.reduce((s: number, p: any) => s + p.y, 0) / pads.length
  expect(avgX).toBeCloseTo(0, 1)
  expect(avgY).toBeCloseTo(0, 1)
})

test("origin(pin1) works in string parser for res0402", () => {
  const circuit = fp.string("res0402_origin(pin1)").circuitJson()
  const pad1 = circuit.find(
    (el: any) => el.type === "pcb_smtpad" && el.port_hints?.[0] === "1",
  ) as any
  expect(pad1).toBeDefined()
  expect(pad1.x).toBeCloseTo(0)
  expect(pad1.y).toBeCloseTo(0)
})

test("origin(bottomleft) works in string parser for res0603", () => {
  const circuit = fp.string("res0603_origin(bottomleft)").circuitJson()
  const pads = circuit.filter((el: any) => el.type === "pcb_smtpad") as any[]
  // All pads should have non-negative x and y after bottomleft origin
  for (const pad of pads) {
    expect(pad.x).toBeGreaterThanOrEqual(-0.01)
    expect(pad.y).toBeGreaterThanOrEqual(-0.01)
  }
})

test("string parser origin matches builder API origin for pin1", () => {
  const fromString = fp.string("dip8_origin(pin1)").circuitJson()
  const fromBuilder = fp().dip(8).origin("pin1").circuitJson()

  const stringPads = fromString.filter(
    (el: any) => el.type === "pcb_plated_hole",
  ) as any[]
  const builderPads = fromBuilder.filter(
    (el: any) => el.type === "pcb_plated_hole",
  ) as any[]

  expect(stringPads.length).toBe(builderPads.length)
  for (let i = 0; i < stringPads.length; i++) {
    expect(stringPads[i].x).toBeCloseTo(builderPads[i].x)
    expect(stringPads[i].y).toBeCloseTo(builderPads[i].y)
  }
})

test("string parser origin matches builder API origin for center", () => {
  const fromString = fp.string("soic8_origin(center)").circuitJson()
  const fromBuilder = fp().soic(8).origin("center").circuitJson()

  const stringPads = fromString.filter(
    (el: any) => el.type === "pcb_smtpad",
  ) as any[]
  const builderPads = fromBuilder.filter(
    (el: any) => el.type === "pcb_smtpad",
  ) as any[]

  expect(stringPads.length).toBe(builderPads.length)
  for (let i = 0; i < stringPads.length; i++) {
    expect(stringPads[i].x).toBeCloseTo(builderPads[i].x)
    expect(stringPads[i].y).toBeCloseTo(builderPads[i].y)
  }
})

test("origin(topcenter) works in string parser", () => {
  const circuit = fp.string("res0805_origin(topcenter)").circuitJson()
  const pads = circuit.filter((el: any) => el.type === "pcb_smtpad") as any[]
  expect(pads.length).toBe(2)
  // Top center means highest pad edge should be at y=0
  const maxY = Math.max(...pads.map((p: any) => p.y + p.height / 2))
  expect(maxY).toBeCloseTo(0, 1)
})

test("origin(rightcenter) works in string parser", () => {
  const circuit = fp.string("soic8_origin(rightcenter)").circuitJson()
  const pads = circuit.filter((el: any) => el.type === "pcb_smtpad") as any[]
  // Right center means rightmost pad edge should be at x=0
  const maxX = Math.max(...pads.map((p: any) => p.x + p.width / 2))
  expect(maxX).toBeCloseTo(0, 1)
})

test("origin shifts silkscreen elements in string parser", () => {
  const withoutOrigin = fp.string("dip8").circuitJson()
  const withOrigin = fp.string("dip8_origin(pin1)").circuitJson()

  const silkWithout = withoutOrigin.find(
    (el: any) => el.type === "pcb_silkscreen_path",
  ) as any
  const silkWith = withOrigin.find(
    (el: any) => el.type === "pcb_silkscreen_path",
  ) as any

  // Silkscreen routes should be shifted
  expect(silkWith.route[0].x).not.toBeCloseTo(silkWithout.route[0].x)
})
