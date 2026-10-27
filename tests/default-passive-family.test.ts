import { expect, test } from "bun:test"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import {
  type FootprinterStringOptions,
  type PassiveFootprintFamily,
  fp,
  resolvePassiveFootprintDefinition,
  string,
} from "../src"

const families: PassiveFootprintFamily[] = ["res", "cap", "diode", "led"]

test.each(families)("bare sizes can default to %s", (defaultFamily) => {
  const options: FootprinterStringOptions = { defaultFamily }
  expect(resolvePassiveFootprintDefinition("0805", options)).toBe(
    `${defaultFamily}0805`,
  )
  const circuitJson = fp.string("0805", options).circuitJson()
  // The existing bare-resistor outline differs from explicit res0805.
  const expected = defaultFamily === "res" ? "0805" : `${defaultFamily}0805`
  expect(circuitJson).toEqual(fp.string(expected).circuitJson())
  expect(string("0805", options).circuitJson()).toEqual(circuitJson)
  expect(convertCircuitJsonToPcbSvg(circuitJson)).toMatchSvgSnapshot(
    import.meta.path,
    `default-family-${defaultFamily}`,
  )
})

test.each([
  ["01005", "cap01005"],
  ["1608_metric", "cap1608_metric"],
  ["0805_pw0.8mm_ph1.2mm", "cap0805_pw0.8mm_ph1.2mm"],
  ["0805_pw800um_ph1200µm", "cap0805_pw800um_ph1200µm"],
  ["0805_polarized_positivepin2", "cap0805_polarized_positivepin2"],
  [
    "0805_polarized_tht_pin1location(topside,left)",
    "cap0805_polarized_tht_pin1location(topside,left)",
  ],
])("capacitor defaults preserve the options in %s", (definition, resolved) => {
  const options: FootprinterStringOptions = { defaultFamily: "cap" }
  expect(resolvePassiveFootprintDefinition(definition, options)).toBe(resolved)
  const circuitJson = fp.string(definition, options).circuitJson()
  expect(circuitJson).toEqual(fp.string(resolved).circuitJson())
  expect(convertCircuitJsonToPcbSvg(circuitJson)).toMatchSvgSnapshot(
    import.meta.path,
    `default-family-${definition.replace(/[^a-zA-Z0-9]/g, "-")}`,
  )
})

test("diode defaults preserve terminal mapping and fabrication options", () => {
  const definition = "0805_cathodepin1_nosilkscreen_origin(pin1)"
  const options: FootprinterStringOptions = { defaultFamily: "diode" }
  const resolved = `diode${definition}`
  expect(resolvePassiveFootprintDefinition(definition, options)).toBe(resolved)
  const circuitJson = fp.string(definition, options).circuitJson()
  expect(circuitJson).toEqual(fp.string(resolved).circuitJson())
  expect(
    circuitJson.filter(
      (element) => element.type === "pcb_fabrication_note_path",
    ),
  ).not.toHaveLength(0)
  expect(convertCircuitJsonToPcbSvg(circuitJson)).toMatchSvgSnapshot(
    import.meta.path,
    "default-family-diode-cathodepin1",
  )
})

test.each([
  "res0805",
  "cap0805_polarized",
  "diode0805_cathodepin1",
  "led0805",
  "sod123_nonpolarized",
  "smdpads2_pw0.8mm_ph1.2mm_p2mm",
  "dip8_w0.3in",
  "do-219ad",
  "pinheader2",
])(
  "explicit footprint %s takes precedence over every default",
  (definition) => {
    const original = fp.string(definition)
    for (const defaultFamily of families) {
      expect(
        resolvePassiveFootprintDefinition(definition, { defaultFamily }),
      ).toBe(definition)
      const actual = fp.string(definition, { defaultFamily })
      expect(actual.params()).toEqual(original.params())
      expect(actual.circuitJson()).toEqual(original.circuitJson())
    }
  },
)

test("the legacy resistor default and authored string are preserved", () => {
  for (const definition of ["0805", "01005", "1608_metric", "0603_pw0.8mm"]) {
    expect(resolvePassiveFootprintDefinition(definition)).toBe(
      `res${definition}`,
    )
    const original = fp.string(definition)
    expect(original.params()).toMatchObject({ fn: "res", string: definition })
    for (const options of [{}, undefined, { defaultFamily: "res" }] satisfies (
      | FootprinterStringOptions
      | undefined
    )[]) {
      const actual = fp.string(definition, options)
      expect(actual.params()).toEqual(original.params())
      expect(actual.circuitJson()).toEqual(original.circuitJson())
    }
    expect(
      fp.string(` ${definition} `, { defaultFamily: "cap" }).params(),
    ).toMatchObject({
      fn: "cap",
      string: definition,
    })
  }
  expect(
    resolvePassiveFootprintDefinition(" 0805_pw0.8mm ", {
      defaultFamily: "cap",
    }),
  ).toBe("cap0805_pw0.8mm")
})

test.each([
  ["0805x1.2_pw0.8mm", "cap0805x1.2_pw0.8mm"],
  ["12345", "cap12345"],
  ["080", "080"],
  ["123456", "123456"],
  ["0805extra", "0805extra"],
  ["not-a-footprint", "not-a-footprint"],
  ["", ""],
])(
  "the resolver only qualifies an existing bare-size token: %s",
  (definition, resolved) => {
    expect(
      resolvePassiveFootprintDefinition(definition, { defaultFamily: "cap" }),
    ).toBe(resolved)
  },
)
