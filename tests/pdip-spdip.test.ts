import { test, expect } from "bun:test"
import { fp } from "../src/footprinter"

test("pdip8 generates 8 plated holes (closes #371)", () => {
  const circuitJson = fp.string("pdip8").circuitJson()
  const holes = circuitJson.filter((e: any) => e.type === "pcb_plated_hole")
  expect(holes.length).toBe(8)
})

test("pdip8 uses 300mil (7.62mm) row spacing by default", () => {
  const circuitJson = fp.string("pdip8").circuitJson()
  const holes = circuitJson.filter((e: any) => e.type === "pcb_plated_hole")
  // Left-side holes are at x = -w/2, right-side at x = +w/2, so separation = w = 7.62mm
  const leftX = holes.filter((h: any) => h.x < 0)[0]?.x
  const rightX = holes.filter((h: any) => h.x > 0)[0]?.x
  expect(Math.abs(rightX - leftX)).toBeCloseTo(7.62, 1)
})

test("pdip-8 hyphen format also works", () => {
  const circuitJson = fp.string("pdip-8").circuitJson()
  const holes = circuitJson.filter((e: any) => e.type === "pcb_plated_hole")
  expect(holes.length).toBe(8)
})

test("pdip_8 underscore format also works", () => {
  const circuitJson = fp.string("pdip_8").circuitJson()
  const holes = circuitJson.filter((e: any) => e.type === "pcb_plated_hole")
  expect(holes.length).toBe(8)
})

test("pdip16 generates 16 plated holes", () => {
  const circuitJson = fp.string("pdip16").circuitJson()
  const holes = circuitJson.filter((e: any) => e.type === "pcb_plated_hole")
  expect(holes.length).toBe(16)
})

test("spdip28 generates 28 plated holes (closes #180)", () => {
  const circuitJson = fp.string("spdip28").circuitJson()
  const holes = circuitJson.filter((e: any) => e.type === "pcb_plated_hole")
  expect(holes.length).toBe(28)
})

test("spdip28 uses 300mil (7.62mm) row spacing (narrow/skinny package)", () => {
  const circuitJson = fp.string("spdip28").circuitJson()
  const holes = circuitJson.filter((e: any) => e.type === "pcb_plated_hole")
  const leftX = holes.filter((h: any) => h.x < 0)[0]?.x
  const rightX = holes.filter((h: any) => h.x > 0)[0]?.x
  // SPDIP uses narrow 300mil = 7.62mm row spacing
  expect(Math.abs(rightX - leftX)).toBeCloseTo(7.62, 1)
})

test("spdip-28 hyphen format also works", () => {
  const circuitJson = fp.string("spdip-28").circuitJson()
  const holes = circuitJson.filter((e: any) => e.type === "pcb_plated_hole")
  expect(holes.length).toBe(28)
})

// SIP (Single In-line Package) — maps to pinrow
test("sip5 generates 5 plated holes", () => {
  const circuitJson = fp.string("sip5").circuitJson()
  const holes = circuitJson.filter((e: any) => e.type === "pcb_plated_hole")
  expect(holes.length).toBe(5)
})

test("sip10 generates 10 plated holes", () => {
  const circuitJson = fp.string("sip10").circuitJson()
  const holes = circuitJson.filter((e: any) => e.type === "pcb_plated_hole")
  expect(holes.length).toBe(10)
})

test("sip-5 hyphen format works", () => {
  const circuitJson = fp.string("sip-5").circuitJson()
  const holes = circuitJson.filter((e: any) => e.type === "pcb_plated_hole")
  expect(holes.length).toBe(5)
})

test("sip_5 underscore format works", () => {
  const circuitJson = fp.string("sip_5").circuitJson()
  const holes = circuitJson.filter((e: any) => e.type === "pcb_plated_hole")
  expect(holes.length).toBe(5)
})

// DIL (Dual In-line) — same as DIP
test("dil8 generates 8 plated holes", () => {
  const circuitJson = fp.string("dil8").circuitJson()
  const holes = circuitJson.filter((e: any) => e.type === "pcb_plated_hole")
  expect(holes.length).toBe(8)
})

test("dil14 generates 14 plated holes", () => {
  const circuitJson = fp.string("dil14").circuitJson()
  const holes = circuitJson.filter((e: any) => e.type === "pcb_plated_hole")
  expect(holes.length).toBe(14)
})
