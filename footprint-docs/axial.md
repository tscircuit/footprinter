# Axial Footprint

This footprint represents an axial component with two plated holes and a silkscreen outline. The function is intended for passive components such as axial resistors or diodes.

## Syntax

For metric parameters, the footprint function follows:

```
axial_p{pitch}_id{inner_diameter}_od{outer_diameter}
```

For example, a string definition might be:  
```
axial_p2.54mm_id0.7mm_od1mm
```

Alternatively, if using an imperial size it can be specified as:  
```
axial{imperial}
```

## Examples

- `axial_p2.54mm_id0.7mm_od1mm`
- `axial_p0.2in` *(example used in tests)*

## Defaults

- **p** (pitch): Default is `"2.54mm"`. This is the center-to-center distance between the two plated holes.
- **id** (inner diameter): Default is `"0.7mm"`.
- **od** (outer diameter): Default is `"1mm"`.

## Notes

- The function generates two plated holes:
  - The first is positioned at x = `-p/2` and the second at x = `p/2` (both with y = 0).
  - Hole sizes are defined by `id` and `od` for the inner and outer diameters respectively.
- A silkscreen path is drawn on the top layer between:
  - Start: x = `(-p/2 + od + id/2)`, y = 0.
  - End: x = `(p/2 - od - id/2)`, y = 0.
  - The line has a stroke width of `0.1`.
- A silkscreen reference text element is added at position x = 0, y = `p/4` with a font size of `0.5`.
- The footprint is implemented as a passive component footprint, and it is defined using a Zod schema to enforce parameter types and defaults.