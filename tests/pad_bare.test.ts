import { test, expect } from "bun:test"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { fp } from "../src/footprinter"

test("pad renders from a bare name", () => {
  // `pad` is advertised by getFootprintNames(); a bare `pad` used to throw a raw
  // TypeError from mm(undefined) for the missing w and h. It now defaults to a
  // 1mm square pad, the same fallback smtpad uses, so the name renders.
  const soup = fp.string("pad").circuitJson()
  const pads = soup.filter((e) => e.type === "pcb_smtpad")
  expect(pads.length).toBe(1)
  expect(pads[0]).toMatchObject({ width: 1, height: 1, x: 0, y: 0 })
  const svgContent = convertCircuitJsonToPcbSvg(soup)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "pad_bare")
})
