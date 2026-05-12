import { test, expect } from "bun:test"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { fp } from "../src/footprinter"

test("UTDFN-4-EP(1x1) aliases to configured VSON footprint", () => {
  const utdfnCircuitJson = fp.string("UTDFN-4-EP(1x1)").circuitJson()
  const canonicalCircuitJson = fp
    .string("utdfn_4_p0.35_w0.65_grid1x1mm_pinw0.2_pinh0.35_ep0.35x0.35mm")
    .circuitJson()

  expect(convertCircuitJsonToPcbSvg(utdfnCircuitJson)).toEqual(
    convertCircuitJsonToPcbSvg(canonicalCircuitJson),
  )
  expect(
    utdfnCircuitJson.filter((elm) => elm.type === "pcb_smtpad"),
  ).toHaveLength(5)
})
