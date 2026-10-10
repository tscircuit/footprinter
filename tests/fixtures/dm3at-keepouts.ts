import type {
  PadLayoutKeepoutRect,
  PadLayoutSmdPad,
} from "../../src/footprinter"

// Hirose DM3AT-SF-PEJM5, EDC-325165-00-00, p.1 mounting-side layout.
// https://www.hirose.com/product/download?distributor=digikey&type=2d&lang=en&num=DM3AT-SF-PEJM5
// Note 3: "No patterns are permitted in this oblique-hatched area."
// Datum: contact 1 land center, +Y toward the rear of the connector.
export const dm3atPads: PadLayoutSmdPad[] = [
  [1, 0, 0, 0.7, 1.2],
  [2, -1.1, 0, 0.7, 1.2],
  [3, -2.2, 0, 0.7, 1.2],
  [4, -3.3, 0, 0.7, 1.2],
  [5, -4.4, 0, 0.7, 1.2],
  [6, -5.5, 0, 0.7, 1.2],
  [7, -6.6, 0, 0.7, 1.2],
  [8, -7.7, 0, 0.7, 1.2],
  [9, -8.65, 0, 0.7, 1.2],
  [10, -9.6, -10.5, 1, 0.8],
  [11, 1.55, 0, 1, 1.2],
  [11, -9.6, -4.3, 1, 1.2],
  [11, -9.6, -14.65, 1, 2.8],
  [11, 3.9, -15.1, 1.3, 1.9],
]

// Source polygon boundaries are independent of the rectangle decomposition.
// The concave interior region can be represented exactly by two rectangles.
export const dm3atSourcePolygons = [
  [
    [-10, -0.45],
    [-9.25, -0.45],
    [-9.25, -3.7],
    [-10, -3.7],
  ],
  [
    [-10, -4.9],
    [-9.25, -4.9],
    [-9.25, -8.5],
    [-10, -8.5],
  ],
  [
    [-8.9, -6.3],
    [-8.2, -6.3],
    [-8.2, -5],
    [0.5, -5],
    [0.5, -6.6],
    [-8.2, -6.6],
    [-8.2, -13.9],
    [-8.9, -13.9],
  ],
  [
    [0.15, -14.7],
    [2.7, -14.7],
    [2.7, -16.05],
    [0.15, -16.05],
  ],
] as const

export const dm3atKeepouts: PadLayoutKeepoutRect[] = [
  [-9.625, -2.075, 0.75, 3.25],
  [-9.625, -6.7, 0.75, 3.6],
  [-8.55, -10.1, 0.7, 7.6],
  [-3.85, -5.8, 8.7, 1.6],
  [1.425, -15.375, 2.55, 1.35],
]
