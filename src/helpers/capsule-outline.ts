export type CapsuleOrientation = "horizontal" | "vertical"

export type CapsuleOutlinePoint = {
  x: number
  y: number
}

export const createCapsuleOutline = (options: {
  centerX: number
  centerY: number
  straightHalfLength: number
  radius: number
  arcSegmentCount?: number
  orientation?: CapsuleOrientation
}): CapsuleOutlinePoint[] => {
  const {
    centerX,
    centerY,
    straightHalfLength,
    radius,
    arcSegmentCount = 9,
    orientation = "horizontal",
  } = options

  if (straightHalfLength < 0) {
    throw new Error("Capsule straightHalfLength must be non-negative")
  }

  if (radius <= 0) {
    throw new Error("Capsule radius must be positive")
  }

  if (arcSegmentCount < 2) {
    throw new Error("Capsule arcSegmentCount must be at least 2")
  }

  if (orientation === "horizontal") {
    const leftCenterX = centerX - straightHalfLength
    const rightCenterX = centerX + straightHalfLength

    const rightArc = Array.from({ length: arcSegmentCount + 1 }, (_, i) => {
      const theta = Math.PI / 2 - (i * Math.PI) / arcSegmentCount
      return {
        x: rightCenterX + Math.cos(theta) * radius,
        y: centerY + Math.sin(theta) * radius,
      }
    })

    const leftArc = Array.from({ length: arcSegmentCount + 1 }, (_, i) => {
      const theta = -Math.PI / 2 + (i * Math.PI) / arcSegmentCount
      return {
        x: leftCenterX - Math.cos(theta) * radius,
        y: centerY + Math.sin(theta) * radius,
      }
    })

    return [
      { x: leftCenterX, y: centerY + radius },
      { x: rightCenterX, y: centerY + radius },
      ...rightArc.slice(1, -1),
      { x: rightCenterX, y: centerY - radius },
      { x: leftCenterX, y: centerY - radius },
      ...leftArc.slice(1, -1),
    ]
  }

  const bottomCenterY = centerY - straightHalfLength
  const topCenterY = centerY + straightHalfLength

  const topArc = Array.from({ length: arcSegmentCount + 1 }, (_, i) => {
    const theta = Math.PI - (i * Math.PI) / arcSegmentCount
    return {
      x: centerX + Math.cos(theta) * radius,
      y: topCenterY + Math.sin(theta) * radius,
    }
  })

  const bottomArc = Array.from({ length: arcSegmentCount + 1 }, (_, i) => {
    const theta = (i * Math.PI) / arcSegmentCount
    return {
      x: centerX + Math.cos(theta) * radius,
      y: bottomCenterY - Math.sin(theta) * radius,
    }
  })

  return [
    { x: centerX - radius, y: bottomCenterY },
    { x: centerX - radius, y: topCenterY },
    ...topArc.slice(1, -1),
    { x: centerX + radius, y: topCenterY },
    { x: centerX + radius, y: bottomCenterY },
    ...bottomArc.slice(1, -1),
  ]
}
