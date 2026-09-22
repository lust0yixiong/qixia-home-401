import { buildSurfaceRegistry, assignSurfaceMaterial, installMaterialPicking } from './material-selection.js';
const GROUPS = [
  ['wood', '木饰面与木家具'], ['cream', '浅色柜体与家具'], ['countertop', '厨房台面、岛台与餐桌'],
  ['stone', '地面石材'], ['wall', '墙面'], ['green', '厨房墙砖'], ['wetTile', '卫浴墙面'],
  ['windowFrame', '窗框与窗套'], ['linen', '座垫与床垫织物'], ['duvet', '床上织物'], ['pink', '次卧床架']
];
const IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);
const MAX_FILE = 10 * 1024 * 1024;
const MAX_PLAN = 40 * 1024 * 1024;
const DB = 'qixia-materials-v1';

// Validate imports before any material or saved preference is changed.
export function validatePlan(plan) {
  if (!plan || ![1, 2].includes(plan.version) || !plan.materials || typeof plan.materials !== 'object' || Array.isArray(plan.materials)) throw Error('不是支持的材质方案文件。');
  const result = {};
  for (const [key, c] of Object.entries(plan.materials)) {
    if (!GROUPS.some(([id]) => id === key)) throw Error('方案包含未知材质。');
    if (!c || !/^#[0-9a-f]{6}$/i.test(c.color) || !['original', 'solid', 'custom'].includes(c.mode)) throw Error('方案中的颜色或贴图类型无效。');
    for (const [field, lo, hi] of [['repeatX', .25, 12], ['repeatY', .25, 12], ['roughness', 0, 1], ['rotation', 0, 270]]) {
      if (!Number.isFinite(c[field]) || c[field] < lo || c[field] > hi) throw Error('方案中的材质参数超出范围。');
    }
    if (![0, 90, 180, 270].includes(c.rotation)) throw Error('纹理方向无效。');
    if (c.mode === 'custom' && (typeof c.image !== 'string' || c.image.length > 8 * 1024 * 1024 || !/^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/.test(c.image))) throw Error('方案中的贴图无效或过大。');
    result[key] = {color: c.color.toLowerCase(), mode: c.mode, repeatX: c.repeatX, repeatY: c.repeatY, rotation: c.rotation, roughness: c.roughness,
      ...(c.mode === 'custom' ? {image: c.image, name: String(c.name || '本地贴图').slice(0, 120)} : {})};
  }
  return result;
}

export function validateSurfacePlan(plan, registry) {
  if (plan.version === 1) return {};
  if (!plan.surfaces || typeof plan.surfaces !== 'object' || Array.isArray(plan.surfaces)) throw Error('部件方案格式无效。');
  const result = {};
  for (const [key, config] of Object.entries(plan.surfaces)) {
    const meta = registry.get(key);
    if (!meta || meta.base !== config?.base) throw Error('方案中的部件与当前模型不匹配。');
    result[key] = validatePlan({version:1,materials:{[meta.base]:config}})[meta.base];
  }
  return result;
}

function openStore() {
  return new Promise((resolve, reject) => {
    const r = indexedDB.open(DB, 1);
    r.onupgradeneeded = () => r.result.createObjectStore('settings');
    r.onerror = () => reject(r.error);
    r.onsuccess = () => resolve(r.result);
    r.onblocked = () => reject(Error('浏览器暂时无法打开本地存储。'));
  });
}
async function storage(value) {
  const db = await openStore();
  try {
    return await new Promise((resolve, reject) => {
      const tx = db.transaction('settings', value === undefined ? 'readonly' : 'readwrite');
      const s = tx.objectStore('settings');
      const r = value === undefined ? s.get('current') : s.put(value, 'current');
      tx.oncomplete = () => resolve(r.result);
      tx.onerror = tx.onabort = () => reject(tx.error || Error('保存失败'));
    });
  } finally { db.close(); }
}

async function decodeImage(blob) {
  const url = URL.createObjectURL(blob), image = new Image();
  try {
    image.src = url;
    await image.decode();
    if (!image.naturalWidth || !image.naturalHeight || image.naturalWidth * image.naturalHeight > 50_000_000) throw Error('图片尺寸过大，请使用小于 5000 万像素的图片。');
    const scale = Math.min(1, 2048 / Math.max(image.naturalWidth, image.naturalHeight));
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
    canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#fff';ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
    return {canvas, data: canvas.toDataURL('image/jpeg', .9)};
  } finally { URL.revokeObjectURL(url); }
}

export function initMaterialEditor({THREE, materials, renderer, scene, camera, onOpen}) {
  const surfaces = buildSurfaceRegistry(scene, materials, GROUPS);
  materials = {...materials};
  const defaults = {}, settings = {}, ownedMaps = new Map();
  for (const [key] of GROUPS) {
    const m = materials[key];
    defaults[key] = {color: `#${m.color.getHexString()}`, mode: 'original', repeatX: m.map?.repeat.x || 1, repeatY: m.map?.repeat.y || 1, rotation: 0, roughness: m.roughness, map: m.map};
    const {map, ...config} = defaults[key];settings[key] = {...config};
  }
  const button = document.createElement('button');button.id = 'materials-toggle';button.textContent = '材质设置';
  button.setAttribute('aria-expanded', 'false');button.setAttribute('aria-controls', 'material-panel');
  const pickButton = document.createElement('button');pickButton.id = 'material-pick';pickButton.textContent = '点选换材质';pickButton.setAttribute('aria-pressed','false');
  document.querySelector('.scene-tools').append(button, pickButton);
  const pickHint = document.createElement('p');pickHint.id = 'material-pick-hint';pickHint.className = 'hidden';pickHint.setAttribute('role','status');document.querySelector('#scene-view').append(pickHint);
  const panel = document.createElement('section');panel.id = 'material-panel';panel.className = 'hidden';panel.setAttribute('aria-label', '材质设置');
  panel.innerHTML = `
    <div class="material-head"><div><span class="eyebrow">MAKE IT YOURS</span><h2>材质与配色</h2></div><button id="material-close" aria-label="关闭材质设置">×</button></div>
    <p class="material-note" id="material-selection-label">选择材质类别，或开启“点选换材质”后点击模型。</p>
    <fieldset id="material-fields" disabled>
    <label for="material-target">材质类别</label><select id="material-target"></select>
    <label for="material-scope">修改范围</label><select id="material-scope"><option value="group">同类整体</option><option value="surface" disabled>仅此部件</option></select>
    <p class="material-note" id="material-scope-note">整体修改会覆盖该类部件的单独设置。</p>
    <div class="material-color-row"><label for="material-color">表面颜色</label><input id="material-color" type="color"><input id="material-hex" aria-label="颜色十六进制值" maxlength="7" spellcheck="false"></div>
    <p class="material-note">有贴图时，颜色会叠加在贴图上；白色保留素材原色。</p>
    <div class="texture-preview"><img id="material-preview" alt="当前纹理预览" hidden><span id="material-texture-name"></span></div>
    <div class="material-actions"><button id="material-upload">上传本地贴图</button><button id="material-solid">仅用颜色</button></div>
    <input id="material-file" type="file" accept="image/jpeg,image/png,image/webp" hidden>
    <p class="material-note">JPG / PNG / WebP，最大 10 MB。自动优化到最长边 2048 像素。</p>
    <label for="material-repeat-x">横向重复 <output id="material-repeat-x-value"></output></label><input id="material-repeat-x" type="range" min="0.25" max="12" step="0.25">
    <label for="material-repeat-y">纵向重复 <output id="material-repeat-y-value"></output></label><input id="material-repeat-y" type="range" min="0.25" max="12" step="0.25">
    <label for="material-rotation">纹理方向</label><select id="material-rotation"><option value="0">0° · 原方向</option><option value="90">90°</option><option value="180">180°</option><option value="270">270°</option></select>
    <label for="material-roughness">表面粗糙度 <output id="material-roughness-value"></output></label><input id="material-roughness" type="range" min="0" max="1" step="0.05">
    <div class="material-scale"><span>光滑</span><span>哑光</span></div>
    <div class="material-actions"><button id="material-reset">恢复此部位</button><button id="material-reset-all">全部恢复默认</button></div>
    <div class="material-actions material-plan"><button id="material-export">导出方案</button><button id="material-import">导入方案</button></div>
    <input id="material-plan-file" type="file" accept=".json,application/json" hidden>
    </fieldset>
    <p class="material-note">素材只保存在当前浏览器，不会上传至网站。导出方案包含贴图，可分享或备份。</p>
    <p id="material-status" role="status" aria-live="polite">正在读取本地方案…</p>`;
  document.querySelector('#scene-view').append(panel);
  const $ = id => panel.querySelector(`#${id}`), target = $('material-target');
  for (const [id, label] of GROUPS) target.add(new Option(label, id));
  let active = 'wood', selectedSurface = null, busy = true, saveTimer, saveChain = Promise.resolve(), revision = 0;
  const status = message => { $('material-status').textContent = message; };
  const baseOf = key => surfaces.registry.get(key)?.base || key;
  const configFor = key => settings[key] || settings[baseOf(key)];
  const materialFor = key => materials[key] || materials[baseOf(key)];
  const pack = () => ({version: 2,
    materials: Object.fromEntries(GROUPS.map(([key])=>[key,structuredClone(settings[key])])),
    surfaces: Object.fromEntries(Object.keys(settings).filter(key=>surfaces.registry.has(key)).map(key=>[key,{...structuredClone(settings[key]),base:baseOf(key)}]))
  });
  function removeOverride(key) {
    const meta = surfaces.registry.get(key);if (!meta || !settings[key]) return;
    assignSurfaceMaterial(meta,materials[meta.base]);ownedMaps.get(key)?.dispose();ownedMaps.delete(key);materials[key].dispose();delete materials[key];delete settings[key];
  }
  function clearGroupOverrides(base) {for (const key of Object.keys(settings)) if(surfaces.registry.get(key)?.base===base) removeOverride(key);}
  function ensureEditable(key=active) {
    const meta=surfaces.registry.get(key);
    if (!meta) {clearGroupOverrides(key);return;}
    if (settings[key]) return;
    settings[key]=structuredClone(settings[meta.base]);materials[key]=materials[meta.base].clone();
    const map=materials[meta.base].map;
    if(map){materials[key].map=map.clone();ownedMaps.set(key,materials[key].map);}
    assignSurfaceMaterial(meta,materials[key]);
  }
  const picking = installMaterialPicking({THREE,scene,camera,canvas:renderer.domElement,surfaces,
    onPick:key=>{
      if(busy)return false;
      selectedSurface=key;active=key;panel.classList.remove('hidden');button.setAttribute('aria-expanded','true');onOpen();sync();panel.scrollTop=0;return true;
    },
    onHint:message=>{pickHint.textContent=message;pickHint.classList.toggle('hidden',!message);},
    onEnabled:enabled=>{pickButton.setAttribute('aria-pressed',String(enabled));pickButton.textContent=enabled?'结束点选':'点选换材质';if(enabled)onOpen();}
  });
  pickButton.onclick=()=>{picking.setEnabled(!picking.enabled);if(picking.enabled){panel.classList.add('hidden');button.setAttribute('aria-expanded','false');}};
  const save = () => {
    const currentRevision = ++revision;
    clearTimeout(saveTimer);status('正在保存到本机…');
    saveTimer = setTimeout(() => {
      const data = pack();
      saveChain = saveChain.catch(() => {}).then(() => storage(data)).then(() => {
        if (revision === currentRevision) status('已保存在此浏览器');
      }).catch(() => {if (revision === currentRevision) status('无法保存到本机，请导出方案备份。');});
    }, 250);
  };
  function mapFromCanvas(canvas) {
    const map = new THREE.CanvasTexture(canvas);map.colorSpace = THREE.SRGBColorSpace;
    map.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());return map;
  }
  function replaceMap(key, map) {
    const old = ownedMaps.get(key);if (old && old !== map) old.dispose();
    if (map) ownedMaps.set(key, map);else ownedMaps.delete(key);
    materials[key].map = map;materials[key].needsUpdate = true;
  }
  function apply(key) {
    const c = settings[key], m = materials[key];m.color.set(c.color);m.roughness = c.roughness;
    if (m.map) {m.map.wrapS = m.map.wrapT = THREE.RepeatWrapping;m.map.repeat.set(c.repeatX, c.repeatY);m.map.center.set(.5, .5);m.map.rotation = THREE.MathUtils.degToRad(c.rotation);m.map.needsUpdate = true;}
  }
  function sync() {
    const c = configFor(active), base=baseOf(active);target.value = base;
    const meta=surfaces.registry.get(selectedSurface);
    const local=surfaces.registry.has(active);
    $('material-scope').value=local?'surface':'group';
    $('material-scope').querySelector('[value="surface"]').disabled=!meta || meta.base!==base;
    $('material-selection-label').textContent=meta && meta.base===base ? `已选：${GROUPS.find(([key])=>key===base)[1]} · 部件 ${meta.number}` : '选择材质类别，或开启“点选换材质”后点击模型。';
    $('material-scope-note').textContent=local?'只修改选中的部件，不影响其他部件。':'整体修改会覆盖该类部件的单独设置。';
    $('material-reset').textContent=local?'跟随同类材质':'恢复此类默认';
    $('material-color').value = $('material-hex').value = c.color;
    for (const field of ['repeat-x', 'repeat-y', 'roughness']) {
      const prop = {'repeat-x': 'repeatX', 'repeat-y': 'repeatY', roughness: 'roughness'}[field];
      $(`material-${field}`).value = c[prop];$(`material-${field}-value`).value = String(c[prop]);
    }
    $('material-rotation').value = c.rotation;
    const hasMap = !!materialFor(active).map;
    for (const id of ['material-repeat-x', 'material-repeat-y', 'material-rotation']) $(id).disabled = !hasMap;
    const preview = $('material-preview');preview.hidden = !hasMap;
    if (hasMap) preview.src = c.image || defaults[base].map.image.toDataURL();else preview.removeAttribute('src');
    $('material-texture-name').textContent = c.mode === 'custom' ? c.name : hasMap ? '原始纹理' : '纯色表面';
    $('material-hex').setCustomValidity('');
  }
  function restore(key) {
    if (surfaces.registry.has(key)) {removeOverride(key);return;}
    clearGroupOverrides(key);
    const {map, ...c} = defaults[key];settings[key] = {...c};replaceMap(key, map ? map.clone() : null);apply(key);
  }
  function setBusy(value) {busy = value;$('material-fields').disabled = value;}
  button.onclick = () => {
    const open = panel.classList.contains('hidden');panel.classList.toggle('hidden', !open);button.setAttribute('aria-expanded', String(open));
    if (open) {onOpen();$('material-close').focus();}
  };
  function close() {panel.classList.add('hidden');button.setAttribute('aria-expanded', 'false');button.focus();}
  $('material-close').onclick = close;panel.addEventListener('keydown', e => {if (e.key === 'Escape') {e.stopPropagation();picking.setEnabled(false);close();}});
  target.onchange = () => {active = target.value;selectedSurface=null;picking.clearHighlight();sync();};
  $('material-scope').onchange=()=>{active=$('material-scope').value==='surface'&&selectedSurface?selectedSurface:baseOf(active);sync();};
  $('material-color').oninput = e => {ensureEditable();settings[active].color = e.target.value;$('material-hex').value = e.target.value;apply(active);save();};
  $('material-hex').oninput = e => {
    const value = e.target.value.trim();e.target.setCustomValidity('');
    if (/^#[0-9a-f]{6}$/i.test(value)) {ensureEditable();settings[active].color = value.toLowerCase();$('material-color').value = value;apply(active);save();}
  };
  $('material-hex').onchange = e => {
    const value = e.target.value.trim();
    if (!/^#[0-9a-f]{6}$/i.test(value)) {e.target.setCustomValidity('请输入 # 加六位颜色值，例如 #b99570');e.target.reportValidity();return;}
    ensureEditable();settings[active].color = value.toLowerCase();apply(active);sync();save();
  };
  for (const [id, prop] of [['repeat-x','repeatX'],['repeat-y','repeatY'],['rotation','rotation'],['roughness','roughness']]) {
    $(`material-${id}`).oninput = e => {ensureEditable();settings[active][prop] = Number(e.target.value);apply(active);const output = $(`material-${id}-value`);if(output) output.value = e.target.value;save();};
  }
  $('material-upload').onclick = () => $('material-file').click();
  $('material-file').onchange = async e => {
    const file = e.target.files[0];e.target.value = '';if (!file || busy) return;
    if (!IMAGE_TYPES.has(file.type) || file.size > MAX_FILE) {status('请使用 10 MB 以内的 JPG、PNG 或 WebP 图片。');return;}
    const key = active;setBusy(true);status('正在处理贴图…');
    try {
      const {canvas, data} = await decodeImage(file);
      ensureEditable(key);replaceMap(key, mapFromCanvas(canvas));settings[key] = {...settings[key], mode: 'custom', image: data, name: file.name.slice(0,120), color: '#ffffff', repeatX: 1, repeatY: 1, rotation: 0};
      apply(key);sync();save();
    } catch {status('图片读取失败或尺寸过大，原有材质已保留。');} finally {setBusy(false);}
  };
  $('material-solid').onclick = () => {ensureEditable();settings[active].mode = 'solid';delete settings[active].image;delete settings[active].name;replaceMap(active, null);apply(active);sync();save();};
  $('material-reset').onclick = () => {restore(active);sync();save();};
  $('material-reset-all').onclick = () => {for (const [key] of GROUPS) restore(key);sync();save();};
  $('material-export').onclick = () => {
    const blob = new Blob([JSON.stringify(pack(), null, 2)], {type:'application/json'}), url = URL.createObjectURL(blob);
    const a = document.createElement('a');a.href = url;a.download = '栖霞苑-材质方案.json';document.body.append(a);a.click();a.remove();setTimeout(() => URL.revokeObjectURL(url), 10000);
    status('方案已导出，包含自定义贴图。');
  };
  async function loadPlan(plan) {
    const checked = validatePlan(plan), individual = validateSurfacePlan(plan,surfaces.registry), prepared = new Map();
    const entries=[...GROUPS.map(([key])=>[key,checked[key],key]),...Object.entries(individual).map(([key,c])=>[key,c,baseOf(key)])];
    try {
      for (const [key,c,base] of entries) {
        if (c?.mode === 'custom') {
          const bytes = Uint8Array.from(atob(c.image.split(',')[1]), ch => ch.charCodeAt(0));
          const {canvas, data} = await decodeImage(new Blob([bytes], {type: c.image.slice(5,c.image.indexOf(';'))}));
          c.image = data;prepared.set(key, mapFromCanvas(canvas));
        } else if ((!c || c.mode === 'original') && defaults[base].map) prepared.set(key, defaults[base].map.clone());
      }
    } catch (error) {for (const map of prepared.values()) map.dispose();throw error;}
    for (const key of Object.keys(settings)) if(surfaces.registry.has(key))removeOverride(key);
    for (const [key] of GROUPS) {
      const {map, ...fallback} = defaults[key];settings[key] = checked[key] || fallback;
      replaceMap(key, prepared.get(key) || null);apply(key);
    }
    for(const [key,c] of Object.entries(individual)){ensureEditable(key);settings[key]=c;replaceMap(key,prepared.get(key)||null);apply(key);}
    sync();
  }
  $('material-import').onclick = () => $('material-plan-file').click();
  $('material-plan-file').onchange = async e => {
    const file = e.target.files[0];e.target.value = '';if (!file || busy) return;
    if (file.size > MAX_PLAN) {status('方案文件超过 40 MB，请精简贴图后再导入。');return;}
    setBusy(true);status('正在读取方案…');
    try {await loadPlan(JSON.parse(await file.text()));save();}
    catch {status('方案格式、贴图或部件不匹配，当前方案未改动。');} finally {setBusy(false);}
  };
  sync();
  storage().then(async plan => {if (plan) await loadPlan(plan);status(plan ? '已恢复此浏览器上次的方案' : '选择部位，开始搭配。');})
    .catch(() => status('本地方案不可用；仍可修改并导出备份。')).finally(() => setBusy(false));
}
