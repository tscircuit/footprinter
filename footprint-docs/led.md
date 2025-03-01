# LED

## Syntax

Use the LED footprint by passing a PassiveDef object with the following parameters:

```
led({
  tht,        // If true, a through‐hole style footprint is generated; otherwise SMT pads are used.
  p,          // Pitch: distance between centers of left/right pads.
  pw,         // Pad width.
  ph,         // Pad height.
  metric,     // (Optional) Standard metric size string (e.g. "0402", "0603") to automatically infer dimensions.
  imperial,   // (Optional) Standard imperial size string (e.g. "01005", "0201") to automatically infer dimensions.
  w,          // (Optional) Overall width when using a through‐hole (THT) layout.
  h           // (Optional) Overall height when using a through‐hole (THT) layout.
})
```

Alternatively, if using standard sizes with the passive interface, you can use:

```
led{imperial}
```

which parses a footprint string such as `"0402"` to set the parameters automatically.

## Examples

- `led_imperial0402`  
  Generates an LED footprint with size defined by the imperial "0402" standard in SMT style (i.e. `tht` is false).

- Using explicit parameters for an LED with SMT pads:

  ```js
  led({
    tht: false,
    p: 2.5,
    pw: 0.5,
    ph: 0.5
  })
  ```

- Using explicit parameters for an LED with through‐hole pads:

  ```js
  led({
    tht: true,
    p: 2,
    pw: 0.5,
    ph: 0.5,
    metric: "mm",
    w: 5,
    h: 2
  })
  ```

## Defaults

- There are no LED-specific defaults; the footprint uses the defaults provided by the passive footprint function.
- When using a size string (e.g. `"0402"` or `"0603"`):
  - The corresponding standard dimensions are inferred based on common passive component footprints.
- All parameters in the PassiveDef are used in the function, so be sure to specify any desired overrides.

## Notes

- `p`: Sets the pitch (distance between the centers of the left and right pads).
- `pw` and `ph`: Define the pad dimensions.
- `tht`: Determines the footprint style.
  - `false`: Creates SMT pads (typically two rectangular pads—one for each side).
  - `true`: Creates plated through‐hole pads.
- The optional parameters `metric` or `imperial` allow standard footprint sizes to be applied automatically.
- When using this footprint function, ensure all desired parameters are provided to accurately define the LED package.

Use this concise documentation to integrate and test the LED footprint using the footprint test examples.