import { expect, test } from "bun:test"
import type { AnyCircuitElement } from "circuit-json"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { fp } from "../src/footprinter"

const cases = [
  {
    name: "res-wide-tall",
    definition: "res0603_pw1.4_ph2",
    width: 1.4,
    height: 2,
    pitch: 1.65,
  },
  {
    name: "cap-height",
    definition: "cap0603_ph2",
    width: 0.8,
    height: 2,
    pitch: 1.65,
  },
  {
    name: "diode-width",
    definition: "diode0603_pw1.4",
    width: 1.4,
    height: 0.95,
    pitch: 1.65,
  },
  {
    name: "led-metric",
    definition: "led1608_metric_pw1mm_ph2mm",
    width: 1,
    height: 2,
    pitch: 1.65,
  },
]

const expectConsistentGeometry = (elements: AnyCircuitElement[]) => {
  const pads = elements.filter(
    (element) =>
      element.type === "pcb_smtpad" || element.type === "pcb_plated_hole",
  )
  const courtyard = elements.find(
    (element) => element.type === "pcb_courtyard_rect",
  )
  expect(courtyard).toBeDefined()
  if (!courtyard) throw new Error("missing courtyard")
  const copper = pads.map((pad) => {
    const width =
      pad.type === "pcb_smtpad" && "width" in pad
        ? pad.width
        : "outer_diameter" in pad
          ? pad.outer_diameter
          : 0
    const height =
      pad.type === "pcb_smtpad" && "height" in pad ? pad.height : width
    return {
      minX: pad.x - width / 2,
      maxX: pad.x + width / 2,
      minY: pad.y - height / 2,
      maxY: pad.y + height / 2,
    }
  })
  for (const bounds of copper) {
    expect(bounds.minX).toBeGreaterThanOrEqual(
      courtyard.center.x - courtyard.width / 2 - 1e-9,
    )
    expect(bounds.maxX).toBeLessThanOrEqual(
      courtyard.center.x + courtyard.width / 2 + 1e-9,
    )
    expect(bounds.minY).toBeGreaterThanOrEqual(
      courtyard.center.y - courtyard.height / 2 - 1e-9,
    )
    expect(bounds.maxY).toBeLessThanOrEqual(
      courtyard.center.y + courtyard.height / 2 + 1e-9,
    )
  }
  for (const line of elements) {
    if (line.type !== "pcb_silkscreen_path") continue
    const halfStroke = line.stroke_width / 2
    for (let index = 1; index < line.route.length; index++) {
      const a = line.route[index - 1]!
      const b = line.route[index]!
      const stroke = {
        minX: Math.min(a.x, b.x) - halfStroke,
        maxX: Math.max(a.x, b.x) + halfStroke,
        minY: Math.min(a.y, b.y) - halfStroke,
        maxY: Math.max(a.y, b.y) + halfStroke,
      }
      expect(stroke.minX).toBeGreaterThanOrEqual(
        courtyard.center.x - courtyard.width / 2 - 1e-9,
      )
      expect(stroke.maxX).toBeLessThanOrEqual(
        courtyard.center.x + courtyard.width / 2 + 1e-9,
      )
      expect(stroke.minY).toBeGreaterThanOrEqual(
        courtyard.center.y - courtyard.height / 2 - 1e-9,
      )
      expect(stroke.maxY).toBeLessThanOrEqual(
        courtyard.center.y + courtyard.height / 2 + 1e-9,
      )
      for (const pad of copper) {
        const overlapsX = stroke.minX < pad.maxX && stroke.maxX > pad.minX
        const overlapsY = stroke.minY < pad.maxY && stroke.maxY > pad.minY
        expect(overlapsX && overlapsY).toBe(false)
      }
    }
  }
}

for (const { name, definition, width, height, pitch } of cases) {
  test(`${name} honors custom pads and keeps their dependent geometry consistent`, () => {
    const elements = fp.string(definition).circuitJson()
    const pads = elements.filter((element) => element.type === "pcb_smtpad")
    expect(pads).toHaveLength(2)
    for (const pad of pads) expect(pad).toMatchObject({ width, height })
    expect(pads.map((pad) => pad.x)).toEqual([-pitch / 2, pitch / 2])
    expectConsistentGeometry(elements)
    expect(
      convertCircuitJsonToPcbSvg(elements, { showCourtyards: true }),
    ).toMatchSvgSnapshot(import.meta.path, `passive-custom-${name}`)
  })
}

