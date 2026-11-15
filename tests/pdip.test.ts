import { describe, expect, test } from "bun:test"
import type { AnyCircuitElement, PcbPlatedHole } from "circuit-json"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { fp } from "../src/footprinter"

describe("PDIP-8 footprint support (#371)", () => {
  test("fp.string('pdip-8') produces an 8-pin dual in-line package", () => {
    const circuitJson = fp.string("pdip-8").circuitJson() as AnyCircuitElement[]
    const platedHoles = circuitJson.filter(
      (e): e is PcbPlatedHole => e.type === "pcb_plated_hole",
    )

    expect(platedHoles.length).toBe(8)

    // Check pin coordinates for standard 2.54mm pitch and 7.62mm width
    const pin1 = platedHoles.find((h) => h.port_hints?.includes("1"))
    expect(pin1).toBeDefined()
    expect(pin1!.x).toBeCloseTo(-3.81) // -7.62 / 2
    expect(pin1!.y).toBeCloseTo(3.81) // top pin on left column

    const pin8 = platedHoles.find((h) => h.port_hints?.includes("8"))
    expect(pin8).toBeDefined()
    expect(pin8!.x).toBeCloseTo(3.81) // 7.62 / 2
    expect(pin8!.y).toBeCloseTo(3.81) // top pin on right column
  })

  test("normalizes PDIP string variations identically to DIP", () => {
    const expected = fp.string("dip8").json()
    expect(fp.string("pdip-8").json()).toEqual(expected)
    expect(fp.string("pdip8").json()).toEqual(expected)
    expect(fp.string("PDIP-8").json()).toEqual(expected)
    expect(fp.string("pdip_8").json()).toEqual(expected)
    expect(fp.string("PDIP8").json()).toEqual(expected)
  })

  test("builder method fp().pdip(8) works with explicit parameters", () => {
    const circuitJson = fp()
      .pdip(8)
      .w(7.62)
      .p(2.54)
      .circuitJson() as AnyCircuitElement[]
    const platedHoles = circuitJson.filter(
      (e): e is PcbPlatedHole => e.type === "pcb_plated_hole",
    )
    expect(platedHoles.length).toBe(8)
  })

  test("generates valid PCB SVG for pdip-8", () => {
    const circuitJson = fp.string("pdip-8").circuitJson() as AnyCircuitElement[]
    const svg = convertCircuitJsonToPcbSvg(circuitJson)
    expect(svg).toContain("<svg")
    expect(svg).toContain("</svg>")
  })
})
