/**
 * tscircuit/footprinter - Standard SOIC IC Models
 */
export function getSoicFootprint(pinCount: 8 | 14 | 16, wide: boolean = false) {
  const pitch = 1.27;
  const bodyWidth = wide ? 7.5 : 3.9;
  const padLength = 1.5;
  const padWidth = 0.6;

  return {
    package: `SOIC-${pinCount}${wide ? '-WIDE' : ''}`,
    pins: pinCount,
    pitch,
    dimensions: { bodyWidth, padLength, padWidth }
  };
}
