import { expect, test } from "bun:test"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { fp } from "../src/footprinter"

test("lga body outline expands the courtyard without changing copper or silkscreen", () => {
  const base = "lga16_grid5x3_p0.5mm_w3.6mm_h3.6mm_pw0.28mm_pl0.8mm"
  const original = fp.string(base).circuitJson()
  for (const [name, suffix, minX, minY] of [
    [
      "nominal",
      "_bodywidth3mm_bodyheight3mm_bodythickness1mm",
      3 / 2 + 0.25,
      3 / 2 + 0.25,
    ],
    ["large-body", "_bodywidth12mm_bodyheight14mm", 6.25, 7.25],
    ["width-only", "_bodywidth12mm", 6.25, 0],
    ["height-only", "_bodyheight14mm", 0, 7.25],
  ] as const) {
    const elements = fp.string(base + suffix).circuitJson()
    expect(elements.filter((e) => e.type !== "pcb_courtyard_outline")).toEqual(
      original.filter((e) => e.type !== "pcb_courtyard_outline"),
    )
    const courtyard = elements.find((e) => e.type === "pcb_courtyard_outline")!
    if (courtyard.type !== "pcb_courtyard_outline")
      throw new Error("missing courtyard")
    const hx = Math.max(...courtyard.outline.map((p) => p.x))
    const hy = Math.max(...courtyard.outline.map((p) => p.y))
    expect(hx).toBeGreaterThanOrEqual(minX)
    expect(hy).toBeGreaterThanOrEqual(minY)
    for (const pad of elements) {
      if (pad.type !== "pcb_smtpad" || pad.shape !== "rect") continue
      expect(hx + 1e-9).toBeGreaterThanOrEqual(
        Math.abs(pad.x) + pad.width / 2 + 0.25,
      )
      expect(hy + 1e-9).toBeGreaterThanOrEqual(
        Math.abs(pad.y) + pad.height / 2 + 0.25,
      )
    }
    expect(
      convertCircuitJsonToPcbSvg(elements, {
        showCourtyards: true,
        viewport: { minX: -hx - 1, maxX: hx + 1, minY: -hy - 1, maxY: hy + 1 },
      }),
    ).toMatchSvgSnapshot(import.meta.path, "lga-body-" + name)
  }
})
