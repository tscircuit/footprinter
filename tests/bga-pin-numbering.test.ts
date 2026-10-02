import { expect, test } from "bun:test"
import type { AnyCircuitElement, PcbSmtPad } from "circuit-json"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { fp, type BgaPinNumbering } from "../src/footprinter"
import { silkscreenRef } from "../src/helpers/silkscreenRef"

type CenteredPad = Exclude<PcbSmtPad, { shape: "polygon" }>
const pads = (elements: AnyCircuitElement[]) =>
  elements.filter(
    (element): element is CenteredPad =>
      element.type === "pcb_smtpad" && element.shape !== "polygon",
  )

const hintsByBall = (elements: AnyCircuitElement[]) =>
  Object.fromEntries(
    pads(elements).map((pad) => [pad.port_hints!.at(-1), pad.port_hints]),
  )

// Label test snapshots so changes in pin identity are visible, not just copper.
const snapshot = (elements: AnyCircuitElement[], name: string) => {
  const labels = pads(elements).map((pad, index) => ({
    ...silkscreenRef(pad.x!, pad.y!, 0.13),
    pcb_silkscreen_text_id: `pin_label_${index}`,
    text: pad.port_hints!.join("/"),
  }))
  expect(
    convertCircuitJsonToPcbSvg([...elements, ...labels]),
  ).toMatchSvgSnapshot(import.meta.path, name)
}

test("BGA naming conventions agree between DSL and builder without moving pads", () => {
  const expected = {
    rowmajor: {
      A1: ["1", "A1"],
      A2: ["2", "A2"],
      A3: ["3", "A3"],
      B1: ["4", "B1"],
      B2: ["5", "B2"],
      B3: ["6", "B3"],
    },
    columnmajor: {
      A1: ["1", "A1"],
      A2: ["3", "A2"],
      A3: ["5", "A3"],
      B1: ["2", "B1"],
      B2: ["4", "B2"],
      B3: ["6", "B3"],
    },
    ballcoords: {
      A1: ["A1"],
      A2: ["A2"],
      A3: ["A3"],
      B1: ["B1"],
      B2: ["B2"],
      B3: ["B3"],
    },
  }
  const geometry = (elements: AnyCircuitElement[]) =>
    pads(elements).map(({ port_hints, ...pad }) => pad)
  const legacy = fp.string("bga6_grid3x2_p1").circuitJson()
  for (const convention of Object.keys(expected) as BgaPinNumbering[]) {
    const elements = fp
      .string(`bga6_grid3x2_p1_pinnumbering(${convention})`)
      .circuitJson()
    const builder = fp()
      .bga(6)
      .grid("3x2")
      .p(1)
      .pinnumbering(convention)
      .circuitJson()
    expect(elements).toEqual(builder)
    expect(hintsByBall(elements)).toEqual(expected[convention])
    expect(geometry(elements)).toEqual(geometry(legacy))
    snapshot(elements, `bga_3x2_${convention}`)
  }
})

test("missing balls do not consume numbers under any BGA origin", () => {
  const expected = {
    rowmajor: {
      A2: ["1", "A2"],
      A3: ["2", "A3"],
      B1: ["3", "B1"],
      B3: ["4", "B3"],
    },
    columnmajor: {
      A2: ["2", "A2"],
      A3: ["3", "A3"],
      B1: ["1", "B1"],
      B3: ["4", "B3"],
    },
    ballcoords: { A2: ["A2"], A3: ["A3"], B1: ["B1"], B3: ["B3"] },
  }
  for (const origin of ["tl", "bl", "tr", "br"] as const) {
    for (const convention of Object.keys(expected) as BgaPinNumbering[]) {
      const elements = fp
        .string(
          `bga4_grid3x2_p1_missing(A1,B2)_${origin}origin_pinnumbering(${convention})`,
        )
        .circuitJson()
      expect(hintsByBall(elements)).toEqual(expected[convention])
      const b1 = pads(elements).find((pad) => pad.port_hints!.includes("B1"))!
      expect(b1.x).toBe(origin === "tr" || origin === "br" ? 1 : -1)
      expect(b1.y).toBe(origin === "bl" || origin === "br" ? -0.5 : 0.5)
      const marker = elements.find(
        (element) =>
          element.type === "pcb_silkscreen_path" &&
          element.pcb_silkscreen_path_id === "pin1_marker",
      )
      expect(marker?.type).toBe("pcb_silkscreen_path")
      if (marker?.type === "pcb_silkscreen_path") {
        expect(marker.route[0]).toEqual({
          x: origin === "tr" || origin === "br" ? 1.5 : -1.5,
          y: origin === "bl" || origin === "br" ? 1 : -1,
        })
      }
      snapshot(elements, `bga_sparse_${origin}_${convention}`)
    }
    const legacy = fp
      .string(`bga4_grid3x2_p1_missing(1,5)_${origin}origin`)
      .circuitJson()
    expect(hintsByBall(legacy)).toEqual(expected.rowmajor)
    snapshot(legacy, `bga_sparse_${origin}_legacy`)
  }
})

