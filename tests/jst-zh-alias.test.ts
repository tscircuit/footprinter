import { expect, test } from "bun:test"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { fp } from "../src/footprinter"

for (const [suffix, name] of [
  ["", "bare"],
  ["_nosilkscreen", "nosilkscreen"],
  ["_pw0.9mm_p1.7mm", "custom-dimensions"],
] as const) {
  test(`ZH alias preserves its family and modifiers: ${name}`, () => {
    const alias = fp.string(`zh7${suffix}`)
    const canonical = fp.string(`jst7_zh${suffix}`)
    const circuit = alias.circuitJson()

    expect(alias.json()).toMatchObject({
      zh: true,
      ph: false,
      num_pins: 7,
      p: suffix.includes("_p1.7mm") ? 1.7 : 1.5,
      pw: suffix.includes("_pw0.9mm") ? 0.9 : 1.03,
    })
    expect(circuit).toEqual(canonical.circuitJson())
    if (suffix === "_nosilkscreen") {
      expect(
        circuit.filter((element) => element.type.startsWith("pcb_silkscreen")),
      ).toHaveLength(0)
    }
    expect(convertCircuitJsonToPcbSvg(circuit)).toMatchSvgSnapshot(
      import.meta.path,
      `zh7-alias-${name}`,
    )
  })
}