test("builder dimensions convert units and match the metric string alias", () => {
  const elements = fp()
    .cap()
    .imperial("0805")
    .pw("0.04in")
    .ph("1200um")
    .circuitJson()
  const pads = elements.filter((element) => element.type === "pcb_smtpad")
  expect(pads).toHaveLength(2)
  for (const pad of pads)
    expect(pad).toMatchObject({ width: 1.016, height: 1.2 })
  expect(pads.map((pad) => pad.x)).toEqual([-0.9125, 0.9125])
  expect(elements).toEqual(
    fp.string("cap2012_metric_pw1.016mm_ph1.2mm").circuitJson(),
  )
  expect(elements).toEqual(
    fp.string("0805_pw1.016mm_ph1.2mm", { defaultFamily: "cap" }).circuitJson(),
  )
  expectConsistentGeometry(elements)
  expect(
    convertCircuitJsonToPcbSvg(elements, { showCourtyards: true }),
  ).toMatchSvgSnapshot(import.meta.path, "passive-custom-cap-builder")
})

test("through-hole passive width controls its drill and copper envelope", () => {
  const elements = fp.string("cap0603_pw1.1mm_tht").circuitJson()
  const pads = elements.filter((element) => element.type === "pcb_plated_hole")
  expect(pads).toHaveLength(2)
  for (const pad of pads)
    expect(pad).toMatchObject({ hole_diameter: 1.1, outer_diameter: 1.375 })
  expectConsistentGeometry(elements)
  expect(
    convertCircuitJsonToPcbSvg(elements, { showCourtyards: true }),
  ).toMatchSvgSnapshot(import.meta.path, "passive-custom-cap-tht")
})

for (const family of ["cap", "res"]) {
  for (const position of ["top", "bottom"]) {
    test(`${family} wide through-hole pads keep the ${position} reference clear of the outline`, () => {
      const suffix = position === "bottom" ? "_textbottom" : ""
      const direction = position === "bottom" ? -1 : 1
      const elements = fp
        .string(`${family}1206_pw2.2mm_tht${suffix}`)
        .circuitJson()
      const pads = elements.filter(
        (element) => element.type === "pcb_plated_hole",
      )
      expect(pads).toHaveLength(2)
      for (const pad of pads)
        expect(pad).toMatchObject({ hole_diameter: 2.2, outer_diameter: 2.75 })
      expect(pads.map((pad) => pad.x)).toEqual([-1.4625, 1.4625])
      expect(pads[1]!.x - pads[0]!.x).toBeGreaterThan(2.75)
      const reference = elements.find(
        (element) => element.type === "pcb_silkscreen_text",
      )
      expect(reference).toBeDefined()
      if (!reference) throw new Error("missing reference")
      expect(reference.anchor_position.y).toBe(direction * 2.275)
      const nearestTextEdge =
        Math.abs(reference.anchor_position.y) - reference.font_size / 2
      expect(nearestTextEdge).toBeGreaterThan(2.75 / 2)
      for (const line of elements) {
        if (line.type !== "pcb_silkscreen_path") continue
        for (const point of line.route)
          expect(nearestTextEdge).toBeGreaterThan(
            Math.abs(point.y) + line.stroke_width / 2,
          )
      }
      expectConsistentGeometry(elements)

      const standard = fp.string(`${family}1206_tht${suffix}`).circuitJson()
      expect(
        fp
          .string(`${family}1206_pw1.125mm_ph1.75mm_tht${suffix}`)
          .circuitJson(),
      ).toEqual(standard)
      for (const control of [
        standard,
        fp.string(`${family}1206_pw2.2mm${suffix}`).circuitJson(),
      ]) {
        expect(
          control.find((element) => element.type === "pcb_silkscreen_text"),
        ).toMatchObject({ anchor_position: { y: direction * 1.775 } })
      }
      expect(
        convertCircuitJsonToPcbSvg(elements, { showCourtyards: true }),
      ).toMatchSvgSnapshot(
        import.meta.path,
        `passive-custom-${family}-wide-tht-${position}`,
      )
    })
  }
}

test("explicit dimensions equal to defaults retain the complete standard footprint", () => {
  const elements = fp.string("res0603_pw0.8mm_ph0.95mm").circuitJson()
  expect(elements).toEqual(fp.string("res0603").circuitJson())
  expect(
    elements.filter((element) => element.type === "pcb_smtpad"),
  ).toMatchObject([
    { width: 0.8, height: 0.95, x: -0.825 },
    { width: 0.8, height: 0.95, x: 0.825 },
  ])
  expect(
    elements.find((element) => element.type === "pcb_courtyard_rect"),
  ).toMatchObject({ width: 2.96, height: 1.46 })
  expect(
    convertCircuitJsonToPcbSvg(elements, { showCourtyards: true }),
  ).toMatchSvgSnapshot(import.meta.path, "passive-custom-equal-defaults")
})
