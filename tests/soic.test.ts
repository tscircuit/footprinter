import { test, expect } from "bun:test"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { fp } from "../src/footprinter"

test("soic8_w5.3mm_p1.27mm", () => {
  const soup = fp.string("soic8_w5.3mm_p1.27mm").circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(soup)
  expect(svgContent).toMatchSvgSnapshot(
    import.meta.path,
    "soic8_w5.3mm_p1.27mm",
  )
})
test("soic8", () => {
  const soup = fp.string("soic8").circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(soup)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "soic8")
})

test("soic28", () => {
  const soup = fp
    .string("soic28_pw0.762_pl1.524_pillpads_w11.2_p1.3")
    .circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(soup)
  expect(svgContent).toMatchSvgSnapshot(
    import.meta.path,
    "soic28_pw0762_pl1524",
  )
})

test("soic8 with pill pads", () => {
  const soup = fp().soic(8).pw("0.4").pl("1").pillpads(true).circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(soup)
  expect(svgContent).toMatchSvgSnapshot(
    import.meta.path,
    "soic8_pw04_pl1_pillpads",
  )

  // Verify pads are pill-shaped
  const pads = soup.filter((el) => el.type === "pcb_smtpad")
  expect(pads).toHaveLength(8)
  expect(pads[0]?.shape).toBe("pill")

  const firstPad = pads[0]
  if (firstPad && firstPad.shape === "pill") {
    expect(firstPad.radius).toBe(firstPad.height / 2)
  }
})
