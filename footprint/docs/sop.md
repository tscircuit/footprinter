## `sop`

### Syntax
`SOP{ pad_width, pad_height, body_width, body_height, pitch, y0, x0, rotation, origin }`

### Examples
- `SOP{ 3.2, 2.8, 8.1, 7.6, 2.54, -0.15, -1.45, 0, (1.57, -0.75) }`

### Defaults
- `pad_width`: None
- `pad_height`: None
- `body_width`: None
- `body_height`: None
- `pitch`: None
- `y0`: None
- `x0`: None
- `rotation`: None
- `origin`: None

### Notes
- `pad_width` and `pad_height` define the dimensions of the pads.
- `body_width` and `body_height` define the dimensions of the body.
- `pitch` represents the distance between the centers of two adjacent pins.
- `y0` and `x0` represent the placement coordinates of the pin 1.
- `rotation` sets the rotation angle of the footprint.
- `origin` specifies the origin point of the footprint.
- All dimensions are in millimeters.
- The pin 1 should be on the left side of the footprint.
- The component body should be below the pads.
- Positive y-axis points downwards.
- Positive x-axis points towards the right side of the board.