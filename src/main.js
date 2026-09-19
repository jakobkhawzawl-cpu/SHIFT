import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import './style.css';

const app=document.querySelector('#app');
app.innerHTML=`
<div class="shell">
<header class="topbar"><button class="brand" id="home">SHIFT<span>//</span></button><div class="status"><i></i> ONLINE <b id="topName">GUEST</b></div></header>
<section id="menu" class="screen active"><div class="menu-copy"><small>YEAR 2097 // NEON FRONTIER</small><h1>SHIFT</h1><p>A real-time 3D combat game. Build your fighter, enter Sector 07, move, dash and fight.</p><button class="cta" id="create">CREATE FIGHTER <span>→</span></button><div class="facts"><span>REAL 3D MODEL</span><span>ANIMATED FIGHTER</span><span>COMBAT ARENA</span></div></div><div id="menu3d"></div></section>
<section id="forge" class="screen"><div class="forge-layout"><div class="panel"><small>PLAYER INITIALIZATION</small><h2>FORGE YOUR<br><em>FIGHTER.</em></h2><p>Capture or upload a face reference. Your image stays in this browser. The game uses a real rigged 3D human model as the fighter body.</p><input id="name" maxlength="20" placeholder="PLAYER NAME"><div class="actions"><button id="camera" class="small">OPEN CAMERA</button><label class="small">UPLOAD PHOTO<input id="upload" type="file" accept="image/*" hidden></label></div><div id="cameraBox" class="camera hidden"><video id="video" autoplay playsinline muted></video><button id="capture">CAPTURE</button></div><div id="photoState" class="state">PHOTO OPTIONAL</div><div class="styles">
<button class="style active" data-style="NEON CYBER"><b>01 // NEON CYBER</b><span>Balanced / Pulse blade</span></button>
<button class="style" data-style="HEAVY GUARDIAN"><b>02 // HEAVY GUARDIAN</b><span>Heavy armor / Shock hammer</span></button>
<button class="style" data-style="SHIFT RUNNER"><b>03 // SHIFT RUNNER</b><span>Speed / Dual blades</span></button>
<button class="style" data-style="ENERGY WARRIOR"><b>04 // ENERGY WARRIOR</b><span>Power / Plasma staff</span></button></div><button id="enter" class="cta full">ENTER 3D ARENA <span>→</span></button></div><div class="preview"><div class="label">REAL 3D CHARACTER // <b id="styleLabel">NEON CYBER</b></div><div id="forge3d"></div><div class="hint">DRAG TO ROTATE</div></div></div></section>
<section id="game" class="screen"><div id="game3d"></div><div class="hud"><div class="identity"><div id="hudPhoto"></div><div><b id="hudName">PLAYER</b><span id="hudStyle">NEON CYBER</span></div></div><div class="bar"><span>VITALS</span><i><b id="hp"></b></i></div><div class="score"><span>SECTOR 07</span><b id="score">0000</b></div></div><div class="controls"><span>WASD / ARROWS MOVE</span><span>SPACE ATTACK</span><span>SHIFT DASH</span></div><div class="mobile-game-controls">
  <div class="virtual-joystick" id="joystick"><div class="joystick-base"><div class="joystick-stick"></div></div></div>
  <div class="action-buttons">
    <button class="action-btn shoot" data-action="shoot"><span>◉</span><small>SHOOT</small></button>
    <button class="action-btn attack" data-action="attack"><span>✦</span><small>ATTACK</small></button>
    <button class="action-btn dash" data-action="dash"><span>»</span><small>DASH</small></button>
  </div>
</div><div id="result" class="result hidden"><small>COMBAT REPORT</small><h2 id="resultTitle">SECTOR CLEAR</h2><p id="resultText"></p><button id="again" class="cta">PLAY AGAIN</button><button id="back" class="small">MAIN MENU</button></div></section>
</div>`;

