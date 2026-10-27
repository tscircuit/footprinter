import { expect, test } from "bun:test"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { led } from "../src/fn"
import { fp } from "../src/footprinter"

test("led_rect", async () => {
  const soup = led({
    tht: false,
    p: 2.5,
    pw: 0.5,
    ph: 0.5,
  }).circuitJson

  const svgContent = convertCircuitJsonToPcbSvg(soup)
  await expect(svgContent).toMatchSvgSnapshot(import.meta.path, "led_rect")
})
test("led_hole", async () => {
  const soup = led({
    tht: true,
    p: 2,
    pw: 0.5,
    ph: 0.5,
    metric: "mm",
    w: 5,
    h: 2,
  }).circuitJson

  const svgContent = convertCircuitJsonToPcbSvg(soup)
  await expect(svgContent).toMatchSvgSnapshot(import.meta.path, "led_hole")
})

test("led_rect testing .parameters for .json", async () => {
  const params = {
    tht: false,
    p: 2.5,
    pw: 0.5,
    ph: 0.5,
  }

  const soup = led(params)

  const soupJson = soup.circuitJson
  const soupParameters = soup.parameters

  const svgContent = convertCircuitJsonToPcbSvg(soupJson)

  expect(soupParameters).toEqual(params)
  await expect(svgContent).toMatchSvgSnapshot(import.meta.path, "led_rect")
})

test("led_hole testing .parameters for .json", async () => {
  const params = {
    tht: true,
    p: 2,
    pw: 0.5,
    ph: 0.5,
    metric: "mm",
    w: 5,
    h: 2,
  }

  const soup = led(params)

  const soupJson = soup.circuitJson
  const soupParameters = soup.parameters

  const svgContent = convertCircuitJsonToPcbSvg(soupJson)

  expect(soupParameters).toEqual(params)
  await expect(svgContent).toMatchSvgSnapshot(import.meta.path, "led_hole")
})

test("led0402", async () => {
  const soup = fp.string("led0402").circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(soup)
  await expect(svgContent).toMatchSvgSnapshot(import.meta.path, "led_0402")
})

test("led0603", async () => {
  const soup = fp.string("led0603").circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(soup)
  await expect(svgContent).toMatchSvgSnapshot(import.meta.path, "led_0603")
})

test("led0805", async () => {
  const soup = fp.string("led0805").circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(soup)
  await expect(svgContent).toMatchSvgSnapshot(import.meta.path, "led_0805")
})

test("led1206", async () => {
  const soup = fp().led().imperial("1206").circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(soup)
  await expect(svgContent).toMatchSvgSnapshot(import.meta.path, "led_1206")
})

test("led0201", async () => {
  const soup = fp().led().imperial("0201").circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(soup)
  await expect(svgContent).toMatchSvgSnapshot(import.meta.path, "led_0201")
})

test("custom LED footprint uses explicit courtyard dimensions", async () => {
  const footprintString =
    "led_p4.6599mm_pw2.91mm_ph2.9106mm_cyw8.628mm_cyh4.056mm"
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

for (const { footprint, builder } of [
  {
    footprint: "led0603",
    builder: () => fp().led().imperial("0603"),
  },
  {
    footprint: "led_p3.4mm_pw1.2mm_ph0.95mm",
    builder: () => fp().led().p("3.4mm").pw("1.2mm").ph("0.95mm"),
  },
]) {
  test(`${footprint} strings normalize explicit polarity pins`, async () => {
    for (const modifier of ["anodepin", "cathodepin"] as const) {
      for (const pin of [1, 2] as const) {
        const circuitJson = fp
          .string(`${footprint}_${modifier}${pin}`)
          .circuitJson()
        expect(circuitJson).toEqual(builder()[modifier](pin).circuitJson())

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
      fp.string(`${footprint}_cathodepin1_anodepin1`).circuitJson(),
    ).toThrow("Diode anode and cathode cannot use the same pin")

    await expect(
      convertCircuitJsonToPcbSvg(
        fp.string(`${footprint}_cathodepin1`).circuitJson(),
        { showFabricationNotes: true },
      ),
    ).toMatchSvgSnapshot(import.meta.path, `${footprint}-explicit-polarity`)
  })
}
