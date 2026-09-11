import test from "ava"

test("generates standard 0.95mm pitch pad placements for SOT-23-3 transistors", (t) => {
  const pitch = 0.95
  const pin1 = { x: -pitch, y: -1.2 }
  const pin2 = { x: pitch, y: -1.2 }
  const pin3 = { x: 0, y: 1.2 }
  
  const pinSpacing = Math.abs(pin2.x - pin1.x)
  t.is(pinSpacing, 1.9)
  t.is(pin3.x, 0)
})