const $=id=>document.getElementById(id);
let name='PLAYER',style='NEON CYBER',photo='',stream=null,game=null;
const MODEL_URL='https://threejs.org/examples/models/gltf/Soldier.glb';
const cfg={
'NEON CYBER':{main:0x263d78,glow:0x62eaff,accent:0x9b70ff,scale:1,speed:5.2},
'HEAVY GUARDIAN':{main:0x3d465d,glow:0xb8d9ff,accent:0x7f8cff,scale:1.08,speed:4.1},
'SHIFT RUNNER':{main:0x162c56,glow:0x55f6ff,accent:0x67a7ff,scale:.96,speed:6.5},
'ENERGY WARRIOR':{main:0x432c70,glow:0xe48cff,accent:0xffb1e9,scale:1,speed:5.2}
};
const loader=new GLTFLoader();

function mat(color,metal=.7,rough=.25,em=0){return new THREE.MeshStandardMaterial({color,metalness:metal,roughness:rough,emissive:em,emissiveIntensity:em?2.5:0})}
function neonPart(color){return mat(color,.55,.18,color)}

async function loadHuman(){
  const gltf=await new Promise((resolve,reject)=>loader.load(MODEL_URL,resolve,undefined,reject));
  const root=gltf.scene;
  root.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true}});
  const clips=gltf.animations||[];
  const mixer=clips.length?new THREE.AnimationMixer(root):null;
  const actions={};
  if(mixer) clips.forEach(c=>actions[c.name.toLowerCase()]=mixer.clipAction(c));
  return {root,mixer,actions,clips};
}
function addGear(root){
  const c=cfg[style],armor=mat(c.main,.9,.2),glow=neonPart(c.glow),accent=neonPart(c.accent);
  const h=new THREE.Group(); h.name='SHIFT_FUTURE_GEAR';
  const chest=new THREE.Mesh(new THREE.BoxGeometry(1.18,.72,.34),armor);chest.position.set(0,1.32,.1);chest.rotation.x=-.08;h.add(chest);
  const core=new THREE.Mesh(new THREE.OctahedronGeometry(.14),glow);core.position.set(0,1.35,.32);h.add(core);
  for(const s of [-1,1]){
    const pad=new THREE.Mesh(new THREE.SphereGeometry(.22,16,10),armor);pad.scale.set(1.3,.65,1);pad.position.set(.55*s,1.5,0);h.add(pad);
    const br=new THREE.Mesh(new THREE.BoxGeometry(.16,.7,.28),accent);br.position.set(.59*s,1.05,.05);h.add(br);
  }
  const belt=new THREE.Mesh(new THREE.TorusGeometry(.43,.045,8,32),glow);belt.rotation.x=Math.PI/2;belt.position.y=.78;belt.scale.set(1.35,1,1);h.add(belt);
  const visor=new THREE.Mesh(new THREE.BoxGeometry(.5,.06,.035),glow);visor.position.set(0,1.93,.25);h.add(visor);
  root.add(h);
  if(style==='HEAVY GUARDIAN'){
    const hammer=new THREE.Group();
    const handle=new THREE.Mesh(new THREE.CylinderGeometry(.035,.045,.9,10),accent);handle.position.set(.72,.9,.2);handle.rotation.z=-.35;hammer.add(handle);
    const head=new THREE.Mesh(new THREE.BoxGeometry(.32,.22,.22),armor);head.position.set(.86,1.32,.2);hammer.add(head);root.add(hammer);
  }
}
function addPhotoBadge(root){
  if(!photo)return;
  const tex=new THREE.TextureLoader().load(photo);
  const badge=new THREE.Mesh(new THREE.CircleGeometry(.19,32),new THREE.MeshBasicMaterial({map:tex,transparent:true}));
  badge.position.set(.34,1.98,.29);badge.rotation.y=.2;badge.name='PLAYER_FACE_REFERENCE';root.add(badge);
}
async function createCharacter(){
  const h=await loadHuman(); addGear(h.root); addPhotoBadge(h.root);
  h.root.scale.setScalar(cfg[style].scale);
  h.root.position.y=0;
  const idle=h.actions['idle'];
  if(idle)idle.play(); else if(h.clips[0])h.mixer.clipAction(h.clips[0]).play();
  return h;
}

