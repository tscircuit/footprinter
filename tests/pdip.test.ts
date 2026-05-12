import { test, expect } from "bun:test"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { fp } from "../src/footprinter"

test("PDIP-8 aliases to DIP-8", () => {
  const pdipSvg = convertCircuitJsonToPcbSvg(fp.string("PDIP-8").circuitJson())
  const dipSvg = convertCircuitJsonToPcbSvg(fp.string("dip_8").circuitJson())

  expect(pdipSvg).toEqual(dipSvg)
})

test("pdip8 compact form aliases to DIP-8", () => {
  const pdipSvg = convertCircuitJsonToPcbSvg(fp.string("pdip8").circuitJson())
  const dipSvg = convertCircuitJsonToPcbSvg(fp.string("dip_8").circuitJson())

  expect(pdipSvg).toEqual(dipSvg)
})
