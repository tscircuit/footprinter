import { expect, test } from "bun:test"
import type { PcbPlatedHoleOval, PcbSmtPadRect } from "circuit-json"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { fp } from "../src/footprinter"
import { c2765186PinPositions } from "./fixtures/c2765186-pin-positions"

test("usbcmidmount16_sharedshell matches every C2765186 shell and contact pin", () => {
  const circuitJson = fp
    .string(
      "usbcmidmount16_sharedshell_pinstart13_tophh1.3mm_bottomhh1mm_topy1.5751mm_holey1.0549mm",
    )
    .circuitJson()
  const pads = circuitJson.filter(
    (element): element is PcbSmtPadRect | PcbPlatedHoleOval =>
      (element.type === "pcb_smtpad" && element.shape === "rect") ||
      (element.type === "pcb_plated_hole" && element.shape === "pill"),
  )
  expect(pads).toHaveLength(c2765186PinPositions.length)
  for (const expected of c2765186PinPositions) {
    const actual = pads.find(
      (pad) =>
        pad.port_hints?.includes(String(expected.pin)) &&
        Math.abs(pad.y - expected.y) < 0.001,
    )!
    expect(actual).toBeDefined()
    expect(Math.abs(actual.x - expected.x)).toBeLessThan(0.001)
    expect(Math.abs(actual.y - expected.y)).toBeLessThan(0.001)
  }
  expect(convertCircuitJsonToPcbSvg(circuitJson)).toMatchSvgSnapshot(
    import.meta.path,
    "usbcmidmount16_sharedshell_C2765186",
  )
})

test("usbcmidmount16_sharedshell preserves split and reverse contact numbering", () => {
  const circuitJson = fp()
    .usbcmidmount(16)
    .sharedshell()
    .split()
    .reverse()
    .circuitJson()
  const shellTabs = circuitJson.filter(
    (element): element is PcbPlatedHoleOval =>
      element.type === "pcb_plated_hole" && element.shape === "pill",
  )
  const contactPads = circuitJson.filter(
    (element) => element.type === "pcb_smtpad" && element.shape === "rect",
  )
  expect(shellTabs.map((pad) => pad.port_hints)).toEqual([
    ["1"],
    ["2"],
    ["1"],
    ["2"],
  ])
  expect(contactPads.map(({ x, port_hints }) => ({ x, port_hints }))).toEqual([
    { x: 3.35, port_hints: ["3"] },
    { x: 3.05, port_hints: ["4"] },
    { x: 2.55, port_hints: ["5"] },
    { x: 2.25, port_hints: ["6"] },
    { x: 1.75, port_hints: ["7"] },
    { x: 1.25, port_hints: ["8"] },
    { x: 0.75, port_hints: ["9"] },
    { x: 0.25, port_hints: ["10"] },
    { x: -0.25, port_hints: ["11"] },
    { x: -0.75, port_hints: ["12"] },
    { x: -1.25, port_hints: ["13"] },
    { x: -1.75, port_hints: ["14"] },
    { x: -2.25, port_hints: ["15"] },
    { x: -2.55, port_hints: ["16"] },
    { x: -3.05, port_hints: ["17"] },
    { x: -3.35, port_hints: ["18"] },
  ])
  expect(convertCircuitJsonToPcbSvg(circuitJson)).toMatchSvgSnapshot(
    import.meta.path,
    "usbcmidmount16_sharedshell_split_reverse",
  )
})