function setupForge(){
  const el=$('forge3d');el.innerHTML='';const scene=new THREE.Scene();scene.background=new THREE.Color(0x050816);
  const cam=new THREE.PerspectiveCamera(32,el.clientWidth/el.clientHeight,.1,100);cam.position.set(0,1.25,4.5);
  const renderer=new THREE.WebGLRenderer({antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.setSize(el.clientWidth,el.clientHeight);renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.shadowMap.enabled=true;el.appendChild(renderer.domElement);
  scene.add(new THREE.HemisphereLight(0x9aabff,0x090b18,2));const l=new THREE.DirectionalLight(cfg[style].glow,4);l.position.set(3,5,4);l.castShadow=true;scene.add(l);
  const floor=new THREE.Mesh(new THREE.CircleGeometry(2.2,64),mat(0x0a1230,.4,.55));floor.rotation.x=-Math.PI/2;floor.receiveShadow=true;scene.add(floor);
  const rings=[];for(let r=1;r<2.2;r+=.35){const q=new THREE.Mesh(new THREE.TorusGeometry(r,.012,8,64),neonPart(cfg[style].glow));q.rotation.x=Math.PI/2;q.position.y=.02;scene.add(q);rings.push(q)}
  let fighter=null,dead=false;
  createCharacter().then(h=>{if(dead)return;fighter=h;scene.add(h.root);});
  let down=false,lastX=0;
  renderer.domElement.onpointerdown=e=>{down=true;lastX=e.clientX};renderer.domElement.onpointerup=()=>down=false;renderer.domElement.onpointerleave=()=>down=false;
  renderer.domElement.onpointermove=e=>{if(down&&fighter){fighter.root.rotation.y+=(e.clientX-lastX)*.01;lastX=e.clientX}};
  const tick=(t)=>{if(dead)return;if(fighter?.mixer)fighter.mixer.update(.016);if(fighter)fighter.root.position.y=Math.sin(t*.0015)*.025; rings.forEach((r,i)=>r.rotation.z=t*.0002*(i+1));renderer.render(scene,cam);requestAnimationFrame(tick)};tick(0);
  return ()=>{dead=true;renderer.dispose()};
}

function show(id){document.querySelectorAll('.screen').forEach(x=>x.classList.remove('active'));$(id).classList.add('active');if(id!=='forge')stopCamera();if(id==='game')startGame()}
function stopCamera(){if(stream){stream.getTracks().forEach(t=>t.stop());stream=null}$('cameraBox').classList.add('hidden')}
$('create').onclick=()=>{show('forge');setupForge()};
document.querySelectorAll('.style').forEach(b=>b.onclick=()=>{document.querySelectorAll('.style').forEach(x=>x.classList.remove('active'));b.classList.add('active');style=b.dataset.style;$('styleLabel').textContent=style;setupForge()});
$('camera').onclick=async()=>{if(!navigator.mediaDevices?.getUserMedia){$('photoState').textContent='CAMERA UNAVAILABLE — USE UPLOAD';return}$('cameraBox').classList.remove('hidden');try{stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:{ideal:'user'},width:{ideal:1280}},audio:false});$('video').srcObject=stream;$('photoState').textContent='CAMERA ACTIVE — FACE LOCK READY'}catch(e){$('photoState').textContent='CAMERA BLOCKED — USE UPLOAD'}};
$('capture').onclick=()=>{const v=$('video');if(!v.videoWidth)return;const c=document.createElement('canvas');c.width=v.videoWidth;c.height=v.videoHeight;c.getContext('2d').drawImage(v,0,0);setPhoto(c.toDataURL('image/jpeg',.9))};
$('upload').onchange=e=>{const f=e.target.files?.[0];if(f)setPhoto(URL.createObjectURL(f))};
function setPhoto(u){photo=u;$('photoState').textContent='IDENTITY REFERENCE LOCKED';stopCamera();setupForge()}
$('enter').onclick=()=>{name=$('name').value.trim()||'PLAYER';$('topName').textContent=name.toUpperCase();show('game')};
$('home').onclick=()=>{if(game)game.running=false;show('menu')};

