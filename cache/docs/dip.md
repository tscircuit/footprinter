## `dip`

### Syntax
`Package_ dip <package_width>mm <package_height>mm <number_of_pins> DIP <pin_spacing>mm`

### Examples
- `Package_ dip 10.16 7.62 28 DIP 2.54`

### Defaults
- `Package_ dip <default_package_width>mm <default_package_height>mm <default_number_of_pins> DIP <default_pin_spacing>mm`
- `<default_package_width>`: 10.16 mm (0.4 inches)
- `<default_package_height>`: 7.62 mm (0.3 inches)
- `<default_number_of_pins>`: 28
- `<default_pin_spacing>`: 2.54 mm (0.1 inches)

### Notes
- `dip` (Dual In-line Package) footprints are commonly used for through-hole components.
- Pin numbers follow the standard DIP sequence starting from the top-left corner.
- Pin 1 is always indicated by a notch or dot on the package.
- Ensure proper landing pad and via placement to meet the manufacturer's recommended design rules.