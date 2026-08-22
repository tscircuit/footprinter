export function getStandardizedFootprintDimensions(type: 'QFN' | 'SOIC', pinCount: number): { pitch: number; width: number } {
  if (type === 'QFN') {
    return { pitch: 0.5, width: pinCount <= 16 ? 3.0 : 4.0 };
  }
  return { pitch: 1.27, width: 3.9 };
}
