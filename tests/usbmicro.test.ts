import { expect, test } from "bun:test"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { fp } from "../src/footprinter"
import { usbmicro_def } from "../src/fn/usbmicro"
import { usbMicroFrontFlangeCopper } from "./fixtures/usbmicro-frontflange"

test("usbmicro5 front flange matches all 11 reviewed Amphenol solder owners", () => {
  const circuitJson = fp.string("usbmicro5_frontflange").circuitJson()
  const copper = circuitJson.filter(
    (element) =>
      element.type === "pcb_smtpad" || element.type === "pcb_plated_hole",
  )
  expect(copper).toHaveLength(11)
  expect(copper.map((pad) => pad.port_hints)).toEqual(
    Array.from({ length: 11 }, (_, index) => [String(index + 1)]),
  )
  for (const { pin, ...expected } of usbMicroFrontFlangeCopper) {
    const pad = copper.find((element) => element.port_hints?.includes(pin))
    expect(pad).toMatchObject(expected)
  }
  expect(copper.filter((pad) => pad.type === "pcb_plated_hole")).toHaveLength(4)
  expect(convertCircuitJsonToPcbSvg(circuitJson)).toMatchSvgSnapshot(
    import.meta.path,
    "usbmicro5_10118194_0001LF",
  )
})

test("usbmicro contact pitch and shell spans are unit-aware independent dimensions", () => {
  const definition =
    "usbmicro5_frontflange_p700um_rearspan5.2mm_frontspan7.4mm_tabspan2.2mm_pinstart21_reverse"
  const circuitJson = fp.string(definition).circuitJson()
  const copper = circuitJson.filter(
    (element) =>
      (element.type === "pcb_smtpad" && element.shape === "rect") ||
      element.type === "pcb_plated_hole",
  )
  expect(
    copper.slice(0, 5).map((pad) => ({ x: pad.x, pin: pad.port_hints })),
  ).toEqual([
    { x: 1.4, pin: ["21"] },
    { x: 0.7, pin: ["22"] },
    { x: 0, pin: ["23"] },
    { x: -0.7, pin: ["24"] },
    { x: -1.4, pin: ["25"] },
  ])
  expect(
    copper.slice(5).map((pad) => ({ x: pad.x, pin: pad.port_hints })),
  ).toEqual([
    { x: -2.6, pin: ["26"] },
    { x: 2.6, pin: ["27"] },
    { x: -3.7, pin: ["28"] },
    { x: 3.7, pin: ["29"] },
    { x: -1.1, pin: ["30"] },
    { x: 1.1, pin: ["31"] },
  ])
  expect(
    fp()
      .usbmicro(5)
      .p("700um")
      .rearspan(5.2)
      .frontspan(7.4)
      .tabspan(2.2)
      .pinstart(21)
      .reverse()
      .circuitJson(),
  ).toEqual(circuitJson)
  expect(convertCircuitJsonToPcbSvg(circuitJson)).toMatchSvgSnapshot(
    import.meta.path,
    "usbmicro5_semantic_dimensions",
  )
})

test("usbmicro rejects impossible lands, nonfinite dimensions, and other mechanical profiles", () => {
  for (const invalid of [
    { p: 0 },
    { p: -1 },
    { p: Infinity },
    { rowy: NaN },
    { pw: 0.65 },
    { frontpw: 0.5 },
    { frontph: 1.15 },
    { rearring: 0 },
    { tabpw: 2 },
    { pinstart: 0 },
    { pinstart: 1.5 },
    { num_pins: 4 },
    { frontflange: false },
    { noflange: true },
  ]) {
    expect(usbmicro_def.safeParse({ fn: "usbmicro", ...invalid }).success).toBe(
      false,
    )
  }
  expect(() => fp.string("usbmicro4").circuitJson()).toThrow()
  expect(() => fp.string("usbmicro5_noflange").circuitJson()).toThrow()
})

test("usbmicro honors standard silkscreen and reference switches", () => {
  const circuitJson = fp.string("usbmicro5_nosilkscreen").circuitJson()
  expect(
    circuitJson.some((element) => element.type.startsWith("pcb_silkscreen")),
  ).toBe(false)
  const withoutReference = fp.string("usbmicro5_norefdes").circuitJson()
  expect(
    withoutReference.some(
      (element) =>
        element.type === "pcb_silkscreen_text" && element.text !== "",
    ),
  ).toBe(false)
  expect(
    withoutReference.some((element) => element.type === "pcb_silkscreen_path"),
  ).toBe(true)
})
