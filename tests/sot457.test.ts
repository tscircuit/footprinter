import { test, expect } from "bun:test"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { fp } from "../src/footprinter"

test("sot457 - reflow (default)", () => {
  const soup = fp.string("sot457").circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(soup)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "sot457")
})

test("sot457 - wave", () => {
  const soup = fp
    .string(
      "sot457_wave_p1.475mm_pillh0.45mm_pillw1.45mm_pillr0.225mm_pw1.5mm_pl1.45mm_h3.0mm",
    )
    .circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(soup)
  expect(svgContent).toMatchSvgSnapshot(
    import.meta.path,
    "sot457_wave_p1.475mm_pillh0.45mm_pillw1.45mm_pillr0.225mm_pw1.5mm_pl1.45mm_h3.0mm",
  )
})
