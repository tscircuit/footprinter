import Flatten from "@flatten-js/core"

export interface BooleanDifferenceOptions {
  operation?: "difference" | "union" | "intersection"
  colorA?: string
  colorB?: string
  colorDifference?: string
  showLegend?: boolean
  title?: string
  footprintNameA?: string
  footprintNameB?: string
}

interface FootprintElement {
  type: string
  x?: number
  y?: number
  width?: number
  height?: number
  outer_diameter?: number
  hole_diameter?: number
  route?: Array<{ x: number; y: number }>
  points?: Array<{ x: number; y: number }>
  shape?: string
}

/**
 * Convert a footprint element to a Flatten.js polygon
 */
function elementToPolygon(element: FootprintElement): Flatten.Polygon | null {
  try {
    if (
      element.type === "pcb_smtpad" &&
      element.width &&
      element.height &&
      element.x !== undefined &&
      element.y !== undefined
    ) {
      // Create rectangular pad polygon
      const halfWidth = element.width / 2
      const halfHeight = element.height / 2
      const points = [
        new Flatten.Point(element.x - halfWidth, element.y - halfHeight),
        new Flatten.Point(element.x + halfWidth, element.y - halfHeight),
        new Flatten.Point(element.x + halfWidth, element.y + halfHeight),
        new Flatten.Point(element.x - halfWidth, element.y + halfHeight),
      ]
      return new Flatten.Polygon(points)
    }

    if (
      element.type === "pcb_smtpad" &&
      element.points &&
      element.points.length > 0
    ) {
      // Handle polygon-shaped SMT pads
      const points = element.points.map((p) => new Flatten.Point(p.x, p.y))
      return new Flatten.Polygon(points)
    }

    if (
      element.type === "pcb_plated_hole" &&
      element.outer_diameter &&
      element.hole_diameter &&
      element.x !== undefined &&
      element.y !== undefined
    ) {
      // Create annular ring polygon (outer circle - inner circle) for plated area only
      const outerRadius = element.outer_diameter / 2
      const innerRadius = element.hole_diameter / 2

      // Use many more points for very smooth circles (64 points = very smooth)
      const numPoints = 64

      // Create outer circle with high resolution
      const outerPoints: Flatten.Point[] = []
      for (let i = 0; i < numPoints; i++) {
        const angle = (i * Math.PI * 2) / numPoints
        outerPoints.push(
          new Flatten.Point(
            element.x + outerRadius * Math.cos(angle),
            element.y + outerRadius * Math.sin(angle),
          ),
        )
      }

      // Create inner circle with high resolution, but in reverse order for proper hole subtraction
      const innerPoints: Flatten.Point[] = []
      for (let i = numPoints - 1; i >= 0; i--) {
        // Reverse order for hole
        const angle = (i * Math.PI * 2) / numPoints
        innerPoints.push(
          new Flatten.Point(
            element.x + innerRadius * Math.cos(angle),
            element.y + innerRadius * Math.sin(angle),
          ),
        )
      }

      // Use a simpler, more reliable approach: create the ring directly
      // This avoids boolean operation artifacts and ensures smooth, continuous rings
      const ringPoints: Flatten.Point[] = []

      // Add outer circle points (clockwise)
      for (let i = 0; i < numPoints; i++) {
        const angle = (i * Math.PI * 2) / numPoints
        ringPoints.push(
          new Flatten.Point(
            element.x + outerRadius * Math.cos(angle),
            element.y + outerRadius * Math.sin(angle),
          ),
        )
      }

      // Add inner circle points (counter-clockwise to create hole)
      for (let i = numPoints - 1; i >= 0; i--) {
        const angle = (i * Math.PI * 2) / numPoints
        ringPoints.push(
          new Flatten.Point(
            element.x + innerRadius * Math.cos(angle),
            element.y + innerRadius * Math.sin(angle),
          ),
        )
      }

      return new Flatten.Polygon(ringPoints)
    }

    if (
      element.type === "pcb_silkscreen_path" &&
      element.route &&
      element.route.length > 2
    ) {
      // Create polygon from path route
      const points = element.route.map((p) => new Flatten.Point(p.x, p.y))
      return new Flatten.Polygon(points)
    }

    return null
  } catch (error) {
    console.warn(`Failed to convert element to polygon:`, error)
    return null
  }
}

/**
 * Convert circuit-json footprint elements to polygons
 */
