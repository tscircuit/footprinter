import { test, expect } from "bun:test"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { fp } from "../src/footprinter"

test("pinrow5 noref", () => {
  const soup = fp.string("pinrow5_noref").circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(soup)
  const pinrowJson = fp.string("pinrow5_female").json()
  expect(pinrowJson).toMatchObject({
    fn: "pinrow",
    num_pins: 5,
    p: 2.54,
    id: 1,
    od: 1.5,
    female: true,
    male: false,
    pinlabeltextalignleft: false,
    pinlabeltextaligncenter: false,
    pinlabeltextalignright: false,
    pinlabelverticallyinverted: false,
    pinlabelorthogonal: false,
  })
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "pinrow5_1_noref")
})
