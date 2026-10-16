import { test, expect } from "bun:test"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { fp } from "../src/footprinter"

// Test bottomleft origin for single pad

test("smtpad origin bottomleft", () => {
  const circuit = fp()
    .smtpad()
    .rect()
    .w("2mm")
    .h("1mm")
    .origin("bottomleft")
    .circuitJson()
  const pad = circuit[0]
  expect(pad.x).toBeCloseTo(1)
  expect(pad.y).toBeCloseTo(0.5)
})

// Test pin1 origin for resistor

test("res origin pin1", () => {
  const circuit = fp().res().imperial("0603").origin("pin1").circuitJson()
  const pad1 = circuit.find(
    (el) => el.type === "pcb_smtpad" && el.port_hints?.[0] === "1",
  )
  expect(pad1?.x).toBeCloseTo(0)
  expect(pad1?.y).toBeCloseTo(0)
})

// Test bottomcenter and centerbottom origins

test("smtpad origin bottomcenter", () => {
  const circuit = fp()
    .smtpad()
    .rect()
    .w("2mm")
    .h("1mm")
    .origin("bottomcenter")
    .circuitJson()
  const pad = circuit[0]
  expect(pad.x).toBeCloseTo(0)
  expect(pad.y).toBeCloseTo(0.5)
})

test("smtpad origin centerbottom", () => {
  const circuit = fp()
    .smtpad()
    .rect()
    .w("2mm")
    .h("1mm")
    .origin("centerbottom")
    .circuitJson()
  const pad = circuit[0]
  expect(pad.x).toBeCloseTo(0)
  expect(pad.y).toBeCloseTo(0.5)
})

// Test leftcenter alias centerleft

test("smtpad origin leftcenter", () => {
  const circuit = fp()
    .smtpad()
    .rect()
    .w("2mm")
    .h("1mm")
    .origin("leftcenter")
    .circuitJson()
  const pad = circuit[0]
  expect(pad.x).toBeCloseTo(1)
  expect(pad.y).toBeCloseTo(0)
})

test("smtpad origin centerleft", () => {
  const circuit = fp()
    .smtpad()
    .rect()
    .w("2mm")
    .h("1mm")
    .origin("centerleft")
    .circuitJson()
  const pad = circuit[0]
  expect(pad.x).toBeCloseTo(1)
  expect(pad.y).toBeCloseTo(0)
})

// Top/centertop

test("smtpad origin topcenter", () => {
  const circuit = fp()
    .smtpad()
    .rect()
    .w("2mm")
    .h("1mm")
    .origin("topcenter")
    .circuitJson()
  const pad = circuit[0]
  expect(pad.x).toBeCloseTo(0)
  expect(pad.y).toBeCloseTo(-0.5)
})

test("smtpad origin centertop", () => {
  const circuit = fp()
    .smtpad()
    .rect()
    .w("2mm")
    .h("1mm")
    .origin("centertop")
    .circuitJson()
  const pad = circuit[0]
  expect(pad.x).toBeCloseTo(0)
  expect(pad.y).toBeCloseTo(-0.5)
})

// Ensure origin applies to silkscreen elements

test("res origin bottomleft shifts silkscreen", () => {
  const circuit = fp().res().imperial("0603").origin("bottomleft").circuitJson()
  const pad1 = circuit.find(
    (el) => el.type === "pcb_smtpad" && el.port_hints?.[0] === "1",
  )!
  const text = circuit.find((el) => el.type === "pcb_silkscreen_text")!
  expect(text.anchor_position.y - pad1.y).toBeCloseTo(pad1.height / 2 + 0.9)
})

test("res origin bottomleft snapshot", () => {
  const soup = fp().res().imperial("0603").origin("bottomleft").soup()
  const svgContent = convertCircuitJsonToPcbSvg(soup)
  expect(svgContent).toMatchSvgSnapshot(
    import.meta.path,
    "0603_bottomleft_origin",
  )
})

test.each(["pin1", "bottomleft"])(
  "diode origin %s shifts fabrication note text with the copper",
  async (origin) => {
    const original = fp.string("diode0603_cathodepin1").circuitJson()
    const shifted = fp
      .string("diode0603_cathodepin1")
      .origin(origin)
      .circuitJson()
    const originalPad = original.find((el) => el.type === "pcb_smtpad")!
    const shiftedPad = shifted.find((el) => el.type === "pcb_smtpad")!
    const dx = shiftedPad.x - originalPad.x
    const dy = shiftedPad.y - originalPad.y
    const notes = shifted.filter(
      (el) => el.type === "pcb_fabrication_note_text",
    )

    expect(notes).toHaveLength(2)
    for (const note of notes) {
      const originalNote = original.find(
        (el) =>
          el.type === "pcb_fabrication_note_text" && el.text === note.text,
      )!
      expect(note.anchor_position.x).toBeCloseTo(
        originalNote.anchor_position.x + dx,
        10,
      )
      expect(note.anchor_position.y).toBeCloseTo(
        originalNote.anchor_position.y + dy,
        10,
      )
    }

    await expect(
      convertCircuitJsonToPcbSvg(shifted, { showFabricationNotes: true }),
    ).toMatchSvgSnapshot(import.meta.path, `diode-${origin}-origin`)
  },
)
