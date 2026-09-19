import * as THREE from 'three';
import './style.css';

const app=document.querySelector('#app');
app.innerHTML=`
<div class="shell">
<header class="topbar"><button class="brand" id="home">SHIFT<span>//</span></button><div class="status"><i></i> ONLINE <b id="topName">GUEST</b></div></header>
<section id="menu" class="screen active"><div class="menu-copy"><small>YEAR 2097 // NEON FRONTIER</small><h1>SHIFT</h1><p>A real-time 3D fighter arena. Forge your identity, then enter Sector 07.</p><button class="cta" id="create">CREATE FIGHTER <span>→</span></button><div class="facts"><span>REAL 3D</span><span>THIRD-PERSON</span><span>COMBAT DEMO</span></div></div><div id="menu3d"></div></section>
<section id="forge" class="screen"><div class="forge-layout"><div class="panel"><small>PLAYER INITIALIZATION</small><h2>FORGE YOUR<br><em>FIGHTER.</em></h2><p>Capture or upload a face reference. This build keeps the source image in your browser and uses it as the fighter's identity texture.</p><input id="name" maxlength="20" placeholder="PLAYER NAME"><div class="actions"><button id="camera" class="small">OPEN CAMERA</button><label class="small">UPLOAD PHOTO<input id="upload" type="file" accept="image/*" hidden></label></div><div id="cameraBox" class="camera hidden"><video id="video" autoplay playsinline muted></video><button id="capture">CAPTURE</button></div><div id="photoState" class="state">PHOTO OPTIONAL</div><div class="styles"><button class="style active" data-style="NEON CYBER"><b>01 // NEON CYBER</b><span>Balanced / Pulse blade</span></button><button class="style" data-style="HEAVY GUARDIAN"><b>02 // HEAVY GUARDIAN</b><span>Tank / Shock hammer</span></button><button class="style" data-style="SHIFT RUNNER"><b>03 // SHIFT RUNNER</b><span>Speed / Dual blades</span></button><button class="style" data-style="ENERGY WARRIOR"><b>04 // ENERGY WARRIOR</b><span>Power / Plasma staff</span></button></div><button id="enter" class="cta full">ENTER 3D ARENA <span>→</span></button></div><div class="preview"><div class="label">LIVE 3D CHARACTER // <b id="styleLabel">NEON CYBER</b></div><div id="forge3d"></div><div class="hint">DRAG TO ROTATE</div></div></div></section>
<section id="game" class="screen"><div id="game3d"></div><div class="hud"><div class="identity"><div id="hudPhoto"></div><div><b id="hudName">PLAYER</b><span id="hudStyle">NEON CYBER</span></div></div><div class="bar"><span>VITALS</span><i><b id="hp"></b></i></div><div class="score"><span>SECTOR 07</span><b id="score">0000</b></div></div><div class="controls"><span>WASD / ARROWS MOVE</span><span>SPACE ATTACK</span><span>SHIFT DASH</span></div><div class="touch"><button data-k="up">▲</button><div><button data-k="left">◀</button><button data-k="attack">●</button><button data-k="right">▶</button></div><button data-k="down">▼</button></div><div id="result" class="result hidden"><small>COMBAT REPORT</small><h2 id="resultTitle">SECTOR CLEAR</h2><p id="resultText"></p><button id="again" class="cta">PLAY AGAIN</button><button id="back" class="small">MAIN MENU</button></div></section>
</div>`;

