export type CircleArcPoint = { x: number; y: number }

export const generateCircleArcs = (
  centerX: number,
  centerY: number,
  radius: number,
  cut: number,
  cutHeight: number,
  segmentLength = 0.1,
): {
  topArc: CircleArcPoint[]
  bottomArc: CircleArcPoint[]
} => {
  const topArc: CircleArcPoint[] = []
  const bottomArc: CircleArcPoint[] = []

  // choose angular step so the arc length between points is ~segmentLength
  const segments = Math.max(1, Math.ceil((Math.PI * radius) / segmentLength))
  const thetaStep = Math.PI / segments

  for (let i = 0; i <= segments; i++) {
    const theta = i * thetaStep
    const x = centerX + Math.cos(theta) * radius
    const y = centerY + Math.sin(theta) * radius

    if (
      x < centerX - cut &&
      y >= centerY - cutHeight / 2 &&
      y <= centerY + cutHeight / 2
    ) {
      continue
    }
    topArc.push({ x, y })
  }

  for (let i = 0; i <= segments; i++) {
    const theta = Math.PI + i * thetaStep
    const x = centerX + Math.cos(theta) * radius
    const y = centerY + Math.sin(theta) * radius

    if (
      x < centerX - cut &&
      y >= centerY - cutHeight / 2 &&
      y <= centerY + cutHeight / 2
    ) {
      continue
    }
    bottomArc.push({ x, y })
  }

  return { topArc, bottomArc }
}
