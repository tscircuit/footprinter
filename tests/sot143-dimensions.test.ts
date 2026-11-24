import { expect, test } from "bun:test"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { fp } from "../src/footprinter"

test("sot143 rejects non-positive pad and pitch dimensions", () => {
  for (const definition of [
    "sot143_p0mm",
    "sot143_p-2mm",
    "sot143_px0mm",
    "sot143_px-1.9mm",
    "sot143_pw0mm",
    "sot143_pw-0.5mm",
    "sot143_ph0mm",
    "sot143_pin1padwidth0mm",
    "sot143_pin1padwidth-1mm",
  ]) {
    expect(() => fp.string(definition).circuitJson()).toThrow()
  }
})

test("sot143 rejects non-positive body dimensions", () => {
  for (const definition of [
    "sot143_w0mm",
    "sot143_w-3mm",
    "sot143_h0mm",
    "sot143_h-2.9mm",
  ]) {
    expect(() => fp.string(definition).circuitJson()).toThrow()
  }
})

test("sot143 keeps accepting positive dimensions and a signed pin 1 offset", () => {
  const circuitJson = fp
    .string(
      "sot143_p2.5mm_px2mm_pw0.9mm_ph0.8mm_pin1padwidth1.3mm_pin1centeroffsetx-0.1mm_w3.2mm_h3mm",
    )
    .circuitJson()
  const pads = circuitJson.filter((element) => element.type === "pcb_smtpad")
  expect(pads).toHaveLength(4)
  expect(pads[0]).toMatchObject({ x: -1.1, y: -1.25, width: 1.3, height: 0.8 })
  expect(pads[3]).toMatchObject({ x: -1, y: 1.25, width: 0.9, height: 0.8 })
  expect(convertCircuitJsonToPcbSvg(circuitJson)).toMatchSvgSnapshot(
    import.meta.path,
    "sot143_validated_dimensions",
  )
})