const $=id=>document.getElementById(id);
let name='PLAYER',style='NEON CYBER',photo='',stream=null,previewScene,game;
const cfg={
'NEON CYBER':{main:0x283c78,glow:0x62eaff,accent:0x9b70ff,scale:1,speed:7},
'HEAVY GUARDIAN':{main:0x3d465d,glow:0xb8d9ff,accent:0x7f8cff,scale:1.12,speed:5.5},
'SHIFT RUNNER':{main:0x162c56,glow:0x55f6ff,accent:0x67a7ff,scale:.92,speed:9},
'ENERGY WARRIOR':{main:0x432c70,glow:0xe48cff,accent:0xffb1e9,scale:1,speed:7}
};
const material=(color,metal=.6,rough=.3,emissive=0)=>new THREE.MeshStandardMaterial({color,metalness:metal,roughness:rough,emissive,emissiveIntensity:emissive?2:0});
function limb(r1,r2,len,m){const g=new THREE.Group(),x=new THREE.Mesh(new THREE.CylinderGeometry(r1,r2,len,12),m);x.position.y=len/2;g.add(x);return g}
function makeFighter(usePhoto){
 const c=cfg[style],g=new THREE.Group();g.scale.setScalar(c.scale);
 const armor=material(c.main,.8,.22),glow=material(c.glow,.5,.18,c.glow),accent=material(c.accent,.7,.2,c.accent);
 const body=new THREE.Mesh(new THREE.CapsuleGeometry(.62,1.15,6,16),armor);body.position.y=2.25;g.add(body);
 const core=new THREE.Mesh(new THREE.IcosahedronGeometry(.22,1),glow);core.position.set(0,2.3,.57);g.add(core);
 const neck=new THREE.Mesh(new THREE.CylinderGeometry(.22,.25,.25,12),armor);neck.position.y=3.03;g.add(neck);
 const head=new THREE.Mesh(new THREE.SphereGeometry(.48,24,16),armor);head.position.y=3.52;g.add(head);
 if(usePhoto){const tex=new THREE.TextureLoader().load(photo);const face=new THREE.Mesh(new THREE.CircleGeometry(.31,32),new THREE.MeshBasicMaterial({map:tex,transparent:true}));face.position.set(0,3.52,.46);face.scale.set(.9,1.15,1);g.add(face)}
 const visor=new THREE.Mesh(new THREE.BoxGeometry(.72,.12,.08),glow);visor.position.set(0,3.55,.47);g.add(visor);
 for(const s of [-1,1]){const sh=new THREE.Mesh(new THREE.SphereGeometry(.34,16,10),armor);sh.position.set(.78*s,2.75,0);g.add(sh);const a=limb(.18,.24,1.15,armor);a.position.set(.85*s,1.72,0);a.rotation.z=-.12*s;g.add(a);const l=limb(.25,.31,1.25,armor);l.position.set(.34*s,.55,0);g.add(l);const b=new THREE.Mesh(new THREE.BoxGeometry(.5,.25,.8),accent);b.position.set(.34*s,-.05,.18);g.add(b)}
 const ring=new THREE.Mesh(new THREE.TorusGeometry(.9,.025,8,64),glow);ring.rotation.x=Math.PI/2;ring.position.y=.02;g.add(ring);
 if(style==='HEAVY GUARDIAN'){const hammer=limb(.09,.13,1.4,accent);hammer.rotation.z=Math.PI/2;hammer.position.set(1.25,1.5,.15);g.add(hammer)}
 return g;
}
function setupForge(){
 const el=$('forge3d');el.innerHTML='';const scene=new THREE.Scene();scene.background=new THREE.Color(0x070b18);const cam=new THREE.PerspectiveCamera(38,el.clientWidth/el.clientHeight,.1,100);cam.position.set(0,2.4,8);
 const renderer=new THREE.WebGLRenderer({antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.setSize(el.clientWidth,el.clientHeight);renderer.outputColorSpace=THREE.SRGBColorSpace;el.appendChild(renderer.domElement);
 scene.add(new THREE.HemisphereLight(0x91aaff,0x101020,2));const light=new THREE.DirectionalLight(cfg[style].glow,4);light.position.set(3,6,5);scene.add(light);
 const floor=new THREE.Mesh(new THREE.CircleGeometry(4,64),material(0x0b1230,.4,.6));floor.rotation.x=-Math.PI/2;scene.add(floor);const f=makeFighter(!!photo);scene.add(f);
 let down=false,lastX=0;renderer.domElement.onpointerdown=e=>{down=true;lastX=e.clientX};renderer.domElement.onpointerup=()=>down=false;renderer.domElement.onpointerleave=()=>down=false;renderer.domElement.onpointermove=e=>{if(down){f.rotation.y+=(e.clientX-lastX)*.01;lastX=e.clientX}};
 const tick=()=>{if(!document.getElementById('forge3d').isConnected)return;f.position.y=Math.sin(performance.now()*.0015)*.06;renderer.render(scene,cam);requestAnimationFrame(tick)};tick();
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
 const el=$('game3d');el.innerHTML='';const scene=new THREE.Scene();scene.background=new THREE.Color(0x02040a);scene.fog=new THREE.FogExp2(0x050812,.035);
 const camera=new THREE.PerspectiveCamera(58,innerWidth/(innerHeight-76),.1,150);const renderer=new THREE.WebGLRenderer({antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.setSize(innerWidth,innerHeight-76);renderer.shadowMap.enabled=true;renderer.outputColorSpace=THREE.SRGBColorSpace;el.appendChild(renderer.domElement);
 scene.add(new THREE.HemisphereLight(0x7c8cff,0x080910,1.7));const sun=new THREE.DirectionalLight(0x9ab5ff,3);sun.position.set(5,12,7);sun.castShadow=true;scene.add(sun);
 const floor=new THREE.Mesh(new THREE.PlaneGeometry(80,80),new THREE.MeshStandardMaterial({color:0x070b17,metalness:.65,roughness:.5}));floor.rotation.x=-Math.PI/2;floor.receiveShadow=true;scene.add(floor);
 scene.add(new THREE.GridHelper(80,40,0x27335f,0x111a31));
 for(let i=0;i<24;i++){const p=new THREE.Mesh(new THREE.BoxGeometry(.08,Math.random()*5+1,.08),new THREE.MeshBasicMaterial({color:cfg[style].glow}));p.position.set((Math.random()-.5)*35,.5,(Math.random()-.5)*35);scene.add(p)}
 const player=makeFighter(!!photo);player.position.set(0,0,4);player.traverse(o=>{if(o.isMesh)o.castShadow=true});scene.add(player);
 const enemies=[];let score=0,hp=100,spawn=0,last=performance.now(),attackCd=0,dashCd=0,running=true;const keys={};
 function enemy(){const g=new THREE.Group(),m=material(0x301326,.6,.3),red=material(0xff527d,.4,.2,0xff527d);const b=new THREE.Mesh(new THREE.CapsuleGeometry(.55,1,5,12),m);b.position.y=1.5;g.add(b);const h=new THREE.Mesh(new THREE.SphereGeometry(.42,16,12),m);h.position.y=2.45;g.add(h);const v=new THREE.Mesh(new THREE.BoxGeometry(.6,.1,.08),red);v.position.set(0,2.47,.4);g.add(v);return g}
 function addEnemy(){const a=Math.random()*Math.PI*2,d=10+Math.random()*9,e=enemy();e.position.set(Math.cos(a)*d,0,Math.sin(a)*d);scene.add(e);enemies.push({o:e,hp:2})}
 for(let i=0;i<4;i++)addEnemy();
 const attack=()=>{if(attackCd>0)return;attackCd=.45;for(let i=enemies.length-1;i>=0;i--){const e=enemies[i];if(player.position.distanceTo(e.o.position)<2.4){e.hp--;if(e.hp<=0){score+=100;scene.remove(e.o);enemies.splice(i,1)}}}$('score').textContent=String(score).padStart(4,'0')};
 const dash=()=>{if(dashCd>0)return;dashCd=1;const v=new THREE.Vector3((keys.d||keys.ArrowRight?1:0)-(keys.a||keys.ArrowLeft?1:0),0,(keys.s||keys.ArrowDown?1:0)-(keys.w||keys.ArrowUp?1:0));if(v.lengthSq()===0)v.set(0,0,-1);v.normalize();player.position.addScaledVector(v,4)};
 const kd=e=>{keys[e.key]=true;if(e.code==='Space'){e.preventDefault();attack()}if(e.key==='Shift')dash()},ku=e=>keys[e.key]=false;addEventListener('keydown',kd);addEventListener('keyup',ku);
 document.querySelectorAll('[data-k]').forEach(b=>{const k=b.dataset.k,map={up:'w',down:'s',left:'a',right:'d'};b.onpointerdown=e=>{e.preventDefault();if(k==='attack')attack();else keys[map[k]]=true};b.onpointerup=b.onpointercancel=()=>{if(map[k])keys[map[k]]=false}});
 const resize=()=>{camera.aspect=innerWidth/(innerHeight-76);camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight-76)};addEventListener('resize',resize);
 game={running:true};$('hudName').textContent=name.toUpperCase();$('hudStyle').textContent=style;$('hudPhoto').style.backgroundImage=photo?'url("'+photo+'")':'';$('hp').style.width='100%';$('result').classList.add('hidden');
 const loop=now=>{if(!running||!game?.running)return;const dt=Math.min((now-last)/1000,.04);last=now;const mx=(keys.d||keys.ArrowRight?1:0)-(keys.a||keys.ArrowLeft?1:0),mz=(keys.s||keys.ArrowDown?1:0)-(keys.w||keys.ArrowUp?1:0);if(mx||mz){const v=new THREE.Vector3(mx,0,mz).normalize();player.position.addScaledVector(v,cfg[style].speed*dt);player.rotation.y=Math.atan2(v.x,v.z)}player.position.x=THREE.MathUtils.clamp(player.position.x,-18,18);player.position.z=THREE.MathUtils.clamp(player.position.z,-18,18);attackCd=Math.max(0,attackCd-dt);dashCd=Math.max(0,dashCd-dt);spawn-=dt;if(spawn<=0&&enemies.length<8){addEnemy();spawn=.9}
 enemies.forEach(e=>{const v=player.position.clone().sub(e.o.position);v.y=0;const d=v.length();if(d>1.65){v.normalize();e.o.position.addScaledVector(v,(1.25+score/1800)*dt)}else hp-=10*dt});$('hp').style.width=Math.max(0,hp)+'%';
 if(enemies.length===0)for(let i=0;i<4;i++)addEnemy();
 camera.position.lerp(player.position.clone().add(new THREE.Vector3(0,3.2,7)),.08);camera.lookAt(player.position.x,1.5,player.position.z);renderer.render(scene,camera);
 if(hp<=0)return finish(false);if(score>=1200)return finish(true);requestAnimationFrame(loop)};
 requestAnimationFrame(loop);
 function finish(win){running=false;game.running=false;$('resultTitle').textContent=win?'SECTOR CLEARED':'FIGHTER DOWN';$('resultText').textContent=win?'Score '+score+'. Sector 07 is secure.':'Score '+score+'. Re-enter the arena and try again.';$('result').classList.remove('hidden')}
}
$('again').onclick=()=>startGame();$('back').onclick=()=>{if(game)game.running=false;show('menu')};addEventListener('pagehide',stopCamera);
