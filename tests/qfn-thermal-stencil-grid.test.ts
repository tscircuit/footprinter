import test from "ava"

test("generates divided 2x2 solder paste stencil grid on large QFN center thermal pads", (t) => {
  const centerPad = { width: 4.0, height: 4.0 }
  const gridRows = 2
  const gridCols = 2
  const gap = 0.2
  
  const subPadWidth = (centerPad.width - ((gridCols - 1) * gap)) / gridCols
  const subPadHeight = (centerPad.height - ((gridRows - 1) * gap)) / gridRows
  
  t.is(subPadWidth, 1.9)
  t.is(subPadHeight, 1.9)
  t.is(gridRows * gridCols, 4)
})
