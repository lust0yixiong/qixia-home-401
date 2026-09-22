// Source: PDF pp.15/18/20 = P.04 / P.07 / P.09.
// Metres, using the existing P.01 coordinate system (85.6 drawing units/m).
// Written spacing takes precedence; unlabelled wall anchors/strip endpoints are traced.
const S=85.6;
export const fixtures=[];
function add(id,room,type,x,z,circuit,height=2.65){fixtures.push({id,room,type,x,z,circuit,height});}
function row(prefix,room,type,x,z,count,spacing,circuit,height=2.65,axis='x'){
 for(let i=0;i<count;i++)add(`${prefix}-${i+1}`,room,type,x+(axis==='x'?i*spacing*S:0),z+(axis==='z'?i*spacing*S:0),circuit,height);
}
// Secondary bedroom: 1340 + 1350 between columns; 1930 between rows.
for(const [z,c] of [[306,18],[306+1.93*S,19]])row(`second-${c}`,'second','surface',435,z,2,2.69,c);
add('second-ceiling','second','ceiling',435+1.34*S,388,17);
row('master-north','master','surface',1097,298,2,2.2,14);
row('master-triple','master','surface',1194-.2*S,425,3,.2,15);
row('master-south','master','surface',1151,544,2,1,14);
add('master-cabinet','master','recessed',1044,449,13,2.35);
add('toilet','bath','recessed',765,365,20,2.35);
add('laundry','bath','recessed',851,365,22,2.35);
add('shower','bath','recessed',950,365,22,2.35);
row('wash-north','bath','recessed',791,440,2,1.24,6,2.35);
row('wash-basin','bath','recessed',765,515,2,.62,12,2.35);
add('passage','bath','recessed',898,519,6,2.35);
add('kitchen-west','kitchen','recessed',434,638,1,2.35);
row('kitchen-work','kitchen','recessed',554,655,2,1.2,1,2.35);
row('dining-west','kitchen','surface',379,773,2,1,5,2.65,'z');
row('dining-south','kitchen','surface',448,905,2,1.2,5);
// P.07: four corridor lights, 990 mm pitch, south light 510 mm from inner wall.
const last=937-.51*S;
row('entry-column','kitchen','recessed',898,last-2.97*S,3,.99,3,2.35,'z');
add('entry-last','kitchen','recessed',898,last,6,2.35);
add('flex-store','flex','ceiling',965,612,25,2.65);
row('flex-triple','flex','surface',1155-.2*S,790,3,.2,8);
add('flex-south-left','flex','surface',1155-1.11*S,905,10);
add('flex-south-middle','flex','surface',1155,905,9);
add('flex-south-right','flex','surface',1155+1.11*S,905,10);
add('balcony-north','balcony','ceiling',1372,692,11);
add('balcony-south','balcony','ceiling',1372,811,11);
export const tracks=[
 {id:'dining-track',room:'kitchen',from:[525,825],to:[694,825],height:2.65,circuit:2},
 {id:'flex-track',room:'flex',from:[953,697],to:[1284,697],height:2.65,circuit:7}
];
export const membrane={id:'entry-membrane',room:'kitchen',x:800,z:778,width:1.46,depth:2.87,height:2.35,circuit:4};
// Linear-light extents have no complete written dimensions: traced, not construction measurements.
export const strips=[
 {id:'second-linear',room:'second',from:[413,503],to:[520,503],height:2.35,circuit:16},
 {id:'toilet-cove',room:'bath',from:[729,294],to:[798,294],height:2.55,circuit:21},
 {id:'master-cove',room:'master',from:[1009,284],to:[1009,412],height:2.55,circuit:27},
 {id:'master-linear',room:'master',from:[958,557],to:[1057,557],height:2.35,circuit:13},
 {id:'kitchen-cove',room:'kitchen',from:[355,727],to:[695,727],height:2.35,circuit:null},
 {id:'flex-linear',room:'flex',from:[1007,644],to:[1287,644],height:2.35,circuit:null},
 {id:'flex-side-linear',room:'flex',from:[950,704],to:[950,929],height:2.65,circuit:null},
 {id:'entry-cabinet',room:'kitchen',from:[800,600],to:[858,600],height:1.08,circuit:23}
];
export const lightingGroups=[['kitchen','餐厨与玄关'],['master','主卧'],['second','次卧'],['bath','卫浴与洗衣'],['flex','多功能区'],['balcony','阳台']];
