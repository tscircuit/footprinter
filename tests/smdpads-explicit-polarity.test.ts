import { expect, test } from "bun:test"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { fp } from "../src/footprinter"
import { applyOrigin } from "../src/helpers/apply-origin"

test("explicit smdpads polarity options retain neutral footprint geometry", async () => {
  const dimensions = "smdpads2_p3.3848mm_pw0.95mm_ph1.15mm"
  const transforms: Array<{
    origin?: "pin1" | "bottomleft"
    noSilkscreen?: boolean
  }> = [
    {},
    { origin: "pin1" },
    { origin: "bottomleft" },
    { origin: "pin1", noSilkscreen: true },
  ]
  const generate = (
    footprint: string,
    transform: (typeof transforms)[number],
  ) => {
    const circuitJson = fp
      .string(`${footprint}${transform.noSilkscreen ? "_nosilkscreen" : ""}`)
      .circuitJson()
    return applyOrigin(circuitJson, transform.origin)
  }
  for (const transform of transforms) {
    const plain = generate(dimensions, transform)
    if (transform.origin === "pin1") {
      const pin1 = plain.find(
        (pad) => pad.type === "pcb_smtpad" && pad.port_hints?.includes("1"),
      )!
      if (pin1.type !== "pcb_smtpad" || !("x" in pin1))
        throw new Error("missing pin 1")
      expect(pin1.x).toBe(0)
      expect(pin1.y).toBe(0)
    }
    expect(
      plain.some((note) => note.type.startsWith("pcb_fabrication_note")),
    ).toBe(false)
    for (const modifier of [
      "anodepin1",
      "anodepin2",
      "cathodepin1",
      "cathodepin2",
      "anodepin2_cathodepin1",
    ]) {
      const circuitJson = generate(`${dimensions}_${modifier}`, transform)
      expect(circuitJson).toEqual(plain)
    }
  }
  expect(() =>
    fp.string(`${dimensions}_anodepin1_cathodepin1`).circuitJson(),
  ).toThrow("Diode anode and cathode cannot use the same pin")
  expect(
    fp.string(`${dimensions}_anodepin2_cathodepin1`).circuitJson(),
  ).toEqual(
    fp()
      .smdpads(2)
      .p("3.3848mm")
      .pw("0.95mm")
      .ph("1.15mm")
      .anodepin(2)
      .cathodepin(1)
      .circuitJson(),
  )
  // More than two generic pads do not imply a single diode.
  expect(
    fp
      .string("smdpads3_anodepin1_cathodepin2")
      .circuitJson()
      .some((note) => note.type.startsWith("pcb_fabrication_note")),
  ).toBe(false)
  const svgOptions = {
    width: 800,
    height: 600,
    showFabricationNotes: true,
    showCourtyards: true,
  }
  for (const [name, circuitJson] of [
    ["neutral", generate(dimensions, {})],
    ["cathode_left", generate(`${dimensions}_cathodepin1`, {})],
    ["cathode_right", generate(`${dimensions}_anodepin1`, {})],
    ["pin1_origin", generate(`${dimensions}_cathodepin1`, { origin: "pin1" })],
  ] as const) {
    await expect(
      convertCircuitJsonToPcbSvg(circuitJson, svgOptions),
    ).toMatchSvgSnapshot(import.meta.path, `smdpads-polarity-${name}`)
  }
})
