import { expect, test } from "bun:test"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { fp } from "../src/footprinter"

test("lcc68", () => {
  const soup = fp.string("lcc68_w24.2_h24.2_p1.27mm").circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(soup)

  const pads = soup.filter((element) => element.type === "pcb_smtpad")
  expect(pads).toHaveLength(68)

  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "lcc68")
})

// lcc and plcc are a 1.27mm-pitch family. Before the pitch default was set, lcc
// fell back to the generic quad 0.5mm pitch while forcing 0.6mm-wide pads, so a
// bare lccN placed neighbouring pads 0.5mm apart and they overlapped by 0.1mm,
// a short between adjacent pins.
test("lcc default pitch does not overlap adjacent pads", () => {
  for (const name of ["lcc20", "lcc44", "lcc68"]) {
    const soup = fp.string(name).circuitJson()
    const pads = soup.filter((e) => e.type === "pcb_smtpad") as Array<{
      x: number
      y: number
      width: number
      height: number
    }>

    for (let i = 0; i < pads.length; i++) {
      for (let j = i + 1; j < pads.length; j++) {
        const a = pads[i]!
        const b = pads[j]!
        const gapX = Math.abs(a.x - b.x) - (a.width + b.width) / 2
        const gapY = Math.abs(a.y - b.y) - (a.height + b.height) / 2
        // Two rectangular pads only overlap when they are inside each other on
        // both axes. A separation on either axis means no short.
        expect(gapX > -1e-6 || gapY > -1e-6).toBe(true)
      }
    }
  }
})

test("lcc44 default", () => {
  const soup = fp.string("lcc44").circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(soup)

  const pads = soup.filter((element) => element.type === "pcb_smtpad")
  expect(pads).toHaveLength(44)

  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "lcc44_default")
})