function footprintToPolygons(elements: FootprintElement[]): Flatten.Polygon[] {
  const polygons: Flatten.Polygon[] = []

  for (const element of elements) {
    const poly = elementToPolygon(element)
    if (poly) {
      polygons.push(poly)
    }
  }

  return polygons
}

/**
 * Convert a Flatten.js polygon to SVG path data
 */
function polygonToSvgPath(polygon: Flatten.Polygon): string {
  if (!polygon || polygon.isEmpty()) {
    return ""
  }

  try {
    // Use vertices directly for simple polygon path generation
    const vertices = polygon.vertices
    if (!vertices || vertices.length === 0) {
      return ""
    }

    let pathData = `M ${vertices[0]!.x} ${vertices[0]!.y}`

    for (let i = 1; i < vertices.length; i++) {
      pathData += ` L ${vertices[i]!.x} ${vertices[i]!.y}`
    }

    pathData += " Z"
    return pathData
  } catch (error) {
    console.warn("Failed to convert polygon to SVG path:", error)
    return ""
  }
}

/**
 * Calculate bounding box for multiple polygons
 */
function calculateBoundingBox(polygons: Flatten.Polygon[]): {
  minX: number
  minY: number
  maxX: number
  maxY: number
} {
  let minX = Infinity
  let minY = Infinity
  let maxX = -Infinity
  let maxY = -Infinity

  for (const polygon of polygons) {
    if (polygon && !polygon.isEmpty()) {
      const box = polygon.box
      minX = Math.min(minX, box.xmin)
      minY = Math.min(minY, box.ymin)
      maxX = Math.max(maxX, box.xmax)
      maxY = Math.max(maxY, box.ymax)
    }
  }

  // Fallback if no valid polygons
  if (!isFinite(minX)) {
    return { minX: -1, minY: -1, maxX: 1, maxY: 1 }
  }

  return { minX, minY, maxX, maxY }
}

/**
 * Create boolean difference visualization between two footprints
 */
