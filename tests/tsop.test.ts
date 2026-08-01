import { expect, test } from "bun:test"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { fp } from "../src/footprinter"

test("tsop48", () => {
  const soup = fp.string("tsop48_w18.4_h12.4_p0.5mm").circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(soup)

  const pads = soup.filter((element) => element.type === "pcb_smtpad")
  expect(pads).toHaveLength(48)

  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "tsop48")
})
