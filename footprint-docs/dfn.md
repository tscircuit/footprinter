# Dual Flat No-lead (dfn)

The dfn footprint is similar in pin arrangement to a traditional SOIC but features a modified silkscreen layout. It arranges the pads in a counter‐clockwise order with an arrow marker uniquely identifying pin 1.

---

## Syntax

Use the following naming convention – parameters are concatenated to form a string:

  dfn{num_pins}_w{width}_p{pitch}_pl{padLength}_pw{padWidth}

For example:  
  dfn8_w5.3mm_p1.27mm_pl1mm_pw0.6mm

*Alternatively*, you can use the fluent API via the footprinter’s string method:
  fp.string("dfn8_w5.3mm_p1.27mm")  
which uses default pad sizes if not specified.

---

## Examples

- **Default DFN footprint:**  
  `dfn8_w5.3mm_p1.27mm`  
  (Creates an 8-pin DFN with a body width of 5.3 mm, a pitch of 1.27 mm, pad length 1 mm and pad width 0.6 mm.)

- **Custom DFN footprint:**  
  `dfn16_w7mm_p1.5mm_pl1.2mm_pw0.7mm`  
  (Creates a 16-pin DFN with a 7 mm width, 1.5 mm pitch, 1.2 mm pad length, and 0.7 mm pad width.)

---

## Defaults

- **num_pins:** 8 (default from the underlying SOIC definition)
- **w (body width):** "5.3mm" (default if not provided)
- **p (pitch):** "1.27mm" (default)
- **pl (pad length):** "1mm" (if not provided)
- **pw (pad width):** "0.6mm" (if not provided)

---

## Notes

- **Coordinate Calculation:**  
  Pads are positioned using counter-clockwise (CCW) coordinates via the helper function getCcwSoicCoords. The parameter `widthincludeslegs` is set to true so that the leg placement is automatically adjusted.

- **Pad Generation:**  
  Each pad is created using the provided (or default) pad length (`pl`) and pad width (`pw`) via a rectangular pad generator.

- **Silkscreen Layout:**  
  The silkscreen consists of two parts:
  - **Corner paths:** Four silkscreen lines are drawn at the four corners of the package. These lines are computed based on the overall body width (with a small adjustment) and the vertical span (sh) derived from the number of pins and pitch.
  - **Arrow marker:** An arrow is drawn to indicate the location of pin 1. Its size is determined as one-quarter of the pitch, and its tip is placed slightly outside the left edge of the body.
  
- **Silkscreen Reference Text:**  
  A reference text (usually the component reference like “{REF}”) is placed centered horizontally at a vertical offset computed as half the package height (sh/2) plus an offset (0.4) with a font size proportional to sh.

- **Parameter Usage:**  
  All parameters are used in the footprint generation:
  - `p`: the pitch (distance between the centers of pads on the left/right side)
  - `pl`: pad length, influences both pad size and silkscreen geometry
  - `pw`: pad width
  - `w`: overall body width  
  - `num_pins`: total number of pins (arranged symmetrically on two sides)

---

This documentation is intended to be concise and serve as a reference for generating DFN footprints using the provided code. Use the examples to quickly prototype and then adjust parameters as necessary.