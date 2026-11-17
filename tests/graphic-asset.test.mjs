import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const bytes=readFileSync(new URL('../public/models/graphic-protagonist.glb',import.meta.url));
const json=JSON.parse(bytes.subarray(20,20+bytes.readUInt32LE(12)).toString());
test('graphic asset is a complete glTF 2 binary with a renderable scene',()=>{
 assert.equal(bytes.toString('ascii',0,4),'glTF');assert.equal(bytes.readUInt32LE(4),2);assert.equal(bytes.readUInt32LE(8),bytes.length);assert.ok(json.scenes[0].nodes.length>0);assert.ok(json.meshes.length>0);
});
test('GLB preserves the joint names consumed by the Remotion controller',()=>{
 const names=new Set(json.nodes.map(n=>n.name));
 for(const name of ['GraphicProtagonist','Torso','Head','Mouth','Brow_L','Brow_R','Hip_L','Hip_R','Knee_L','Knee_R','Shoulder_L','Shoulder_R','Elbow_L','Elbow_R'])assert.ok(names.has(name),name);
 for(const n of json.nodes)for(const field of ['translation','rotation','scale'])if(n[field])assert.ok(n[field].every(Number.isFinite));
});
test('asset has triangle indices and stays within the study polygon budget',()=>{
 let triangles=0;for(const m of json.meshes)for(const p of m.primitives){assert.ok(p.attributes.POSITION!==undefined);assert.ok(p.attributes.NORMAL!==undefined);triangles+=json.accessors[p.indices].count/3;}
 assert.ok(triangles>1000&&triangles<15000,`${triangles} triangles`);
});
