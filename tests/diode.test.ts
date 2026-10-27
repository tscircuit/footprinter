import { expect, test } from "bun:test"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { fp } from "../src/footprinter"

test("diode", async () => {
  const soup = fp().diode().imperial("0402").soup()
  const svgContent = convertCircuitJsonToPcbSvg(soup)
  await expect(svgContent).toMatchSvgSnapshot(import.meta.path, "diode")
})

test("diode0402", async () => {
  const soup = fp.string("diode0402").circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(soup)
  await expect(svgContent).toMatchSvgSnapshot(import.meta.path, "diode0402")
})

test("diode1210", async () => {
  const soup = fp().diode().imperial("1210").circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(soup, { showCourtyards: true })
  await expect(svgContent).toMatchSvgSnapshot(import.meta.path, "diode1210")
})

test("diode0603", async () => {
  const soup = fp().diode().imperial("0603").soup()
  const svgContent = convertCircuitJsonToPcbSvg(soup)
  await expect(svgContent).toMatchSvgSnapshot(import.meta.path, "diode0603")
})

test("diode01005", async () => {
  const soup = fp().diode().imperial("01005").soup()
  const svgContent = convertCircuitJsonToPcbSvg(soup)
  await expect(svgContent).toMatchSvgSnapshot(import.meta.path, "diode01005")
})

test("diode0201", async () => {
  const soup = fp().diode().imperial("0201").soup()
  const svgContent = convertCircuitJsonToPcbSvg(soup)
  await expect(svgContent).toMatchSvgSnapshot(import.meta.path, "diode0201")
})

test("diode2512", async () => {
  const soup = fp().diode().imperial("2512").soup()
  const svgContent = convertCircuitJsonToPcbSvg(soup)
  await expect(svgContent).toMatchSvgSnapshot(import.meta.path, "diode2512")
})

test("custom diode footprint uses explicit courtyard dimensions", async () => {
  const footprintString =
    "diode_p4.6599mm_pw2.91mm_ph2.9106mm_cyw8.628mm_cyh4.056mm"
  const circuitJson = fp.string(footprintString).circuitJson()
  const courtyard = circuitJson.find(
    (element) => element.type === "pcb_courtyard_rect",
  )

  expect(courtyard).toMatchObject({
    width: 8.628,
    height: 4.056,
  })
  await expect(
    convertCircuitJsonToPcbSvg(circuitJson, { showCourtyards: true }),
  ).toMatchSvgSnapshot(import.meta.path, footprintString)
})

test("diode strings normalize explicit polarity pins", async () => {
  const dimensions = "diode_p3.4mm_pw1.2mm_ph0.95mm_rounded0"
  for (const modifier of ["anodepin", "cathodepin"] as const) {
    for (const pin of [1, 2] as const) {
      const circuitJson = fp
        .string(`${dimensions}_${modifier}${pin}`)
        .circuitJson()
      const builder = fp()
        .diode()
        .p("3.4mm")
        .pw("1.2mm")
        .ph("0.95mm")
        .rounded(0)
      const expected = builder[modifier](pin).circuitJson()
      expect(circuitJson).toEqual(expected)
      expect(
        circuitJson.filter(
          (element) =>
            element.type === "pcb_fabrication_note_path" ||
            element.type === "pcb_fabrication_note_text",
        ),
      ).toHaveLength(0)
    }
  }

  expect(() =>
    fp.string(`${dimensions}_cathodepin1_anodepin1`).circuitJson(),
  ).toThrow("Diode anode and cathode cannot use the same pin")
  await expect(
    convertCircuitJsonToPcbSvg(
      fp.string(`${dimensions}_cathodepin1`).circuitJson(),
      {
        showFabricationNotes: true,
      },
    ),
  ).toMatchSvgSnapshot(import.meta.path, "diode-explicit-polarity")
})
