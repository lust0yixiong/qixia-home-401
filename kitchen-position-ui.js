const storageKey='qixia-kitchen-position-v1';
export function initKitchenPositionUI({placement,person,onChange,onView}){
 const panel=document.createElement('section');panel.id='kitchen-position-panel';panel.className='hidden';panel.setAttribute('aria-label','位置与人物');
 panel.innerHTML=`<div class="position-head"><h2>位置与人物</h2><button id="position-close" aria-label="关闭位置设置">×</button></div>
 <p>餐桌、岛台及座椅一起移动，比较不同位置的空间感。</p>
 <label for="kitchen-offset">整体位置 <output id="kitchen-offset-value" for="kitchen-offset"></output></label>
 <input id="kitchen-offset" type="range" min="-30" max="50" step="1" value="10">
 <div class="position-scale"><span>← 向灶台 30 cm</span><span>向大门 50 cm →</span></div>
 <div class="position-presets"><button data-offset="0">原位置</button><button data-offset="10">向大门 10 cm</button><button data-offset="20">20 cm</button><button data-offset="30">30 cm</button></div>
 <dl><div><dt>岛台至灶台</dt><dd id="working-clearance"></dd></div><div><dt>岛台至玄关柜</dt><dd id="entry-clearance"></dd></div></dl>
 <p class="position-note">距离按台面边缘至柜面计算，不含座椅及人物占用。</p>
 <label class="position-person"><input id="fridge-person" type="checkbox" checked>显示冰箱前人物 · 身高 170 cm</label>
 <button id="fridge-person-view">操作区近看</button><p class="position-note" id="position-save">位置与人物显示设置会保存在当前浏览器。</p>`;
 document.querySelector('#scene-view').append(panel);
 const toggle=document.querySelector('#kitchen-position-toggle'),range=panel.querySelector('#kitchen-offset'),check=panel.querySelector('#fridge-person');
 function render(){const cm=placement.offsetCm,c=placement.clearances();range.value=cm;panel.querySelector('#kitchen-offset-value').textContent=cm===0?'原位置':`${cm>0?'向大门':'向灶台'} ${Math.abs(cm)} cm`;panel.querySelector('#working-clearance').textContent=`${Math.round(c.working*100)} cm`;panel.querySelector('#entry-clearance').textContent=`${Math.round(c.entry*100)} cm`;check.checked=person.root.visible;for(const b of panel.querySelectorAll('[data-offset]'))b.setAttribute('aria-pressed',String(Number(b.dataset.offset)===cm));}
 function change(){render();try{localStorage.setItem(storageKey,JSON.stringify({offsetCm:placement.offsetCm,personVisible:person.root.visible}));}catch{panel.querySelector('#position-save').textContent='当前浏览器无法保存；本次调整仍然有效。';}onChange();}
 try{const saved=JSON.parse(localStorage.getItem(storageKey));if(saved&&typeof saved.offsetCm==='number'&&Number.isFinite(saved.offsetCm))placement.setOffset(saved.offsetCm);if(typeof saved?.personVisible==='boolean')person.setVisible(saved.personVisible);}catch{}
 range.addEventListener('input',()=>{placement.setOffset(range.value);change();});
 for(const b of panel.querySelectorAll('[data-offset]'))b.onclick=()=>{placement.setOffset(b.dataset.offset);change();};
 check.onchange=()=>{person.setVisible(check.checked);change();};
 function close(){panel.classList.add('hidden');toggle.setAttribute('aria-expanded','false');}
 toggle.onclick=()=>{const open=panel.classList.contains('hidden');panel.classList.toggle('hidden',!open);toggle.setAttribute('aria-expanded',String(open));};
 panel.querySelector('#position-close').onclick=()=>{close();toggle.focus();};
 panel.addEventListener('keydown',e=>{if(e.key==='Escape'){close();toggle.focus();}});
 panel.querySelector('#fridge-person-view').onclick=()=>{close();onView();};render();return {close};
}
