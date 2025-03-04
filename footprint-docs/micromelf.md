# MicroMelf

The MicroMelf footprint generates a two‐pin SMT component footprint with a silkscreen outline and reference text.

---

## Syntax

```
micromelf{num_pins}_w{w}_h{h}_p{p}_pl{pl}_pw{pw}
```

Where:
- **num_pins**: Number of pins (always 2 by default).
- **w**: Component width.
- **h**: Component height.
- **p**: Pitch (distance between the centers of pads).
- **pl**: Pad length.
- **pw**: Pad width.

Example strings can be provided to the footprint builder to override default parameters.

---

## Examples

- `micromelf2_w3.0mm_h1.80mm_p1.6mm_pl0.80mm_pw1.20mm`  
  (Creates a MicroMelf footprint with the default parameters.)

- Custom example: `micromelf2_w3.2mm_h2.0mm_p1.8mm_pl0.9mm_pw1.3mm`  
  (Overrides width, height, pitch, pad length, and pad width.)

---

## Defaults

- **num_pins**: `2`  
- **w**: `"3.0mm"`  
- **h**: `"1.80mm"`  
- **p**: `"1.6mm"`  
- **pl**: `"0.80mm"`  
- **pw**: `"1.20mm"`

---

## Notes

- **Pitch (`p`)**  
  This value defines the distance between the centers of the two pads. In the code, it is parsed and used to position the pads.

- **Pad Length (`pl`) and Pad Width (`pw`)**  
  These values define the dimensions of each SMT pad.

- **Silkscreen Outline**  
  The footprint also generates a silkscreen path that outlines the component. The outline consists of four segments forming a rectangle that is based on:
  - X-coordinates derived from half the parsed pitch and half the component width (with a small extra offset of 0.1mm).
  - Y-coordinates derived from half the component height.
  
- **Silkscreen Reference Text**  
  A silkscreen text element is generated to indicate the reference designator. It is positioned at x = 0 and y equal to the parsed height, with a font size of 0.3.

- **Internal Functions**  
  - `getMicroMelfCoords(parameters)`  
    Computes the X–Y coordinate for each pad. For pin 1, the pad is placed at (-p/2, 0); for pin 2 it is placed at (p/2, 0).
  - `microMelfWithoutParsing(parameters)`  
    Uses the coordinate function to generate SMT pads (using a helper called `rectpad`), one for each pin.

- **Usage**  
  In test files the footprint is typically invoked via a string syntax through a footprint builder function (e.g. using `fp.string("micromelf...")`). This enables automated parsing of the footprint definition string.

---

Use these guidelines and parameter definitions to build or modify the MicroMelf footprint as needed for your PCB design projects.