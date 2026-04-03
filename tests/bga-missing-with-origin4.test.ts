import { expect, test } from "bun:test"
import type { PcbSmtPad } from "circuit-json"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { fp } from "../src/footprinter"

test("bga missing specific pin with blorigin via string", () => {
  const soup = fp.string("bga8_grid3x3_p1_missing(B2)_blorigin").circuitJson()

  const pads = soup.filter((el): el is PcbSmtPad => el.type === "pcb_smtpad")
  expect(pads).toHaveLength(8)

  const pinNums = pads
    .map((p) => Number(p.port_hints?.[0]))
    .sort((a, b) => a - b)
  expect(pinNums).toEqual([1, 2, 3, 4, 5, 6, 7, 8])

  const svgContent = convertCircuitJsonToPcbSvg(soup)
  expect(svgContent).toMatchSvgSnapshot(
    import.meta.path,
    "bga_3x3_blorigin_missing_B2",
  )
})
