import { expect, test } from "bun:test"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { fp } from "../src/footprinter"

const getPads = (definition: string) =>
  fp
    .string(definition)
    .circuitJson()
    .filter((element) => element.type === "pcb_smtpad")

test("UTDFN-4-EP(1x1) has four signal pads and one exposed pad", () => {
  const pads = getPads("UTDFN-4-EP(1x1)")
  expect(pads).toHaveLength(5)
  expect(pads.map((pad) => pad.port_hints[0])).toEqual([
    "1",
    "2",
    "3",
    "4",
    "5",
  ])

  const exposedPad = pads[4]
  expect(exposedPad).toMatchObject({
    shape: "rect",
    x: 0,
    y: 0,
    width: 0.53,
    height: 0.53,
  })
})

test("UTDFN-4-EP(1x1) signal pads use the reference pitch and placement", () => {
  const pads = getPads("utdfn4ep")
  for (const pad of pads.slice(0, 4)) expect(pad.shape).toBe("polygon")

  const centers = pads.slice(0, 4).map((pad) => {
    if (pad.shape !== "polygon") throw new Error("expected polygon signal pad")
    return {
      x:
        pad.points.reduce((sum, point) => sum + point.x, 0) / pad.points.length,
      y:
        pad.points.reduce((sum, point) => sum + point.y, 0) / pad.points.length,
    }
  })

  expect(centers[0]!.x).toBeLessThan(0)
  expect(centers[0]!.y).toBeGreaterThan(0)
  expect(centers[1]!.x).toBeLessThan(0)
  expect(centers[1]!.y).toBeLessThan(0)
  expect(centers[2]!.x).toBeGreaterThan(0)
  expect(centers[2]!.y).toBeLessThan(0)
  expect(centers[3]!.x).toBeGreaterThan(0)
  expect(centers[3]!.y).toBeGreaterThan(0)

  const aliases = ["utdfn4ep", "utdfn_4_ep", "UTDFN-4-EP", "UTDFN-4-EP(1x1)"]
  const baseline = getPads(aliases[0]!)
  for (const alias of aliases.slice(1)) expect(getPads(alias)).toEqual(baseline)
})

test("UTDFN-4-EP(1x1) signal pads stay clear of the exposed pad", () => {
  const pads = getPads("UTDFN-4-EP(1x1)")
  const epHalf = 0.53 / 2
  for (const pad of pads.slice(0, 4)) {
    if (pad.shape !== "polygon") throw new Error("expected polygon signal pad")
    const pointInsideEp = pad.points.some(
      ({ x, y }) => Math.abs(x) < epHalf && Math.abs(y) < epHalf,
    )
    expect(pointInsideEp).toBe(false)
  }
})

test("UTDFN-4-EP(1x1) snapshot", () => {
  const circuitJson = fp.string("UTDFN-4-EP(1x1)").circuitJson()
  const svg = convertCircuitJsonToPcbSvg(circuitJson)
  expect(svg).toMatchSvgSnapshot(import.meta.path, "utdfn4ep")
})
