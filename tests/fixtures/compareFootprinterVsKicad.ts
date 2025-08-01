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

export async function compareFootprinterVsKicad(
  imperialOrMetric: string,
  footprintName: string,
): Promise<{
  avgRelDiff: number
  combinedFootprintElements: any[]
}> {
  let size = imperialOrMetric.endsWith("_imp")
    ? footprintSizes.find((s) => s.imperial === imperialOrMetric)
    : footprintSizes.find((s) => s.metric === imperialOrMetric) ||
      footprintSizes.find((s) => s.imperial === imperialOrMetric)

  if (!size) {
    throw new Error(`Footprint size not found for ${imperialOrMetric}`)
  }

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

  const kicadArea = kicadPads.reduce(
    (sum, pad) => sum + (pad.width ?? 0) * (pad.height ?? 0),
    0,
  )

  const circuitJson = fp.string(imperialOrMetric).circuitJson()
  const referencePads = (circuitJson as any[]).filter(
    (e) => e.type === "pcb_smtpad",
  ) as PcbSmtPad[]

  const refArea = referencePads.reduce(
    (sum, pad) => sum + (pad.width ?? 0) * (pad.height ?? 0),
    0,
  )

  const avgRelDiff = Math.abs(refArea - kicadArea) / (refArea + kicadArea) || 0
  const diffPercent = avgRelDiff * 100

  // Visual placement
  const transformedReference = transformPcbElements(
    circuitJson,
    translate(0, 0),
  )
  const kicadElements = data.filter(
    (e) => e.type === "pcb_smtpad" || e.type === "pcb_component",
  )

  const refMaxX = Math.max(
    ...transformedReference.map((e) =>
      "x" in e && "width" in e ? e.x + e.width / 2 : 0,
    ),
  )
  const refMinX = Math.min(
    ...transformedReference.map((e) =>
      "x" in e && "width" in e ? e.x - e.width / 2 : 0,
    ),
  )
  const refWidth = refMaxX - refMinX

  const areaGapFactor = 1
  const dynamicExtraGap = Math.sqrt((refArea + kicadArea) * areaGapFactor)
  const dynamicGap = refWidth + dynamicExtraGap

  const transformedKiCad = transformPcbElements(
    kicadElements,
    translate(dynamicGap, 0),
  )

  // Combine and annotate
  const allElements = [...transformedReference, ...transformedKiCad]
  const refXs = transformedReference.flatMap((e) =>
    "x" in e && "width" in e
      ? [e.x - e.width / 2, e.x + e.width / 2]
      : "center" in e && "width" in e
        ? [e.center.x - e.width / 2, e.center.x + e.width / 2]
        : [],
  )

  const kicadXs = transformedKiCad.flatMap((e) =>
    "x" in e && "width" in e
      ? [e.x - e.width / 2, e.x + e.width / 2]
      : "center" in e && "width" in e
        ? [e.center.x - e.width / 2, e.center.x + e.width / 2]
        : [],
  )

  const minX = Math.min(...refXs, ...kicadXs)
  const maxX = Math.max(...refXs, ...kicadXs)
  const midX = (minX + maxX) / 2

  const maxY = Math.max(
    ...allElements.map((e) =>
      "y" in e && "height" in e ? e.y + e.height / 2 : 0,
    ),
  )

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
      y: -maxY - 1,
    },
    anchor_alignment: "center",
    ccw_rotation: 0,
    is_mirrored: false,
  }

  const combinedFootprintElements = [
    ...transformedReference,
    ...transformedKiCad,
    diffPercentText,
  ]

  return {
    avgRelDiff,
    combinedFootprintElements,
  }
}
