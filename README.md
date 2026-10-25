# @tscircuit/footprinter

[Online Gallery](https://tscircuit.github.io/footprinter/) &middot; [discord](https://tscircuit.com/join) &middot; [main tscircuit repo](https://github.com/tscircuit/tscircuit) &middot; [List of Missing Footprints](https://jlcsearch.tscircuit.com/footprint_index/list)

Footprinter is tscircuit's DSL and micro-builder for creating footprints.

![image](https://github.com/user-attachments/assets/24f7a9ba-47ef-4dd9-9a66-9536159a8ff9)

You can create very custom footprints using the `<footprint>` element, but the
compressability is poor. `footprinter` produces very short, low parameter
mini-programs for generating footprints, this makes it suitable for standardized
footprints. You can use it with any component that accepts a footprint prop, e.g.
`<chip footprint="qfp12_p0.5" />`

Here are some example footprinter strings:

```
0402
0603
cap0402
res0805
soic8_p1.27mm
dip16
PDIP-8
pinrow10
pinrow6_rows2_cols5_p2.54mm_py5.08mm_missing(3,4,8,9)
smdpinheader6
tssop20_p0.5mm
sot23
qfn24_w6_h6_p0.8mm_thermalpad_startingpin(topside,rightpin)_ccw
qfn64_thermalpad6.3mmx6.3mm_thermalvias4x4_thermalviapitch1mm_thermalviaid0.3048mm_thermalviaod0.6096mm
axial_p0.2in
do219ad
sod323he
```

You can use these like so:

```tsx
const circuitJson = fp.string("dip8_w0.5in").circuitJson()
const parameters = fp.string("dip8_w0.5in").parameters()
```

You can also programmatically build footprints like so:

```ts
import { fp } from "@tscircuit/footprinter"

fp.cap().w(0.4).h(0.2)
fp.cap().p(0.1).pw(0.1).ph(0.1) // pitch, pad width and pad height
fp.cap().metric("0402")
fp.res().imperial("01005")
fp.dip(4).w(7.62)
fp.dip(4).w(7.62).socket()
fp.pdip() // PDIP-8: 7.62 mm row spacing, 2.54 mm pitch
```

`pdip`, `pdip8`, and `PDIP-8` select the eight-pin plastic DIP package.
The footprint reuses DIP geometry, including its 0.8 mm drill and 1.6 mm pad
defaults. Override `id`/`od` for your board process, or use `w`, `p`, `wide`,
`narrow`, and `nosquareplating` as with DIP.

> [!TIP]
> Footprinter is the DSL that [text-to-footprint](https://github.com/tscircuit/text-to-footprint) uses.
> If you're unable to generate a particular footprint, try to see if you can produce it in footprinter.
> If you can't, you'll need to add some kind of representation in the DSL before it can be generated.

> [!NOTE]
> Compressability of the DSL is important because it allows an LLM to fit more examples into context,
> and not waste output tokens on verbose elements

## Contributing

Watch this [getting started with footprinter contribution guide!](https://blog.tscircuit.com/p/learn-how-to-contribute-to-tscircuits?utm_campaign=post&utm_medium=web)

https://github.com/user-attachments/assets/72596154-1410-4b2d-9e35-0e2d1af9415f

## Footprinter Strings

A footprinter string is a string that maps to a set of builder calls.

```ts
import { fp } from "@tscircuit/footprinter"

fp.string("dip4_w7.62") // same as fp.dip(4).w(7.62)
fp.string("dip4_w7.62mm") // same as fp.dip(4).w(7.62)
fp.string("dip4_w0.3in") // same as fp.dip(4).w("0.3in")
```

### Pin 1 location

Every footprint accepts a `pin1location(side,alignment)` modifier that rotates
the complete footprint in 90-degree increments. The first argument selects the
side, while the second selects the position along that side:

```ts
fp.string("soic8_pin1location(leftside,top)")
fp.string("crystal_pin1location(topside,left)")

// Builder equivalent:
fp().crystal().pin1location("topside", "left")
```

Valid pairs are `leftside|rightside` with `top|bottom`, and
`topside|bottomside` with `left|right`. Rotation preserves pin ordering, so a
mirrored-only location is rejected with an error.

### Diode polarity pins

Diode footprints assume pin 1 is the anode and pin 2 is the cathode by default.
Use `anodepin1` to record that default explicitly, or `cathodepin1` for parts
whose package numbering assigns the cathode to pin 1. These modifiers orient
the fabrication-note diode symbol and polarity labels without changing pad
numbers:

```ts
fp.string("sod123w_p3.4mm_pw0.95mm_cathodepin1")
fp.string("sod123w_p3.4mm_pw0.95mm_anodepin1")

// Builder equivalent:
fp().sod123w().p("3.4mm").pw("0.95mm").cathodepin(1)
fp().sod123w().p("3.4mm").pw("0.95mm").anodepin(1)
```

### Explicit two-pad package identity

Two rectangular pads alone do not identify the component package. Use a named
standard-family footprint when downstream tools such as a 3D renderer need an
unambiguous package identity:

```ts
fp.string("do219ad")
fp.string("sod323he")
fp.string("dfn2_w1.6mm_pl0.6mm_pw0.6mm")
```

`do-219ad` and `sod-323he` are accepted aliases and normalize to the canonical
names above. DO-219AD and SOD-323HE assign pin 1 to the cathode at negative X
and pin 2 to the anode at positive X. Their land-pattern parameters (`p`, `pw`,
and `ph`) are independent from their validated mechanical parameters such as
`bodylength`, `bodywidth`, and `bodyheight`. A generic `smdpads2` footprint
remains generic and never selects one of these packages by pad dimensions.

### Rounded pads

Every footprint accepts a `rounded${radius}` modifier that applies the requested
corner radius to all rectangular copper pads. The radius is clamped to half of
each pad's smaller dimension:

```ts
fp.string("soic8_rounded0.2mm")

// Builder equivalent:
fp().soic(8).rounded("0.2mm")
```

Circular, pill-shaped, and polygonal pads keep their original geometry.

### Sparse pin grids

`pinrow` can represent relay and connector layouts that omit positions from a
regular grid. `p` controls the column pitch, `py` controls the row pitch, and
`missing(...)` uses row-major nominal positions:

```ts
fp.string(
  "pinrow6_rows2_cols5_p2.54mm_py5.08mm_missing(3,4,8,9)_nosquareplating",
)
```

### BGA pin numbering

Use `pinnumbering(...)` to select a naming convention for every populated BGA
ball without changing the pad geometry:

```ts
fp.string("bga6_grid3x2_pinnumbering(columnmajor)")
fp().bga(6).grid("3x2").pinnumbering("columnmajor")
```

| Convention | Output hints | Traversal |
| --- | --- | --- |
| `rowmajor` | Numeric ID and ball coordinate | A1, A2, A3, then B1, B2, B3 |
| `columnmajor` | Numeric ID and ball coordinate | A1, B1, then A2, B2, then A3, B3 |
| `ballcoords` | Ball coordinate only | No synthetic numeric ID |

Explicit conventions use BGA row letters `ABCDEFGHJKLMNPRTUVWY`, followed by
`AA`, `AB`, and so on. They omit I, O, Q, S, X, and Z. Check this alphabet against
the exact package's pin diagram. Omitting `pinnumbering` preserves the legacy
row-major numbers and plain A–Z row alphabet, extended to AA after Z.

Numeric IDs start at 1 and skip missing balls. Coordinate arguments to
`missing(...)` use the selected row alphabet; numeric arguments always refer to
nominal row-major grid positions before omissions, regardless of the numbering
convention. Naming is relative to `tlorigin`, `blorigin`, `trorigin`, or
`brorigin`; these options determine which physical corner holds A1. Explicit
conventions align the corner marker with that labeled A1 corner; omitted options
preserve the legacy marker placement.
`pin1location(...)` can rotate numeric modes afterward. Since `ballcoords` has
no numeric pin 1, use the BGA origin options to orient coordinate-only footprints.

For example, a 25×25 layout with A1 absent and column-major component IDs can
be expressed as:

```ts
fp.string(
  "bga624_grid25x25_p0.8_pad0.4_missing(A1)_blorigin_pinnumbering(columnmajor)",
)
// B1 → 1, C1 → 2, J1 → 8, AA1 → 20, A2 → 25, AE25 → 624
```

## Getting JSON output from the builder

Use the `.circuitJson()` function to output [tscircuit circuit JSON](https://github.com/tscircuit/circuit-json)

```ts
fp.string("res0402").circuitJson()
/*
[
  {
    type: 'pcb_smtpad',
    x: -0.5,
    y: 0,
    width: 0.6000000000000001,
    height: 0.6000000000000001,
    layer: 'top',
    shape: 'rect',
    pcb_smtpad_id: '',
    port_hints: [ '1' ]
  },
  {
    type: 'pcb_smtpad',
    x: 0.5,
    y: 0,
    width: 0.6000000000000001,
    height: 0.6000000000000001,
    layer: 'top',
    shape: 'rect',
    pcb_smtpad_id: '',
    port_hints: [ '2' ]
  }
]
*/
```

## Generation Defaults

- Pins are CCW starting at the top left
- Y is upward-positive, X is rightward-positive

## Slop

Slop is a "sloppy" definition, it really doesn't have enough
information to draw a footprint, i.e. it's missing critical dimensions.

footprinter is extremely tolerant to Slop, because it's useful
when you're iterating incrementally towards a fully constrained
design, or when you're using footprinter strings as an output format
for an AI.

Generally when footprinter is interpreting a sloppy definition, it will use
industry best practices or otherwise "reasonable" defaults. In theory, upgrading
footprinter could cause the defaults to change, which is why sloppy definitions
are generally not desirable.

An example of a sloppy definition is `bga64`. It's very underconstrained and
unlikely to be correct (what's the pitch? pad size?). tscircuit strict mode
or a linter will eventually error if it sees these.

## Adding a new footprint function

You can add new footprint functions by introducing a new function in the [src/fn directory](https://github.com/tscircuit/footprinter/tree/main/src/fn). You'll also need to export it from the [footprint function index file](https://github.com/tscircuit/footprinter/blob/main/src/fn/index.ts)

After you've written the function, you can introduce a quick test, e.g. [soic.test.ts](https://github.com/tscircuit/footprinter/blob/main/tests/soic.test.ts)
Currently it's not possible to see if a given definition is sloppy.

To run tests, just run `npx ava ./tests/soic.test.ts` or whatever your test
file is.

You'll sometimes see this `logSoup` function- this makes some debug output
appear at https://debug.tscircuit.com. Make sure to hit "pcb" and "pcb_renderer"
after the design.
