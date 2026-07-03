import { test, expect } from "bun:test"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { fp } from "../src/footprinter"

test("sod123", () => {
  const soup = fp.string("sod123").circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(soup)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "sod123")
})

test("sod123 includes KiCad fabrication geometry", () => {
  const circuitJson = fp.string("sod123").circuitJson()
  const fabricationPaths = circuitJson.filter(
    (element) => element.type === "pcb_fabrication_note_path",
  )
  const fabricationTexts = circuitJson.filter(
    (element) => element.type === "pcb_fabrication_note_text",
  )

  expect(fabricationPaths).toHaveLength(11)
  expect(fabricationPaths.map((path) => path.route)).toEqual([
    [
      { x: 0.25, y: 0 },
      { x: 0.75, y: 0 },
    ],
    [
      { x: 0.25, y: 0.4 },
      { x: -0.35, y: 0 },
    ],
    [
      { x: 0.25, y: -0.4 },
      { x: 0.25, y: 0.4 },
    ],
    [
      { x: -0.35, y: 0 },
      { x: 0.25, y: -0.4 },
    ],
    [
      { x: -0.35, y: 0 },
      { x: -0.35, y: 0.55 },
    ],
    [
      { x: -0.35, y: 0 },
      { x: -0.35, y: -0.55 },
    ],
    [
      { x: -0.75, y: 0 },
      { x: -0.35, y: 0 },
    ],
    [
      { x: -1.4, y: 0.9 },
      { x: -1.4, y: -0.9 },
    ],
    [
      { x: 1.4, y: 0.9 },
      { x: -1.4, y: 0.9 },
    ],
    [
      { x: 1.4, y: -0.9 },
      { x: 1.4, y: 0.9 },
    ],
    [
      { x: -1.4, y: -0.9 },
      { x: 1.4, y: -0.9 },
    ],
  ])
  expect(fabricationTexts).toHaveLength(1)
})
