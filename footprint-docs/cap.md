# cap

## Syntax

Use the cap footprint by specifying its size with an imperial package identifier. For passive footprints the syntax is:

```
cap{imperial}
```

For example, using the fluent chain:

```
fp().cap().imperial("0402")
```

or via a string definition:

```
fp.string("cap_imperial0402").circuitJson()
```

## Examples

- **cap0402**  
  Creates a capacitor footprint for a 0402 package.

- **cap1210**  
  Creates a capacitor footprint for a 1210 package.

## Defaults

- **Parameters are defined via the PassiveDef type.**  
  These include:
  - `tht`: flag for through-hole mounting (boolean)
  - `p`: Pitch distance between pad centers (default is determined by the passive function)
  - `pw`: Pad width
  - `ph`: Pad height (or pad length, if applicable)
  - `metric` and/or `imperial`: Sizing identifiers (e.g. "0402", "1210")
  - Optionally, dimensions `w` and `h` for the overall footprint

*Note:* When no explicit dimensions are provided, the passive function will derive pad dimensions based on standard sizing.

## Notes

- The **cap** footprint is generated using the common passive function. It creates an appropriate set of surface–mount pads (and plated holes if configured) for a capacitor.
- The size string provided via `imperial` (or `metric`) determines the physical sizing of the footprint. For example, passing `"0402"` converts to the respective dimensions for a 0402 capacitor.
- All parameters defined in the PassiveDef type are passed to the underlying passive function. Adjusting parameters such as `p`, `pw`, and `ph` will affect pad spacing and size.
- This footprint returns an object with two keys:
  - `circuitJson`: an array of circuit JSON (soup) elements describing the footprint.
  - `parameters`: the parsed parameters used for footprint generation.

Use this documentation to quickly integrate and test the cap footprint within your PCB design workflow.