import { expect, test } from "bun:test"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import type { AnyCircuitElement } from "circuit-json"
import { fp } from "../src/footprinter"
import type { OriginMode } from "../src/helpers/apply-origin"

const notePaths = (elements: AnyCircuitElement[]) =>
  elements.filter((element) => element.type === "pcb_fabrication_note_path")
const noteTexts = (elements: AnyCircuitElement[]) =>
  elements.filter((element) => element.type === "pcb_fabrication_note_text")
const firstPad = (elements: AnyCircuitElement[]) =>
  elements.find(
    (element) => element.type === "pcb_smtpad" && element.shape === "rect",
  )!

for (const origin of ["pin1", "bottomleft"] satisfies OriginMode[]) {
  test(`diode fabrication notes follow the copper for origin ${origin}`, () => {
    const before = fp().sod123().circuitJson()
    const after = fp().sod123().origin(origin).circuitJson()
    const dx = firstPad(after).x! - firstPad(before).x!
    const dy = firstPad(after).y! - firstPad(before).y!
    expect(dx).not.toBe(0)
    const pathsBefore = notePaths(before)
    const pathsAfter = notePaths(after)
    expect(pathsBefore.length).toBeGreaterThan(0)
    expect(pathsAfter).toHaveLength(pathsBefore.length)
    pathsBefore.forEach((path, index) => {
      const shifted = pathsAfter[index]!
      expect(shifted.route).toHaveLength(path.route.length)
      path.route.forEach((point, pointIndex) => {
        expect(shifted.route[pointIndex]!.x).toBeCloseTo(point.x + dx)
        expect(shifted.route[pointIndex]!.y).toBeCloseTo(point.y + dy)
      })
      expect(shifted.stroke_width).toBe(path.stroke_width)
      expect(shifted.layer).toBe(path.layer)
    })
    const textsBefore = noteTexts(before)
    const textsAfter = noteTexts(after)
    expect(textsBefore.map((text) => text.text)).toEqual(["+", "-"])
    expect(textsAfter).toHaveLength(textsBefore.length)
    textsBefore.forEach((text, index) => {
      const shifted = textsAfter[index]!
      expect(shifted.anchor_position.x).toBeCloseTo(text.anchor_position.x + dx)
      expect(shifted.anchor_position.y).toBeCloseTo(text.anchor_position.y + dy)
      expect(shifted.text).toBe(text.text)
      expect(shifted.font_size).toBe(text.font_size)
      expect(shifted.layer).toBe(text.layer)
    })
    expect(
      convertCircuitJsonToPcbSvg(after, { showPcbNotes: true }),
    ).toMatchSvgSnapshot(
      import.meta.path,
      `sod123_fabrication_origin_${origin}`,
    )
  })
}

test("an unchanged centered origin preserves diode fabrication notes", () => {
  const before = fp().sod123().circuitJson()
  const after = fp().sod123().origin("center").circuitJson()
  expect(notePaths(after)).toEqual(notePaths(before))
  expect(noteTexts(after)).toEqual(noteTexts(before))
  expect(
    convertCircuitJsonToPcbSvg(after, { showPcbNotes: true }),
  ).toMatchSvgSnapshot(import.meta.path, "sod123_fabrication_origin_center")
})
