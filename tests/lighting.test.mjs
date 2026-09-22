import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {fixtures,tracks,strips,membrane} from '../lighting-layout.mjs';
const close=(a,b)=>assert(Math.abs(a-b)<1e-8,`${a} != ${b}`);
test('P.07 labelled dimensions survive plan-to-model conversion',()=>{
 const get=id=>fixtures.find(f=>f.id===id);
 close(membrane.width,1.46);close(membrane.depth,2.87);
 close((get('master-north-2').x-get('master-north-1').x)/85.6,2.2);
 close((get('master-triple-2').x-get('master-triple-1').x)/85.6,.2);
 close((get('second-19-1').z-get('second-18-1').z)/85.6,1.93);
 close((get('second-18-2').x-get('second-18-1').x)/85.6,2.69);
 close((get('wash-basin-2').x-get('wash-basin-1').x)/85.6,.62);
 const column=[1,2,3].map(i=>get(`entry-column-${i}`));column.push(get('entry-last'));
 for(let i=1;i<4;i++)close((column[i].z-column[i-1].z)/85.6,.99);
 close((937-column[3].z)/85.6,.51);
});
test('ceiling layout counts, heights, and references stay explicit',()=>{
 assert.equal(fixtures.length,41);assert.equal(tracks.length,2);
 const all=[...fixtures,...tracks,...strips,membrane];assert.equal(new Set(all.map(x=>x.id)).size,all.length);
 assert(fixtures.every(f=>f.height===2.35||f.height===2.65));
 assert(fixtures.filter(f=>f.id.startsWith('master-triple')).every(f=>f.circuit===15));
 assert(fixtures.filter(f=>f.id.startsWith('balcony')).every(f=>f.circuit===11));
});
test('bundled internet texture files match the publisher manifests',()=>{
 const root=new URL('../assets/materials/',import.meta.url);
 const files=JSON.parse(readFileSync(new URL('sources.json',root)));
 assert.equal(files.length,18);
 for(const item of files){const bytes=readFileSync(new URL(item.file,root));assert.equal(bytes.length,item.size,item.file);assert.equal(createHash('md5').update(bytes).digest('hex'),item.md5,item.file);}
});
