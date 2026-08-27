import { expect, test } from "bun:test"
import type { AnyCircuitElement } from "circuit-json"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { fp } from "../src/footprinter"

test("spdip28 resolves to the DIP-28 footprint", () => {
  expect(fp.string("spdip28").json()).toEqual(fp.string("dip28").json())
  expect(fp.string("SPDIP-28_W7.62mm").json()).toEqual(
    fp.string("dip28_w7.62mm").json(),
  )
})

test("spdip28 renders as a DIP-28 footprint", () => {
  const circuitJson = fp.string("spdip28").circuitJson() as AnyCircuitElement[]
  const svgContent = convertCircuitJsonToPcbSvg(circuitJson)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "spdip28")
})
