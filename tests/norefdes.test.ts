import { expect, test } from "bun:test"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { fp } from "../src/footprinter"

for (const footprint of [
  "stampboard_left3_right3_top0_bottom0_w21mm_p2.54mm_silkscreenlabels",
  "stampreceiver_left3_right3_top0_bottom0_w21mm_p2.54mm_silkscreenlabels",
]) {
  test(`${footprint} norefdes preserves pin labels`, () => {
    const original = fp.string(footprint).circuitJson()
    const circuit = fp.string(`${footprint}_norefdes`).circuitJson()
    const originalTexts = original.filter(
      (element) => element.type === "pcb_silkscreen_text",
    )
    const texts = circuit.filter(
      (element) => element.type === "pcb_silkscreen_text",
    )

    expect(originalTexts.some((element) => element.text === "{REF}")).toBe(true)
    expect(texts.map((element) => element.text)).toEqual(
      originalTexts.map((element) =>
        element.text === "{REF}" ? "" : element.text,
      ),
    )
    expect(texts.filter((element) => element.text !== "")).toHaveLength(6)
    expect(convertCircuitJsonToPcbSvg(circuit)).toMatchSvgSnapshot(
      import.meta.path,
      `${footprint}_norefdes`,
    )
  })
}
