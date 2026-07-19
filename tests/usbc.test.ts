import { expect, test } from "bun:test"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { fp } from "../src/footprinter"

test("usbc default matches the C2765186 connector geometry", () => {
  const circuitJson = fp.string("usbc").circuitJson()
  const smtPads = circuitJson.filter((element) => element.type === "pcb_smtpad")
  const rectangularSmtPads = circuitJson.filter(
    (element) => element.type === "pcb_smtpad" && element.shape === "rect",
  )
  const platedHoles = circuitJson.filter(
    (element) => element.type === "pcb_plated_hole",
  )

  expect(smtPads).toHaveLength(12)
  expect(platedHoles).toHaveLength(4)
  expect(
    rectangularSmtPads.map((pad) => ({
      x: pad.x,
      y: pad.y,
      width: pad.width,
      height: pad.height,
    })),
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

  expect(convertCircuitJsonToPcbSvg(circuitJson)).toMatchSvgSnapshot(
    import.meta.path,
    "usbc_c2765186_default",
  )
})

test("usbc can add symmetric circular locating holes", () => {
  const circuitJson = fp.string("usbc_roundholecount2").circuitJson()
  expect(
    circuitJson.filter((element) => element.type === "pcb_plated_hole"),
  ).toHaveLength(6)
})

test("usbc accepts an explicit padcount for any contact count", () => {
  const circuitJson = fp
    .string(
      "usbc_padcount6_outerpads1_topmountingcount0_bottommountingcount0_bottommountingy-2.3mm",
    )
    .circuitJson()
  expect(
    circuitJson.filter((element) => element.type === "pcb_smtpad"),
  ).toHaveLength(6)
})

test("usb_c is accepted as an alias for usbc", () => {
  expect(fp.string("usb_c").circuitJson()).toEqual(
    fp.string("usbc").circuitJson(),
  )
})

test("usbc can explicitly describe irregular pads and mounting holes", () => {
  const circuitJson = fp
    .string(
      "usbc_pads(-1:1:0.4:1:pill,1:1:0.5:1:rect)_roundholes(0:0:0.6:0.9)_mountingholes(2:-1:0.5:1.2:1:1.8)",
    )
    .circuitJson()

  expect(
    circuitJson.filter((element) => element.type === "pcb_smtpad"),
  ).toHaveLength(2)
  expect(
    circuitJson.filter((element) => element.type === "pcb_plated_hole"),
  ).toHaveLength(2)
})
