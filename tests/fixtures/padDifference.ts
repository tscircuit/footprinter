import { footprintSizes } from "src/helpers/passive-fn"
import { transformPcbElements } from "@tscircuit/circuit-json-util"
import { translate } from "transformation-matrix"
import { fp } from "src/footprinter"
import type { PcbSilkscreenText } from "circuit-json"

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

const safe = (v: number | undefined) => (typeof v === "number" ? v : 0)

function relativeDiffToRef(kicadVal: number, refVal: number) {
  if (refVal === 0) return 0
  return Math.abs(kicadVal - refVal) / refVal
}

export async function padDifference(
  imperialOrMetric: string,
  footprintName: string,
): Promise<{
  avgRelDiff: number
  combinedFootprintElements: any[]
}> {
  const normalized = imperialOrMetric.replace(/_(imp|metric)$/, "")

  let size = imperialOrMetric.endsWith("_imp")
    ? footprintSizes.find((s) => s.imperial === normalized)
    : footprintSizes.find((s) => s.metric === normalized) ||
      footprintSizes.find((s) => s.imperial === normalized)

  if (!size) {
    throw new Error(`Footprint size not found for ${imperialOrMetric}`)
  }

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

  console.log(size)
  console.log(kicadPads)
  console.log(pcbComp)

  const [leftPad, rightPad] = kicadPads.sort((a, b) => a.x - b.x)
  const kicadPadSpacing = Math.abs(rightPad!.x - leftPad!.x)

  // Reference sizes
  const refPadSpacing = safe(size.p_mm_min)
  const refPadWidth = safe(size.pw_mm_min)
  const refPadHeight = safe(size.ph_mm_min)
  const refBodyWidth = safe(size.w_mm_min)
  const refBodyHeight = safe(size.h_mm_min)

  // Compute individual relative diffs
  const padSpacingRelDiff = relativeDiffToRef(kicadPadSpacing, refPadSpacing)

  const leftPadWidthRelDiff = relativeDiffToRef(leftPad!.width, refPadWidth)
  const rightPadWidthRelDiff = relativeDiffToRef(rightPad!.width, refPadWidth)

  const leftPadHeightRelDiff = relativeDiffToRef(leftPad!.height, refPadHeight)
  const rightPadHeightRelDiff = relativeDiffToRef(
    rightPad!.height,
    refPadHeight,
  )

  const bodyWidthRelDiff = relativeDiffToRef(pcbComp.width, refBodyWidth)
  const bodyHeightRelDiff = relativeDiffToRef(pcbComp.height, refBodyHeight)

  // Weight each diff by its reference dimension (pads weighted twice for two pads)
  const weights = {
    padSpacing: refPadSpacing,
    padWidth: refPadWidth,
    padHeight: refPadHeight,
    bodyWidth: refBodyWidth,
    bodyHeight: refBodyHeight,
  }

  const totalWeight =
    weights.padSpacing +
    2 * weights.padWidth +
    2 * weights.padHeight +
    weights.bodyWidth +
    weights.bodyHeight

  const weightedDiffSum =
    padSpacingRelDiff * weights.padSpacing +
    leftPadWidthRelDiff * weights.padWidth +
    rightPadWidthRelDiff * weights.padWidth +
    leftPadHeightRelDiff * weights.padHeight +
    rightPadHeightRelDiff * weights.padHeight +
    bodyWidthRelDiff * weights.bodyWidth +
    bodyHeightRelDiff * weights.bodyHeight

  const avgRelDiff = weightedDiffSum / totalWeight
  const diffPercent = avgRelDiff * 100

  // Prepare reference pad for layout
  const refRightPad: PcbSmtPad = {
    type: "pcb_smtpad",
    x: refPadSpacing,
    y: 0,
    width: refPadWidth,
    height: refPadHeight,
    port_hints: ["2"],
  }

  const circuitJson = fp.string(imperialOrMetric).circuitJson()
  console.log("circuitJson", circuitJson)
  const referenceElements: any = circuitJson

  const refMinY = -Math.max(refPadHeight / 2, refBodyHeight / 2)
  const refMaxY = Math.max(refPadHeight / 2, refBodyHeight / 2)
  const refCenterY = (refMaxY + refMinY) / 2

  let transformedReference = transformPcbElements(
    referenceElements,
    translate(0, -refCenterY),
  )

  // Remove default REF text to replace with our own
  const cleanedReference = transformedReference.filter(
    (e) => !(e.type === "pcb_silkscreen_text" && e.text === "{REF}"),
  )

  const referenceSilkscreenText = transformedReference.find(
    (e) => e.type === "pcb_silkscreen_text" && e.text === "{REF}",
  )

  let silkscreenForKiCad: any = null
  if (referenceSilkscreenText) {
    const silkscreenForReference = {
      ...referenceSilkscreenText,
      text: `REF: ${imperialOrMetric}`,
    }
    cleanedReference.push(silkscreenForReference)

    silkscreenForKiCad = {
      ...referenceSilkscreenText,
      text: `KiCad: ${normalizedFootprintName}`,
    }
  }

  transformedReference = cleanedReference

  const kicadElements: any = [pcbComp, ...kicadPads]

  // Calculate Y bounds for KiCad footprint
  const padYs = kicadPads.flatMap((p) => [
    p.y - p.height / 2,
    p.y + p.height / 2,
  ])
  const compMinY = pcbComp.center.y - pcbComp.height / 2
  const compMaxY = pcbComp.center.y + pcbComp.height / 2
  const kicadMinY = Math.min(...padYs, compMinY)
  const kicadMaxY = Math.max(...padYs, compMaxY)
  const kicadCenterY = (kicadMinY + kicadMaxY) / 2

  // Calculate horizontal gap to position footprints side-by-side
  const refRightEdge = refRightPad.x + refRightPad.width / 2
  const kicadLeftEdge = leftPad!.x - leftPad!.width / 2
  const minDesiredGap = 0.5
  const actualGap = kicadLeftEdge - refRightEdge
  const dynamicGapX =
    actualGap < minDesiredGap ? minDesiredGap - actualGap + 0.2 : 1

  const kicadShiftX = refPadSpacing + dynamicGapX
  const kicadShiftY = -kicadCenterY

  const transformedKiCad = transformPcbElements(
    silkscreenForKiCad ? [...kicadElements, silkscreenForKiCad] : kicadElements,
    translate(kicadShiftX, kicadShiftY),
  )

  // Combine both transformed arrays temporarily to calculate bounding box
  const allElements = [...transformedReference, ...transformedKiCad]

  // Compute minX and maxX for all elements to center the diff text
  const allXBounds = allElements.flatMap((el) => {
    if ("x" in el && "width" in el)
      return [el.x - el.width / 2, el.x + el.width / 2]
    if ("center" in el && "width" in el)
      return [el.center.x - el.width / 2, el.center.x + el.width / 2]
    return []
  })
  const minX = Math.min(...allXBounds)
  const maxX = Math.max(...allXBounds)
  const midX = (minX + maxX) / 2

  // Get max Y from all elements to place diff text below footprints
  const allYBounds = allElements.flatMap((el) => {
    if ("y" in el && "height" in el) return [el.y + el.height / 2]
    if ("center" in el && "height" in el) return [el.center.y + el.height / 2]
    return []
  })
  const maxY = Math.max(...allYBounds)
  const belowY = maxY + 1 // margin below

  const diffPercentText: PcbSilkscreenText = {
    type: "pcb_silkscreen_text",
    pcb_silkscreen_text_id: "diffPercentText",
    pcb_component_id: "",
    font: "tscircuit2024",
    font_size: 0.3,
    text: `Diff: ${diffPercent.toFixed(2)}%`,
    layer: "top",
    anchor_position: {
      x: midX,
      y: -belowY,
    },
    anchor_alignment: "center",
    ccw_rotation: 0,
    is_mirrored: false,
  }

  cleanedReference.push(diffPercentText)

  const combinedFootprintElements = [
    ...transformedReference,
    ...transformedKiCad,
  ]

  return {
    avgRelDiff,
    combinedFootprintElements,
  }
}
