export const u_curve = Array.from({ length: 9 }, (_, i) =>
  Math.cos((i / 8) * Math.PI - Math.PI),
).map((x) => ({
  x,
  y: -Math.sqrt(1 - x ** 2),
}))
