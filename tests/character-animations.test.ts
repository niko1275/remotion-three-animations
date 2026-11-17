import {test} from 'node:test';
import assert from 'node:assert/strict';
import {animationPose,blendPose,smooth} from '../src/components/characters/CharacterAnimations.ts';
const actions=['idle','walk','sit','talk','think','surprise','fear','lookAround'];
test('every action yields finite, repeatable joint poses at story boundaries',()=>{
 for(const a of actions)for(const f of [0,1,8,30,89,90,180,270,360,449]){
  const p=animationPose(a,f);assert.ok(Object.values(p).every(Number.isFinite));assert.deepEqual(p,animationPose(a,f));
 }
});
test('pose blends preserve both endpoints and clamp outside the transition',()=>{
 const a=animationPose('idle',0),b=animationPose('sit',0);
 for(const t of [-1,0])assert.deepEqual(blendPose(a,b,t),a);
 for(const t of [1,2])for(const k of Object.keys(b))assert.ok(Math.abs(blendPose(a,b,t)[k]-b[k])<1e-12);
});
test('walking alternates opposing legs and bends the swing knee',()=>{
 const p=animationPose('walk',6);assert.ok(p.hipL>0&&p.hipR<0);assert.ok(p.kneeR<0);assert.equal(p.hipL,-p.hipR);
});
test('sitting bends hips and knees in opposite directions',()=>{
 const p=animationPose('sit',20);assert.ok(p.hipL>1.3&&p.kneeL< -1.3);assert.equal(p.hipL,p.hipR);assert.equal(p.lift,.3);
});
test('surprise eases into raised arms rather than snapping immediately',()=>{
 assert.equal(animationPose('surprise',0).armR,0);assert.ok(animationPose('surprise',4).armR>0);assert.ok(animationPose('surprise',8).armR>animationPose('surprise',4).armR);
});
test('smooth interpolation is bounded and monotonic',()=>{
 let previous=0;for(let i=-10;i<=110;i++){const v=smooth(i/100);assert.ok(v>=previous&&v>=0&&v<=1);previous=v;}
});
