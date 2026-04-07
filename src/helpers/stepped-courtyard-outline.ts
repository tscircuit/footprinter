export type CourtyardOutlinePoint = {
  x: number
  y: number
}

export type RectBounds = {
  halfX: number
  halfY: number
}

export const createOuterAndInnerRectUnionOutline = (params: {
  outerRectBounds: RectBounds
  middleRectBounds?: RectBounds
  innerRectBounds: RectBounds
}): CourtyardOutlinePoint[] => {
  const rectBoundsFromOuterToInner = [
    params.outerRectBounds,
    ...(params.middleRectBounds ? [params.middleRectBounds] : []),
    params.innerRectBounds,
  ]

  if (rectBoundsFromOuterToInner.length < 2) {
    throw new Error("Rect union outline requires at least outer and inner bounds")
  }

  for (let i = 1; i < rectBoundsFromOuterToInner.length; i++) {
    const previous = rectBoundsFromOuterToInner[i - 1]!
    const current = rectBoundsFromOuterToInner[i]!
    if (current.halfX > previous.halfX || current.halfY < previous.halfY) {
      throw new Error(
        "Rect union bounds must tighten X and expand Y from outer to inner",
      )
    }
  }

  const topRightRoute: CourtyardOutlinePoint[] = []
  let index = rectBoundsFromOuterToInner.length - 1

  topRightRoute.push({
    x: rectBoundsFromOuterToInner[index]!.halfX,
    y: rectBoundsFromOuterToInner[index]!.halfY,
  })

  while (index > 0) {
    const current = rectBoundsFromOuterToInner[index]!
    const previous = rectBoundsFromOuterToInner[index - 1]!
    topRightRoute.push({
      x: current.halfX,
      y: previous.halfY,
    })
    topRightRoute.push({
      x: previous.halfX,
      y: previous.halfY,
    })
    index -= 1
  }

  const leftTopRoute = [...topRightRoute]
    .reverse()
    .map(({ x, y }) => ({ x: -x, y }))
  const rightBottomRoute = leftTopRoute.map(({ x, y }) => ({ x: -x, y: -y }))
  const bottomLeftRoute = topRightRoute.map(({ x, y }) => ({ x: -x, y: -y }))

  return [
    ...leftTopRoute,
    ...topRightRoute,
    ...rightBottomRoute,
    ...bottomLeftRoute,
  ]
}
