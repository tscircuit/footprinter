import { expect, test } from "bun:test"
import type { AnyCircuitElement, PcbSmtPadRect } from "circuit-json"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { applyOrigin } from "../src/helpers/apply-origin"

const fixture = (): AnyCircuitElement[] => [
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
    pcb_fabrication_note_dimension_id: "width",
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
    pcb_fabrication_note_dimension_id: "height",
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
    text_ccw_rotation: 0,
  },
  {
    type: "pcb_fabrication_note_text",
    pcb_fabrication_note_text_id: "label",
    pcb_component_id: "",
    layer: "top",
    font: "tscircuit2024",
    font_size: 0.3,
    text: "PAD",
    anchor_position: { x: 4, y: 3 },
    anchor_alignment: "center",
  },
]

for (const origin of ["pin1", "bottomleft"] as const) {
  test(`fabrication dimensions with ${origin} origin snapshot`, async () => {
    const circuit = applyOrigin(fixture(), origin)
    await expect(convertCircuitJsonToPcbSvg(circuit)).toMatchSvgSnapshot(
      import.meta.path,
      `fabrication-dimensions-${origin}`,
    )
  })

  test(`fabrication dimension endpoints follow the pad with ${origin} origin`, () => {
    const original = fixture()
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

    expect(dx).not.toBe(0)
    expect(dy).not.toBe(0)

    const originalText = original.find(
      (el) => el.type === "pcb_fabrication_note_text",
    )!
    const shiftedText = shifted.find(
      (el) => el.type === "pcb_fabrication_note_text",
    )!
    expect(shiftedText.anchor_position).toEqual({
      x: originalText.anchor_position.x + dx,
      y: originalText.anchor_position.y + dy,
    })

    const dimensions = shifted.filter(
      (el) => el.type === "pcb_fabrication_note_dimension",
    )
    expect(dimensions).toHaveLength(2)
    for (const dimension of dimensions) {
      const originalDimension = original
        .filter((el) => el.type === "pcb_fabrication_note_dimension")
        .find(
          (el) =>
            el.pcb_fabrication_note_dimension_id ===
            dimension.pcb_fabrication_note_dimension_id,
        )!
      expect(dimension).toEqual({
        ...originalDimension,
        from: {
          x: originalDimension.from.x + dx,
          y: originalDimension.from.y + dy,
        },
        to: {
          x: originalDimension.to.x + dx,
          y: originalDimension.to.y + dy,
        },
      })
    }
  })
}
