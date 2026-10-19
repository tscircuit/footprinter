import { expect, test } from "bun:test"
import { type PcbSmtPad, any_circuit_element } from "circuit-json"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { pad, pad_def } from "../src/fn/pad"
import { qfn, qfn_def } from "../src/fn/qfn"
import { quad, quad_def } from "../src/fn/quad"
import { smtpad, smtpad_def } from "../src/fn/smtpad"
import { fp } from "../src/footprinter"
import { any_footprinter_def } from "../src/helpers/zod/AnyFootprinterDefinitionOutput"

const getSmtPads = (definition: string): PcbSmtPad[] => {
  const elements = fp.string(definition).circuitJson()
  for (const element of elements) {
    expect(any_circuit_element.parse(element)).toEqual(element)
  }
  return elements.filter(
    (element): element is PcbSmtPad => element.type === "pcb_smtpad",
  )
}

test("pad supports negative solder mask margin and separate mask opening dimensions", () => {
  const fromMargin = getSmtPads("pad_w2mm_h1mm_soldermaskmargin-0.1mm")
  expect(fromMargin).toHaveLength(1)
  expect(fromMargin[0]).toMatchObject({
    type: "pcb_smtpad",
    shape: "rect",
    width: 2,
    height: 1,
    soldermask_margin: -0.1,
  })

  const fromUniformOpening = getSmtPads("pad_w2mm_h1mm_maskw1.8mm_maskh0.8mm")
  expect(fromUniformOpening[0]).toEqual(fromMargin[0])

  const fromBuilder = fp()
    .pad()
    .w("2mm")
    .h("1mm")
    .mask("1.8x0.8mm")
    .circuitJson()
  expect(fromBuilder).toEqual(
    fp.string("pad_w2mm_h1mm_soldermaskmargin-0.1mm").circuitJson(),
  )

  const fromAsymmetricOpening = getSmtPads(
    "pad_w2mm_h1mm_maskw1.6mm_maskh0.8mm",
  )
  expect(fromAsymmetricOpening[0]).toMatchObject({
    type: "pcb_smtpad",
    shape: "rect",
    width: 2,
    height: 1,
    soldermask_margin_left: -0.2,
    soldermask_margin_right: -0.2,
    soldermask_margin_top: -0.1,
    soldermask_margin_bottom: -0.1,
  })
  expect(fromAsymmetricOpening[0]?.soldermask_margin).toBeUndefined()

  const parsedPad = pad_def.parse(
    fp.string("pad_w2mm_h1mm_mask1.6x0.8mm").params(),
  )
  expect(pad(parsedPad).circuitJson).toEqual(
    fp.string("pad_w2mm_h1mm_maskw1.6mm_maskh0.8mm").circuitJson(),
  )
})

test("smtpad supports solder-mask-defined rect, square, circle, and pill lands", () => {
  const circleByDiameter = getSmtPads("smtpad_circle_d1.2mm_maskd0.9mm")
  expect(circleByDiameter[0]).toMatchObject({
    type: "pcb_smtpad",
    shape: "circle",
    radius: 0.6,
    soldermask_margin: -0.15,
  })

  const circleByRadius = fp()
    .smtpad()
    .circle()
    .r("0.6mm")
    .maskr("0.45mm")
    .circuitJson()
  expect(circleByRadius).toEqual(
    fp.string("smtpad_circle_d1.2mm_soldermaskmargin-0.15mm").circuitJson(),
  )

  const squarePad = getSmtPads("smtpad_square_s1.5mm_masks1.2mm")
  expect(squarePad[0]).toMatchObject({
    type: "pcb_smtpad",
    shape: "rect",
    width: 1.5,
    height: 1.5,
    soldermask_margin: -0.15,
  })

  const rectAsymmetric = getSmtPads("smtpad_rect_w2mm_h1.2mm_mask1.6x1mm")
  expect(rectAsymmetric[0]).toMatchObject({
    type: "pcb_smtpad",
    shape: "rect",
    width: 2,
    height: 1.2,
    soldermask_margin_left: -0.2,
    soldermask_margin_right: -0.2,
    soldermask_margin_top: -0.1,
    soldermask_margin_bottom: -0.1,
  })

  const pillPad = getSmtPads("smtpad_pill_w3mm_h1mm_maskw2.8mm_maskh0.8mm")
  expect(pillPad[0]).toMatchObject({
    type: "pcb_smtpad",
    shape: "pill",
    width: 3,
    height: 1,
    radius: 0.5,
    soldermask_margin: -0.1,
  })

  const parsedSmtPad = smtpad_def.parse(
    fp.string("smtpad_circle_d1.2mm_maskd0.9mm").params(),
  )
  expect(smtpad(parsedSmtPad).circuitJson).toEqual(
    fp.string("smtpad_circle_d1.2mm_maskd0.9mm").circuitJson(),
  )
})

