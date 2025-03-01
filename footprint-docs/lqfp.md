# LQFP Footprint

## Overview

The LQFP footprint is implemented using the quad package function with an override: it sets the `legsoutside` parameter to true. This configuration positions the leads (pads) outside the package body, conforming to the typical leaded QFP standard.

## Syntax

```
lqfp{num_pins}_w{width}_h{height}_p{pitch}
```

For example:
- `lqfp16_w10mm_h10mm_p0.5mm`

## Parameters

- **num_pins**: Number of pins in the package (inherited from the quad footprint default; typically 8, 16, 32, etc.).
- **w**: The overall package width.
- **h**: The overall package height.
- **p**: The pitch distance between the centers of adjacent pads on one side.
- **pl**: The pad (lead) length.
- **pw**: The pad (lead) width.
- **legsoutside**: Automatically set to `true` by this function to position the legs outside.

All other parameter defaults and additional configuration follow those defined in the quad footprint implementation.

## Defaults

- **legsoutside**: `true` (set by the LQFP function)
- Other defaults (for `num_pins`, `w`, `h`, `p`, `pl`, `pw`) are inherited from the quad footprint definition.

## Examples

- `lqfp16_w10mm_h10mm_p0.5mm`
- `lqfp32_w14mm_h14mm_p0.65mm`

## Notes

- This footprint uses the quad footprint function; therefore, any parameter available for quad (such as `pw` for pad width and `pl` for pad length) is available.
- The special setting `legsoutside = true` ensures that the pads extend outside the package dimensions.
- Use all parameters as needed to adjust the footprint dimensions to match the target component.
- For further examples and in-depth parameter explanations, refer to the quad footprint documentation.