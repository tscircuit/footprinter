import { test, expect } from "bun:test"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { fp } from "../src/footprinter"

test("utdfn_4_ep", () => {
  const circuitJson = fp.string("utdfn_4_ep").circuitJson()
  const params = fp.string("utdfn_4_ep").json() as any
  expect(params.num_pins).toBe(4)
  expect(params.ep).toBe(true)
  const svgContent = convertCircuitJsonToPcbSvg(circuitJson)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "utdfn_4_ep")
})

test("UTDFN-4-EP(1x1) pretransform alias", () => {
  const circuitJson = fp.string("UTDFN-4-EP(1x1)").circuitJson()
  const params = fp.string("UTDFN-4-EP(1x1)").json() as any
  expect(params.num_pins).toBe(4)
  expect(params.ep).toBe(true)
  const pads = circuitJson.filter(
    (el: any) => el.type === "pcb_smtpad" || el.type === "pcb_plated_hole",
  )
  expect(pads.length).toBe(5)
  const svgContent = convertCircuitJsonToPcbSvg(circuitJson)
  expect(svgContent).toMatchSvgSnapshot(
    import.meta.path,
    "utdfn_4_ep_1x1_alias",
  )
})
