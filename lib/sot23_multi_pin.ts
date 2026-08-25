export function getSot23MultiPinDimensions(pinCount: 5 | 6): { pinPitch: number; bodyWidthMm: number } {
  return { pinPitch: 0.95, bodyWidthMm: pinCount === 5 ? 1.6 : 1.75 };
}
