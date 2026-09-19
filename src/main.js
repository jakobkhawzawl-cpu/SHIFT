import './style.css';

const app = document.querySelector('#app');

app.innerHTML = `
<div class="app-shell">
  <div class="stars"></div>
  <header class="topbar">
    <button class="brand" id="brandHome">SHIFT<span>//</span></button>
    <div class="top-status"><i></i> ONLINE <b id="topPlayer">GUEST</b></div>
  </header>

  <section id="screen-menu" class="screen active">
    <div class="menu-hero">
      <div class="kicker">YEAR 2097 // NEON FRONTIER</div>
      <h1>SHIFT</h1>
      <p>Become the fighter. Build your identity. Enter the arena.</p>
      <button class="cta" id="playBtn">CREATE FIGHTER <span>→</span></button>
      <div class="menu-stats"><span>SOLO ARENA</span><span>LIVE COMBAT DEMO</span><span>BUILD 0.1</span></div>
    </div>
    <div class="hero-character">
      <div class="hero-ring"></div><div class="hero-glow"></div>
      <div class="bot bot-hero"><div class="bot-head"></div><div class="bot-body"></div><div class="bot-core"></div><div class="bot-arm a"></div><div class="bot-arm b"></div><div class="bot-leg a"></div><div class="bot-leg b"></div></div>
      <div class="floating-card">SECTOR 07<br><strong>ARENA READY</strong></div>
    </div>
  </section>

  <section id="screen-create" class="screen">
    <div class="create-layout">
      <div>
        <div class="kicker">PLAYER INITIALIZATION</div>
        <h2>FORGE YOUR<br><em>FIGHTER.</em></h2>
        <p class="sub">Use your camera or upload a photo. In this demo the source image stays inside your browser.</p>
        <input id="playerName" class="name-input" maxlength="20" placeholder="PLAYER NAME">
        <div class="photo-actions">
          <button class="small-btn" id="cameraBtn">OPEN CAMERA</button>
          <label class="small-btn">UPLOAD PHOTO<input id="photoUpload" type="file" accept="image/*" hidden></label>
        </div>
        <div id="cameraBox" class="camera-box hidden"><video id="video" autoplay playsinline muted></video><div class="scan"></div><button id="captureBtn" class="capture">CAPTURE</button></div>
        <div id="photoState" class="photo-state">NO BIOMETRIC REFERENCE — A PHOTO IS OPTIONAL</div>
        <div class="style-grid">
          <button class="style-card active" data-style="NEON CYBER"><span>01</span><b>NEON CYBER</b><small>Balanced / Pulse blade</small></button>
          <button class="style-card" data-style="HEAVY GUARDIAN"><span>02</span><b>HEAVY GUARDIAN</b><small>Tank / Shock hammer</small></button>
          <button class="style-card" data-style="SHIFT RUNNER"><span>03</span><b>SHIFT RUNNER</b><small>Speed / Dual blades</small></button>
          <button class="style-card" data-style="ENERGY WARRIOR"><span>04</span><b>ENERGY WARRIOR</b><small>Power / Plasma staff</small></button>
        </div>
        <button class="cta full" id="forgeBtn">FORGE CHARACTER <span>→</span></button>
      </div>
      <div class="forge-preview">
        <div class="preview-label">CHARACTER PREVIEW // <span id="previewStyle">NEON CYBER</span></div>
        <div id="avatarStage" class="avatar-stage">
          <div class="avatar-grid"></div><div class="avatar-aura"></div>
          <div class="avatar" id="avatar">
            <div class="avatar-head"><img id="avatarPhoto" alt=""></div>
            <div class="visor"></div><div class="neck"></div><div class="chest"></div><div class="core"></div>
            <div class="shoulder left"></div><div class="shoulder right"></div><div class="arm left"></div><div class="arm right"></div>
            <div class="waist"></div><div class="leg left"></div><div class="leg right"></div><div class="boot left"></div><div class="boot right"></div>
          </div>
          <div class="scan-corners"></div>
        </div>
      </div>
    </div>
  </section>

  <section id="screen-game" class="screen game-screen">
    <div class="game-wrap">
      <div class="game-hud">
        <div class="fighter-hud"><div class="mini-avatar" id="hudAvatar"></div><div><strong id="hudName">PLAYER</strong><small id="hudStyle">NEON CYBER</small></div></div>
        <div class="health-wrap"><span>VITALS</span><div class="health"><i id="health"></i></div></div>
        <div class="score-wrap"><small>SECTOR 07</small><strong id="score">0000</strong></div>
      </div>
      <canvas id="gameCanvas"></canvas>
      <div class="game-help"><span>WASD / ARROWS</span> MOVE <span>SPACE</span> ATTACK <span>SHIFT</span> DASH</div>
      <div id="touchControls" class="touch-controls"><button data-key="up">▲</button><div><button data-key="left">◀</button><button data-key="attack">●</button><button data-key="right">▶</button></div><button data-key="down">▼</button></div>
      <div id="gameOver" class="game-over hidden"><div class="kicker">COMBAT REPORT</div><h2 id="gameOverTitle">SECTOR CLEAR</h2><p id="gameOverText"></p><button class="cta" id="againBtn">PLAY AGAIN</button><button class="ghost" id="menuBtn">MAIN MENU</button></div>
    </div>
  </section>
</div>`;

