import { expect, test } from "bun:test"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { fp } from "../src/footprinter"

const definitions = [
  "diode0805",
  "led0805",
  "led2835",
  "led5050",
  "do219ad",
  "sod323he",
  "melf",
  "micromelf",
  "minimelf",
  "sma",
  "smb",
  "smbf",
  "smc",
  "smf",
  "sod110",
  "sod123",
  "sod123f",
  "sod123fl",
  "sod123w",
  "sod128",
  "sod323",
  "sod323f",
  "sod323fl",
  "sod323w",
  "sod523",
  "sod723",
  "sod80",
  "sod882",
  "sod882d",
  "sod923",
  "smdpads2_anodepin1_cathodepin2",
]
const visualDefinitions = new Set([
  "diode0805",
  "sod123",
  "led2835",
  "led5050",
  "do219ad",
  "smdpads2_anodepin1_cathodepin2",
])

test("nonpolarized suppresses only automatic diode fabrication symbols across generators", () => {
  for (const definition of definitions) {
    const normal = fp.string(definition).circuitJson()
    const neutral = fp.string(`${definition}_nonpolarized`).circuitJson()
    const disabledFlag = fp.string(definition).nonpolarized(false).circuitJson()
    expect(
      normal.filter((e) => e.type === "pcb_fabrication_note_path").length,
    ).toBeGreaterThan(0)
    expect(
      neutral.filter((e) => e.type.startsWith("pcb_fabrication_note")),
    ).toHaveLength(0)
    expect(disabledFlag).toEqual(normal)
    const copperAndCourtyards = (elements: typeof normal) =>
      elements.filter(
        (e) =>
          e.type === "pcb_smtpad" ||
          e.type === "pcb_plated_hole" ||
          e.type === "pcb_courtyard_rect",
      )
    expect(copperAndCourtyards(neutral)).toEqual(copperAndCourtyards(normal))
    if (visualDefinitions.has(definition)) {
      for (const [name, elements] of [
        ["default", normal],
        ["neutral", neutral],
      ] as const) {
        expect(convertCircuitJsonToPcbSvg(elements)).toMatchSvgSnapshot(
          import.meta.path,
          `${definition}-${name}`,
        )
      }
    }
  }
  const builder = fp().sod123().nonpolarized().circuitJson()
  expect(builder).toEqual(fp.string("sod123_nonpolarized").circuitJson())
  const transformed = fp
    .string("sod123_nonpolarized_pin1location(topside,left)_nosilkscreen")
    .origin("pin1")
    .circuitJson()
  expect(
    transformed.filter((e) => e.type.startsWith("pcb_fabrication_note")),
  ).toHaveLength(0)
  expect(convertCircuitJsonToPcbSvg(transformed)).toMatchSvgSnapshot(
    import.meta.path,
    "neutral-transformed-nosilkscreen",
  )
  const dip = fp.string("dip8").circuitJson()
  expect(dip.some((e) => e.type === "pcb_fabrication_note_text")).toBe(true)
  expect(fp.string("dip8_nonpolarized").circuitJson()).toEqual(dip)
  expect(convertCircuitJsonToPcbSvg(dip)).toMatchSvgSnapshot(
    import.meta.path,
    "unrelated-dip-pin-labels",
  )
  expect(
    fp
      .string("smdpads2_nonpolarized")
      .circuitJson()
      .filter((e) => e.type.startsWith("pcb_fabrication_note")),
  ).toHaveLength(0)
})
