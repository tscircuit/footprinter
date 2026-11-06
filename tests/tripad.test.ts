import { expect, test } from "bun:test"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { tripad } from "../src/fn/tripad"
import { fp } from "../src/footprinter"

test("tripad default", () => {
  const circuitJson = fp.string("tripad").circuitJson()
  const pads = circuitJson.filter((e) => e.type === "pcb_smtpad")
  expect(pads.length).toBe(3)
  const svgContent = convertCircuitJsonToPcbSvg(circuitJson)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "tripad_default")
})

test("tripad custom dimensions", () => {
  const circuitJson = fp.string("tripad_w5_h4.5_p2.54").circuitJson()
  const pads = circuitJson.filter((e) => e.type === "pcb_smtpad")
  expect(pads.length).toBe(3)
  const svgContent = convertCircuitJsonToPcbSvg(circuitJson)
  expect(svgContent).toMatchSvgSnapshot(
    import.meta.path,
    "tripad_custom_dimensions",
  )
})

test("tripad pin numbering and geometry", () => {
  const result = tripad({ fn: "tripad" })
  const pads = result.circuitJson.filter((e) => e.type === "pcb_smtpad")
  expect(pads.length).toBe(3)

  const pin1 = pads.find(
    (e) => e.type === "pcb_smtpad" && e.port_hints?.includes("1"),
  )
  const pin2 = pads.find(
    (e) => e.type === "pcb_smtpad" && e.port_hints?.includes("2"),
  )
  const pin3 = pads.find(
    (e) => e.type === "pcb_smtpad" && e.port_hints?.includes("3"),
  )

  expect(pin1).toBeDefined()
  expect(pin2).toBeDefined()
  expect(pin3).toBeDefined()

  if (pin1 && pin2 && pin3) {
    expect((pin1 as any).x).toBeLessThan((pin2 as any).x)
    expect((pin3 as any).x).toBeLessThan((pin2 as any).x)
    expect((pin1 as any).y).toBeGreaterThan((pin3 as any).y)
    expect((pin2 as any).y).toBe(0)
    expect((pin2 as any).width).toBeGreaterThan((pin1 as any).width)
    expect((pin2 as any).height).toBeGreaterThan((pin1 as any).height)
  }
})
