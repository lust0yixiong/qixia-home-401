// Written dimensions, in metres. Plan anchors are traced separately from P.01.
// An anchor does not imply that an unlabelled wall/appliance size was measured.
export const interiorLayout = {
  ceiling: 2.65, // EL.05 / EL.07: 2350 clear below bulkhead + 300 bulkhead.
  kitchen: { baseTop: .80, upperBottom: 1.55, upperHeight: .80 }, // EL.01
  westCounter: { top: .97 }, // EL.04, same datum as north narrow counter
  entry: { top: 1.10, depth: .25 }, // EL.04 (1100 datum) / P.12; finish in EL.02
  island: { width: 2, depth: 1.10, top: 1.01, topThickness: .12, seatingRecess: .25, endPanel: .05 }, // EL.08 outer dimensions; 250 mm recess confirmed by user; end thickness approximated from rendering 03
  table: { width: 1.90, depth: .90, top: .80, topThickness: .06 }, // EL.08
  secondWardrobe: { width: 2.05, depth: .51, height: 2.65, doorSplit: 2.19, front: '-z' }, // P.12 / EL.03
  masterWardrobe: { overallLength: 2.27, returnWidth: 1.25, depth: .60, height: 2.35 }, // P.12 / EL.05; depth traced
  washerBay: { width: .65, depth: .65 }, // P.12, not appliance manufacturer dimensions
  laundrySide: { width: .47, depth: .45, lowerHeight: .74 }, // P.12 / EL.07
  // Pull-out face width = rearSideDepth 340; insertion depth = sideBay + endStorage 680.
  // Pull-out travel and shelf details are illustrative, not documented dimensions.
  vanity: { basinBay: .90, sideBay: .58, depth: .45, top: .80, mirrorBottom: 1.00, mirrorHeight: .80, upperHeight: .55, endStorage: .10, rearSideDepth: .34, rearPierDepth: .24, pulloutBase: .08, pulloutTop: 2.35, pulloutTravel: .55, frontPlanZ: 502 }, // P.12 / EL.03: 200 + 800 + 550 above the 800 mm counter
  flexWardrobe: { width: 3.40, depth: .60, height: 2.65, serviceWidth: .80, serviceDepth: .80 }, // P.12 / EL.01
  flooring: { main: [.75, 1.50], second: [1.50, .75], wet: [.30, .30], balcony: [.40, .40] }, // P.08
};
