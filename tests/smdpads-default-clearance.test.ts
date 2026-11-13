import { expect, test } from "bun:test"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { fp } from "../src/footprinter"

for (const pinCount of [2, 3] as const) {
  test(`default smdpads${pinCount} keeps adjacent pins separated`, () => {
    const circuitJson = fp.string(`smdpads${pinCount}`).circuitJson()
    const pads = circuitJson.filter((element) => element.type === "pcb_smtpad")

    expect(pads).toHaveLength(pinCount)
    for (let index = 1; index < pads.length; index++) {
      const left = pads[index - 1]!
      const right = pads[index]!
      const gap = right.x - right.width / 2 - (left.x + left.width / 2)
      expect(gap).toBeCloseTo(0.5, 6)
      expect(right.x - left.x).toBe(1)
    }
    expect(circuitJson).toEqual(fp().smdpads(pinCount).circuitJson())
    if (pinCount === 3) {
      expect(circuitJson).toEqual(fp.string("smdpads").circuitJson())
      expect(circuitJson).toEqual(fp().smdpads().circuitJson())
    }
    expect(
      convertCircuitJsonToPcbSvg(circuitJson, { showCourtyards: true }),
    ).toMatchSvgSnapshot(
      import.meta.path,
      `smdpads${pinCount}-default-clearance`,
    )
  })
}

test("smdpads preserves explicit pad widths", () => {
  const circuitJson = fp.string("smdpads3_pw1mm_p1.5mm_ph0.8mm").circuitJson()
  const pads = circuitJson.filter((element) => element.type === "pcb_smtpad")
  expect(pads.map(({ x, width, height }) => ({ x, width, height }))).toEqual([
    { x: -1.5, width: 1, height: 0.8 },
    { x: 0, width: 1, height: 0.8 },
    { x: 1.5, width: 1, height: 0.8 },
  ])
  expect(
    convertCircuitJsonToPcbSvg(circuitJson, { showCourtyards: true }),
  ).toMatchSvgSnapshot(import.meta.path, "smdpads3-explicit-pad-width")
})
