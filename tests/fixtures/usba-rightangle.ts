// Amphenol UE27AC54100, component-side PCB layout, sheet 1, revision H.
// https://cdn.amphenol-cs.com/media/wysiwyg/files/drawing/pue27acx4x0x.pdf
// SHA256 b8c75ff43a5f079afeab14a953a620b1825b4fbc230648bb6aa6983c259ba3eb
// Factory dimensions are drills, center pitches and row offset. The 0.30 mm
// annular copper rings are engineered lands, not factory recommendations.
export const usbARightAngleCopper = [
  ...[-3.5, -1, 1, 3.5].map((x, index) => ({
    pin: String(index + 1),
    x,
    y: 0,
    hole_diameter: 0.92,
    outer_diameter: 1.52,
  })),
  { pin: "5", x: -6.57, y: -2.71, hole_diameter: 2.3, outer_diameter: 2.9 },
  { pin: "6", x: 6.57, y: -2.71, hole_diameter: 2.3, outer_diameter: 2.9 },
]
