import { roundCourtyardCoord } from "./round-courtyard-coord"

export const createRectCourtyardOutlinePoints = (
  courtyardWidthMm: number,
  courtyardHeightMm: number,
) => [
  {
    x: -roundCourtyardCoord(courtyardWidthMm / 2),
    y: roundCourtyardCoord(courtyardHeightMm / 2),
  },
  {
    x: -roundCourtyardCoord(courtyardWidthMm / 2),
    y: -roundCourtyardCoord(courtyardHeightMm / 2),
  },
  {
    x: roundCourtyardCoord(courtyardWidthMm / 2),
    y: -roundCourtyardCoord(courtyardHeightMm / 2),
  },
  {
    x: roundCourtyardCoord(courtyardWidthMm / 2),
    y: roundCourtyardCoord(courtyardHeightMm / 2),
  },
]
