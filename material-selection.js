// Stable, geometry-based IDs survive reloads and do not depend on Three.js UUIDs.
function hash(text) {
  let a = 2166136261, b = 5381;
  for (let i = 0; i < text.length; i++) {a = Math.imul(a ^ text.charCodeAt(i), 16777619);b = Math.imul(b, 33) ^ text.charCodeAt(i);}
  return `${(a >>> 0).toString(36)}-${(b >>> 0).toString(36)}`;
}
export function buildSurfaceRegistry(scene, materials, groups) {
  scene.updateMatrixWorld(true);
  const registry = new Map(), lookup = new WeakMap(), meshes = [], duplicates = new Map();
  const bases = new Map(groups.map(([key]) => [materials[key], key]));
  scene.traverse(object => {
    if (!object.isMesh) return;
    meshes.push(object);
    const list = Array.isArray(object.material) ? object.material : [object.material];
    const slots = new Map();lookup.set(object, slots);
    list.forEach((material, slot) => {
      const base = bases.get(material);if (!base) return;
      object.geometry.computeBoundingBox();
      const bb = object.geometry.boundingBox;
      const shape = [...object.matrixWorld.elements, ...bb.min.toArray(), ...bb.max.toArray()].map(v => Math.round(v * 100000) / 100000);
      const token = hash(JSON.stringify([base, slot, object.geometry.type, object.geometry.attributes.position.count, shape]));
      const ordinal = duplicates.get(token) || 0;duplicates.set(token, ordinal + 1);
      const key = `s-${token}-${ordinal}`;
      registry.set(key, {key, base, object, slot, number: registry.size + 1});slots.set(slot, key);
    });
  });
  return {registry, lookup, meshes};
}
export function assignSurfaceMaterial(meta, material) {
  if (Array.isArray(meta.object.material)) {const next = [...meta.object.material];next[meta.slot] = material;meta.object.material = next;}
  else meta.object.material = material;
}
export function isVisible(object) {
  for (let parent = object; parent; parent = parent.parent) if (!parent.visible) return false;
  return true;
}
export function isTap(start, end) {
  return !!start && !start.cancelled && start.id === end.pointerId && end.button === 0 && Math.hypot(end.clientX - start.x, end.clientY - start.y) <= 6;
}
export function installMaterialPicking({THREE, scene, camera, canvas, surfaces, onPick, onHint, onEnabled}) {
  const ray = new THREE.Raycaster(), position = new THREE.Vector2(), pointers = new Set();
  let enabled = false, start = null, outline = null;
  function clearHighlight() {
    if (!outline) return;
    outline.removeFromParent();outline.geometry.dispose();outline.material.dispose();outline = null;
  }
  function highlight(key) {
    clearHighlight();const meta = surfaces.registry.get(key);if (!meta) return;
    outline = new THREE.LineSegments(new THREE.EdgesGeometry(meta.object.geometry, 25), new THREE.LineBasicMaterial({color: '#ec972d', depthTest: false, transparent: true, opacity: .95}));
    outline.renderOrder = 100;outline.raycast = () => {};meta.object.add(outline);
  }
  function setEnabled(value) {
    enabled = value;start = null;canvas.classList.toggle('material-picking', value);
    if (!value) {clearHighlight();onHint('');}else onHint('点击模型选中部件；拖动仍可旋转，Esc 结束点选。');
    onEnabled(value);
  }
  canvas.addEventListener('pointerdown', e => {
    pointers.add(e.pointerId);
    if (!enabled || e.button !== 0) return;
    if (pointers.size > 1) {if (start) start.cancelled = true;return;}
    start = {id:e.pointerId, x:e.clientX, y:e.clientY, cancelled:false};
  }, true);
  canvas.addEventListener('pointermove', e => {if (start && e.pointerId === start.id && Math.hypot(e.clientX-start.x,e.clientY-start.y)>6) start.cancelled = true;}, true);
  canvas.addEventListener('pointerup', e => {
    pointers.delete(e.pointerId);const gesture = start;start = null;
    if (!enabled || !isTap(gesture,e)) return;
    const rect = canvas.getBoundingClientRect();position.set((e.clientX-rect.left)/rect.width*2-1,-(e.clientY-rect.top)/rect.height*2+1);
    scene.updateMatrixWorld(true);camera.updateMatrixWorld(true);ray.setFromCamera(position,camera);
    for (const hit of ray.intersectObjects(surfaces.meshes,false)) {
      if (!isVisible(hit.object)) continue;
      const slot = Array.isArray(hit.object.material) ? hit.face?.materialIndex ?? 0 : 0;
      const m = Array.isArray(hit.object.material) ? hit.object.material[slot] : hit.object.material;
      if (!m.visible || (m.transparent && m.opacity < .3)) continue;
      const key = surfaces.lookup.get(hit.object)?.get(slot);
      if (!key) {onHint('这处暂不支持换材质，请选择墙面、台面或柜体等部件。');return;}
      if (onPick(key) !== false) {highlight(key);onHint('已选中橙色描边部件，可继续点击其他部件。');}
      return;
    }
    onHint('未选中部件，请点击模型表面。');
  }, true);
  canvas.addEventListener('pointercancel', e => {pointers.delete(e.pointerId);start = null;}, true);
  window.addEventListener('blur', () => {pointers.clear();start = null;});
  document.addEventListener('keydown', e => {if (e.key === 'Escape' && enabled) setEnabled(false);});
  return {setEnabled, clearHighlight, get enabled() {return enabled;}};
}
