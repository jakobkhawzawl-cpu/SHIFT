import './style.css';

const app = document.querySelector('#app');

app.innerHTML = `
<div class="page">
  <div class="grid"></div>
  <div class="noise"></div>
  <header class="nav">
    <div class="logo">SHIFT</div>
    <div class="tag">PLAYER IDENTITY // 01</div>
  </header>

  <main class="hero">
    <section class="intro">
      <div class="eyebrow">THE FUTURE IS PERSONAL</div>
      <h1 class="title">CREATE<br>YOUR<br>FIGHTER.</h1>
      <p class="copy">Register, scan your face, and forge a personalized futuristic fighter identity.</p>
      <div class="steps"><span class="step active">01 REGISTER</span><span class="step">02 SCAN</span><span class="step">03 FORGE</span><span class="step">04 ENTER</span></div>
    </section>

    <section id="panel" class="card">
      <div class="card-head"><div class="mini-orb"></div><span>SHIFT // CHARACTER FORGE</span></div>
      <h2>Initialize Player</h2>
      <p class="muted">Your source photo stays in this browser prototype. It is not sent to a server.</p>

      <div id="register">
        <label class="label" for="name">PLAYER NAME</label>
        <input id="name" class="input" placeholder="Enter your name" maxlength="24" autocomplete="name">
        <button id="start" class="primary">BEGIN SHIFT <span>→</span></button>
      </div>

      <div id="capture" class="hidden">
        <div class="camera-wrap">
          <video id="video" class="camera" autoplay playsinline muted></video>
          <div class="scan-line"></div>
          <div class="camera-corners"></div>
          <div class="camera-label">FACE SCAN // READY</div>
        </div>
        <p id="camera-status" class="status">Allow camera access, or use upload below.</p>
        <div class="actions">
          <button id="snap" class="secondary">CAPTURE PHOTO</button>
          <label class="secondary upload-label">UPLOAD PHOTO<input id="upload" type="file" accept="image/jpeg,image/png,image/webp" class="hidden"></label>
        </div>
        <button id="skip-camera" class="text-button">Camera not available? Upload a photo instead.</button>
        <canvas id="canvas" class="hidden"></canvas>
      </div>

      <div id="forge" class="hidden">
        <div class="forge-loader">
          <div class="loader-core"><div class="loader-ring"></div><div class="loader-ring ring-two"></div><span>SHIFT</span></div>
          <div class="forge-title">FORGING YOUR IDENTITY</div>
          <div id="forge-status">Mapping facial reference...</div>
          <div class="progress"><span id="progress-bar"></span></div>
        </div>
      </div>

      <div id="customize" class="hidden">
        <div class="preview" id="preview">
          <div class="scan-grid"></div>
          <div class="energy"></div>
          <div class="character-aura"></div>
          <div class="photo-character"><img id="photo" alt="Your personalized SHIFT fighter"></div>
          <div class="armor-frame"></div>
          <div class="helmet-glow"></div>
          <div class="hud hud-top">BIOMETRIC // LOCKED</div>
          <div class="hud hud-side">SYNC 98.7%<br>CORE ONLINE</div>
          <div class="badge">PERSONALIZED // FIGHTER</div>
        </div>
        <div class="identity-row"><strong id="player-label">PLAYER</strong><span id="style-label">NEON CYBER</span></div>
        <div class="scan-complete"><span></span> CHARACTER REFERENCE GENERATED</div>
        <div class="styles">
          <button class="style active" data-style="NEON CYBER">NEON CYBER</button>
          <button class="style" data-style="HEAVY GUARDIAN">HEAVY GUARDIAN</button>
          <button class="style" data-style="SHIFT RUNNER">SHIFT RUNNER</button>
          <button class="style" data-style="ENERGY WARRIOR">ENERGY WARRIOR</button>
        </div>
        <button id="enter" class="primary">ENTER THE SHIFT <span>→</span></button>
      </div>
    </section>
  </main>
</div>`;

const $ = (id) => document.getElementById(id);
let stream = null;
let photoUrl = null;
let selectedStyle = 'NEON CYBER';
let playerName = 'PLAYER';

function stopCamera() {
  if (stream) {
    stream.getTracks().forEach((track) => track.stop());
    stream = null;
  }
}

function setStep(number) {
  document.querySelectorAll('.step').forEach((step, index) => {
    step.classList.toggle('active', index < number);
  });
}

