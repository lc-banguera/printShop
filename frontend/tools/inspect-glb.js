#!/usr/bin/env node
import path from 'path';
import { NodeIO } from '@gltf-transform/core';

const glbPath = 'C:\\Users\\Carlos Banguera\\Desktop\\printShop\\frontend\\src\\resources\\mockup\\t_shirt.glb';
const io = new NodeIO();
let doc;
try {
  doc = await io.read(glbPath);
} catch (e) {
  console.error('Failed to read GLB:', e.message || e);
  process.exit(2);
}

const root = doc.getRoot();
const meshes = root.listMeshes();
const materials = root.listMaterials();
const textures = root.listTextures();
const images = root.listImages ? root.listImages() : [];

console.log('--- Textures ---');
textures.forEach((t, i) => {
  console.log(`Texture[${i}].name = ${t.getName() || '<unnamed>'}`);
});
console.log('\n--- Images ---');
(images || []).forEach((img, i) => {
  console.log(`Image[${i}].name = ${img.getName() || '<unnamed>'}`);
});


console.log('--- GLB Meshes and Materials ---');
meshes.forEach((mesh, mi) => {
  console.log(`Mesh[${mi}].name = ${mesh.getName() || '<unnamed>'}`);
  const primitives = mesh.listPrimitives();
  primitives.forEach((prim, pi) => {
    const mat = prim.getMaterial();
    if (mat) {
      console.log(`  Primitive[${pi}] -> material.name = ${mat.getName() || '<unnamed-material>'}`);
      // Attempt to read base color factor if present
      try {
        const pbr = mat.getPBRMetallicRoughness && mat.getPBRMetallicRoughness();
        if (pbr && typeof pbr.getBaseColorFactor === 'function') {
          const factor = pbr.getBaseColorFactor();
          console.log(`    baseColorFactor = ${JSON.stringify(factor)}`);
        } else {
          // Fallback: inspect extras/values
          console.log('    baseColorFactor = <not available>');
        }
      } catch (e) {
        console.log('    baseColorFactor = <error reading>');
      }
    } else {
      console.log(`  Primitive[${pi}] -> material = <none>`);
    }
  });
});

console.log('\n--- Materials (global list) ---');
const knitMaterials = materials.filter((m) => (m.getName() || '').toLowerCase().includes('knit_fleece') || (m.getName() || '').toLowerCase().includes('knit_fleece_terry') || (m.getName() || '').toLowerCase().includes('knit'));
knitMaterials.forEach((mat, idx) => {
  const name = mat.getName() || '<unnamed>';
  console.log(`\n--------------------------------\nMaterial[${idx}].name = ${name}`);
  const unlit = !!mat.getExtension('KHR_materials_unlit');
  console.log(`material.type = ${unlit ? 'unlit' : 'pbr-metallic-roughness'}`);
  // baseColorTexture
  try {
    const pbr = mat.getPBRMetallicRoughness && mat.getPBRMetallicRoughness();
    const baseTex = pbr && typeof pbr.getBaseColorTexture === 'function' ? pbr.getBaseColorTexture() : null;
    console.log(`material.map = ${baseTex ? (baseTex.getName ? baseTex.getName() : '<texture>') : '<none>'}`);
    if (pbr && typeof pbr.getBaseColorFactor === 'function') {
      console.log(`material.color = ${JSON.stringify(pbr.getBaseColorFactor())}`);
    } else {
      console.log('material.color = <not available>');
    }
    console.log(`material.metalness = ${pbr && typeof pbr.getMetallicFactor === 'function' ? pbr.getMetallicFactor() : '<n/a>'}`);
    console.log(`material.roughness = ${pbr && typeof pbr.getRoughnessFactor === 'function' ? pbr.getRoughnessFactor() : '<n/a>'}`);
  } catch (e) {
    console.log('Error reading PBR values:', e.message || e);
  }
  try {
    console.log(`material.transparent = ${mat.getAlphaMode ? mat.getAlphaMode() === 'BLEND' : '<unknown>'}`);
  } catch (e) {
    console.log('material.transparent = <error>');
  }
  try {
    console.log(`material.alphaTest = ${mat.getAlphaCutoff ? mat.getAlphaCutoff() : '<none>'}`);
  } catch (e) {
    console.log('material.alphaTest = <error>');
  }

  // vertexColors: find primitives referencing this material and check COLOR_0 attribute
  const meshesUsing = root.listMeshes().filter((mesh) => mesh.listPrimitives().some((p) => p.getMaterial && p.getMaterial() === mat));
  let vertexColors = false;
  meshesUsing.forEach((mesh) => {
    mesh.listPrimitives().forEach((prim) => {
      try {
        const matPrim = prim.getMaterial && prim.getMaterial();
        if (matPrim !== mat) return;
        const colorAttr = prim.getAttribute && prim.getAttribute('COLOR_0');
        if (colorAttr) vertexColors = true;
      } catch (e) {
        // ignore
      }
    });
  });
  console.log(`material.vertexColors = ${vertexColors}`);
  console.log('--------------------------------');
});

console.log('\n--- Viewer state defaults (from store file) ---');
console.log('currentGarmentColor = #ffffff');
console.log('selectedColorIndex = 0');

console.log('\n--- End of inspection ---');