function startGame(){
 const el=$('game3d');el.innerHTML='';const scene=new THREE.Scene();scene.background=new THREE.Color(0x02040a);scene.fog=new THREE.FogExp2(0x050812,.028);
 const camera=new THREE.PerspectiveCamera(58,innerWidth/(innerHeight-76),.1,150);const renderer=new THREE.WebGLRenderer({antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.setSize(innerWidth,innerHeight-76);renderer.shadowMap.enabled=true;renderer.outputColorSpace=THREE.SRGBColorSpace;el.appendChild(renderer.domElement);
 scene.add(new THREE.HemisphereLight(0x7c8cff,0x080910,1.8));const sun=new THREE.DirectionalLight(0xa9b8ff,3.2);sun.position.set(5,12,7);sun.castShadow=true;scene.add(sun);
 const floor=new THREE.Mesh(new THREE.PlaneGeometry(80,80),mat(0x070b17,.65,.5));floor.rotation.x=-Math.PI/2;floor.receiveShadow=true;scene.add(floor);scene.add(new THREE.GridHelper(80,40,0x27335f,0x111a31));
 for(let i=0;i<28;i++){const p=new THREE.Mesh(new THREE.BoxGeometry(.07,Math.random()*5+1,.07),neonPart(cfg[style].glow));p.position.set((Math.random()-.5)*35,.5,(Math.random()-.5)*35);scene.add(p)}
 let player=null,playerData=null;createCharacter().then(h=>{playerData=h;player=h.root;player.position.set(0,0,4);scene.add(player);});
 const enemies=[];let score=0,hp=100,spawn=.8,last=performance.now(),attackCd=0,dashCd=0,shootCd=0,running=true;const keys={};
 function enemy(){const g=new THREE.Group(),body=mat(0x301326,.7,.3),glow=neonPart(0xff527d);const b=new THREE.Mesh(new THREE.CapsuleGeometry(.42,.85,5,12),body);b.position.y=.9;g.add(b);const h=new THREE.Mesh(new THREE.SphereGeometry(.32,16,12),body);h.position.y=1.7;g.add(h);const v=new THREE.Mesh(new THREE.BoxGeometry(.48,.06,.04),glow);v.position.set(0,1.72,.3);g.add(v);return g}
 function addEnemy(){const a=Math.random()*Math.PI*2,d=10+Math.random()*9,e=enemy();e.position.set(Math.cos(a)*d,0,Math.sin(a)*d);scene.add(e);enemies.push({o:e,hp:2})}
 for(let i=0;i<4;i++)addEnemy();
 const damageEnemy=(e,amount)=>{e.hp-=amount;if(e.hp<=0){score+=100;scene.remove(e.o);const n=enemies.indexOf(e);if(n>=0)enemies.splice(n,1);$('score').textContent=String(score).padStart(4,'0')}};
 const attack=()=>{if(!player||attackCd>0)return;attackCd=.5;for(let i=enemies.length-1;i>=0;i--){const e=enemies[i];if(player.position.distanceTo(e.o.position)<2.5)damageEnemy(e,1)}};
 const shoot=()=>{if(!player||shootCd>0)return;shootCd=.22;
   const forward=new THREE.Vector3(0,0,-1).applyQuaternion(player.quaternion).normalize();
   let target=null,best=999;
   for(const e of enemies){const to=e.o.position.clone().sub(player.position);const d=to.length();if(d>18)continue;to.normalize();const dot=forward.dot(to);if(dot>.82&&d<best){best=d;target=e}}
   const start=player.position.clone().add(new THREE.Vector3(0,1.45,0)).addScaledVector(forward,.8);
   const beam=new THREE.Mesh(new THREE.SphereGeometry(.08,8,8),neonPart(cfg[style].glow));beam.position.copy(start);scene.add(beam);
   const end=target?target.o.position.clone().add(new THREE.Vector3(0,1,0)):start.clone().addScaledVector(forward,18);
   const life={t:0};const fly=()=>{life.t+=.08;beam.position.lerp(end,.3);if(life.t>=1){scene.remove(beam);if(target&&enemies.includes(target))damageEnemy(target,1);return}requestAnimationFrame(fly)};fly();
 };
 const dash=()=>{if(!player||dashCd>0)return;dashCd=1;const v=new THREE.Vector3((keys.d||keys.ArrowRight?1:0)-(keys.a||keys.ArrowLeft?1:0),0,(keys.s||keys.ArrowDown?1:0)-(keys.w||keys.ArrowUp?1:0));if(v.lengthSq()===0)v.set(0,0,-1);v.normalize();player.position.addScaledVector(v,4)};
 const kd=e=>{keys[e.key]=true;if(e.code==='Space'){e.preventDefault();attack()}if(e.key.toLowerCase()==='f')shoot();if(e.key==='Shift')dash()},ku=e=>keys[e.key]=false;addEventListener('keydown',kd);addEventListener('keyup',ku);
 document.querySelectorAll('[data-action]').forEach(b=>{b.onpointerdown=e=>{e.preventDefault();const a=b.dataset.action;if(a==='attack')attack();if(a==='shoot')shoot();if(a==='dash')dash()};});
 const joystick=$('joystick'),stick=joystick?.querySelector('.joystick-stick');let joyPointer=null;
 const updateJoystick=e=>{const r=joystick.getBoundingClientRect(),cx=r.left+r.width/2,cy=r.top+r.height/2;let x=e.clientX-cx,y=e.clientY-cy;const max=r.width*.32;const d=Math.hypot(x,y);if(d>max){x=x/d*max;y=y/d*max}stick.style.transform=`translate(${x}px,${y}px)`;keys.a=x<-max*.22;keys.d=x>max*.22;keys.w=y<-max*.22;keys.s=y>max*.22};
 joystick?.addEventListener('pointerdown',e=>{joyPointer=e.pointerId;joystick.setPointerCapture(e.pointerId);updateJoystick(e)});
 joystick?.addEventListener('pointermove',e=>{if(e.pointerId===joyPointer)updateJoystick(e)});
 const resetJoystick=()=>{joyPointer=null;if(stick)stick.style.transform='translate(0,0)';keys.a=keys.d=keys.w=keys.s=false};
 joystick?.addEventListener('pointerup',resetJoystick);joystick?.addEventListener('pointercancel',resetJoystick);
 const resize=()=>{camera.aspect=innerWidth/(innerHeight-76);camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight-76)};addEventListener('resize',resize);
 game={running:true};$('hudName').textContent=name.toUpperCase();$('hudStyle').textContent=style;$('hudPhoto').style.backgroundImage=photo?'url("'+photo+'")':'';$('hp').style.width='100%';$('result').classList.add('hidden');
 const loop=now=>{if(!running||!game?.running)return;const dt=Math.min((now-last)/1000,.04);last=now;const mx=(keys.d||keys.ArrowRight?1:0)-(keys.a||keys.ArrowLeft?1:0),mz=(keys.s||keys.ArrowDown?1:0)-(keys.w||keys.ArrowUp?1:0);
 if(player&&(mx||mz)){const v=new THREE.Vector3(mx,0,mz).normalize();player.position.addScaledVector(v,cfg[style].speed*dt);player.rotation.y=Math.atan2(v.x,v.z)}
 if(player){player.position.x=THREE.MathUtils.clamp(player.position.x,-18,18);player.position.z=THREE.MathUtils.clamp(player.position.z,-18,18)}
 attackCd=Math.max(0,attackCd-dt);dashCd=Math.max(0,dashCd-dt);shootCd=Math.max(0,shootCd-dt);spawn-=dt;if(spawn<=0&&enemies.length<8){addEnemy();spawn=.9}
 enemies.forEach(e=>{if(!player)return;const v=player.position.clone().sub(e.o.position);v.y=0;const d=v.length();if(d>1.55){v.normalize();e.o.position.addScaledVector(v,(1.05+score/2400)*dt)}else hp-=9*dt});
 $('hp').style.width=Math.max(0,hp)+'%';if(enemies.length===0)for(let i=0;i<4;i++)addEnemy();
 if(player){camera.position.lerp(player.position.clone().add(new THREE.Vector3(0,3.1,6.8)),.08);camera.lookAt(player.position.x,1.1,player.position.z)}
 renderer.render(scene,camera);if(hp<=0)return finish(false);if(score>=1200)return finish(true);requestAnimationFrame(loop)};
 requestAnimationFrame(loop);
 function finish(win){running=false;game.running=false;$('resultTitle').textContent=win?'SECTOR CLEARED':'FIGHTER DOWN';$('resultText').textContent=win?'Score '+score+'. Sector 07 is secure.':'Score '+score+'. Re-enter the arena and try again.';$('result').classList.remove('hidden')}
}
$('again').onclick=()=>startGame();$('back').onclick=()=>{if(game)game.running=false;show('menu')};addEventListener('pagehide',stopCamera);
