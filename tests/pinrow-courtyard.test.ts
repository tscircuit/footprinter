import { expect, test } from "bun:test"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { fp } from "../src/footprinter"

// Keep the complete courtyard visible and compare all cases at the same scale.
const svgOptions = {
  showCourtyards: true,
  viewport: { minX: -12, minY: -8, maxX: 12, maxY: 8 },
}

const cases = [
  {
    name: "pinrow6_default_courtyard",
    base: "pinrow6",
    modifiers: "",
    width: 16.24,
    height: 3.54,
  },
  {
    name: "pinrow6_custom_courtyard",
    base: "pinrow6",
    modifiers: "_cyw18mm_cyh5mm",
    width: 18,
    height: 5,
  },
  {
    name: "pinrow6_courtyard_width_only",
    base: "pinrow6",
    modifiers: "_cyw18",
    width: 18,
    height: 3.54,
  },
  {
    name: "pinrow6_courtyard_height_only",
    base: "pinrow6",
    modifiers: "_cyh6",
    width: 16.24,
    height: 6,
  },
  {
    name: "pinrow3_smaller_courtyard",
    base: "pinrow3",
    modifiers: "_cyw7.5_cyh2.5",
    width: 7.5,
    height: 2.5,
  },
  {
    name: "pinrow3_courtyard_units",
    base: "pinrow3",
    modifiers: "_cyw0.5in_cyh10000um",
    width: 12.7,
    height: 10,
  },
  {
    name: "pinrow6_smd_rows2_custom_courtyard",
    base: "pinrow6_rows2_smd",
    modifiers: "_cyw12mm_cyh8mm",
    width: 12,
    height: 8,
  },
  {
    name: "headermodule6_custom_courtyard",
    base: "headermodule6_rows2_female_silkscreenborder",
    modifiers: "_cyw12mm_cyh8mm",
    width: 12,
    height: 8,
  },
] as const

for (const { name, base, modifiers, width, height } of cases) {
  test(name, async () => {
    const footprint = fp.string(`${base}${modifiers}`)
    const circuitJson = footprint.circuitJson()
    const courtyards = circuitJson.filter(
      (element) => element.type === "pcb_courtyard_rect",
    )
    expect(courtyards).toHaveLength(1)
    const courtyard = courtyards[0]!
    expect(courtyard.center).toEqual({ x: 0, y: 0 })
    expect(courtyard.layer).toBe("top")
    expect(courtyard.width).toBeCloseTo(width)
    expect(courtyard.height).toBeCloseTo(height)
    if (modifiers) {
      expect(footprint.json()).toMatchObject({
        ...(modifiers.includes("cyw") ? { cyw: width } : {}),
        ...(modifiers.includes("cyh") ? { cyh: height } : {}),
      })
    }
    expect(
      circuitJson.filter((element) => element.type !== "pcb_courtyard_rect"),
    ).toEqual(
      fp
        .string(base)
        .circuitJson()
        .filter((element) => element.type !== "pcb_courtyard_rect"),
    )
    await expect(
      convertCircuitJsonToPcbSvg(circuitJson, svgOptions),
    ).toMatchSvgSnapshot(import.meta.path, name)
  })
}

test("pinrow courtyard dimensions support the typed builder", async () => {
  const circuitJson = fp().pinrow(6).cyw(18).cyh("5mm").circuitJson()
  expect(circuitJson).toEqual(fp.string("pinrow6_cyw18mm_cyh5mm").circuitJson())
  await expect(
    convertCircuitJsonToPcbSvg(circuitJson, svgOptions),
  ).toMatchSvgSnapshot(import.meta.path, "pinrow6_custom_courtyard")
})

test("headermodule courtyard dimensions support the typed builder", async () => {
  const circuitJson = fp()
    .headermodule(6)
    .rows(2)
    .female()
    .silkscreenborder()
    .cyw("12mm")
    .cyh(8)
    .circuitJson()
  expect(circuitJson).toEqual(
    fp
      .string("headermodule6_rows2_female_silkscreenborder_cyw12mm_cyh8mm")
      .circuitJson(),
  )
  await expect(
    convertCircuitJsonToPcbSvg(circuitJson, svgOptions),
  ).toMatchSvgSnapshot(import.meta.path, "headermodule6_custom_courtyard")
})

test("pinrow rejects non-positive or invalid courtyard dimensions", () => {
  for (const dimension of ["cyw", "cyh"] as const) {
    for (const value of [0, -1, Number.NaN, Infinity, "invalid", "-2mm"]) {
      expect(() => fp().pinrow(6)[dimension](value).circuitJson()).toThrow()
    }
  }
})
