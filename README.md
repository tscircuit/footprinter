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
pinrow10
tssop20_p0.5mm
sot23
qfn24_w6_h6_p0.8mm_thermalpad_startingpin(topside,rightpin)_ccw
axial_p0.2in
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
```

> [!TIP]
> Footprinter is the DSL that [text-to-footprint](https://github.com/tscircuit/text-to-footprint) uses.
> If you're unable to generate a particular footprint, try to see if you can produce it in footprinter.
> If you can't, you'll need to add some kind of representation in the DSL before it can be generated.

> [!NOTE]
> Compressability of the DSL is important because it allows an LLM to fit more examples into context,
> and not waste output tokens on verbose elements

## Contributing

Watch this [getting started with footprinter contribution guide!](https://blog.tscircuit.com/p/learn-how-to-contribute-to-tscircuits?utm_campaign=post&utm_medium=web)

## Footprinter Strings

A footprinter string is a string that maps to a set of builder calls.

```ts
import { fp } from "@tscircuit/footprinter"

fp.string("dip4_w7.62") // same as fp.dip(4).w(7.62)
fp.string("dip4_w7.62mm") // same as fp.dip(4).w(7.62)
fp.string("dip4_w0.3in") // same as fp.dip(4).w("0.3in")
```

## Getting JSON output from the builder

Use the `.soup()` function to output [tscircuit soup JSON](https://github.com/tscircuit/soup)

```ts
fp.string("res0402").soup()
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
