const $ = id => document.getElementById(id);
const tabsEl = $('tabs'), webContainer = $('webContainer');
let tabs = [], activeId = null, nextId = 1;
let historyItems = JSON.parse(localStorage.getItem('zzearch-history') || '[]');
let bookmarks = JSON.parse(localStorage.getItem('zzearch-bookmarks') || '[]');

function isUrl(value) {
  return /^(https?:\\/\\/)/i.test(value) || (/^[\\w-]+\\.[\\w.-]+/.test(value) && !value.includes(' '));
}
function resolveAddress(value) {
  value = value.trim();
  if (!value) return 'https://www.google.com';
  if (isUrl(value)) return value.startsWith('http') ? value : 'https://' + value;
  return 'https://www.google.com/search?q=' + encodeURIComponent(value);
}
function activeTab(){ return tabs.find(t => t.id === activeId); }
function updateUI(){
  tabsEl.innerHTML = '';
  tabs.forEach(t => {
    const b = document.createElement('div'); b.className = 'tab' + (t.id === activeId ? ' active':'');
    const label = document.createElement('span'); label.textContent = t.title || 'Nova guia';
    const close = document.createElement('button'); close.textContent='×'; close.title='Fechar aba';
    close.onclick = e => { e.stopPropagation(); closeTab(t.id); };
    b.append(label, close); b.onclick = () => activateTab(t.id); tabsEl.appendChild(b);
  });
  const t = activeTab();
  $('address').value = t && t.url && t.url !== 'home' ? t.url : '';
  $('startPage').style.display = !t || t.url === 'home' ? 'flex':'none';
  webContainer.style.display = t && t.url !== 'home' ? 'block':'none';
  $('back').disabled = !(t && t.view && t.view.canGoBack());
  $('forward').disabled = !(t && t.view && t.view.canGoForward());
}
function createTab(url='home'){
  const id=nextId++, view=document.createElement('webview');
  view.setAttribute('partition','persist:zzearch');
  view.setAttribute('allowpopups','');
  view.setAttribute('webpreferences','contextIsolation=yes,sandbox=yes');
  view.addEventListener('page-title-updated', e=>{const t=tabs.find(x=>x.id===id);if(t){t.title=e.title;updateUI();}});
  view.addEventListener('did-navigate', e=>{const t=tabs.find(x=>x.id===id);if(t){t.url=e.url;if(id===activeId)updateUI();addHistory(e.url);}});
  view.addEventListener('did-navigate-in-page', e=>{const t=tabs.find(x=>x.id===id);if(t){t.url=e.url;if(id===activeId)updateUI();}});
  webContainer.appendChild(view);
  const tab={id,url,title:'Nova guia',view}; tabs.push(tab); activateTab(id);
  if(url!=='home') navigate(url);
}
function activateTab(id){activeId=id;tabs.forEach(t=>t.view.classList.toggle('active',t.id===id));updateUI();}
function closeTab(id){
  const i=tabs.findIndex(t=>t.id===id); if(i<0)return;
  tabs[i].view.remove(); tabs.splice(i,1);
  if(!tabs.length)createTab(); else activateTab(tabs[Math.max(0,i-1)].id);
}
function navigate(value){
  const t=activeTab(); if(!t)return;
  const url=resolveAddress(value); t.url=url;t.title='Carregando...';
  $('startPage').style.display='none';webContainer.style.display='block';
  t.view.src=url; updateUI();
}
function addHistory(url){
  if(!url || url==='about:blank')return;
  historyItems.unshift({url,time:Date.now()});historyItems=historyItems.slice(0,100);
  localStorage.setItem('zzearch-history',JSON.stringify(historyItems));
}
$('addressForm').addEventListener('submit',e=>{e.preventDefault();navigate($('address').value);});
$('searchForm').addEventListener('submit',e=>{e.preventDefault();navigate($('homeSearch').value);});
$('newTab').onclick=()=>createTab();
$('back').onclick=()=>{const t=activeTab();if(t?.view.canGoBack())t.view.goBack();};
$('forward').onclick=()=>{const t=activeTab();if(t?.view.canGoForward())t.view.goForward();};
$('reload').onclick=()=>{const t=activeTab();if(t?.url==='home')return;if(t)t.view.reload();};
$('home').onclick=()=>{const t=activeTab();if(t){t.url='home';t.title='Nova guia';t.view.src='about:blank';updateUI();}};
$('bookmark').onclick=()=>{
  const t=activeTab();if(!t||t.url==='home')return;
  if(!bookmarks.includes(t.url))bookmarks.push(t.url);
  localStorage.setItem('zzearch-bookmarks',JSON.stringify(bookmarks));$('bookmark').textContent='★';
};
document.querySelectorAll('[data-url]').forEach(b=>b.onclick=()=>navigate(b.dataset.url));
$('historyBtn').onclick=()=>{renderHistory();$('historyPanel').classList.toggle('hidden');};
$('closeHistory').onclick=()=>$('historyPanel').classList.add('hidden');
$('clearHistory').onclick=()=>{historyItems=[];localStorage.removeItem('zzearch-history');renderHistory();};
function renderHistory(){
  const list=$('historyList');list.innerHTML='';
  historyItems.forEach(item=>{const b=document.createElement('button');b.className='history-item';b.textContent=item.url;b.onclick=()=>{navigate(item.url);$('historyPanel').classList.add('hidden');};list.appendChild(b);});
}
document.addEventListener('keydown',e=>{
  if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='t'){e.preventDefault();createTab();}
  if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='w'){e.preventDefault();if(tabs.length>1)closeTab(activeId);}
  if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='l'){e.preventDefault();$('address').focus();$('address').select();}
});
createTab();