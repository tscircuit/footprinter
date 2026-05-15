import { expect, test } from "bun:test"
import { footprint } from "../src"

test("pdip8 creates 8-pin DIP footprint", () => {
  const result = footprint("pdip8")
  expect(result.circuitJson.length).toBeGreaterThan(0)

  // Check for 8 plated holes
  const holes = result.circuitJson.filter(
    (el: any) => el.type === "pcb_plated_hole",
  )
  expect(holes.length).toBe(8)
})

test("pdip8_wide creates 600mil DIP-8", () => {
  const result = footprint("pdip8_wide")
  expect(result.circuitJson.length).toBeGreaterThan(0)

  const holes = result.circuitJson.filter(
    (el: any) => el.type === "pcb_plated_hole",
  )
  expect(holes.length).toBe(8)
})

test("spdip8 creates 300mil DIP-8", () => {
  const result = footprint("spdip8")
  expect(result.circuitJson.length).toBeGreaterThan(0)

  const holes = result.circuitJson.filter(
    (el: any) => el.type === "pcb_plated_hole",
  )
  expect(holes.length).toBe(8)
})

test("spdip28 creates 28-pin skinny DIP", () => {
  const result = footprint("spdip28")
  expect(result.circuitJson.length).toBeGreaterThan(0)

  const holes = result.circuitJson.filter(
    (el: any) => el.type === "pcb_plated_hole",
  )
  expect(holes.length).toBe(28)
})

test("dip8_300mil creates correct 300mil DIP-8", () => {
  const result = footprint("dip8_300mil")
  expect(result.circuitJson.length).toBeGreaterThan(0)

  const holes = result.circuitJson.filter(
    (el: any) => el.type === "pcb_plated_hole",
  )
  expect(holes.length).toBe(8)
})
