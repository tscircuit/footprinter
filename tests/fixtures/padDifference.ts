import { footprintSizes } from "src/helpers/passive-fn"
import { transformPcbElements } from "@tscircuit/circuit-json-util"
import { translate } from "transformation-matrix"
import { fp } from "src/footprinter"

type PcbSmtPad = {
  type: "pcb_smtpad"
  x: number
  y: number
  width: number
  height: number
  port_hints: string[]
}

type PcbComponent = {
  type: "pcb_component"
  width: number
  height: number
  center: { x: number; y: number }
}

const diff = (a: number, b: number) => Math.abs(a - b)

export async function padDifference(
  imperialOrMetric: string,
  footprintName: string,
): Promise<{
  totalDiff: number
  combinedFootprintElements: any[]
}> {
  const size = footprintSizes.find(
    (s) => s.metric === imperialOrMetric || s.imperial === imperialOrMetric,
  )
  if (!size) throw new Error(`Footprint size not found for ${imperialOrMetric}`)

  const normalizedFootprintName = footprintName.startsWith("kicad:")
    ? footprintName.slice(6)
    : footprintName

  const url = `https://kicad-mod-cache.tscircuit.com/Resistor_SMD.pretty/${normalizedFootprintName}.circuit.json`
  const res = await fetch(url)
  if (!res.ok)
    throw new Error(`Failed to fetch ${normalizedFootprintName}: ${res.status}`)

  const data = (await res.json()) as any[]

  const kicadPads = data.filter(
    (e) =>
      e.type === "pcb_smtpad" &&
      Array.isArray(e.port_hints) &&
      (e.port_hints.includes("1") || e.port_hints.includes("2")),
  ) as PcbSmtPad[]

  const pcbComp = data.find((e) => e.type === "pcb_component") as
    | PcbComponent
    | undefined
  if (!pcbComp)
    throw new Error(`No pcb_component found for ${normalizedFootprintName}`)
  if (kicadPads.length !== 2)
    throw new Error(
      `Expected 2 signal pads for ${normalizedFootprintName}, found ${kicadPads.length}`,
    )

  const [leftPad, rightPad] = kicadPads.sort((a, b) => a.x - b.x)
  const kicadPadSpacing = Math.abs(rightPad!.x - leftPad!.x)

  const padSpacingDiff = diff(kicadPadSpacing, size.p_mm_min)
  const padWidthDiff =
    diff(leftPad!.width, size.pw_mm_min) + diff(rightPad!.width, size.pw_mm_min)
  const padHeightDiff =
    diff(leftPad!.height, size.ph_mm_min) +
    diff(rightPad!.height, size.ph_mm_min)
  const bodyWidthDiff = diff(pcbComp.width, size.w_mm_min)
  const bodyHeightDiff = diff(pcbComp.height, size.h_mm_min)

  const totalDiff =
    padSpacingDiff +
    padWidthDiff +
    padHeightDiff +
    bodyWidthDiff +
    bodyHeightDiff

  const refRightPad: PcbSmtPad = {
    type: "pcb_smtpad",
    x: size.p_mm_min,
    y: 0,
    width: size.pw_mm_min,
    height: size.ph_mm_min,
    port_hints: ["2"],
  }

  const circuitJson = fp.string(imperialOrMetric).circuitJson()

  const referenceElements: any = circuitJson

  // --- Center Reference Footprint Vertically ---
  const refMinY = -Math.max(size.ph_mm_min / 2, size.h_mm_min / 2)
  const refMaxY = Math.max(size.ph_mm_min / 2, size.h_mm_min / 2)
  const refCenterY = (refMaxY + refMinY) / 2

  let transformedReference = transformPcbElements(
    referenceElements,
    translate(0, -refCenterY),
  )
  // Filter out the {REF} silkscreen from the reference
  const cleanedReference = transformedReference.filter(
    (e) => !(e.type === "pcb_silkscreen_text" && e.text === "{REF}"),
  )

  // Find original silkscreen text to reuse position/font settings
  const referenceSilkscreenText = transformedReference.find(
    (e) => e.type === "pcb_silkscreen_text" && e.text === "{REF}",
  )

  if (referenceSilkscreenText) {
    const silkscreenForKiCad = {
      ...referenceSilkscreenText,
      text: "Local_FP",
    }

    // Add the renamed silkscreen to the cleaned reference
    cleanedReference.push(silkscreenForKiCad)
  }

  // Then use cleanedReference instead of transformedReference
  transformedReference = cleanedReference

  // --- Filter and Align KiCad Footprint Vertically ---
  const kicadElements: any = [pcbComp, ...kicadPads]

  const padYs = kicadPads.flatMap((p) => [
    p.y - p.height / 2,
    p.y + p.height / 2,
  ])
  const compMinY = pcbComp.center.y - pcbComp.height / 2
  const compMaxY = pcbComp.center.y + pcbComp.height / 2
  const kicadMinY = Math.min(...padYs, compMinY)
  const kicadMaxY = Math.max(...padYs, compMaxY)
  const kicadCenterY = (kicadMinY + kicadMaxY) / 2

  // Place KiCad footprint to the right of reference
  // Calculate rightmost edge of reference right pad
  const refRightEdge = refRightPad.x + refRightPad.width / 2

  // Calculate leftmost edge of KiCad left pad
  const kicadLeftEdge = leftPad!.x - leftPad!.width / 2

  // Calculate the minimum required gap (e.g., 0.5mm) + safety
  const minDesiredGap = 0.5
  const actualGap = kicadLeftEdge - refRightEdge

  // If too close or overlapping, increase gap
  const dynamicGapX =
    actualGap < minDesiredGap
      ? minDesiredGap - actualGap + 0.2 // add 0.2mm buffer
      : 1

  const kicadShiftX = size.p_mm_min + dynamicGapX

  const kicadShiftY = -kicadCenterY

  const transformedKiCad = transformPcbElements(
    [
      ...kicadElements,
      {
        type: "pcb_silkscreen_text",
        pcb_silkscreen_text_id: "silkscreen_text_kicad",
        font: "tscircuit2024",
        font_size: 0.2,
        pcb_component_id: "pcb_generic_component_0", // make sure this matches the KiCad component ID
        text: "KiCad_FP",
        layer: "top",
        anchor_position: {
          x: 0,
          y: 1.05,
        },
        anchor_alignment: "center",
      },
    ],
    translate(kicadShiftX, kicadShiftY),
  )

  console.log(
    "transformedReference",
    JSON.stringify(transformedReference, null, 2),
  )

  // Combine both
  const combinedFootprintElements = [
    ...transformedReference,
    ...transformedKiCad,
  ]

  return {
    totalDiff,
    combinedFootprintElements,
  }
}
