import { expect, test } from "bun:test"
import type { PcbSmtPad } from "circuit-json"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { fp } from "../src/footprinter"

test("bga missing center with trorigin renumbers pins correctly", () => {
  const soup = fp()
    .bga(8)
    .grid("3x3")
    .p(1)
    .missing("center")
    .trorigin(true)
    .soup()

  const pads = soup.filter(
    (el): el is PcbSmtPad => el.type === "pcb_smtpad",
  )
  expect(pads).toHaveLength(8)

  const pinNums = pads
    .map((p) => Number(p.port_hints?.[0]))
    .sort((a, b) => a - b)
  expect(pinNums).toEqual([1, 2, 3, 4, 5, 6, 7, 8])

  const pin1 = pads.find((p) => p.port_hints?.[0] === "1")
  expect(pin1?.x).toBe(1)
  expect(pin1?.y).toBe(-1)
  expect(pin1?.port_hints?.[1]).toBe("A1")

  const svgContent = convertCircuitJsonToPcbSvg(soup)
  expect(svgContent).toMatchSvgSnapshot(
    import.meta.path,
    "bga_3x3_trorigin_missing_center",
  )
})
