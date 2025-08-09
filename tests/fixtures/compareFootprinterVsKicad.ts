import { transformPcbElements } from "@tscircuit/circuit-json-util"
import { translate } from "transformation-matrix"
import { fp } from "src/footprinter"
import type { PcbPlatedHole, PcbSilkscreenText } from "circuit-json"
import { createBooleanDifferenceVisualization } from "../../src/helpers/boolean-difference"

type PcbSmtPad = {
  type: "pcb_smtpad"
  x: number
  y: number
  width: number
  height: number
  port_hints?: string[]
  shape?: string
}

// --- Helpers to handle both pads & holes safely ---
function getWidth(elm: PcbSmtPad | PcbPlatedHole): number {
  if ("width" in elm) return elm.width
  if (elm.shape === "circle") return elm.outer_diameter

  return 0
}
function getHeight(elm: PcbSmtPad | PcbPlatedHole): number {
  if ("height" in elm) return elm.height
  if (elm.shape === "circle") return elm.outer_diameter

  return 0
}
function getArea(elm: PcbSmtPad | PcbPlatedHole): number {
  if (elm.type === "pcb_plated_hole" && elm.shape === "circle") {
    const outerRadius = elm.outer_diameter / 2
    const innerRadius = elm.hole_diameter / 2
    // Plated area = outer circle - inner circle (annular ring)
    return Math.PI * (outerRadius * outerRadius - innerRadius * innerRadius)
  }
  return getWidth(elm) * getHeight(elm)
}

