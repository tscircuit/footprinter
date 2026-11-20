import { expect, test } from "bun:test"
import type { AnyCircuitElement, PcbSmtPadRect } from "circuit-json"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { applyOrigin } from "../src/helpers/apply-origin"

const createFixture = (): AnyCircuitElement[] => [
  {
    type: "pcb_smtpad",
    pcb_smtpad_id: "pad1",
    shape: "rect",
    layer: "top",
    port_hints: ["1"],
    x: 4,
    y: 3,
    width: 2,
    height: 1,
  },
  {
    type: "pcb_fabrication_note_dimension",
    pcb_fabrication_note_dimension_id: "dim_width",
    pcb_component_id: "",
    layer: "top",
    from: { x: 3, y: 3.5 },
    to: { x: 5, y: 3.5 },
    text: "2 mm",
    font: "tscircuit2024",
    font_size: 0.25,
    arrow_size: 0.15,
    offset_distance: 0.6,
    offset_direction: { x: 0, y: 1 },
  },
  {
    type: "pcb_fabrication_note_dimension",
    pcb_fabrication_note_dimension_id: "dim_height",
    pcb_component_id: "",
    layer: "top",
    from: { x: 5, y: 2.5 },
    to: { x: 5, y: 3.5 },
    text: "1 mm",
    font: "tscircuit2024",
    font_size: 0.25,
    arrow_size: 0.15,
    offset_distance: 0.6,
    offset_direction: { x: 1, y: 0 },
  },
]

test("applyOrigin translates fabrication note dimension endpoints and preserves offset_direction", async () => {
  for (const origin of ["pin1", "bottomleft"] as const) {
    const original = createFixture()
    const shifted = applyOrigin(structuredClone(original), origin)

    const originalPad = original.find(
      (el): el is PcbSmtPadRect =>
        el.type === "pcb_smtpad" && el.shape === "rect",
    )!
    const shiftedPad = shifted.find(
      (el): el is PcbSmtPadRect =>
        el.type === "pcb_smtpad" && el.shape === "rect",
    )!
    const dx = shiftedPad.x - originalPad.x
    const dy = shiftedPad.y - originalPad.y

    expect(Math.hypot(dx, dy)).toBeGreaterThan(0)

    const shiftedDimensions = shifted.filter(
      (el) => el.type === "pcb_fabrication_note_dimension",
    )
    expect(shiftedDimensions).toHaveLength(2)

    for (const dim of shiftedDimensions) {
      const origDim = original.find(
        (el) =>
          el.type === "pcb_fabrication_note_dimension" &&
          el.pcb_fabrication_note_dimension_id ===
            dim.pcb_fabrication_note_dimension_id,
      )!
      if (origDim.type !== "pcb_fabrication_note_dimension") continue
      expect(dim.from).toEqual({
        x: origDim.from.x + dx,
        y: origDim.from.y + dy,
      })
      expect(dim.to).toEqual({
        x: origDim.to.x + dx,
        y: origDim.to.y + dy,
      })
      expect(dim.offset_direction).toEqual(origDim.offset_direction)
    }

    await expect(convertCircuitJsonToPcbSvg(shifted)).toMatchSvgSnapshot(
      import.meta.path,
      `origin4-fabrication-dim-${origin}`,
    )
  }
})
