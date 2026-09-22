import test from 'node:test';
import assert from 'node:assert/strict';
import {runPhotoRequest,photoFailureMessage} from '../photo-recovery.mjs';
test('late failed import does not change a newer user selection',async()=>{
 let reject,current=true;const events=[];
 const pending=runPhotoRequest({load:()=>new Promise((_,r)=>reject=r),isCurrent:()=>current,ready:()=>events.push('ready'),failed:()=>events.push('failed')});
 current=false;reject(new Error('Failed to fetch dynamically imported module'));await pending;
 assert.deepEqual(events,[]);
});
test('late successful import does not create an abandoned renderer',async()=>{
 let resolve,current=true;const events=[];
 const pending=runPhotoRequest({load:()=>new Promise(r=>resolve=r),isCurrent:()=>current,ready:()=>events.push('ready'),failed:()=>events.push('failed')});
 current=false;resolve({});await pending;assert.deepEqual(events,[]);
});
test('startup failures retain the actual error and a subsequent retry can succeed',async()=>{
 const error=new Error('Failed to fetch dynamically imported module');const events=[];
 const callbacks={isCurrent:()=>true,ready:()=>events.push('ready'),failed:e=>events.push(e)};
 await runPhotoRequest({...callbacks,load:async()=>{throw error;}});
 await runPhotoRequest({...callbacks,load:async()=>({})});
 assert.deepEqual(events,[error,'ready']);
 assert.match(photoFailureMessage(error),/刷新网页/);
 assert.match(photoFailureMessage(error),/Failed to fetch/);
 assert.match(photoFailureMessage(new Error('shader compile failed')),/显卡未能编译/);
});
