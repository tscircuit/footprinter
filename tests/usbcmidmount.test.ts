import { expect, test } from "bun:test"
import { fp } from "../src/footprinter"

test("usbcmidmount16 creates the mid-mount shell and signal pattern", () => {
  const circuitJson = fp.string("usbcmidmount16_pinstart13").circuitJson()
  const holes = circuitJson.filter((element) => element.type === "pcb_hole")
  const shellTabs = circuitJson.filter(
    (element) => element.type === "pcb_plated_hole",
  )
  const signalPads = circuitJson.filter(
    (element) => element.type === "pcb_smtpad",
  )

  expect(holes).toHaveLength(2)
  expect(shellTabs).toHaveLength(4)
  expect(signalPads).toHaveLength(12)
  expect(shellTabs.map((pad) => pad.port_hints)).toEqual([
    ["13"],
    ["14"],
    ["15"],
    ["16"],
  ])
  expect(signalPads.map((pad) => pad.port_hints)).toEqual(
    Array.from({ length: 12 }, (_, index) => [String(index + 17)]),
  )
  expect(
    signalPads.map(({ x, y, width, height }) => ({ x, y, width, height })),
  ).toEqual([
    { x: -3.2, y: 2.125, width: 0.55, height: 1.1 },
    { x: -2.4, y: 2.125, width: 0.55, height: 1.1 },
    { x: -1.75, y: 2.125, width: 0.3, height: 1.1 },
    { x: -1.25, y: 2.125, width: 0.3, height: 1.1 },
    { x: -0.75, y: 2.125, width: 0.3, height: 1.1 },
    { x: -0.25, y: 2.125, width: 0.3, height: 1.1 },
    { x: 0.25, y: 2.125, width: 0.3, height: 1.1 },
    { x: 0.75, y: 2.125, width: 0.3, height: 1.1 },
    { x: 1.25, y: 2.125, width: 0.3, height: 1.1 },
    { x: 1.75, y: 2.125, width: 0.3, height: 1.1 },
    { x: 2.4, y: 2.125, width: 0.55, height: 1.1 },
    { x: 3.2, y: 2.125, width: 0.55, height: 1.1 },
  ])
})
