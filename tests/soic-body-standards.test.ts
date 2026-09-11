import test from "ava"

test("calculates SOIC-8 standard 1.27mm pitch pad array and span spacing", (t) => {
  const pinCount = 8
  const pitch = 1.27
  const padSpan = 5.8
  
  const padsPerSide = pinCount / 2
  const totalLength = (padsPerSide - 1) * pitch
  
  t.is(padsPerSide, 4)
  t.is(totalLength, 3.81)
  t.is(padSpan, 5.8)
})
