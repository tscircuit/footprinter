import { expect, test } from "bun:test"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { fp } from "../src/footprinter"
import {
  calculateCopperIou,
  circuitJsonToCopperShapes,
  jlcpcbUsbCMidMountVariants,
} from "./fixtures/usbcmidmount-jlcpcb"

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

for (const variant of jlcpcbUsbCMidMountVariants) {
  test(`${variant.part} ${variant.manufacturerPartNumber} copper IoU`, () => {
    const circuitJson = fp.string(variant.definition).circuitJson()
    const copperIou = calculateCopperIou(
      circuitJsonToCopperShapes(circuitJson),
      variant.targetCopper,
    )

    console.log(`${variant.part} copper IoU: ${(copperIou * 100).toFixed(2)}%`)
    expect(copperIou).toBeGreaterThan(0.98)
    expect(convertCircuitJsonToPcbSvg(circuitJson)).toMatchSvgSnapshot(
      import.meta.path,
      `usbcmidmount16_${variant.part}`,
    )
  })
}

test("mechanical dimensions describe a USB-C body independently of its land pattern", () => {
  const base = jlcpcbUsbCMidMountVariants[0]!
  const body = fp.string(
    base.definition +
      "_shelldepth7.3mm_shellwall300um_cavitydepth4mm_tonguesetback0.3mm_tonguethickness0.62mm",
  )
  expect(body.json()).toMatchObject({
    shelldepth: 7.3,
    shellwall: 0.3,
    cavitydepth: 4,
    tonguesetback: 0.3,
    tonguethickness: 0.62,
  })
  expect(body.circuitJson()).toEqual(fp.string(base.definition).circuitJson())
  expect(convertCircuitJsonToPcbSvg(body.circuitJson())).toMatchSvgSnapshot(
    import.meta.path,
    `usbcmidmount16_${base.part}`,
  )
  expect(
    fp().usbcmidmount(16).tonguesetback(0).shellwall("0.2mm").json(),
  ).toMatchObject({ tonguesetback: 0, shellwall: 0.2 })
  expect(fp.string("usbcmidmount16").json()).not.toHaveProperty("shelldepth")
})

test.each([
  "shellwall0mm",
  "shelldepth-1mm",
  "tonguesetback-1mm",
  "tonguethickness0mm",
  "cavitydepth0mm",
  "shelldepth4mm_cavitydepth4mm",
  "cavitydepth2mm_tonguesetback3mm",
])("rejects invalid USB-C geometry: %s", (fields) => {
  expect(() => fp.string(`usbcmidmount16_${fields}`).json()).toThrow()
})
