# breakoutheaders Footprint

This footprint function creates breakout headers by generating plated holes on one or more sides of a rectangular body and adding a silkscreen outline. A small triangular silkscreen marker is drawn on one of the sides (left, right, top, or bottom) depending on which group of pins is present. The overall board height is computed automatically if not provided.

---

## Syntax

A typical footprint string may be constructed by concatenating the footprint name with parameter abbreviations. For example:

```
breakoutheaders_left{left}_right{right}_top{top}_bottom{bottom}_w{width}_h{height?}_p{pitch}_id{innerDiameter}_od{outerDiameter}
```

Each parameter is appended with its value. If the height (`h`) is not provided, it is computed from the maximum of the left/right pin counts multiplied by the pitch (`p`).

For passive header footprints (if used in that context), you might use an imperial size suffix; however, for breakoutheaders the metric parameters are used.

---

## Examples

- `breakoutheaders_left20_right20_w10mm_p2.54mm`  
  (This uses the default left and right pin counts of 20, a width of 10 mm, and a pitch of 2.54 mm.)

- `breakoutheaders_left15_right15_top2_w8mm_p1.5mm`  
  (This example sets top pins, custom width, and a pitch of 1.5 mm.)

---

## Defaults

- **fn**: *string* – The function name (must be provided).
- **w**: `10mm` – The overall body width.
- **h**: *optional* – If omitted, computed as:  
  - If both `left` and `right` are provided, height = max(`left`, `right`) × `p`.  
  - Otherwise, height = (`left` or `right`) × `p`.  
  - If none provided, a default of `51` (unit based on pitch value) is used.
- **left**: `20` – Number of pins on the left side.
- **right**: `20` – Number of pins on the right side.
- **top**: `0` – Number of pins on the top side.
- **bottom**: `0` – Number of pins on the bottom side.
- **p**: `2.54mm` – The pitch (distance between centers of vertically arranged pins).
- **id**: `1mm` – Inner diameter for plated holes.
- **od**: `1.5mm` – Outer diameter for plated holes.

---

## Notes

- The function uses the [Zod library](https://github.com/colinhacks/zod) to parse and validate parameters.
- If the overall height (`h`) is not explicitly provided, it is derived from the maximum of the left/right counts multiplied by the pitch.
- Plated holes are created on each side (left, right, top, bottom) if the corresponding parameter is nonzero.
  - For the right side, the holes are positioned at `x = w/2` and a calculated `y` offset.
  - For the left side, holes are similarly positioned with a negative x value.
  - For the top and bottom sides, holes are placed along the horizontal direction using a calculated x offset.
- A triangular silkscreen marker is drawn on a side:
  - On the right side, if present, the triangle is generated at the first hole (provided that neither left nor bottom are present).
  - On the left side, the triangle appears on the last hole.
  - On the top and bottom sides, a similar approach positions the triangle depending on which pins are used.
- A rectangular silkscreen border is drawn around the entire body. Its route is defined using the body width (`w`) and computed height.
- The function returns an object with:
  - `circuitJson`: An array of circuit elements (plated holes and silkscreen paths) ready for rendering.
  - `parameters`: The final parsed parameters used for footprint generation.

Use this documentation along with test examples (e.g. in `tests/breakoutheaders.test.ts`) as a reference for usage.