export type CourtyardOutlinePoint = {
  x: number
  y: number
}

export type RectBounds = {
  minX: number
  maxX: number
  minY: number
  maxY: number
}

export const createRectUnionOutline = (
  rectBoundsFromOuterToInner: RectBounds[],
): CourtyardOutlinePoint[] => {
  if (rectBoundsFromOuterToInner.length < 2) {
    throw new Error("Rect union outline requires at least two bounds")
  }

  for (const bounds of rectBoundsFromOuterToInner) {
    if (bounds.minX >= bounds.maxX || bounds.minY >= bounds.maxY) {
      throw new Error("Each rectangle bound must have min < max on both axes")
    }
  }

  for (let i = 1; i < rectBoundsFromOuterToInner.length; i++) {
    const previous = rectBoundsFromOuterToInner[i - 1]!
    const current = rectBoundsFromOuterToInner[i]!
    if (
      current.minX < previous.minX ||
      current.maxX > previous.maxX ||
      current.minY > previous.minY ||
      current.maxY < previous.maxY
    ) {
      throw new Error(
        "Bounds must be ordered outer-to-inner with tighter X and larger Y span",
      )
    }
  }

  const buildTopLeftRouteFromInnerToOuter = (): CourtyardOutlinePoint[] => {
    const route: CourtyardOutlinePoint[] = []
    let index = rectBoundsFromOuterToInner.length - 1
    route.push({
      x: rectBoundsFromOuterToInner[index]!.minX,
      y: rectBoundsFromOuterToInner[index]!.maxY,
    })
    while (index > 0) {
      const current = rectBoundsFromOuterToInner[index]!
      const previous = rectBoundsFromOuterToInner[index - 1]!
      route.push({ x: current.minX, y: previous.maxY })
      route.push({ x: previous.minX, y: previous.maxY })
      index -= 1
    }
    return route
  }

  const buildTopRightRouteFromInnerToOuter = (): CourtyardOutlinePoint[] => {
    const route: CourtyardOutlinePoint[] = []
    let index = rectBoundsFromOuterToInner.length - 1
    route.push({
      x: rectBoundsFromOuterToInner[index]!.maxX,
      y: rectBoundsFromOuterToInner[index]!.maxY,
    })
    while (index > 0) {
      const current = rectBoundsFromOuterToInner[index]!
      const previous = rectBoundsFromOuterToInner[index - 1]!
      route.push({ x: current.maxX, y: previous.maxY })
      route.push({ x: previous.maxX, y: previous.maxY })
      index -= 1
    }
    return route
  }

  const buildBottomRightRouteFromInnerToOuter = (): CourtyardOutlinePoint[] => {
    const route: CourtyardOutlinePoint[] = []
    let index = rectBoundsFromOuterToInner.length - 1
    route.push({
      x: rectBoundsFromOuterToInner[index]!.maxX,
      y: rectBoundsFromOuterToInner[index]!.minY,
    })
    while (index > 0) {
      const current = rectBoundsFromOuterToInner[index]!
      const previous = rectBoundsFromOuterToInner[index - 1]!
      route.push({ x: current.maxX, y: previous.minY })
      route.push({ x: previous.maxX, y: previous.minY })
      index -= 1
    }
    return route
  }

  const buildBottomLeftRouteFromInnerToOuter = (): CourtyardOutlinePoint[] => {
    const route: CourtyardOutlinePoint[] = []
    let index = rectBoundsFromOuterToInner.length - 1
    route.push({
      x: rectBoundsFromOuterToInner[index]!.minX,
      y: rectBoundsFromOuterToInner[index]!.minY,
    })
    while (index > 0) {
      const current = rectBoundsFromOuterToInner[index]!
      const previous = rectBoundsFromOuterToInner[index - 1]!
      route.push({ x: current.minX, y: previous.minY })
      route.push({ x: previous.minX, y: previous.minY })
      index -= 1
    }
    return route
  }

  const topLeftInnerToOuter = buildTopLeftRouteFromInnerToOuter()
  const topRightInnerToOuter = buildTopRightRouteFromInnerToOuter()
  const bottomRightInnerToOuter = buildBottomRightRouteFromInnerToOuter()
  const bottomLeftInnerToOuter = buildBottomLeftRouteFromInnerToOuter()

  return [
    ...topLeftInnerToOuter.reverse(),
    ...topRightInnerToOuter,
    ...bottomRightInnerToOuter.reverse(),
    ...bottomLeftInnerToOuter,
  ]
}
