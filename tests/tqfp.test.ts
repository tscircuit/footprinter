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

test("narrow-body tqfp32_w7 and tqfp48_w7 keep corner silkscreen clear of pads", () => {
  for (const name of ["tqfp32_w7", "tqfp48_w7"]) {
    const soup = fp.string(name).circuitJson()
    const pads = soup.filter(
      (e): e is Extract<typeof e, { type: "pcb_smtpad"; shape: "rect" }> =>
        e.type === "pcb_smtpad" && e.shape === "rect",
    )
    const cornerPaths = soup.filter(
      (e): e is Extract<typeof e, { type: "pcb_silkscreen_path" }> =>
        e.type === "pcb_silkscreen_path" &&
        !e.pcb_silkscreen_path_id.endsWith("_3"),
    )

    for (const path of cornerPaths) {
      const halfStroke = (path.stroke_width || 0.1) / 2
      for (let i = 0; i + 1 < path.route.length; i++) {
        const a = path.route[i]!
        const b = path.route[i + 1]!
        const segMinX = Math.min(a.x, b.x)
        const segMaxX = Math.max(a.x, b.x)
        const segMinY = Math.min(a.y, b.y)
        const segMaxY = Math.max(a.y, b.y)

        for (const pad of pads) {
          const dx = Math.max(
            0,
            pad.x - pad.width / 2 - segMaxX,
            segMinX - (pad.x + pad.width / 2),
          )
          const dy = Math.max(
            0,
            pad.y - pad.height / 2 - segMaxY,
            segMinY - (pad.y + pad.height / 2),
          )
          const clearance = Math.hypot(dx, dy) - halfStroke
          expect(clearance).toBeGreaterThanOrEqual(0.2 - 1e-6)
        }
      }
    }
  }
})
