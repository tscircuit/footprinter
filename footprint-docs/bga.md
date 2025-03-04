# BGA Footprint

This footprint creates a Ball Grid Array (BGA) package based on a configurable grid layout. It supports custom pin count, grid dimensions, pitch, ball diameter, pad size, and options to remove (or “missing”) specific pins using numeric or alphanumeric identifiers.

---

## Syntax

The footprint function can be invoked using a string shorthand that includes parameters. For example, the syntax may be expressed as:

```
bga{num_pins}_w{width}_h{height}_p{pitch}_[grid{columns}x{rows}]_[missing({missing_pin_specifiers})]
```

Alternatively, when using a passive footprint style (via the footprinter module), you may use parameter shortcuts such as:

```
bga64_w10mm_h10mm_p0.8mm
```

with optional extensions:
- `grid8x8` – defines an 8x8 grid.
- `missing(center,B1)` – removes pins specified by “center” or alphanumeric coordinates (e.g. B1).

---

## Examples

- **Default BGA footprint (64 pins):**

  ```
  bga64_w10mm_h10mm_p0.8mm
  ```

- **BGA with custom grid and missing pins:**

  ```
  bga64_w10mm_h10mm_grid8x8_p0.8mm_missing(center,B1)
  ```

- **BGA using footprinter shorthand:**

  ```
  fp.string("bga64_w10mm_h10mm_grid8x8_p0.8mm_missing(center,B1)").circuitJson()
  ```

---

## Defaults

- **num_pins**: Defaults to 64 if not specified.
- **p (pitch)**: Defaults to 0.8mm.
- **w, h**: Optional lengths. If not provided in the input transform, they are required in the transformed type.
- **ball**: Defaults to `(0.75 / 1.27) * p` if not provided. This parameter represents the ball diameter.
- **pad**: Defaults to `ball * 0.8` if not provided. This defines the square pad dimensions (width and height) for each ball.
- **grid**: If not provided, the grid is computed as a square with dimensions `ceil(sqrt(num_pins)) × ceil(sqrt(num_pins))`.

---

## Notes

- **Origin Selection:**  
  The footprint accepts boolean flags (`tlorigin`, `blorigin`, `trorigin`, `brorigin`) that indicate the desired origin of the grid. By default, the origin is the top-left (`"tl"`). If, for example, `blorigin` is set to true, the origin is set to bottom-left.

- **Grid Calculation:**  
  When no grid is provided, the code computes the smallest square grid that can accommodate the specified number of pins. For example, for 64 pins, the grid will be 8x8.

- **Missing Pins Handling:**  
  The `missing` parameter allows specification of pins that should be omitted from the array.  
  - You can pass numbers directly (e.g. `[5, 12]`).  
  - Special string values like `"center"` or `"topleft"` are accepted.  
  - Alphanumeric pin identifiers (e.g. `"B1"`) are converted to a numeric pin number using an internal alphabet lookup, where letters correspond to row indices.

- **Pad Arrangement:**  
  The footprint iterates through the grid and assigns each pad a sequential number adjusted after skipping missing pins.  
  - Each pad is positioned based on its grid coordinates with the pitch `p` determining the spacing.  
  - The pad is created as a square with side length equal to the `pad` parameter.

- **Silkscreen Reference Text:**  
  After generating the pads, a silkscreen reference (text element) is placed at the center top of the grid (y = grid.y * p / 2) with a font size of 0.2.

- **Utility:**  
  The overall footprint function returns an object containing:
  - `circuitJson`: An array of circuit elements (pads and silkscreen reference text).
  - `parameters`: The parsed and transformed parameter object with all default values resolved.

---

This concise documentation is intended to help automated systems and developers understand the configurable parameters, default behaviors, and usage patterns for the BGA footprint generator.