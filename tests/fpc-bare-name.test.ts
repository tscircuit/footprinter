import { expect, test } from "bun:test"
import { fp } from "../src/footprinter"

test("bare fpc renders the 12-pin FPC-05F-12PH20 layout", () => {
  const circuitJson = fp.string("fpc").circuitJson()
  const pads = circuitJson.filter((e) => e.type === "pcb_smtpad") as Array<{
    port_hints?: string[]
    x: number
    y: number
    width: number
    height: number
  }>

  expect(pads).toHaveLength(14)

  const contactPads = pads.filter(
    (p) => p.port_hints?.[0] !== "13" && p.port_hints?.[0] !== "14",
  )
  expect(contactPads).toHaveLength(12)
  expect(contactPads[0]).toMatchObject({ x: -2.75, y: 0, width: 0.3, height: 1.25 })
  expect(contactPads[11]).toMatchObject({ x: 2.75, y: 0, width: 0.3, height: 1.25 })

  const mountingPads = pads.filter(
    (p) => p.port_hints?.[0] === "13" || p.port_hints?.[0] === "14",
  )
  expect(mountingPads).toHaveLength(2)
  expect(mountingPads[0]!.x).toBeCloseTo(4.44)
  expect(mountingPads[0]!.y).toBeCloseTo(-2.575)
  expect(mountingPads[0]!.width).toBeCloseTo(2)
  expect(mountingPads[0]!.height).toBeCloseTo(2.5)
})