test("quad and qfn support 8x8mm thermal pad with 6.5x6.5mm solder-mask opening and SMD perimeter pads", () => {
  const qfnDef =
    "qfn32_w10mm_h10mm_p0.8mm_pw0.35mm_pl0.8mm_pwmask0.25mm_plmask0.7mm_thermalpad8x8mm_thermalpadmask6.5x6.5mm"
  const pads = getSmtPads(qfnDef)
  const thermalPad = pads.find((pad) => pad.port_hints?.includes("thermalpad"))!
  const perimeterPads = pads.filter(
    (pad) => !pad.port_hints?.includes("thermalpad"),
  )

  expect(thermalPad).toMatchObject({
    type: "pcb_smtpad",
    shape: "rect",
    width: 8,
    height: 8,
    soldermask_margin: -0.75,
  })
  expect(perimeterPads).toHaveLength(32)
  for (const perimeterPad of perimeterPads) {
    expect(perimeterPad.soldermask_margin).toBe(-0.05)
  }

  const builderCircuit = fp()
    .qfn(32)
    .w("10mm")
    .h("10mm")
    .p("0.8mm")
    .pw("0.35mm")
    .pl("0.8mm")
    .padmask("0.25x0.7mm")
    .thermalpad("8x8mm")
    .thermalpadmask("6.5x6.5mm")
    .circuitJson()
  expect(builderCircuit).toEqual(fp.string(qfnDef).circuitJson())

  const parsedQfn = qfn_def.parse(fp.string(qfnDef).params())
  expect(qfn(parsedQfn).circuitJson).toEqual(fp.string(qfnDef).circuitJson())

  const htqfpCircuit = fp
    .string(
      "tqfp64_w10mm_h10mm_p0.5mm_thermalpad8x8mm_thermalpadsoldermaskmargin-0.75mm",
    )
    .circuitJson()
  const htqfpThermalPad = htqfpCircuit.find(
    (el): el is PcbSmtPad =>
      el.type === "pcb_smtpad" &&
      Boolean(el.port_hints?.includes("thermalpad")),
  )!
  expect(htqfpThermalPad).toMatchObject({
    width: 8,
    height: 8,
    soldermask_margin: -0.75,
  })
})

test("quad and qfn orient asymmetric perimeter pad mask openings along pin width and length", () => {
  const quadDef =
    "quad16_w4mm_h4mm_p0.5mm_pw0.3mm_pl0.8mm_pwmask0.2mm_plmask0.6mm_thermalpad2x2mm_thermalpadmask1.6x1.2mm"
  const pads = getSmtPads(quadDef)
  const pin1Left = pads.find((pad) => pad.port_hints?.includes("1"))!
  const pin5Bottom = pads.find((pad) => pad.port_hints?.includes("5"))!
  const thermalPad = pads.find((pad) => pad.port_hints?.includes("thermalpad"))!

  // Left side pin is horizontal in board X (width = pl = 0.8, height = pw = 0.3)
  expect(pin1Left).toMatchObject({
    shape: "rect",
    width: 0.8,
    height: 0.3,
    soldermask_margin_left: -0.1,
    soldermask_margin_right: -0.1,
    soldermask_margin_top: -0.05,
    soldermask_margin_bottom: -0.05,
  })

  // Bottom side pin is vertical in board Y (width = pw = 0.3, height = pl = 0.8)
  expect(pin5Bottom).toMatchObject({
    shape: "rect",
    width: 0.3,
    height: 0.8,
    soldermask_margin_left: -0.05,
    soldermask_margin_right: -0.05,
    soldermask_margin_top: -0.1,
    soldermask_margin_bottom: -0.1,
  })

  expect(thermalPad).toMatchObject({
    shape: "rect",
    width: 2,
    height: 2,
    soldermask_margin_left: -0.2,
    soldermask_margin_right: -0.2,
    soldermask_margin_top: -0.4,
    soldermask_margin_bottom: -0.4,
  })

  const parsedQuad = quad_def.parse(fp.string(quadDef).params())
  expect(quad(parsedQuad).circuitJson).toEqual(fp.string(quadDef).circuitJson())
})

