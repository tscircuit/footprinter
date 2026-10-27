import { expect, test } from "bun:test"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { fp } from "../src/footprinter"

test("sod123w", async () => {
  const circuitJson = fp.string("sod123w").circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(circuitJson, {
    showCourtyards: true,
  })
  await expect(svgContent).toMatchSvgSnapshot(import.meta.path, "sod123w")
})

test("sod123w supports cathode on pin 1", async () => {
  const circuitJson = fp
    .string("sod123w_p3.4mm_pw0.95mm_cathodepin1")
    .circuitJson()
  const pads = circuitJson.filter((element) => element.type === "pcb_smtpad")
  expect(pads).toHaveLength(2)
  expect(pads[0]?.port_hints).toContain("1")
  expect(pads[0]?.x).toBeLessThan(pads[1]!.x)
  expect(circuitJson).toEqual(
    fp.string("sod123w_p3.4mm_pw0.95mm").circuitJson(),
  )
  expect(
    circuitJson.filter(
      (element) =>
        element.type === "pcb_fabrication_note_path" ||
        element.type === "pcb_fabrication_note_text",
    ),
  ).toHaveLength(0)

  const svgContent = convertCircuitJsonToPcbSvg(circuitJson, {
    showCourtyards: true,
  })
  await expect(svgContent).toMatchSvgSnapshot(
    import.meta.path,
    "sod123w-cathode-pin-1",
  )
})

test("sod123w supports explicitly identifying pin 1 as the anode", async () => {
  const explicitCircuitJson = fp
    .string("sod123w_p3.4mm_pw0.95mm_anodepin1")
    .circuitJson()
  const defaultCircuitJson = fp.string("sod123w_p3.4mm_pw0.95mm").circuitJson()
  const builderCircuitJson = fp()
    .sod123w()
    .p("3.4mm")
    .pw("0.95mm")
    .anodepin(1)
    .circuitJson()

  expect(explicitCircuitJson).toEqual(defaultCircuitJson)
  expect(builderCircuitJson).toEqual(defaultCircuitJson)

  const svgContent = convertCircuitJsonToPcbSvg(explicitCircuitJson, {
    showCourtyards: true,
  })
  await expect(svgContent).toMatchSvgSnapshot(
    import.meta.path,
    "sod123w-anode-pin-1",
  )
})

test("sod123w rejects assigning the anode and cathode to the same pin", async () => {
  expect(() =>
    fp.string("sod123w_anodepin1_cathodepin1").circuitJson(),
  ).toThrow("Diode anode and cathode cannot use the same pin")
})