test("explicit BGA row alphabet skips ambiguous letters and extends through BB", () => {
  const elements = fp
    .string("bga124_grid3x42_p1_missing(J1,AA2,62)_pinnumbering(columnmajor)")
    .circuitJson()
  const byBall = hintsByBall(elements)
  expect(pads(elements)).toHaveLength(124)
  expect(byBall.H1).toEqual(["8", "H1"])
  expect(byBall.J1).toBeUndefined()
  expect(byBall.K1).toEqual(["9", "K1"])
  expect(byBall.Y1).toEqual(["19", "Y1"])
  expect(byBall.AA1).toEqual(["20", "AA1"])
  expect(byBall.AA2).toBeUndefined()
  expect(byBall.AB2).toBeDefined()
  expect(byBall.BA3).toBeDefined()
  expect(byBall.BB3).toEqual(["124", "BB3"])
  expect(
    Object.keys(byBall).every((ball) =>
      /^[ABCDEFGHJKLMNPRTUVWY]+\d+$/.test(ball),
    ),
  ).toBe(true)
  expect(new Set(pads(elements).map((pad) => pad.port_hints![0])).size).toBe(
    124,
  )
  snapshot(elements, "bga_extended_rows_columnmajor")
})

test("legacy BGA row names remain unchanged and extend beyond Z", () => {
  const elements = fp.string("bga53_grid2x27_p1_missing(AA2)").circuitJson()
  const byBall = hintsByBall(elements)
  expect(byBall.I1).toEqual(["17", "I1"])
  expect(byBall.Z1).toEqual(["51", "Z1"])
  expect(byBall.AA1).toEqual(["53", "AA1"])
  expect(byBall.AA2).toBeUndefined()
  snapshot(elements, "bga_extended_rows_legacy")
})

test("624-contact i.MX6 layout uses compact column-major numbers and package ball names", () => {
  // Supplier convention: A1 is absent; rows skip I/O/Q/S/X/Z and end at AE.
  const elements = fp
    .string(
      "bga624_grid25x25_p0.8_pad0.4_missing(A1)_blorigin_pinnumbering(columnmajor)",
    )
    .circuitJson()
  const byBall = hintsByBall(elements)
  expect(pads(elements)).toHaveLength(624)
  expect(byBall.A1).toBeUndefined()
  expect(byBall.B1).toEqual(["1", "B1"])
  expect(byBall.C1).toEqual(["2", "C1"])
  expect(byBall.D1).toEqual(["3", "D1"])
  expect(byBall.J1).toEqual(["8", "J1"])
  expect(byBall.AA1).toEqual(["20", "AA1"])
  expect(byBall.AE1).toEqual(["24", "AE1"])
  expect(byBall.A2).toEqual(["25", "A2"])
  expect(byBall.AE25).toEqual(["624", "AE25"])
  expect(new Set(pads(elements).map((pad) => pad.port_hints![0])).size).toBe(
    624,
  )
  const b1 = pads(elements).find((pad) => pad.port_hints!.includes("B1"))!
  expect(b1.x).toBeCloseTo(-9.6)
  expect(b1.y).toBeCloseTo(8.8)
  snapshot(elements, "bga_imx6_624_columnmajor")
})

test("coordinate-only BGA hints avoid competing numeric aliases", () => {
  const elements = fp
    .string("bga5_grid3x2_p1_missing(A1)_brorigin_pinnumbering(ballcoords)")
    .circuitJson()
  expect(pads(elements).every((pad) => pad.port_hints!.length === 1)).toBe(true)
  expect(
    pads(elements).every(
      (pad) => !pad.port_hints!.some((hint) => /^\d+$/.test(hint)),
    ),
  ).toBe(true)
  expect(hintsByBall(elements)).toEqual({
    A2: ["A2"],
    A3: ["A3"],
    B1: ["B1"],
    B2: ["B2"],
    B3: ["B3"],
  })
  snapshot(elements, "bga_coordinates_only")
})

test("numeric naming conventions compose with pin1location rotation", () => {
  const base = fp
    .string("bga6_grid3x2_p1_pinnumbering(columnmajor)")
    .circuitJson()
  const rotated = fp
    .string(
      "bga6_grid3x2_p1_pinnumbering(columnmajor)_pin1location(leftside,top)",
    )
    .circuitJson()
  expect(hintsByBall(rotated)).toEqual(hintsByBall(base))
  const first = pads(rotated).find((pad) => pad.port_hints![0] === "1")!
  expect(first.x).toBe(-0.5)
  expect(first.y).toBe(1)
  for (const pad of pads(rotated)) {
    const before = pads(base).find(
      (before) => before.port_hints![0] === pad.port_hints![0],
    )!
    expect(pad.x).toBe(before.y!)
    expect(pad.y).toBe(-before.x!)
  }
  snapshot(rotated, "bga_columnmajor_rotated")
})

test("invalid BGA conventions and unavailable ball coordinates fail explicitly", () => {
  expect(() =>
    fp.string("bga4_pinnumbering(arbitrary)").circuitJson(),
  ).toThrow()
  expect(() => fp.string("bga4_pinnumbering").circuitJson()).toThrow()
  expect(() =>
    fp
      .string("bga25_grid5x5_missing(I1)_pinnumbering(ballcoords)")
      .circuitJson(),
  ).toThrow("Missing ball I1")
  expect(() =>
    fp
      .string("bga25_grid5x5_missing(A6)_pinnumbering(columnmajor)")
      .circuitJson(),
  ).toThrow("Missing ball A6")
})
