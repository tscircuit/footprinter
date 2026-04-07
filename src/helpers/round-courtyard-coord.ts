export const roundCourtyardCoord = (value: number) => {
  const grid = 0.01
  if (value >= 0) return Math.ceil(value / grid - 1e-9) * grid
  return Math.floor(value / grid + 1e-9) * grid
}
