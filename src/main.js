import './style.css';

const app=document.querySelector('#app');
app.innerHTML=`
<div class="page"><div class="grid"></div>
<header class="nav"><div class="logo">SHIFT</div><div class="tag">PLAYER IDENTITY // 01</div></header>
<main class="hero">
<section><div class="eyebrow">THE FUTURE IS PERSONAL</div><h1 class="title">CREATE<br>YOUR<br>FIGHTER.</h1><p class="copy">Build your own futuristic identity. Start with a photo, choose your combat style, and enter the SHIFT world.</p></section>
<section id="panel" class="card">
<h2>Initialize Player</h2><p class="muted">Your photo stays in this browser in this prototype.</p>
<div id="register"><input id="name" class="input" placeholder="Player name" maxlength="24"><button id="start" class="primary">BEGIN SHIFT →</button></div>
<div id="capture" class="hidden"><video id="video" class="camera" autoplay playsinline></video><canvas id="canvas" class="hidden"></canvas><div class="actions"><button id="snap" class="secondary">Capture Photo</button><label class="secondary" style="text-align:center">Upload<input id="upload" type="file" accept="image/*" class="hidden"></label></div></div>
<div id="customize" class="hidden"><div class="preview"><div class="energy"></div><div class="avatar"><div class="visor"></div></div><div class="badge">SHIFT // FIGHTER</div></div><div class="styles"><button class="style active">NEON CYBER</button><button class="style">HEAVY GUARDIAN</button><button class="style">SHIFT RUNNER</button><button class="style">ENERGY WARRIOR</button></div><button id="enter" class="primary">ENTER THE SHIFT →</button></div>
</section></main></div>`;

const $=id=>document.getElementById(id);
let stream;

$('start').onclick=async()=>{
 if(!$('name').value.trim()){$('name').focus();return}
 $('register').classList.add('hidden');$('capture').classList.remove('hidden');
 try{stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:'user'}});$('video').srcObject=stream}
 catch(e){$('capture').innerHTML='<p class="muted">Camera access is unavailable. Use Upload instead.</p><label class="primary" style="display:block;text-align:center">Upload Photo<input id="upload2" type="file" accept="image/*" class="hidden"></label>';document.getElementById('upload2').onchange=showCustomize}
};

function showCustomize(){
 if(stream)stream.getTracks().forEach(t=>t.stop());
 $('capture').classList.add('hidden');$('customize').classList.remove('hidden')
}

$('snap').onclick=()=>{
 const c=$('canvas');c.width=$('video').videoWidth;c.height=$('video').videoHeight;
 c.getContext('2d').drawImage($('video'),0,0);showCustomize()
};
$('upload').onchange=showCustomize;

document.querySelectorAll('.style').forEach(b=>b.onclick=()=>{
 document.querySelectorAll('.style').forEach(x=>x.classList.remove('active'));b.classList.add('active')
});

$('enter').onclick=()=>{
 const name=$('name').value.replace(/[<>]/g,'');
 $('panel').innerHTML='<h2>Fighter Initialized</h2><p class="muted">Welcome, '+name+'. Your SHIFT identity is ready.</p><div class="preview"><div class="energy"></div><div class="avatar"><div class="visor"></div></div><div class="badge">ONLINE // READY</div></div><button class="primary" style="margin-top:16px" onclick="location.reload()">CREATE ANOTHER FIGHTER</button>'
};