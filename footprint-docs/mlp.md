# MLP Footprint

The MLP footprint is built on top of the quad package definition. It uses the base quad definition and transformation but customizes two key parameters:  
- It forces the pads (legs) to be placed inside the package by setting `legsoutside` to false.  
- It enables a thermal pad by default by setting `thermalpad` to true if not already defined.

---

## Syntax

```
mlp{num_pins}_w{width}_h{height}_p{pitch}_[other optional parameters]
```

_For example:_  
```
mlp8_w5.3mm_h5.3mm_p1.27mm
```

---

## Examples

- `mlp8_w5.3mm_h5.3mm_p1.27mm`  
  (An 8‑pin MLP footprint with a package width and height of 5.3mm and a pitch of 1.27mm.)

---

## Defaults

- **num_pins**: Inherited from the base quad definition (default is typically 8 if not specified).
- **legsoutside**: Forced to **false** (pads are placed inside the package).
- **thermalpad**: Defaults to **true** if not explicitly provided.
- **w, h, p, pl, pw**: Inherited from the quad footprint parameters:
  - **w**: Package width.
  - **h**: Package height.
  - **p**: Pitch distance between the centers of pins on the left and right sides.
  - **pl**: Pad (or leg) length.
  - **pw**: Pad width.

---

## Notes

- The MLP footprint calls the generic quad footprint function after modifying parameters, so it shares all parameter behaviors of quad footprints.
- Ensure that all parameters (e.g. width, height, pitch, pad length, pad width) are provided using the corresponding functions or inline string notation.
- Example usage in tests (conceptual):  
  ```tsx
  import { fp } from "footprinter"

  // Using the string notation:
  const circuitJson = fp.string("mlp8_w5.3mm_h5.3mm_p1.27mm").circuitJson()
  
  // Or using the chained API:
  const circuitJson = fp().mlp(8).w("5.3mm").h("5.3mm").p("1.27mm").circuitJson()
  ```
- The MLP footprint is intended for packages where the leads (pads) are not extended outside the package outline and a thermal pad is required.

---

By overriding the `legsoutside` and `thermalpad` settings, the MLP footprint differentiates itself from other quad or SOIC footprints while still leveraging the common quad transformation logic.