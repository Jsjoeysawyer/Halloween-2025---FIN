const state={progress:JSON.parse(localStorage.getItem('ww')||'{}')};

async function load(){
  const res=await fetch('content.json'); state.content=await res.json();
  document.getElementById('game-title').textContent=state.content.game.title;
  renderStations(); renderGallery();
  const s=new URLSearchParams(location.hash.replace('#?','')).get('station');
  if(s) openStation(s);
}
function save(){localStorage.setItem('ww',JSON.stringify(state.progress));}
function setActive(v){document.querySelectorAll('.view').forEach(x=>x.classList.remove('active'));document.getElementById('view-'+v).classList.add('active');document.querySelectorAll('.tabs button').forEach(b=>b.classList.toggle('active',b.dataset.view===v));}
document.querySelectorAll('.tabs button').forEach(b=>b.onclick=()=>setActive(b.dataset.view));
document.getElementById('btn-start').onclick=()=>setActive('map');

function renderStations(){let w=document.getElementById('station-list');w.innerHTML='';state.content.stations.forEach(st=>{let d=document.createElement('div');d.innerHTML=`<div>${st.title} — ${state.progress[st.id]?'✔':'❌'} <button data-id="${st.id}">Open</button></div>`;w.appendChild(d);});w.querySelectorAll('button').forEach(b=>b.onclick=()=>openStation(b.dataset.id));}
function renderGallery(){let g=document.getElementById('gallery-list');g.innerHTML='';state.content.gallery.forEach(t=>{g.innerHTML+=`<div>${t.title}: ${state.progress[t.unlockStation]?'Unlocked':'Locked'}</div>`});}

const modal=document.getElementById('modal');document.getElementById('modal-close').onclick=()=>modal.classList.add('hidden');
function openStation(id){let st=state.content.stations.find(s=>s.id===id);modal.classList.remove('hidden');document.getElementById('modal-body').innerHTML=`<h2>${st.title}</h2><p>${st.story}</p><input id='ans'><button id='sub'>Submit</button><p id='fb'></p>`;document.getElementById('sub').onclick=()=>{let a=document.getElementById('ans').value.toLowerCase();if(st.answer.includes(a)){state.progress[id]=true;save();renderStations();renderGallery();document.getElementById('fb').textContent='Correct!';}else document.getElementById('fb').textContent='Try again';};}

// Ritual
let ritBtn=document.getElementById('ritual-start'),stopBtn=document.getElementById('ritual-stop'),meter=document.getElementById('meter-fill'),ritualStatus=document.getElementById('ritual-status');
ritBtn.onclick=async()=>{ritBtn.disabled=true;stopBtn.disabled=false;ritualStatus.textContent='Listening…';const stream=await navigator.mediaDevices.getUserMedia({audio:true});const ctx=new (window.AudioContext||webkitAudioContext)();const src=ctx.createMediaStreamSource(stream);const an=ctx.createAnalyser();src.connect(an);an.fftSize=256;const data=new Uint8Array(an.frequencyBinCount);let level=0;function loop(){an.getByteFrequencyData(data);let vol=data.reduce((a,b)=>a+b,0)/data.length;level=Math.min(100,level+vol/200);meter.style.width=level+'%';if(level>=100){ritualStatus.textContent='Ritual complete!';stream.getTracks().forEach(t=>t.stop());ctx.close();return;}requestAnimationFrame(loop);}loop();};
stopBtn.onclick=()=>{ritBtn.disabled=false;stopBtn.disabled=true;ritualStatus.textContent='Stopped';};

if('serviceWorker'in navigator){navigator.serviceWorker.register('service-worker.js');}
window.addEventListener('hashchange',()=>{const s=new URLSearchParams(location.hash.replace('#?','')).get('station');if(s)openStation(s);});
load();
