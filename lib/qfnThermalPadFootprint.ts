/**
 * tscircuit/footprinter - QFN IC Footprints with Thermal Pads
 */
export interface QfnFootprintOptions {
  pinCount: 16 | 24;
  pitch?: number; // default 0.5mm
  bodySize?: number; // 4x4mm or 5x5mm
  thermalPadSize?: number;
}

export function generateQfnFootprintJson(options: QfnFootprintOptions) {
  const pitch = options.pitch ?? 0.5;
  const pinCount = options.pinCount;
  const bodySize = options.bodySize ?? (pinCount === 16 ? 4.0 : 5.0);
  const thermalPad = options.thermalPadSize ?? (bodySize * 0.55);

  return {
    type: 'footprint',
    package: `QFN-${pinCount}`,
    body: { width: bodySize, height: bodySize },
    thermalPad: { width: thermalPad, height: thermalPad, pin: 'EP' },
    pitch
  };
}
