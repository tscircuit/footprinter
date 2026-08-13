import { test, expect } from "bun:test"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { fp } from "../src/footprinter"

test("vson8 renders from a bare name", () => {
  // vson is advertised by getFootprintNames() and its siblings son8/wson8 render
  // from a bare name; vson8 used to throw a raw parse error for missing dims.
  const soup = fp.string("vson8").circuitJson()
  const pads = soup.filter((e) => e.type === "pcb_smtpad")
  expect(pads.length).toBe(8)
  const svgContent = convertCircuitJsonToPcbSvg(soup)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "vson8")
})
