import { test, expect } from "bun:test"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { fp } from "../src/footprinter"

test("utdfn4ep_pw0.3mm_ph0.5mm_epw0.55mm_eph0.45mm", () => {
  const circuitJson = fp
    .string("utdfn4ep_pw0.3mm_ph0.5mm_epw0.55mm_eph0.45mm")
    .circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(circuitJson)
  expect(svgContent).toMatchSvgSnapshot(
    import.meta.path,
    "utdfn4ep_pw0.3mm_ph0.5mm_epw0.55mm_eph0.45mm",
  )
})