export async function compareFootprinterVsKicad(
  footprinterString: string,
  kicadPath: string,
): Promise<{
  avgRelDiff: number
  combinedFootprintElements: any[]
  booleanDifferenceSvg: string
  fpSilkscreenElements: any[]
}> {
  const BASE_URL = "https://kicad-mod-cache.tscircuit.com/"
  const kicadUrl = BASE_URL + kicadPath
  const normalizedFootprintName =
    kicadPath.split("/").pop()?.replace(".circuit.json", "") ?? "unknown"

  const res = await fetch(kicadUrl)
  if (!res.ok)
    throw new Error(`Failed to fetch ${normalizedFootprintName}: ${res.status}`)

  const kicadCircuitJson = (await res.json()) as any[]

  const kicadPads = kicadCircuitJson.filter(
    (e) => e.type === "pcb_smtpad",
  ) as PcbSmtPad[]
  const kicadHoles = kicadCircuitJson.filter(
    (e) => e.type === "pcb_plated_hole",
  ) as PcbPlatedHole[]

  // Combine KiCad pads and holes for calculations
  const kicadPadsAndHoles = [...kicadPads, ...kicadHoles]
  const kicadArea = kicadPadsAndHoles.reduce(
    (sum, item) => sum + getArea(item),
    0,
  )

  const fpCircuitJson = fp.string(footprinterString).circuitJson()

  const referencePads = (fpCircuitJson as any[]).filter(
    (e) => e.type === "pcb_smtpad",
  ) as PcbSmtPad[]
  const referenceHoles = (fpCircuitJson as any[]).filter(
    (e) => e.type === "pcb_plated_hole",
  ) as PcbPlatedHole[]

  const referencePadsAndHoles = [...referencePads, ...referenceHoles]
  const refArea = referencePadsAndHoles.reduce(
    (sum, item) => sum + getArea(item),
    0,
  )

  const avgRelDiff = Math.abs(refArea - kicadArea) / (refArea + kicadArea) || 0
  const diffPercent = avgRelDiff * 100

  // Pitch detection
  if (diffPercent > 0 && kicadPadsAndHoles.length >= 2) {
    const horizontal = kicadPadsAndHoles.every(
      (item) => item.y === kicadPadsAndHoles[0]!.y,
    )
    const sorted = [...kicadPadsAndHoles].sort((a, b) =>
      horizontal ? a.x - b.x : a.y - b.y,
    )
    const pitches: number[] = []
    for (let i = 1; i < sorted.length; i++) {
      pitches.push(
        horizontal
          ? sorted[i]!.x - sorted[i - 1]!.x
          : sorted[i]!.y - sorted[i - 1]!.y,
      )
    }
    const avgPitch = pitches.reduce((a, b) => a + b, 0) / pitches.length
    console.log(
      `📏 ${horizontal ? "Horizontal" : "Vertical"} pad/hole pitch: ${avgPitch}`,
    )
    for (const pad of kicadPads) {
      console.log(`🔹 KiCad Pad - width: ${pad.width}, height: ${pad.height}`)
    }
    for (const hole of kicadHoles) {
      console.log(
        `⚪ KiCad Plated Hole - outer: ${hole.shape === "circle" ? hole.outer_diameter : "N/A"}, inner: ${hole.shape === "circle" ? hole.hole_diameter : "N/A"}`,
      )
    }
  }

  const kicadElements = kicadCircuitJson.filter(
    (e) =>
      e.type === "pcb_smtpad" ||
      e.type === "pcb_component" ||
      e.type === "pcb_plated_hole",
  )

  // Figure out how far to shift KiCad elements
  const refMaxX = Math.max(
    ...referencePadsAndHoles.map((e) => e.x + getWidth(e) / 2),
  )
  const refMinX = Math.min(
    ...referencePadsAndHoles.map((e) => e.x - getWidth(e) / 2),
  )
  const refWidth = refMaxX - refMinX

  // Calculate vertical center positions for alignment
  const refMaxY = Math.max(
    ...referencePadsAndHoles.map((e) => e.y + getHeight(e) / 2),
  )
  const refMinY = Math.min(
    ...referencePadsAndHoles.map((e) => e.y - getHeight(e) / 2),
  )
  const refCenterY = (refMaxY + refMinY) / 2

  const kicadPadsAndHolesForAlignment = kicadElements.filter(
    (e) => e.type === "pcb_smtpad" || e.type === "pcb_plated_hole",
  )
  const kicadMaxY = Math.max(
    ...kicadPadsAndHolesForAlignment.map((e) => e.y + getHeight(e) / 2),
  )
  const kicadMinY = Math.min(
    ...kicadPadsAndHolesForAlignment.map((e) => e.y - getHeight(e) / 2),
  )
  const kicadCenterY = (kicadMaxY + kicadMinY) / 2

  const areaGapFactor = 1
  const dynamicExtraGap = Math.sqrt((refArea + kicadArea) * areaGapFactor)
  const dynamicGap = refWidth + dynamicExtraGap
  const verticalAlignment = refCenterY - kicadCenterY

  const transformedKiCad = transformPcbElements(
    kicadElements,
    translate(dynamicGap, verticalAlignment),
  )

  // Bounding box for both sets
  let minX = Infinity
  let maxX = -Infinity
  let minY = Infinity
  let maxY = -Infinity

  for (const elm of [...fpCircuitJson, ...transformedKiCad]) {
    if (
      (elm.type === "pcb_smtpad" && elm.shape === "rect") ||
      (elm.type === "pcb_plated_hole" && elm.shape === "circle")
    ) {
      const radiusX = getWidth(elm) / 2
      const radiusY = getHeight(elm) / 2
      minX = Math.min(minX, elm.x - radiusX)
      maxX = Math.max(maxX, elm.x + radiusX)
      minY = Math.min(minY, elm.y - radiusY)
      maxY = Math.max(maxY, elm.y + radiusY)
    }
  }

  const midX = (minX + maxX) / 2

  const diffPercentText: PcbSilkscreenText = {
    type: "pcb_silkscreen_text",
    pcb_silkscreen_text_id: "diffPercentText",
    pcb_component_id: "",
    font: "tscircuit2024",
    font_size: 0.3,
    text: `Diff: ${diffPercent.toFixed(2)}%`,
    layer: "top",
    anchor_position: { x: midX, y: -maxY - 1 },
    anchor_alignment: "center",
    ccw_rotation: 0,
    is_mirrored: false,
  }

  const combinedFootprintElements = [
    ...fpCircuitJson,
    ...transformedKiCad,
    diffPercentText,
  ]

  // Parse out silkscreen elements separately (not included in boolean diff)
  const fpSilkscreenElements = fpCircuitJson.filter(
    (e) => e.type === "pcb_silkscreen_path" || e.type === "pcb_silkscreen_text",
  )

  // Generate boolean difference visualization for alignment analysis
  // Only include pads and holes (not silkscreen) for precise alignment comparison
  const fpFootprintElements = fpCircuitJson.filter(
    (e) => e.type === "pcb_smtpad" || e.type === "pcb_plated_hole",
  )

  // CRITICAL: Use the original KiCad elements BEFORE transformation
  // The kicadElements above are filtered but not yet transformed
  // This ensures true overlay positioning for alignment analysis
  const originalKicadFootprintElements = kicadElements.filter(
    (e) => e.type === "pcb_smtpad" || e.type === "pcb_plated_hole",
  )

  const booleanDifferenceSvg = createBooleanDifferenceVisualization(
    fpFootprintElements,
    originalKicadFootprintElements,
    {
      title: `${normalizedFootprintName} - Alignment Analysis (Footprinter vs KiCad)`,
      operation: "intersection",
      colorA: "#dc3545", // Footprinter in red
      colorB: "#007bff", // KiCad in blue
      colorDifference: "#ffc107", // Overlap in yellow
      showLegend: true,
      footprintNameA: normalizedFootprintName,
      footprintNameB: normalizedFootprintName,
    },
  )

  return {
    avgRelDiff,
    combinedFootprintElements,
    booleanDifferenceSvg,
    fpSilkscreenElements,
  }
}
