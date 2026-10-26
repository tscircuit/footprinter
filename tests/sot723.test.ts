import { expect, test } from "bun:test"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { fp } from "../src/footprinter"

test("sot723", () => {
  const soup = fp.string("sot723").circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(soup)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "sot723")
})

test("sot723 pin coordinates match datasheet and KiCad standard (fixes #686)", () => {
  const soup = fp.string("sot723").circuitJson() as any[]
  const pads = soup.filter((x) => x.type === "pcb_smtpad")

  const pad1 = pads.find((p) => p.port_hints?.includes("1"))
  const pad2 = pads.find((p) => p.port_hints?.includes("2"))
  const pad3 = pads.find((p) => p.port_hints?.includes("3"))

  expect(pad1).toBeDefined()
  expect(pad2).toBeDefined()
  expect(pad3).toBeDefined()

  // Pin 1: top-left (x < 0, y > 0)
  expect(pad1.x).toBeLessThan(0)
  expect(pad1.y).toBeGreaterThan(0)
  expect(pad1.x).toBeCloseTo(-0.575, 2)
  expect(pad1.y).toBeCloseTo(0.4, 2)

  // Pin 2: bottom-left (x < 0, y < 0)
  expect(pad2.x).toBeLessThan(0)
  expect(pad2.y).toBeLessThan(0)
  expect(pad2.x).toBeCloseTo(-0.575, 2)
  expect(pad2.y).toBeCloseTo(-0.4, 2)

  // Pin 3: alone on the right (x > 0, y == 0)
  expect(pad3.x).toBeGreaterThan(0)
  expect(pad3.y).toBeCloseTo(0, 2)
  expect(pad3.x).toBeCloseTo(0.575, 2)
})
