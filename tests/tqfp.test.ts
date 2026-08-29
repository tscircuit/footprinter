import { test, expect } from "bun:test"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { fp } from "../src/footprinter"

test("tqfp64_w10_p0.5mm_pw0.3_pl1.475mm", () => {
  const soup = fp.string("tqfp64_w10_p0.5mm_pw0.3_pl1.475mm").circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(soup)
  expect(svgContent).toMatchSvgSnapshot(
    import.meta.path,
    "tqfp64_w10_p0.5mm_pw0.3_pl1.475mm",
  )
})

test("tqfp32_w7", () => {
  const soup = fp.string("tqfp32_w7").circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(soup)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "tqfp32_w7")
})

test("tqfp44_w10", () => {
  const soup = fp.string("tqfp44_w10").circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(soup)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "tqfp44_w10")
})

test("tqfp48_w7", () => {
  const soup = fp.string("tqfp48_w7").circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(soup)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "tqfp48_w7")
})

test("tqfp100_w14", () => {
  const soup = fp.string("tqfp100_w14").circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(soup)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "tqfp100_w14")
})

test("tqfp44 uses the JEDEC 0.8mm pitch with 0.55mm pads", () => {
  const pads = fp
    .string("tqfp44")
    .circuitJson()
    .filter((el: any) => el.type === "pcb_smtpad") as any[]
  expect(pads.length).toBe(44)

  const maxX = Math.max(...pads.map((p) => p.x))
  const colPads = pads.filter((p) => Math.abs(p.x - maxX) < 0.01)
  const col = colPads.map((p) => p.y).sort((a: number, b: number) => b - a)
  expect(Math.round((col[0] - col[1]) * 1000) / 1000).toBe(0.8)
  expect(colPads[0].height).toBe(0.55)
  expect(colPads[0].width).toBe(1.475)
})
