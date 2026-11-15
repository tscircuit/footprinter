import { expect, test } from "bun:test"
import type { AnyCircuitElement } from "circuit-json"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { fp } from "../src/footprinter"

const cases = [
  {
    name: "res-wide-tall",
    standard: "res0603",
    modifiers: "pw1.4_ph2",
    width: 1.4,
    height: 2,
    bodyHeight: 0.95,
  },
  {
    name: "res-short",
    standard: "res2512",
    modifiers: "ph1",
    width: 1.225,
    height: 1,
    bodyHeight: 3.35,
  },
  {
    name: "cap-narrow",
    standard: "cap2512",
    modifiers: "pw0.2",
    width: 0.2,
    height: 3.35,
    bodyHeight: 3.35,
  },
  {
    name: "cap-small-bottom",
    standard: "cap2512",
    modifiers: "pw0.2_ph1_textbottom",
    width: 0.2,
    height: 1,
    bodyHeight: 3.35,
  },
  {
    name: "res-wide-tht",
    standard: "res1206_tht",
    modifiers: "pw2.2",
    width: 2.2,
    height: 1.75,
    bodyHeight: 1.75,
  },
  {
    name: "cap-wide-tht-bottom",
    standard: "cap1206_tht",
    modifiers: "pw2.2_textbottom",
    width: 2.2,
    height: 1.75,
    bodyHeight: 1.75,
  },
  {
    name: "res-small-tht-bottom",
    standard: "res2512_tht",
    modifiers: "pw0.6_ph1_textbottom",
    width: 0.6,
    height: 1,
    bodyHeight: 3.35,
  },
  {
    name: "cap-narrow-tht",
    standard: "cap2512_tht",
    modifiers: "pw0.6",
    width: 0.6,
    height: 3.35,
    bodyHeight: 3.35,
  },
]

const geometry = (elements: AnyCircuitElement[]) => {
  const pads = elements.filter(
    (element) =>
      element.type === "pcb_smtpad" || element.type === "pcb_plated_hole",
  )
  const courtyard = elements.find(
    (element) => element.type === "pcb_courtyard_rect",
  )
  const reference = elements.find(
    (element) => element.type === "pcb_silkscreen_text",
  )
  if (!courtyard || !reference)
    throw new Error("missing courtyard or reference")
  const copper = pads.map((pad) => {
    const width =
      "width" in pad
        ? pad.width
        : "outer_diameter" in pad
          ? pad.outer_diameter
          : 0
    const height = "height" in pad ? pad.height : width
    return {
      minX: pad.x - width / 2,
      maxX: pad.x + width / 2,
      minY: pad.y - height / 2,
      maxY: pad.y + height / 2,
    }
  })
  const copperWidth =
    Math.max(...copper.map((pad) => pad.maxX)) -
    Math.min(...copper.map((pad) => pad.minX))
  const copperHeight =
    Math.max(...copper.map((pad) => pad.maxY)) -
    Math.min(...copper.map((pad) => pad.minY))
  const points = elements
    .filter((element) => element.type === "pcb_silkscreen_path")
    .flatMap((line) => line.route)
  return {
    pads,
    courtyard,
    reference,
    sideMargin: (courtyard.width - copperWidth) / 2,
    endMargin: (courtyard.height - copperHeight) / 2,
    minX: Math.min(...points.map((point) => point.x)),
    maxX: Math.max(...points.map((point) => point.x)),
    minY: Math.min(...points.map((point) => point.y)),
    maxY: Math.max(...points.map((point) => point.y)),
  }
}

for (const { name, standard, modifiers, width, height, bodyHeight } of cases) {
  test(`${name} retains the standard clearance and marking envelope`, () => {
    const elements = fp.string(`${standard}_${modifiers}`).circuitJson()
    const actual = geometry(elements)
    const original = geometry(fp.string(standard).circuitJson())
    expect(actual.pads).toHaveLength(2)
    for (const pad of actual.pads) {
      expect(pad).toMatchObject(
        standard.endsWith("_tht")
          ? { hole_diameter: width, outer_diameter: width / 0.8 }
          : { width, height },
      )
    }
    expect(actual.pads.map((pad) => pad.x)).toEqual(
      original.pads.map((pad) => pad.x),
    )
    expect(actual.sideMargin).toBeGreaterThanOrEqual(original.sideMargin - 1e-9)
    expect(actual.endMargin).toBeGreaterThanOrEqual(original.endMargin - 1e-9)
    expect(actual.courtyard.width).toBeGreaterThanOrEqual(
      original.courtyard.width,
    )
    expect(actual.courtyard.height).toBeGreaterThanOrEqual(
      original.courtyard.height,
    )
    expect(actual.minX).toBeLessThanOrEqual(original.minX)
    expect(actual.maxX).toBeGreaterThanOrEqual(original.maxX)
    expect(actual.minY).toBeLessThanOrEqual(original.minY)
    expect(actual.maxY).toBeGreaterThanOrEqual(original.maxY)
    const textY = actual.reference.anchor_position.y
    expect(Math.sign(textY)).toBe(modifiers.includes("textbottom") ? -1 : 1)
    expect(Math.abs(textY)).toBeGreaterThanOrEqual(
      Math.abs(original.reference.anchor_position.y),
    )
    expect(Math.abs(textY) - actual.reference.font_size / 2).toBeGreaterThan(
      bodyHeight / 2,
    )
    expect(
      convertCircuitJsonToPcbSvg(elements, { showCourtyards: true }),
    ).toMatchSvgSnapshot(import.meta.path, `passive-envelope-${name}`)
  })
}
