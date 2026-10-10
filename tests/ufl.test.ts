import { expect, test } from "bun:test"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { fp } from "../src/footprinter"

// C88373 U.FL-R-SMT-1(10), acquired through EasyEDA's exact supplier ID lookup.
// Ground pads 1/3 surround signal pad 2; the imported component origin is offset.
// https://jlcpcb.com/partdetail/C88373
const referencePads = [
  { pin: "1", x: 0.44996735, y: 1.499997, width: 2.1999956, height: 1.0999978 },
  { pin: "2", x: -0.79996665, y: 0.001143, width: 1.499997, height: 1.0999978 },
  {
    pin: "3",
    x: 0.44996735,
    y: -1.499997,
    width: 2.1999956,
    height: 1.0999978,
  },
]

test("ufl preserves the signal and ground land pattern of C88373", () => {
  const circuitJson = fp.string("ufl").circuitJson()
  const pads = circuitJson.filter((element) => element.type === "pcb_smtpad")
  expect(pads).toHaveLength(3)
  expect(pads.map((pad) => pad.port_hints)).toEqual([["1"], ["2"], ["3"]])

  const referenceX = (referencePads[0]!.x + referencePads[1]!.x) / 2
  const generatedX = (pads[0]!.x + pads[1]!.x) / 2
  let intersection = 0
  let union = 0
  for (const [index, reference] of referencePads.entries()) {
    const pad = pads[index]!
    const generated = { ...pad, x: pad.x - generatedX }
    const target = { ...reference, x: reference.x - referenceX }
    const overlapX = Math.max(
      0,
      Math.min(generated.x + pad.width / 2, target.x + target.width / 2) -
        Math.max(generated.x - pad.width / 2, target.x - target.width / 2),
    )
    const overlapY = Math.max(
      0,
      Math.min(pad.y + pad.height / 2, target.y + target.height / 2) -
        Math.max(pad.y - pad.height / 2, target.y - target.height / 2),
    )
    const area = overlapX * overlapY
    intersection += area
    union += pad.width * pad.height + target.width * target.height - area
    expect(Math.abs(generated.x - target.x)).toBeLessThan(0.002)
    expect(Math.abs(pad.y - target.y)).toBeLessThan(0.002)
  }
  expect(intersection / union).toBeGreaterThan(0.999)

  const customized = fp()
    .ufl()
    .p("3.2mm")
    .pw("2mm")
    .signalw("1.4mm")
    .signalx("-1.3mm")
    .circuitJson()
  expect(customized[0]).toMatchObject({ x: 0, y: 1.6, width: 2 })
  expect(customized[1]).toMatchObject({ x: -1.3, y: 0, width: 1.4 })
  expect(() => fp.string("ufl_p0mm").circuitJson()).toThrow()
  expect(() => fp.string("ufl4").circuitJson()).toThrow()

  expect(
    convertCircuitJsonToPcbSvg(circuitJson, { showCourtyards: true }),
  ).toMatchSvgSnapshot(import.meta.path, "ufl_C88373")
})
