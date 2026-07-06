import { expect, test } from "bun:test"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { fp } from "../src/footprinter"

test("utdfn-4-ep(1x1)", () => {
  const circuitJson = fp.string("utdfn-4-ep(1x1)").circuitJson()

  // Find all SMD pads
  const pads = circuitJson.filter((e: any) => e.type === "pcb_smtpad")
  expect(pads.length).toBe(5)

  // Verify exposed pad (pad 5) is at center
  const ep = pads.find((p: any) => p.port_hints?.includes("5"))
  expect(ep).toBeDefined()
  expect(ep.x).toBe(0)
  expect(ep.y).toBe(0)
  expect(ep.width).toBeCloseTo(0.48, 3)
  expect(ep.height).toBeCloseTo(0.48, 3)

  // Verify contact pad 1 (bottom-left)
  const pad1 = pads.find((p: any) => p.port_hints?.includes("1"))
  expect(pad1).toBeDefined()
  expect(pad1.x).toBeCloseTo(-0.45, 3)
  expect(pad1.y).toBeCloseTo(-0.325, 3)

  // Verify contact pad 2 (top-left)
  const pad2 = pads.find((p: any) => p.port_hints?.includes("2"))
  expect(pad2).toBeDefined()
  expect(pad2.x).toBeCloseTo(-0.45, 3)
  expect(pad2.y).toBeCloseTo(0.325, 3)

  // Verify contact pad 3 (top-right)
  const pad3 = pads.find((p: any) => p.port_hints?.includes("3"))
  expect(pad3).toBeDefined()
  expect(pad3.x).toBeCloseTo(0.45, 3)
  expect(pad3.y).toBeCloseTo(0.325, 3)

  // Verify contact pad 4 (bottom-right)
  const pad4 = pads.find((p: any) => p.port_hints?.includes("4"))
  expect(pad4).toBeDefined()
  expect(pad4.x).toBeCloseTo(0.45, 3)
  expect(pad4.y).toBeCloseTo(-0.325, 3)

  const svgContent = convertCircuitJsonToPcbSvg(circuitJson)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "utdfn-4-ep-1x1")
})
