export type CourtyardOutlinePoint = {
  x: number
  y: number
}

export const createSteppedCourtyardOutline = (params: {
  xHalfStepsFromInnerToOuter: number[]
  yHalfStepsFromInnerToOuter: number[]
}): CourtyardOutlinePoint[] => {
  const { xHalfStepsFromInnerToOuter, yHalfStepsFromInnerToOuter } = params
  if (
    xHalfStepsFromInnerToOuter.length < 2 ||
    xHalfStepsFromInnerToOuter.length !== yHalfStepsFromInnerToOuter.length
  ) {
    throw new Error(
      "Stepped courtyard requires equal X/Y step counts with at least two levels",
    )
  }

  const topRightRoute: CourtyardOutlinePoint[] = []
  let xIndex = 0
  let yIndex = yHalfStepsFromInnerToOuter.length - 1
  topRightRoute.push({
    x: xHalfStepsFromInnerToOuter[0]!,
    y: yHalfStepsFromInnerToOuter[yIndex]!,
  })
  while (yIndex > 0 || xIndex < xHalfStepsFromInnerToOuter.length - 1) {
    if (yIndex > 0) {
      topRightRoute.push({
        x: xHalfStepsFromInnerToOuter[xIndex]!,
        y: yHalfStepsFromInnerToOuter[yIndex - 1]!,
      })
      yIndex -= 1
    }
    if (xIndex < xHalfStepsFromInnerToOuter.length - 1) {
      topRightRoute.push({
        x: xHalfStepsFromInnerToOuter[xIndex + 1]!,
        y: yHalfStepsFromInnerToOuter[yIndex]!,
      })
      xIndex += 1
    }
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