const $ = (id) => document.getElementById(id);
let screen = 'menu', playerName = 'PLAYER', selectedStyle = 'NEON CYBER', photoUrl = '';
let stream = null, keys = {}, game = null;

function show(name){
  document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active'));
  $('screen-'+name).classList.add('active'); screen=name;
  if(name !== 'create') stopCamera();
  if(name === 'game') startGame();
}
function stopCamera(){ if(stream){stream.getTracks().forEach(t=>t.stop());stream=null;} $('cameraBox').classList.add('hidden'); }

$('playBtn').onclick=()=>show('create');
$('brandHome').onclick=()=>{ if(screen==='game') stopGame(); show('menu'); };
document.querySelectorAll('.style-card').forEach(btn=>btn.onclick=()=>{
  document.querySelectorAll('.style-card').forEach(x=>x.classList.remove('active')); btn.classList.add('active');
  selectedStyle=btn.dataset.style; $('previewStyle').textContent=selectedStyle; $('avatarStage').dataset.style=selectedStyle;
});
$('cameraBtn').onclick=async()=>{
  $('cameraBox').classList.remove('hidden');
  if(!navigator.mediaDevices?.getUserMedia){$('photoState').textContent='CAMERA UNAVAILABLE — USE UPLOAD PHOTO';return;}
  try{stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:{ideal:'user'},width:{ideal:1280},height:{ideal:720}},audio:false});$('video').srcObject=stream;$('photoState').textContent='CAMERA LINK ACTIVE — POSITION FACE IN FRAME';}
  catch(e){$('photoState').textContent='CAMERA PERMISSION UNAVAILABLE — USE UPLOAD PHOTO';}
};
$('captureBtn').onclick=()=>{
  const v=$('video'); if(!v.videoWidth)return;
  const c=document.createElement('canvas');c.width=v.videoWidth;c.height=v.videoHeight;c.getContext('2d').drawImage(v,0,0);
  setPhoto(c.toDataURL('image/jpeg',.9));
};
$('photoUpload').onchange=e=>{const f=e.target.files?.[0];if(f)setPhoto(URL.createObjectURL(f));};
function setPhoto(url){photoUrl=url;$('avatarPhoto').src=url;$('photoState').textContent='BIOMETRIC REFERENCE LOCKED — PERSONALIZATION READY';stopCamera();}
$('forgeBtn').onclick=()=>{
  playerName=$('playerName').value.trim()||'PLAYER'; $('topPlayer').textContent=playerName.toUpperCase();
  $('forgeBtn').textContent='INITIALIZING...';
  setTimeout(()=>{ $('forgeBtn').innerHTML='ENTER ARENA <span>→</span>'; $('forgeBtn').onclick=()=>show('game'); },650);
};

