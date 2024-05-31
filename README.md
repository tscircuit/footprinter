# @tscircuit/footprinter

Footprinter is tscircuit's DSL and micro-builder for creating footprints.

> Footprinter is the DSL that [text-to-footprint](https://github.com/tscircuit/text-to-footprint) uses.
> If you're unable to generate a particular footprint, try to see if you can produce it in footprinter.
> If you can't, you'll need to add some kind of representation in the DSL before it can be generated.

You can create very custom footprints using the `<footprint>` element, but the
compressability is poor. `footprinter` produces very short, low parameter
mini-programs for generating footprints, this makes it suitable for standardized
footprints.

> [INFO]
> Compressability of the DSL is important because it allows an LLM to fit more examples into context,
> and not waste output tokens on verbose elements

Here are some example programs:

```ts
import { fp } from "@tscircuit/footprinter"

fp.cap().w(0.4).h(0.2)
fp.cap().p(0.1).pw(0.1).ph(0.1) // pitch, pad width and pad height
fp.cap().metric("0402")
fp.res().imperial("01005")
fp.dip(4).w(7.62)
fp.dip(4).w(7.62).socket()
```

## Footprinter Strings

A footprinter string is a string that maps to a set of builder calls.

```ts
import { fp } from "@tscircuit/footprinter"

fp.string("dip4_w7.62") // same as fp.dip(4).w(7.62)
fp.string("dip4_w7.62mm") // same as fp.dip(4).w(7.62)
fp.string("dip4_w0.3in") // same as fp.dip(4).w("0.3in")
```

## Magic

`footprinter` comes with a `fp.magic` function which calls a remote server that
attempts to convert the specified string into a `footprinter` string. This can
help when you're looking at a random package designator from an online site. You
should always confirm these footprints against the datasheet.

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

Currently it's not possible to see if a given definition is sloppy.
