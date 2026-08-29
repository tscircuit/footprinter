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

test("lcc pads do not overlap along the pitch axis", () => {
  for (const name of ["lcc20", "lcc44"]) {
    const pads = fp
      .string(name)
      .circuitJson()
      .filter((el: any) => el.type === "pcb_smtpad") as any[]

    const maxX = Math.max(...pads.map((p) => p.x))
    const colPads = pads.filter((p) => Math.abs(p.x - maxX) < 0.01)
    const col = colPads.map((p) => p.y).sort((a: number, b: number) => b - a)
    const maxExtent = Math.max(...colPads.map((p) => p.height))

    for (let i = 1; i < col.length; i++) {
      expect(
        col[i - 1] - col[i],
        `${name}: adjacent pads overlap`,
      ).toBeGreaterThanOrEqual(maxExtent)
    }
  }
})

test("lcc default pitch is 1.27mm", () => {
  const pads = fp
    .string("lcc44")
    .circuitJson()
    .filter((el: any) => el.type === "pcb_smtpad") as any[]
  const maxX = Math.max(...pads.map((p) => p.x))
  const col = pads
    .filter((p) => Math.abs(p.x - maxX) < 0.01)
    .map((p) => p.y)
    .sort((a: number, b: number) => b - a)
  expect(Math.round((col[0] - col[1]) * 1000) / 1000).toBe(1.27)
})