function startGame(){
  const canvas=$('gameCanvas'), ctx=canvas.getContext('2d'), dpr=Math.min(devicePixelRatio||1,2);
  const resize=()=>{canvas.width=innerWidth*dpr;canvas.height=(innerHeight-76)*dpr;canvas.style.width=innerWidth+'px';canvas.style.height=(innerHeight-76)+'px';ctx.setTransform(dpr,0,0,dpr,0,0);};
  resize(); addEventListener('resize',resize);
  const W=()=>innerWidth,H=()=>innerHeight-76;
  game={running:true,score:0,wave:1,player:{x:W()/2,y:H()/2+60,hp:100,r:22,attack:0,dash:0,inv:0},enemies:[],particles:[],last:performance.now(),spawn:0,enemyCount:0,resize};
  $('hudName').textContent=playerName.toUpperCase();$('hudStyle').textContent=selectedStyle;
  $('score').textContent='0000';$('health').style.width='100%';$('gameOver').classList.add('hidden');
  if(photoUrl){$('hudAvatar').style.backgroundImage=`url("${photoUrl}")`;$('hudAvatar').classList.add('has-photo');}
  for(let i=0;i<4;i++)spawnEnemy();
  requestAnimationFrame(loop);
}
function stopGame(){if(game){game.running=false;game.resize=null;game=null;}}
function spawnEnemy(){
  if(!game||game.enemies.length>=7)return;
  const side=Math.floor(Math.random()*4), w=innerWidth,h=innerHeight-76, pad=55;
  const p=side===0?{x:-pad,y:Math.random()*h}:side===1?{x:w+pad,y:Math.random()*h}:side===2?{x:Math.random()*w,y:-pad}:{x:Math.random()*w,y:h+pad};
  game.enemies.push({x:p.x,y:p.y,r:20,hp:2,max:2,speed:34+game.wave*4,hit:0});
}
function particle(x,y,n=8){for(let i=0;i<n;i++){const a=Math.random()*Math.PI*2,s=40+Math.random()*150;game.particles.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,life:.45+Math.random()*.4});}}
function attack(){
  if(!game||game.player.attack>0)return;
  game.player.attack=.32; const p=game.player; let hits=0;
  for(const e of game.enemies){const d=Math.hypot(e.x-p.x,e.y-p.y);if(d<88){e.hp--;e.hit=.18;hits++;particle(e.x,e.y,12);if(e.hp<=0){game.score+=100;game.enemyCount++;}}}
  game.enemies=game.enemies.filter(e=>e.hp>0); $('score').textContent=String(game.score).padStart(4,'0');
}
function dash(){
  if(!game||game.player.dash>0)return;
  const p=game.player;let dx=(keys.d||keys.ArrowRight?1:0)-(keys.a||keys.ArrowLeft?1:0),dy=(keys.s||keys.ArrowDown?1:0)-(keys.w||keys.ArrowUp?1:0);
  if(!dx&&!dy)dy=-1;const l=Math.hypot(dx,dy)||1;p.x+=dx/l*110;p.y+=dy/l*110;p.inv=.28;p.dash=1.1;particle(p.x,p.y,18);
}
addEventListener('keydown',e=>{keys[e.key]=true;if(e.code==='Space'){e.preventDefault();attack()}if(e.key==='Shift')dash();});
addEventListener('keyup',e=>keys[e.key]=false);
document.querySelectorAll('[data-key]').forEach(b=>{
  const k=b.dataset.key;const map={up:'w',down:'s',left:'a',right:'d'};
  b.onpointerdown=e=>{e.preventDefault();if(k==='attack')attack();else keys[map[k]]=true;};
  b.onpointerup=b.onpointercancel=()=>{if(map[k])keys[map[k]]=false;};
});

