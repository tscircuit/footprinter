import { expect, test } from "bun:test"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { fp } from "../src"

test.each([8, 10, 16])(
  "TSSOP%d has the same pads with implicit and explicit default pitch",
  (pinCount) => {
    const implicit = fp.string(`tssop${pinCount}`)
    const explicit = fp.string(`tssop${pinCount}_p0.5mm`)
    const elements = implicit.circuitJson()
    expect(implicit.json()).toEqual(explicit.json())
    expect(elements).toEqual(explicit.circuitJson())
    expect(elements).toEqual(fp().tssop(pinCount).p(0.5).circuitJson())
    expect(elements).toEqual(fp().tssop(pinCount).circuitJson())
    expect(
      convertCircuitJsonToPcbSvg(elements, { showCourtyards: true }),
    ).toMatchSvgSnapshot(import.meta.path, `tssop${pinCount}_default_pitch`)
  },
)