export function createBooleanDifferenceVisualization(
  footprintA: FootprintElement[],
  footprintB: FootprintElement[],
  options: BooleanDifferenceOptions = {},
): string {
  const {
    operation = "difference",
    colorA = "#007bff", // Blue for Footprinter
    colorB = "#dc3545", // Red for KiCad
    colorDifference = "#ffd93d",
    showLegend = true,
    title = "Boolean Difference Visualization",
  } = options

  try {
    // Convert footprints to polygons
    const polygonsA = footprintToPolygons(footprintA)
    const polygonsB = footprintToPolygons(footprintB)

    // Convert footprints to polygons for boolean operations

    // Center both footprints for proper overlay alignment
    const bboxA = calculateBoundingBox(polygonsA)
    const bboxB = calculateBoundingBox(polygonsB)

    const centerAX = (bboxA.minX + bboxA.maxX) / 2
    const centerAY = (bboxA.minY + bboxA.maxY) / 2
    const centerBX = (bboxB.minX + bboxB.maxX) / 2
    const centerBY = (bboxB.minY + bboxB.maxY) / 2

    // Translate polygons to center them at origin for overlay
    const centeredPolygonsA = polygonsA.map((poly) => {
      const translatedVertices = poly.vertices.map(
        (v) => new Flatten.Point(v.x - centerAX, v.y - centerAY),
      )
      return new Flatten.Polygon(translatedVertices)
    })

    const centeredPolygonsB = polygonsB.map((poly) => {
      const translatedVertices = poly.vertices.map(
        (v) => new Flatten.Point(v.x - centerBX, v.y - centerBY),
      )
      return new Flatten.Polygon(translatedVertices)
    })

    // Footprints are now centered and ready for boolean operations

    // Calculate bounding box to ensure both footprints are visible
    const bbox = calculateBoundingBox([
      ...centeredPolygonsA,
      ...centeredPolygonsB,
    ])
    const padding = Math.max(2, (bbox.maxX - bbox.minX) * 0.1) // Dynamic padding
    const width = bbox.maxX - bbox.minX + 2 * padding
    const height = bbox.maxY - bbox.minY + 2 * padding
    const viewBoxX = bbox.minX - padding
    const viewBoxY = bbox.minY - padding

    // Perform boolean operations using flatten-js/core
    let resultPolygons: Flatten.Polygon[] = []

    if (
      options?.operation === "difference" &&
      centeredPolygonsA.length > 0 &&
      centeredPolygonsB.length > 0
    ) {
      // Boolean difference: A - B
      for (const polyA of centeredPolygonsA) {
        let result = polyA
        for (const polyB of centeredPolygonsB) {
          try {
            result = Flatten.BooleanOperations.subtract(result, polyB)
          } catch (error) {
            console.warn("Boolean subtract failed:", error)
          }
        }
        if (!result.isEmpty()) {
          resultPolygons.push(result)
        }
      }
    } else if (
      options?.operation === "union" &&
      centeredPolygonsA.length > 0 &&
      centeredPolygonsB.length > 0
    ) {
      // Boolean union: A ∪ B
      let result = centeredPolygonsA[0]!
      for (let i = 1; i < centeredPolygonsA.length; i++) {
        try {
          result = Flatten.BooleanOperations.unify(
            result,
            centeredPolygonsA[i]!,
          )
        } catch (error) {
          console.warn("Boolean unify failed:", error)
        }
      }
      for (const polyB of centeredPolygonsB) {
        try {
          result = Flatten.BooleanOperations.unify(result, polyB)
        } catch (error) {
          console.warn("Boolean unify failed:", error)
        }
      }
      if (!result.isEmpty()) {
        resultPolygons.push(result)
      }
    } else if (
      options?.operation === "intersection" &&
      centeredPolygonsA.length > 0 &&
      centeredPolygonsB.length > 0
    ) {
      // Boolean intersection: A ∩ B
      // Do individual intersections but only between corresponding elements (same index)
      // This prevents creating too many intersection areas
      const minLength = Math.min(
        centeredPolygonsA.length,
        centeredPolygonsB.length,
      )

      for (let i = 0; i < minLength; i++) {
        try {
          const intersection = Flatten.BooleanOperations.intersect(
            centeredPolygonsA[i]!,
            centeredPolygonsB[i]!,
          )
          if (!intersection.isEmpty()) {
            resultPolygons.push(intersection)
          }
        } catch (error) {
          console.warn("Boolean intersect failed:", error)
        }
      }
    }

    // Generate SVG paths for all centered polygons
    const pathsA = centeredPolygonsA
      .map((p) => polygonToSvgPath(p))
      .filter((p) => p)
    const pathsB = centeredPolygonsB
      .map((p) => polygonToSvgPath(p))
      .filter((p) => p)
    const resultPaths = resultPolygons
      .map((p) => polygonToSvgPath(p))
      .filter((p) => p)

    // Create SVG with proper dimensions for overlay visibility
    let svg = `<svg width="800" height="600" viewBox="${viewBoxX} ${viewBoxY} ${width} ${height}" xmlns="http://www.w3.org/2000/svg">`

    // Add background for better contrast
    svg += `<rect x="${viewBoxX}" y="${viewBoxY}" width="${width}" height="${height}" fill="#f8f9fa" stroke="#dee2e6" stroke-width="0.02"/>`

    // Add title (much smaller to fit within bounds)
    if (title) {
      svg += `<text x="${viewBoxX + width / 2}" y="${viewBoxY + padding * 0.2}" text-anchor="middle" font-family="Arial, sans-serif" font-size="${Math.min(0.15, width * 0.02)}" font-weight="bold" fill="#212529">${title}</text>`
    }

    // Add footprint layers with higher opacity for stronger purple overlap effect
    svg += `<g id="footprint-a" opacity="0.85">`

    // Render all elements from footprintA (centered)
    for (let i = 0; i < footprintA.length; i++) {
      const element = footprintA[i]!
      const path = pathsA[i]

      if (
        element.type === "pcb_plated_hole" &&
        element.outer_diameter &&
        element.hole_diameter
      ) {
        // Render plated holes as stroked circles only (no fill)
        const outerRadius = element.outer_diameter / 2
        const innerRadius = element.hole_diameter / 2
        const strokeWidth = outerRadius - innerRadius
        const avgRadius = (outerRadius + innerRadius) / 2

        // Use already calculated center coordinates
        const centeredX = element.x! - centerAX
        const centeredY = element.y! - centerAY

        svg += `<circle cx="${centeredX}" cy="${centeredY}" r="${avgRadius}" fill="none" stroke="${colorA}" stroke-width="${strokeWidth}" opacity="0.8"/>`
      } else if (path) {
        // Regular pads with fill
        svg += `<path d="${path}" fill="${colorA}" stroke="${colorA}" stroke-width="0.02" fill-opacity="0.6"/>`
      }
    }
    svg += `</g>`

    svg += `<g id="footprint-b" opacity="0.85">`

    // Render all elements from footprintB (centered)
    for (let i = 0; i < footprintB.length; i++) {
      const element = footprintB[i]!
      const path = pathsB[i]

      if (
        element.type === "pcb_plated_hole" &&
        element.outer_diameter &&
        element.hole_diameter
      ) {
        // Render plated holes as stroked circles only (no fill)
        const outerRadius = element.outer_diameter / 2
        const innerRadius = element.hole_diameter / 2
        const strokeWidth = outerRadius - innerRadius
        const avgRadius = (outerRadius + innerRadius) / 2

        // Use already calculated center coordinates
        const centeredX = element.x! - centerBX
        const centeredY = element.y! - centerBY

        svg += `<circle cx="${centeredX}" cy="${centeredY}" r="${avgRadius}" fill="none" stroke="${colorB}" stroke-width="${strokeWidth}" opacity="0.8"/>`
      } else if (path) {
        // Regular pads with fill
        svg += `<path d="${path}" fill="${colorB}" stroke="${colorB}" stroke-width="0.02" fill-opacity="0.6"/>`
      }
    }
    svg += `</g>`

    const centerX = viewBoxX + width / 2
    const centerY = viewBoxY + height / 2

    // Add crosshairs to help visualize alignment
    svg += `<g id="alignment-guides" opacity="0.3">`
    svg += `<line x1="${centerX}" y1="${viewBoxY}" x2="${centerX}" y2="${viewBoxY + height}" stroke="#6c757d" stroke-width="0.02" stroke-dasharray="0.1,0.1"/>`
    svg += `<line x1="${viewBoxX}" y1="${centerY}" x2="${viewBoxX + width}" y2="${centerY}" stroke="#6c757d" stroke-width="0.02" stroke-dasharray="0.1,0.1"/>`
    svg += `</g>`

    // Add compact legend for overlay visualization (sized to fit within bounds)
    if (showLegend) {
      const legendHeight = Math.min(0.8, height * 0.15)
      const legendY = viewBoxY + height - legendHeight - padding * 0.1
      const fontSize = Math.min(0.15, width * 0.02)
      const rectSize = Math.min(0.2, width * 0.03)

      svg += `<g font-family="Arial, sans-serif" font-size="${fontSize}">`

      // Legend background (compact)
      svg += `<rect x="${viewBoxX + padding * 0.1}" y="${legendY}" width="${width - padding * 0.2}" height="${legendHeight}" fill="white" fill-opacity="0.9" stroke="#dee2e6" stroke-width="0.01" rx="0.05"/>`

      // Footprint A legend
      svg += `<rect x="${viewBoxX + padding * 0.2}" y="${legendY + 0.1}" width="${rectSize}" height="${rectSize}" fill="${colorA}" fill-opacity="0.5" stroke="${colorA}" stroke-width="0.01"/>`
      const labelA = options?.footprintNameA
        ? `Footprinter: ${options.footprintNameA}`
        : "Footprinter"
      svg += `<text x="${viewBoxX + padding * 0.2 + rectSize + 0.05}" y="${legendY + 0.1 + rectSize / 2}" fill="#212529" font-weight="500" dominant-baseline="middle">${labelA}</text>`

      // Footprint B legend
      const legendMidX = viewBoxX + width * 0.4
      svg += `<rect x="${legendMidX}" y="${legendY + 0.1}" width="${rectSize}" height="${rectSize}" fill="${colorB}" fill-opacity="0.5" stroke="${colorB}" stroke-width="0.01"/>`
      const labelB = options?.footprintNameB
        ? `KiCad: ${options.footprintNameB}`
        : "KiCad"
      svg += `<text x="${legendMidX + rectSize + 0.05}" y="${legendY + 0.1 + rectSize / 2}" fill="#212529" font-weight="500" dominant-baseline="middle">${labelB}</text>`

      // Compact instructions
      svg += `<text x="${viewBoxX + width / 2}" y="${legendY + legendHeight - 0.1}" text-anchor="middle" fill="#6c757d" font-size="${fontSize * 0.8}">Perfect alignment = complete overlap</text>`

      svg += `</g>`
    }

    svg += "</svg>"

    return svg
  } catch (error) {
    console.error("Error creating boolean difference visualization:", error)

    // Return error SVG
    return `<svg width="400" height="200" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#f8f8f8"/>
      <text x="200" y="100" text-anchor="middle" font-family="Arial" font-size="16" fill="#d32f2f">
        Error: Failed to generate boolean difference visualization
      </text>
      <text x="200" y="120" text-anchor="middle" font-family="Arial" font-size="12" fill="#666">
        ${error instanceof Error ? error.message : "Unknown error"}
      </text>
    </svg>`
  }
}
