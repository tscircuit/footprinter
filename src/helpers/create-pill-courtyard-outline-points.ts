import { type Point } from "circuit-json"

export const createPillCourtyardOutlinePoints = (dimensions: {
  outerHalfWidthMm: number
  innerHalfWidthMm: number
  outerHalfHeightMm: number
  innerHalfHeightMm: number
}): Point[] => {
  const {
    outerHalfWidthMm,
    innerHalfWidthMm,
    outerHalfHeightMm,
    innerHalfHeightMm,
  } = dimensions

  return [
    { x: -outerHalfWidthMm, y: innerHalfHeightMm },
    { x: -innerHalfWidthMm, y: innerHalfHeightMm },
    { x: -innerHalfWidthMm, y: outerHalfHeightMm },
    { x: innerHalfWidthMm, y: outerHalfHeightMm },
    { x: innerHalfWidthMm, y: innerHalfHeightMm },
    { x: outerHalfWidthMm, y: innerHalfHeightMm },
    { x: outerHalfWidthMm, y: -innerHalfHeightMm },
    { x: innerHalfWidthMm, y: -innerHalfHeightMm },
    { x: innerHalfWidthMm, y: -outerHalfHeightMm },
    { x: -innerHalfWidthMm, y: -outerHalfHeightMm },
    { x: -innerHalfWidthMm, y: -innerHalfHeightMm },
    { x: -outerHalfWidthMm, y: -innerHalfHeightMm },
  ]
}
