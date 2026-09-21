// P.01 shows the open stack against the south wall beside the entrance.
// Four connected leaves fold back and forth, rather than stand as a screen.
const x = (944 - 855) / 85.6;
const z = (931 - 610) / 85.6;
export const foldingDoorLayout = {
  count: 4,
  height: 2.60,
  assemblyHeight: 2.65, // EL.05 full-height assembly; 50 mm reserved for overhead hardware
  thickness: .04,
  hinges: Array.from({length: 5}, (_, i) => ({x: x + (i % 2 ? .84 : 0), z: z - i * .065})),
  track: {x, fromZ: (642 - 610) / 85.6, toZ: z, y: 2.625},
  source: 'P.01; user-confirmed four-leaf wall-side stack'
};
