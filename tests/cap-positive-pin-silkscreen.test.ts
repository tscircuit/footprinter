import { expect, test } from "bun:test"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { fp } from "../src/footprinter"

test("polarized capacitor silkscreen follows the selected positive pin", () => {
  const footprint = fp
    .string("cap0805_polarized_positivepin2_negativepin1")
    .circuitJson()
  const pads = footprint.filter((e) => e.type === "pcb_smtpad" && "x" in e)
  const positive = pads.find((pad) => pad.port_hints?.includes("2"))!
  const plus = footprint.filter(
    (e) =>
      e.type === "pcb_silkscreen_path" &&
      e.pcb_silkscreen_path_id.startsWith("capacitor_polarity_plus_"),
  )
  expect(convertCircuitJsonToPcbSvg(footprint)).toMatchSvgSnapshot(
    import.meta.path,
  )
  expect(plus).toHaveLength(2)
  const centerX = plus[1]!.route[0]!.x
  expect(centerX).toBeGreaterThan(positive.x)

  for (const [option, positivePin] of [
    ["positivepin1", 1],
    ["negativepin2", 1],
    ["positivepin2", 2],
    ["negativepin1", 2],
    ["positivepin2_negativepin1", 2],
  ] as const) {
    const elements = fp.string(`cap0805_polarized_${option}`).circuitJson()
    const positivePad = elements.find(
      (e) =>
        e.type === "pcb_smtpad" && e.port_hints?.includes(String(positivePin)),
    )!
    const line = elements.find(
      (e) =>
        e.type === "pcb_silkscreen_path" &&
        e.pcb_silkscreen_path_id === "capacitor_polarity_plus_1",
    )!
    if (
      positivePad.type !== "pcb_smtpad" ||
      !("x" in positivePad) ||
      line.type !== "pcb_silkscreen_path"
    )
      throw new Error("missing pad or plus")
    expect(
      (line.route[0]!.x - positivePad.x) * (positivePin === 1 ? -1 : 1),
    ).toBeGreaterThan(0)
    expect(elements.filter((e) => e.type === "pcb_smtpad")).toEqual(pads)
  }
  expect(() =>
    fp.string("cap0805_polarized_positivepin1_negativepin1").circuitJson(),
  ).toThrow("positive and negative pins must be different")
  expect(
    fp()
      .cap()
      .imperial("0805")
      .polarized()
      .positivepin(2)
      .negativepin(1)
      .circuitJson(),
  ).toEqual(footprint)
})
