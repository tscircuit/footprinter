/**
 * tscircuit - dip-packages
 */
export function getDipPackage(pins: number) { return { name: `DIP-${pins}`, pitch: 2.54 }; }
