# Minimelf Footprint

The `minimelf` footprint defines a small, two‐pin surface‐mount component footprint. It generates a set of rectangular pads along with a silkscreen outline and reference text.

---

## Syntax

```
minimelf[num_pins]_w{width}_h{height}_p{pitch}_pl{pad_length}_pw{pad_width}
```

For example, using default parameters:
```
minimelf2_w5.40mm_h2.30mm_p3.5mm_pl1.30mm_pw1.70mm
```

---

## Examples

- `minimelf_w5.40mm_h2.30mm_p3.5mm_pl1.30mm_pw1.70mm`
- `minimelf2_w5.40mm_h2.30mm_p3.5mm`

> **Usage:** In test files, you might use it via the footprinter’s string method:
>
> ```ts
> const circuitJson = fp.string("minimelf").circuitJson()
> ```
>
> This returns the PCB JSON with two pads and the silkscreen outline.

---

## Defaults

- **num_pins:** `2`
- **w (width):** `"5.40mm"` – Defines the overall width of the footprint.
- **h (height):** `"2.30mm"` – Defines the overall height of the footprint.
- **p (pitch):** `"3.5mm"` – Used for calculating pad placement offsets.
- **pl (pad length):** `"1.30mm"` – Sets the length of each pad.
- **pw (pad width):** `"1.70mm"` – Sets the width of each pad.

---

## Notes

- **fn:** The footprint name string. This parameter is required by the Zod schema but is generally set by the system.
- **Pad Generation:** The function uses a helper function (`miniMelfWithoutParsing`) to generate the pads. It computes each pad’s coordinates using a simple rule:
  - For pin 1: `{ x: -p/2, y: 0 }`
  - For pin 2: `{ x: p/2, y: 0 }`
- **Silkscreen Elements:**  
  - A silkscreen line is drawn around the footprint. Its route is defined by computing edge coordinates from the width, height, and pitch parameters.
  - A silkscreen reference text is created using the `silkscreenRef` helper, placed at a vertical offset from the footprint center.
- **Units Conversion:**  
  - The function calls `length.parse()` on each dimension to convert the string values (e.g., `"5.40mm"`) into numerical values in millimeters.
- **Return Value:**  
  - The function returns an object containing:
    - `circuitJson`: An array of PCB elements (pads and silkscreen paths/text) that make up the footprint.
    - `parameters`: The parsed parameters (with defaults applied) used to generate the footprint.

---

This documentation is intended to provide an overview of the `minimelf` footprint function, its syntax, defaults, and internal implementation details useful for debugging, testing, or further development.