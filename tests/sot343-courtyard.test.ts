import { expect, test } from "bun:test"
import { fp } from "../src/footprinter"

type Point = { x: number; y: number }

// Independent ray-casting oracle; no production geometry helpers are reused.
function contains(point: Point, outline: Point[]) {
  let inside = false
  for (let i = 0, j = outline.length - 1; i < outline.length; j = i++) {
    const a = outline[i]!
    const b = outline[j]!
    if (
      a.y > point.y !== b.y > point.y &&
      point.x < ((b.x - a.x) * (point.y - a.y)) / (b.y - a.y) + a.x
    ) {
      inside = !inside
    }
  }
  return inside
}

// Regression: a static package courtyard must not exclude actual custom copper.
// This is the repository's existing custom SOT-343 snapshot input.
test("custom SOT-343 courtyard encloses every copper pad", () => {
  const elements = fp.string("sot343_pl1.2_pw0.9_p2_w5.2_h5").circuitJson()
  const pads = elements.filter((e) => e.type === "pcb_smtpad")
  const courtyard = elements.find((e) => e.type === "pcb_courtyard_outline")!
  expect(pads).toHaveLength(4)
  const xs = courtyard.outline.map((p) => p.x)
  const ys = courtyard.outline.map((p) => p.y)
  for (const pad of pads) {
    if (pad.shape !== "rect")
      throw new Error("Expected rectangular copper pads")
    expect(Math.min(...xs)).toBeLessThanOrEqual(pad.x - pad.width / 2)
    expect(Math.max(...xs)).toBeGreaterThanOrEqual(pad.x + pad.width / 2)
    expect(Math.min(...ys)).toBeLessThanOrEqual(pad.y - pad.height / 2)
    expect(Math.max(...ys)).toBeGreaterThanOrEqual(pad.y + pad.height / 2)
  }
})

for (const definition of [
  "sot343_p10",
  "sot343_pl8",
  "sot343_pw8",
  "sot343_p0.1_pw2",
  "sot343_p1000_pl100_pw100",
]) {
  test(`${definition}: every copper corner is inside the courtyard`, () => {
    const elements = fp.string(definition).circuitJson()
    const courtyard = elements.find((e) => e.type === "pcb_courtyard_outline")!
    for (const pad of elements.filter((e) => e.type === "pcb_smtpad")) {
      if (pad.shape !== "rect")
        throw new Error("Expected rectangular copper pads")
      for (const dx of [-1, 1])
        for (const dy of [-1, 1]) {
          expect(
            contains(
              {
                x: pad.x + (dx * pad.width) / 2,
                y: pad.y + (dy * pad.height) / 2,
              },
              courtyard.outline,
            ),
          ).toBe(true)
        }
    }
  })
}

test("default SOT-343 keeps its existing courtyard", () => {
  const courtyard = fp
    .string("sot343")
    .circuitJson()
    .find((e) => e.type === "pcb_courtyard_outline")!
  expect(courtyard.outline).toEqual([
    { x: -1.703, y: 0.98 },
    { x: -0.983, y: 0.98 },
    { x: -0.983, y: 1.1 },
    { x: 0.477, y: 1.1 },
    { x: 0.477, y: 0.98 },
    { x: 1.197, y: 0.98 },
    { x: 1.197, y: -0.98 },
    { x: 0.477, y: -0.98 },
    { x: 0.477, y: -1.1 },
    { x: -0.983, y: -1.1 },
    { x: -0.983, y: -0.98 },
    { x: -1.703, y: -0.98 },
  ])
})

test("builder custom dimensions produce the same enclosed copper", () => {
  expect(
    fp().sot343().pl("1.2").pw("0.9").p("2").w("5.2").h("5").circuitJson(),
  ).toEqual(fp.string("sot343_pl1.2_pw0.9_p2_w5.2_h5").circuitJson())
})