test("single-row and two-row QFN circularpads and rectangular pads support solder mask openings", () => {
  const singleRowCircular = getSmtPads(
    "qfn16_w4mm_h4mm_p0.5mm_circularpads_pw0.3mm_pwmask0.22mm_thermalpad2x2mm_tpmask1.6mm",
  )
  const singleRowThermal = singleRowCircular.find((pad) =>
    pad.port_hints?.includes("thermalpad"),
  )!
  const singleRowPins = singleRowCircular.filter(
    (pad) => !pad.port_hints?.includes("thermalpad"),
  )
  expect(singleRowThermal).toMatchObject({
    shape: "rect",
    width: 2,
    height: 2,
    soldermask_margin: -0.2,
  })
  expect(singleRowPins).toHaveLength(16)
  for (const pin of singleRowPins) {
    expect(pin).toMatchObject({
      shape: "circle",
      radius: 0.15,
      soldermask_margin: -0.04,
    })
  }

  const twoRowCircular = getSmtPads(
    "qfn40_grid6x6_rows2_p0.5mm_rowspan4.5mm_rowgap0.5mm_circularpads_pw0.3mm_pwmask0.2mm_w5.5mm_h5.5mm_thermalpad2.4x2.4mm_thermalpadmask1.8x1.8mm",
  )
  const twoRowThermal = twoRowCircular.find((pad) =>
    pad.port_hints?.includes("thermalpad"),
  )!
  const twoRowPins = twoRowCircular.filter(
    (pad) => !pad.port_hints?.includes("thermalpad"),
  )
  expect(twoRowThermal).toMatchObject({
    shape: "rect",
    width: 2.4,
    height: 2.4,
    soldermask_margin: -0.3,
  })
  expect(twoRowPins).toHaveLength(40)
  for (const pin of twoRowPins) {
    expect(pin).toMatchObject({
      shape: "circle",
      radius: 0.15,
      soldermask_margin: -0.05,
    })
  }

  expect(
    convertCircuitJsonToPcbSvg(
      fp
        .string(
          "qfn32_w10mm_h10mm_p0.8mm_pw0.35mm_pl0.8mm_pwmask0.25mm_plmask0.7mm_thermalpad8x8mm_thermalpadmask6.5x6.5mm",
        )
        .circuitJson(),
      { showSolderMask: true },
    ),
  ).toContain("pcb_smtpad")
})

test("solder mask parameters reject non-positive openings and conflicting specifications", () => {
  for (const invalid of [
    "pad_w2mm_h1mm_maskw0mm",
    "pad_w2mm_h1mm_maskw-1mm",
    "pad_w2mm_h1mm_soldermaskmargin-1mm",
    "pad_w2mm_h1mm_soldermaskmargin-0.1mm_maskw1.6mm",
    "smtpad_circle_d1mm_maskd0mm",
    "smtpad_circle_d1mm_soldermaskmargin-0.5mm",
    "smtpad_circle_d1mm_maskw0.8mm",
    "smtpad_rect_w2mm_h1mm_maskd0.8mm",
    "smtpad_pill_w3mm_h1mm_maskw2.6mm_maskh0.8mm",
    "qfn32_w7mm_h7mm_thermalpadmask5x5mm",
    "qfn32_w7mm_h7mm_thermalpad4x4mm_thermalpadmask0x0mm",
    "qfn32_w7mm_h7mm_thermalpad4x4mm_thermalpadsoldermaskmargin-2mm",
    "qfn32_w7mm_h7mm_thermalpad4x4mm_thermalpadmask3x3mm_thermalpadsoldermaskmargin-0.1mm",
    "qfn16_circularpads_pw0.3mm_pwmask0.2mm_plmask0.25mm",
    "qfn16_circularpads_pw0.3mm_lrpwmask0.2mm",
  ]) {
    expect(() => fp.string(invalid).circuitJson()).toThrow()
  }
})
