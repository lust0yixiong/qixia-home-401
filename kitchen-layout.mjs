// P.12 dimensions are millimetres. This local layout is constrained by the
// dimension chains, rather than independently sampled screen coordinates.
const mm = n => n / 1000;
const wallThickness = mm(180);
const westInside = (340 - 855) / 85.6 + wallThickness / 2;
const northWestInside = (400 - 855) / 85.6 + wallThickness / 2;
const southInside = (945 - 610) / 85.6 - wallThickness / 2;
const entryDepth = mm(250);
const entryFront = southInside - entryDepth;
const longSide = { x: westInside, z: entryFront - mm(2240), width: mm(600), depth: mm(2240) };
const shortSide = { x: northWestInside, z: longSide.z - mm(1800), width: mm(440), depth: mm(1800), endRadius: mm(440) };
const island = { x: longSide.x + longSide.width + mm(1360), z: entryFront - mm(1530) - mm(1100), width: mm(2000), depth: mm(1100) };
const table = { x: island.x + island.width, z: island.z + mm(200), width: mm(1900), depth: mm(900) };
const cooking = { x: island.x, z: island.z - mm(1630), width: mm(2000), depth: mm(530) };
export const kitchenLayout = { source: 'P.12 固定家具尺寸图', longSide, shortSide, island, table, cooking, entryFront, entryDepth, southInside, wallStepZ: longSide.z - wallThickness / 2, clearances: { westToIsland: mm(1360), islandToEntry: mm(1530), cookingBackToIsland: mm(1630) } };
export const planX = x => x * 85.6 + 855;
export const planZ = z => z * 85.6 + 610;

// EL.04: sill/counter at 970 mm and opening height 1380 mm.
// The unlabelled opening width is traced from P.01, not a verified dimension.
export const kitchenWindow = { wallPlanX: 400, startPlanZ: 596, endPlanZ: 675, sill: mm(970), height: mm(1380), trim: mm(40), panes: 1, widthSource: 'P.01 approximate trace', heightSource: 'EL.04 dimensions' };

// P.12: 1500 mm cooking run, 500 mm tall end unit, then an 1180 mm
// combined pier/fridge bay. The pier/bay split is traced from P.01.
const cookingWallX = (526 - 855) / 85.6;
const cookingFrontZ = (620 - 610) / 85.6;
export const cookingWallLayout = {
  x: cookingWallX, frontZ: cookingFrontZ, depth: .53,
  cookingWidth: 1.50, towerWidth: .50, frontStorageDepth: .20, towerSetback: 0,
  cabinetHeight: 2.35,
  pierX: cookingWallX + 2.00, pierWidth: .30,
  dividerBackZ: (501 - 610) / 85.6,
  fridgeX: cookingWallX + 2.30, fridgeBayWidth: .88,
  combinedPierFridgeWidth: 1.18,
  serviceX: cookingWallX + 3.18,
  serviceRightX: (858 - 855) / 85.6,
  serviceDepth: .35,
  source: 'P.01 / P.12 / EL.01',
  inferred: ['300/880 mm pier/fridge split', 'unlabelled appliance dimensions']
};

// Keep the exported kitchen footprint consistent with the revised built assembly.
kitchenLayout.cooking = {x: cookingWallX, z: cookingFrontZ - .53, width: 2.00, depth: .53};
delete kitchenLayout.clearances.cookingBackToIsland;

// P.01: gas-meter enclosure at the north end of the 440 mm side cabinet.
// Width follows P.12; the shallow depth and plan stations are traced, not labelled.
// EL.01 shows timber access panels above the 970 mm side-counter datum.
export const kitchenGasCabinet = {
  x: northWestInside, width: .44,
  backPlanZ: 554, frontPlanZ: 575,
  bottom: .97, top: 2.35,
  returnPier: {startPlanZ: 539, endPlanZ: 554},
  doorStack: [[409,533],[447,530],[409,527]],
  doorLinePlanZ: 535,
  spiceShelf: {width: .60, depth: .22, bottom: 1.15, thickness: .05},
  source: 'P.01 / P.12 / EL.01',
  inferred: ['enclosure depth and wall-return stations', 'folding-leaf division', 'shelf width/depth']
};