function showForge(url) {
  if (!url) return;
  stopCamera();
  photoUrl = url;
  $('capture').classList.add('hidden');
  $('forge').classList.remove('hidden');
  setStep(3);

  const messages = [
    ['Reading facial reference...', 18],
    ['Building identity map...', 42],
    ['Applying synthetic armor profile...', 67],
    ['Calibrating combat silhouette...', 86],
    ['Fighter identity locked.', 100]
  ];
  let index = 0;
  const run = () => {
    const [message, progress] = messages[index];
    $('forge-status').textContent = message;
    $('progress-bar').style.width = progress + '%';
    index += 1;
    if (index < messages.length) {
      setTimeout(run, 520);
    } else {
      setTimeout(() => {
        $('forge').classList.add('hidden');
        $('customize').classList.remove('hidden');
        $('photo').src = photoUrl;
        $('player-label').textContent = playerName.toUpperCase();
        $('style-label').textContent = selectedStyle;
        $('preview').dataset.style = selectedStyle;
        setStep(4);
      }, 420);
    }
  };
  run();
}

function useUpload(file) {
  if (!file || !file.type.startsWith('image/')) {
    $('camera-status').textContent = 'Please choose a JPG, PNG, or WebP image.';
    return;
  }
  if (photoUrl?.startsWith('blob:')) URL.revokeObjectURL(photoUrl);
  showForge(URL.createObjectURL(file));
}

$('start').onclick = async () => {
  const name = $('name').value.trim();
  if (!name) {
    $('name').focus();
    $('name').classList.add('invalid');
    setTimeout(() => $('name').classList.remove('invalid'), 600);
    return;
  }

  playerName = name;
  $('register').classList.add('hidden');
  $('capture').classList.remove('hidden');
  setStep(2);

  if (!navigator.mediaDevices?.getUserMedia) {
    $('camera-status').textContent = 'Camera access is not available in this browser. Upload a photo below.';
    $('snap').disabled = true;
    return;
  }

  try {
    stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: { ideal: 'user' }, width: { ideal: 1280 }, height: { ideal: 720 } },
      audio: false
    });
    $('video').srcObject = stream;
    $('camera-status').textContent = 'Camera connected. Position your face inside the frame.';
  } catch (error) {
    console.warn('Camera unavailable:', error);
    $('camera-status').textContent = 'Camera permission was unavailable. Upload a photo below.';
    $('snap').disabled = true;
  }
};

$('snap').onclick = () => {
  const video = $('video');
  if (!video.videoWidth || !video.videoHeight) {
    $('camera-status').textContent = 'Camera is not ready yet. Please wait a moment or upload a photo.';
    return;
  }

  const canvas = $('canvas');
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  const context = canvas.getContext('2d');
  context.drawImage(video, 0, 0, canvas.width, canvas.height);
  showForge(canvas.toDataURL('image/jpeg', 0.9));
};

$('upload').onchange = (event) => useUpload(event.target.files?.[0]);
$('skip-camera').onclick = () => $('upload').click();

document.querySelectorAll('.style').forEach((button) => {
  button.onclick = () => {
    document.querySelectorAll('.style').forEach((item) => item.classList.remove('active'));
    button.classList.add('active');
    selectedStyle = button.dataset.style;
    $('preview').dataset.style = selectedStyle;
    $('style-label').textContent = selectedStyle;
  };
});

$('enter').onclick = () => {
  const safeName = playerName.replace(/[&<>]/g, (char) => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;' }[char]));
  $('panel').innerHTML = `
    <div class="success-mark">✓</div>
    <div class="final-kicker">SHIFT ONLINE</div>
    <h2>Fighter Initialized</h2>
    <p class="muted">Welcome, <strong>${safeName}</strong>. Your <strong>${selectedStyle}</strong> identity is ready.</p>
    <div class="preview final-preview" data-style="${selectedStyle}">
      <div class="scan-grid"></div><div class="energy"></div><div class="character-aura"></div>
      <div class="photo-character"><img src="${photoUrl || ''}" alt="Your SHIFT fighter"></div>
      <div class="armor-frame"></div><div class="helmet-glow"></div>
      <div class="badge">ONLINE // READY</div>
    </div>
    <button class="primary" style="margin-top:16px" id="restart">CREATE ANOTHER FIGHTER</button>
  `;
  $('restart').onclick = () => location.reload();
};

window.addEventListener('pagehide', stopCamera);
