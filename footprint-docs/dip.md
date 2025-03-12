# DIP Footprint

This footprint generates a DIP (Dual Inline Package) board layout with plated holes, a silkscreen border, and pin labels.

## Syntax

```
dip{num_pins}_w{width}_p{pitch}_id{inner_diameter}_od{outer_diameter}
```

Where:
- **num_pins**: Number of pins (default is 6).
- **w**: Overall width of the footprint. Can be specified in millimeters or mils (e.g., "300mil" – conversion is applied if given in mils).
- **p**: Pitch—the center-to-center distance between pins on the left or right side (default is "2.54mm").
- **id**: Inner diameter (hole size). If not specified, it is computed:
  - For a pitch near 1.27mm (±0.01), defaults to 0.55mm.
  - Otherwise, defaults to 1.0mm.
- **od**: Outer diameter (pad size). If not specified, it is computed:
  - For a pitch near 1.27mm, defaults to 0.95mm.
  - Otherwise, defaults to 1.5mm.

Additional boolean flags such as **wide** or **narrow** (when *w* is omitted) adjust the width to 600mil or 300mil respectively.

## Examples

- `dip6_w300mil_p2.54mm`  
  A 6-pin DIP footprint with a width of 300mil and a 2.54mm pitch.

- `dip8_w320mil_p1.27mm`  
  An 8-pin DIP footprint with a width of 320mil and a 1.27mm pitch; the inner and outer diameters will default to 0.55mm and 0.95mm respectively.

- `dip4`  
  A DIP footprint with 4 pins using default width/pitch settings.

## Defaults

- **num_pins**: Defaults to 6.
- **p (pitch)**: Defaults to "2.54mm" (or a provided default via extension).
- **id & od**:  
  - If neither is provided:
    - For a pitch of approximately 1.27mm, then:
      - `id` defaults to 0.55mm,
      - `od` defaults to 0.95mm.
    - Otherwise:
      - `id` defaults to 1.0mm,
      - `od` defaults to 1.5mm.
  - If only one is provided, the other is computed using the ratio (id = od * (1.0/1.5) or od = id * (1.5/1.0)).
- **w (width)**:  
  - If not provided:
    - When the **wide** flag is true, defaults to "600mil".
    - When the **narrow** flag is true, defaults to "300mil".
    - Otherwise, uses a default value (either passed in via newDefaults or "300mil").

## Notes

- **Coordinate Computation**:  
  The function `getCcwDipCoords(pinCount, pn, w, p)` computes coordinates in a counter-clockwise order:
  - For the left half of the DIP, it returns coordinates with an x-offset of `-w/2 - 0.4` and a y-position that decreases by multiples of the pitch.
  - For the right half, it returns coordinates with an x-offset of `w/2 + 0.4` and a corresponding adjusted y-position.

- **Silkscreen Border & Labels**:
  - The silkscreen border is computed using the available width (after subtracting pad size) and the pitch.
  - A U-shaped path (derived from a predefined u-curve) is integrated into the silkscreen border.
  - Each pin is assigned a silkscreen text label showing its pin number in red with a font size of 0.3.

- **Unit Conversion**:  
  The helper function `convertMilToMm` enables input values in mils (1 mil = 0.0254 mm). The Zod schema uses this conversion when a string ending in "mil" is provided.

- **Usage**:  
  The DIP footprint function parses its parameters using the extended Zod definition (`dip_def`) and creates an array of circuit JSON elements. These include plated holes (created via the `platedhole` helper) and silkscreen elements used for PCB rendering.

This concise documentation outlines the primary parameters and behavior of the DIP footprint code, making it easier for an AI or developer to understand and generate instances using the defined syntax.