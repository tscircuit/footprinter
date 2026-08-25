export function getPowerTransistorFootprint(packageType: 'TO220' | 'TO247'): { pinPitch: number; holeDiameter: number } {
  if (packageType === 'TO220') {
    return { pinPitch: 2.54, holeDiameter: 1.0 };
  }
  return { pinPitch: 5.45, holeDiameter: 1.6 };
}
