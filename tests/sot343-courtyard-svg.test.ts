import { expect, test } from "bun:test"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { fp } from "../src/footprinter"

for (const [name, definition] of [
  ["sot343-courtyard-default", "sot343"],
  ["sot343-courtyard-custom", "sot343_pl1.2_pw0.9_p2_w5.2_h5"],
  ["sot343-courtyard-wide-pads", "sot343_pw8"],
]) {
  test(name!, () => {
    const svg = convertCircuitJsonToPcbSvg(
      fp.string(definition!).circuitJson(),
      {
        showCourtyards: true,
      },
    )
    expect(svg).toMatchSvgSnapshot(import.meta.path, name!)
  })
}