function loop(now){
  if(!game?.running)return;
  const dt=Math.min((now-game.last)/1000,.033);game.last=now;const p=game.player,w=W(),h=H();
  let dx=(keys.d||keys.ArrowRight?1:0)-(keys.a||keys.ArrowLeft?1:0),dy=(keys.s||keys.ArrowDown?1:0)-(keys.w||keys.ArrowUp?1:0);
  const len=Math.hypot(dx,dy)||1;if(dx||dy){p.x+=dx/len*(150+(selectedStyle==='SHIFT RUNNER'?35:0))*dt;p.y+=dy/len*150*dt;}
  p.x=Math.max(30,Math.min(w-30,p.x));p.y=Math.max(30,Math.min(h-30,p.y));p.attack=Math.max(0,p.attack-dt);p.dash=Math.max(0,p.dash-dt);p.inv=Math.max(0,p.inv-dt);
  game.spawn-=dt;if(game.spawn<=0){spawnEnemy();game.spawn=Math.max(.45,1.3-game.wave*.08);}
  for(const e of game.enemies){const ax=p.x-e.x,ay=p.y-e.y,d=Math.hypot(ax,ay)||1;e.x+=ax/d*e.speed*dt;e.y+=ay/d*e.speed*dt;e.hit=Math.max(0,e.hit-dt);
    if(d<39&&p.inv<=0){p.hp-=18*dt;$('health').style.width=Math.max(0,p.hp)+'%';p.inv=.08;}
  }
  if(game.enemyCount>=12&&game.enemies.length===0){game.wave++;game.enemyCount=0;for(let i=0;i<game.wave+3;i++)spawnEnemy();}
  for(const q of game.particles){q.x+=q.vx*dt;q.y+=q.vy*dt;q.life-=dt;}game.particles=game.particles.filter(q=>q.life>0);
  draw(ctx,w,h);
  if(p.hp<=0){endGame(false);return;} if(game.score>=1200){endGame(true);return;}
  requestAnimationFrame(loop);
}
function draw(ctx,w,h){
  ctx.clearRect(0,0,w,h);
  const g=ctx.createRadialGradient(w*.5,h*.5,20,w*.5,h*.5,Math.max(w,h)*.7);g.addColorStop(0,'#151b38');g.addColorStop(1,'#03050a');ctx.fillStyle=g;ctx.fillRect(0,0,w,h);
  ctx.strokeStyle='rgba(126,145,255,.08)';ctx.lineWidth=1;for(let x=0;x<w;x+=48){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,h);ctx.stroke();}for(let y=0;y<h;y+=48){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(w,y);ctx.stroke();}
  ctx.strokeStyle='rgba(100,235,255,.12)';ctx.beginPath();ctx.arc(w/2,h/2,Math.min(w,h)*.31,0,Math.PI*2);ctx.stroke();
  for(const e of game.enemies)drawEnemy(ctx,e);
  drawPlayer(ctx,game.player);
  for(const q of game.particles){ctx.fillStyle='rgba(110,230,255,'+Math.max(0,q.life*2)+')';ctx.fillRect(q.x,q.y,3,3);}
}
function drawPlayer(ctx,p){
  ctx.save();ctx.translate(p.x,p.y);if(p.inv>0)ctx.globalAlpha=.55;
  ctx.shadowBlur=25;ctx.shadowColor='#6de8ff';ctx.fillStyle='#111a35';ctx.beginPath();ctx.arc(0,0,26,0,Math.PI*2);ctx.fill();
  ctx.strokeStyle='#72eaff';ctx.lineWidth=2;ctx.stroke();
  ctx.fillStyle='#26366c';ctx.fillRect(-13,-15,26,25);ctx.fillStyle='#9befff';ctx.fillRect(-9,-8,18,4);
  ctx.fillStyle='#7b63ff';ctx.fillRect(-7,4,14,12);
  ctx.strokeStyle='#8ff4ff';ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(-18,-5);ctx.lineTo(-31,12);ctx.moveTo(18,-5);ctx.lineTo(31,12);ctx.stroke();
  ctx.fillStyle='#141c3a';ctx.fillRect(-13,17,10,17);ctx.fillRect(3,17,10,17);
  if(p.attack>0){ctx.strokeStyle='#d7a0ff';ctx.lineWidth=7;ctx.shadowBlur=18;ctx.shadowColor='#d7a0ff';ctx.beginPath();ctx.arc(0,0,64,-1.1,1.1);ctx.stroke();}
  ctx.restore();
}
function drawEnemy(ctx,e){
  ctx.save();ctx.translate(e.x,e.y);ctx.shadowBlur=18;ctx.shadowColor='#ff4f79';ctx.fillStyle=e.hit>0?'#fff':'#311529';ctx.beginPath();ctx.arc(0,0,22,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#ff5b80';ctx.lineWidth=2;ctx.stroke();ctx.fillStyle='#ff557c';ctx.fillRect(-10,-3,20,5);ctx.fillStyle='#151020';ctx.fillRect(-14,9,28,10);ctx.restore();
}
function endGame(win){
  game.running=false;$('gameOverTitle').textContent=win?'SECTOR CLEARED':'FIGHTER DOWN';$('gameOverText').textContent=win?`Score ${game.score}. You cleared the arena.`:`Score ${game.score}. Your fighter needs another run.`; $('gameOver').classList.remove('hidden');
}
$('againBtn').onclick=()=>startGame();
$('menuBtn').onclick=()=>{stopGame();show('menu');};
addEventListener('pagehide',stopCamera);
