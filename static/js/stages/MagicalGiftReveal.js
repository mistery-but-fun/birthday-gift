/**
 * MagicalGiftReveal.js
 * 
 * Orchestrates:
 * 1. The Magical Keyhole Pedestal near the Timber Bridge in Panda Village.
 * 2. Key activation mechanism & 5-step cinematic gift descent.
 * 3. Dedicated animated fluttering butterflies for all 10 gifts.
 * 4. Butterfly interaction ("Touch the Butterfly" hover & click to open box).
 * 5. Smooth box opening animations, specialized particle bursts, and ascending butterfly trail.
 * 6. 10 Unique gift surprises (Birthday Wish, I Miss You note, 2 Photo Frames, 2 Quotes,
 *    Interactive Movie/Song player, 2 Secret Clues: "apd43" & "na1", and Kingdom Key).
 * 7. Password-entry system for Box 10 ("panda143", case-insensitive) and Princess Kingdom entrance transition.
 * 8. Progress tracking ("Gifts Opened: X/10") & complete persistence.
 */

const GIFT_DEFINITIONS = [
  {
    id: 1,
    name: "Gift 1: Pastel Pink & Gold Ribbon",
    desc: "An elegant pastel pink box adorned with a shimmering metallic gold satin ribbon and ornate bow.",
    boxColor: 0xffccd9,
    lidColor: 0xffb8cb,
    ribbonColor: 0xffd700,
    butterflyColor: 0xff69b4,
    isMetallicRibbon: true,
    target: { x: -10.5, z: -31.5 },
    rotationY: 0.35
  },
  {
    id: 2,
    name: "Gift 2: Lavender & Silver Ribbon",
    desc: "An enchanting lavender box wrapped in a lustrous silver satin ribbon with delicate curls.",
    boxColor: 0xd8b4e2,
    lidColor: 0xc99de0,
    ribbonColor: 0xe2e8f0,
    butterflyColor: 0xc084fc,
    isMetallicRibbon: true,
    target: { x: -13.0, z: -38.5 },
    rotationY: -0.6
  },
  {
    id: 3,
    name: "Gift 3: Sky-Blue & White Ribbon",
    desc: "A serene sky-blue box finished with a pure pearl-white silk ribbon and blossom crest.",
    boxColor: 0x93c5fd,
    lidColor: 0x60a5fa,
    ribbonColor: 0xffffff,
    butterflyColor: 0x38bdf8,
    isMetallicRibbon: false,
    target: { x: -12.8, z: -26.0 },
    rotationY: 0.8
  },
  {
    id: 4,
    name: "Gift 4: Rose-Gold & Cream Ribbon",
    desc: "A warm rose-gold box wrapped in rich cream velvet ribbon and accented with gold leaf.",
    boxColor: 0xecb4a5,
    lidColor: 0xdf9f8f,
    ribbonColor: 0xfffdd0,
    butterflyColor: 0xfb7185,
    isMetallicRibbon: false,
    target: { x: -7.5, z: -21.0 },
    rotationY: -0.25
  },
  {
    id: 5,
    name: "Gift 5: Pearl-White & Pink Ribbon",
    desc: "A luminous pearl-white box tied with a delicate cherry blossom pink ribbon.",
    boxColor: 0xfafafa,
    lidColor: 0xf1f5f9,
    ribbonColor: 0xf472b6,
    butterflyColor: 0xfbcfe8,
    isMetallicRibbon: false,
    target: { x: 5.8, z: -33.5 },
    rotationY: 0.45
  },
  {
    id: 6,
    name: "Gift 6: Mint-Green & Gold Ribbon",
    desc: "A refreshing mint-green box crowned with a brilliant polished gold bow and ribbons.",
    boxColor: 0xa7f3d0,
    lidColor: 0x6ee7b7,
    ribbonColor: 0xffd700,
    butterflyColor: 0x34d399,
    isMetallicRibbon: true,
    target: { x: 8.5, z: -23.5 },
    rotationY: -0.5
  },
  {
    id: 7,
    name: "Gift 7: Deep Purple & Golden Ribbon",
    desc: "A regal deep violet-purple box encircled by opulent braided golden ribbons.",
    boxColor: 0x581c87,
    lidColor: 0x4c1d95,
    ribbonColor: 0xffd700,
    butterflyColor: 0xa855f7,
    isMetallicRibbon: true,
    target: { x: 11.2, z: -37.5 },
    rotationY: 0.7
  },
  {
    id: 8,
    name: "Gift 8: Peach & Lavender Ribbon",
    desc: "A delicate pastel peach box tied with a gentle lavender silk ribbon and bow.",
    boxColor: 0xfed7aa,
    lidColor: 0xfdba74,
    ribbonColor: 0xc084fc,
    butterflyColor: 0xfb923c,
    isMetallicRibbon: false,
    target: { x: 16.5, z: -36.0 },
    rotationY: -0.85
  },
  {
    id: 9,
    name: "Gift 9: Champagne-Gold & Pink Ribbon",
    desc: "A sparkling champagne-gold metallic box accented with a romantic blush-pink satin bow.",
    boxColor: 0xfef08a,
    lidColor: 0xfde047,
    ribbonColor: 0xf472b6,
    butterflyColor: 0xfacc15,
    isMetallicRibbon: false,
    target: { x: 13.2, z: -29.0 },
    rotationY: 0.2
  },
  {
    id: 10,
    name: "Gift 10: Pastel Rainbow with Delicate Bow",
    desc: "A breathtaking pastel rainbow ombre box crowned with an intricate celestial bow.",
    isRainbow: true,
    boxColor: 0xffffff,
    lidColor: 0xffffff,
    ribbonColor: 0xffffff,
    butterflyColor: 0xe879f9,
    isMetallicRibbon: false,
    target: { x: 6.8, z: -17.5 },
    rotationY: 0.15
  }
];

class MagicalGiftReveal {
  constructor(stage4) {
    this.stage4 = stage4;
    this.scene = stage4.scene;
    this.camera = stage4.camera;
    this.controls = stage4.controls;
    this.natureGroup = stage4.natureGroup;

    // State & Persistence
    this.keyActivated = (typeof localStorage !== 'undefined' && localStorage.getItem('panda_key_activated') === 'true');
    this.giftsRevealed = (typeof localStorage !== 'undefined' && localStorage.getItem('panda_gifts_revealed') === 'true');
    this.openedGifts = this.loadOpenedGifts();
    this.isCinematicRunning = false;
    this.currentAudioPlayer = null;

    // Load gift contents from configuration or defaults
    this.giftContents = (typeof window !== 'undefined' && window.GIFT_CONTENTS && window.GIFT_CONTENTS.gifts) 
      ? window.GIFT_CONTENTS.gifts 
      : this.getDefaultGiftContents();

    // 3D Objects
    this.pedestalGroup = null;
    this.pedestalLight = null;
    this.pedestalRuneMats = [];
    this.pedestalParticles = null;
    this.pedestalHitBox = null;
    this.insertedKeyMesh = null;

    this.portalGroup = null;
    this.portalLight = null;
    this.portalParticles = null;

    this.gifts = []; // { id, mesh, def, isLanded, lidGroup, magicalObject, isOpened }
    this.giftInteractiveObjects = [];
    this.butterflies = []; // { id, mesh, hitBox, def, leftWing, rightWing, light, state, angle, speed, flutterFreq }
    this.butterflyHitBoxes = [];
    this.particleRings = [];
    this.magicBursts = [];

    // Raycasting & Hover state
    this.hoveredGift = null;
    this.hoveredButterfly = null;
    this.isPedestalHovered = false;
    this.tooltipElem = null;

    // Textures
    this.contactShadowTex = this.createContactShadowTexture();
    this.rainbowTex = this.createRainbowTexture();

    // Event Listeners
    this.onPointerMove = this.onPointerMove.bind(this);
    this.onPointerClick = this.onPointerClick.bind(this);
  }

  loadOpenedGifts() {
    if (typeof localStorage === 'undefined') return [];
    try {
      const data = localStorage.getItem('panda_opened_gifts');
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  }

  saveOpenedGifts() {
    if (typeof localStorage === 'undefined') return;
    try {
      localStorage.setItem('panda_opened_gifts', JSON.stringify(this.openedGifts));
    } catch (e) {}
  }

  isGiftOpened(id) {
    return this.openedGifts.includes(id);
  }

  createContactShadowTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    const grad = ctx.createRadialGradient(32, 32, 2, 32, 32, 30);
    grad.addColorStop(0, 'rgba(10, 15, 8, 0.7)');
    grad.addColorStop(0.4, 'rgba(10, 15, 8, 0.45)');
    grad.addColorStop(0.8, 'rgba(10, 15, 8, 0.15)');
    grad.addColorStop(1, 'rgba(10, 15, 8, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 64, 64);
    return new THREE.CanvasTexture(canvas);
  }

  createRainbowTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    const grad = ctx.createLinearGradient(0, 0, 256, 256);
    grad.addColorStop(0.0, '#ffccd9');
    grad.addColorStop(0.2, '#fed7aa');
    grad.addColorStop(0.4, '#fef08a');
    grad.addColorStop(0.6, '#bbf7d0');
    grad.addColorStop(0.8, '#bae6fd');
    grad.addColorStop(1.0, '#e9d5ff');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 256, 256);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.28)';
    for (let i = -256; i < 512; i += 32) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i + 128, 256);
      ctx.lineTo(i + 140, 256);
      ctx.lineTo(i + 12, 0);
      ctx.closePath();
      ctx.fill();
    }
    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    return tex;
  }

  init() {
    this.buildPedestal();

    if (this.giftsRevealed) {
      // Spawn all 10 gifts already placed in Panda Village
      this.spawnLandedGifts();
      // Spawn butterflies for all gifts that have not been opened yet
      this.spawnButterflies();
    }

    this.renderProgressHUD();

    window.addEventListener('pointermove', this.onPointerMove);
    window.addEventListener('click', this.onPointerClick);
  }

  renderProgressHUD() {
    let pill = document.getElementById('gifts-progress-pill');
    if (!pill) {
      const dock = document.getElementById('nature-hud-panel');
      if (!dock) return;
      pill = document.createElement('div');
      pill.id = 'gifts-progress-pill';
      dock.insertBefore(pill, dock.firstChild);
    }

    const openedCount = this.openedGifts.length;
    const totalGifts = GIFT_DEFINITIONS.length;

    if (openedCount >= totalGifts) {
      pill.className = 'gifts-progress-pill all-opened interactive';
      pill.innerHTML = `<span>👑</span> <span>All Gifts Opened: 10/10 ✨</span>`;
    } else {
      pill.className = 'gifts-progress-pill interactive';
      pill.innerHTML = `<span>🎁</span> <span>Gifts Opened: ${openedCount}/${totalGifts}</span>`;
    }
  }

  /* -------------------------------------------------------------
   * 1. REALISTIC MAGICAL KEYHOLE PEDESTAL
   * -----------------------------------------------------------*/
  buildPedestal() {
    const pX = -10.2;
    const pZ = -33.0;
    const pY = this.stage4.getTerrainHeight(pX, pZ);

    this.pedestalGroup = new THREE.Group();
    this.pedestalGroup.name = "MagicalKeyholePedestal";
    this.pedestalGroup.position.set(pX, pY, pZ);
    this.pedestalGroup.rotation.y = 0.55;

    const stoneMat = new THREE.MeshStandardMaterial({
      color: 0x6e6b66,
      roughness: 0.88,
      metalness: 0.08
    });

    const polishedStoneMat = new THREE.MeshStandardMaterial({
      color: 0x827e78,
      roughness: 0.65,
      metalness: 0.12
    });

    const goldLeafMat = new THREE.MeshStandardMaterial({
      color: 0xffd700,
      roughness: 0.2,
      metalness: 0.94,
      emissive: 0x554000,
      emissiveIntensity: 0.35
    });

    // Base Plinth
    const base1Geo = new THREE.CylinderGeometry(1.2, 1.32, 0.22, 16);
    const base1 = new THREE.Mesh(base1Geo, stoneMat);
    base1.position.y = 0.11;
    base1.castShadow = true;
    base1.receiveShadow = true;
    this.pedestalGroup.add(base1);

    const base2Geo = new THREE.CylinderGeometry(0.98, 1.08, 0.18, 16);
    const base2 = new THREE.Mesh(base2Geo, polishedStoneMat);
    base2.position.y = 0.31;
    base2.castShadow = true;
    base2.receiveShadow = true;
    this.pedestalGroup.add(base2);

    const baseBandGeo = new THREE.TorusGeometry(0.92, 0.024, 8, 24);
    baseBandGeo.rotateX(Math.PI / 2);
    const baseBand = new THREE.Mesh(baseBandGeo, goldLeafMat);
    baseBand.position.y = 0.40;
    this.pedestalGroup.add(baseBand);

    // Carved Column Shaft
    const shaftGeo = new THREE.CylinderGeometry(0.62, 0.75, 1.15, 8);
    const shaft = new THREE.Mesh(shaftGeo, stoneMat);
    shaft.position.y = 0.98;
    shaft.castShadow = true;
    shaft.receiveShadow = true;
    this.pedestalGroup.add(shaft);

    // Relief Runic Engravings
    this.pedestalRuneMats = [];
    for (let r = 0; r < 4; r++) {
      const runeMat = new THREE.MeshStandardMaterial({
        color: 0xffe680,
        roughness: 0.3,
        metalness: 0.85,
        emissive: 0xffb700,
        emissiveIntensity: this.keyActivated ? 0.9 : 0.28
      });
      this.pedestalRuneMats.push(runeMat);

      const runeGeo = new THREE.BoxGeometry(0.04, 0.75, 0.025);
      const rune = new THREE.Mesh(runeGeo, runeMat);
      const ang = (r / 4) * Math.PI * 2 + Math.PI / 4;
      rune.position.set(Math.cos(ang) * 0.65, 0.98, Math.sin(ang) * 0.65);
      rune.rotation.y = -ang;
      this.pedestalGroup.add(rune);

      [-0.18, 0.0, 0.18].forEach(yOff => {
        const tickGeo = new THREE.BoxGeometry(0.12, 0.03, 0.025);
        const tick = new THREE.Mesh(tickGeo, runeMat);
        tick.position.set(Math.cos(ang) * 0.65, 0.98 + yOff, Math.sin(ang) * 0.65);
        tick.rotation.y = -ang;
        this.pedestalGroup.add(tick);
      });
    }

    // Capital Dais
    const capGeo = new THREE.CylinderGeometry(0.88, 0.64, 0.24, 16);
    const cap = new THREE.Mesh(capGeo, polishedStoneMat);
    cap.position.y = 1.68;
    cap.castShadow = true;
    this.pedestalGroup.add(cap);

    const topRimGeo = new THREE.TorusGeometry(0.86, 0.032, 8, 28);
    topRimGeo.rotateX(Math.PI / 2);
    const topRim = new THREE.Mesh(topRimGeo, goldLeafMat);
    topRim.position.y = 1.80;
    this.pedestalGroup.add(topRim);

    const topPlateGeo = new THREE.CylinderGeometry(0.84, 0.84, 0.03, 16);
    const topPlate = new THREE.Mesh(topPlateGeo, polishedStoneMat);
    topPlate.position.y = 1.81;
    this.pedestalGroup.add(topPlate);

    // Front-Facing Golden Escutcheon & Keyhole
    const escutcheonGroup = new THREE.Group();
    escutcheonGroup.position.set(0, 1.12, 0.72);

    const shieldGeo = new THREE.BoxGeometry(0.38, 0.54, 0.05);
    const shield = new THREE.Mesh(shieldGeo, goldLeafMat);
    shield.castShadow = true;
    escutcheonGroup.add(shield);

    const crestGeo = new THREE.TorusGeometry(0.12, 0.025, 8, 16, Math.PI);
    const crest = new THREE.Mesh(crestGeo, goldLeafMat);
    crest.position.set(0, 0.27, 0.02);
    escutcheonGroup.add(crest);

    const keyholeBackMat = new THREE.MeshBasicMaterial({ color: 0x050505 });
    const khCircleGeo = new THREE.CylinderGeometry(0.048, 0.048, 0.06, 12);
    khCircleGeo.rotateX(Math.PI / 2);
    const khCircle = new THREE.Mesh(khCircleGeo, keyholeBackMat);
    khCircle.position.set(0, 0.05, 0.02);
    escutcheonGroup.add(khCircle);

    const khSlotGeo = new THREE.BoxGeometry(0.042, 0.12, 0.06);
    const khSlot = new THREE.Mesh(khSlotGeo, keyholeBackMat);
    khSlot.position.set(0, -0.04, 0.02);
    escutcheonGroup.add(khSlot);

    [[-0.14, 0.2], [0.14, 0.2], [-0.14, -0.2], [0.14, -0.2]].forEach(([rx, ry]) => {
      const rivetGeo = new THREE.SphereGeometry(0.022, 6, 6);
      const rivet = new THREE.Mesh(rivetGeo, goldLeafMat);
      rivet.position.set(rx, ry, 0.028);
      escutcheonGroup.add(rivet);
    });

    this.pedestalGroup.add(escutcheonGroup);

    // Lighting & Particles
    this.pedestalLight = new THREE.PointLight(0xffd700, this.keyActivated ? 2.5 : 1.3, 9.0);
    this.pedestalLight.position.set(0, 1.45, 0.6);
    this.pedestalGroup.add(this.pedestalLight);

    const pCount = 20;
    const pGeo = new THREE.BufferGeometry();
    const pPos = new Float32Array(pCount * 3);
    for (let i = 0; i < pCount; i++) {
      const rad = 0.3 + Math.random() * 0.7;
      const ang = Math.random() * Math.PI * 2;
      pPos[i * 3] = Math.cos(ang) * rad;
      pPos[i * 3 + 1] = 0.5 + Math.random() * 1.5;
      pPos[i * 3 + 2] = Math.sin(ang) * rad;
    }
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));

    const pCanvas = document.createElement('canvas');
    pCanvas.width = 32;
    pCanvas.height = 32;
    const pCtx = pCanvas.getContext('2d');
    const pGrad = pCtx.createRadialGradient(16, 16, 2, 16, 16, 15);
    pGrad.addColorStop(0, 'rgba(255, 250, 200, 1)');
    pGrad.addColorStop(0.5, 'rgba(255, 215, 0, 0.75)');
    pGrad.addColorStop(1, 'rgba(255, 215, 0, 0)');
    pCtx.fillStyle = pGrad;
    pCtx.fillRect(0, 0, 32, 32);

    const pMat = new THREE.PointsMaterial({
      size: 0.16,
      map: new THREE.CanvasTexture(pCanvas),
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    this.pedestalParticles = new THREE.Points(pGeo, pMat);
    this.pedestalGroup.add(this.pedestalParticles);

    // Hit box
    const hitGeo = new THREE.CylinderGeometry(1.0, 1.2, 2.0, 8);
    const hitMat = new THREE.MeshBasicMaterial({ visible: false });
    this.pedestalHitBox = new THREE.Mesh(hitGeo, hitMat);
    this.pedestalHitBox.name = "PedestalHitBox";
    this.pedestalHitBox.position.set(0, 1.0, 0);
    this.pedestalGroup.add(this.pedestalHitBox);

    if (this.keyActivated) {
      this.renderInsertedKey();
    }

    this.natureGroup.add(this.pedestalGroup);
  }

  renderInsertedKey() {
    if (this.insertedKeyMesh) return;

    const goldKeyMat = new THREE.MeshStandardMaterial({
      color: 0xffd700,
      metalness: 0.95,
      roughness: 0.14,
      emissive: 0x665000,
      emissiveIntensity: 0.5
    });

    const keyMesh = new THREE.Group();
    const bowGeo = new THREE.TorusGeometry(0.12, 0.024, 12, 24);
    const bow = new THREE.Mesh(bowGeo, goldKeyMat);
    bow.position.set(0, 0, 0.42);
    bow.rotation.y = Math.PI / 2;
    keyMesh.add(bow);

    const stemGeo = new THREE.CylinderGeometry(0.022, 0.025, 0.38, 12);
    stemGeo.rotateX(Math.PI / 2);
    const stem = new THREE.Mesh(stemGeo, goldKeyMat);
    stem.position.set(0, 0, 0.22);
    keyMesh.add(stem);

    keyMesh.position.set(0, 1.12, 0.72);
    this.insertedKeyMesh = keyMesh;
    this.pedestalGroup.add(this.insertedKeyMesh);
  }

  onPedestalClick() {
    if (this.isCinematicRunning) return;

    if (this.keyActivated) {
      this.showPedestalModal("already_activated");
      return;
    }

    const hasKey = (typeof localStorage !== 'undefined' && localStorage.getItem('panda_golden_key') === 'true') || 
                   (this.stage4 && this.stage4.hasCollectedKey);

    if (hasKey) {
      this.showPedestalModal("ready_to_unlock");
    } else {
      this.showPedestalModal("key_required");
    }
  }

  showPedestalModal(state) {
    const existing = document.getElementById('pedestal-interaction-modal');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.id = 'pedestal-interaction-modal';
    overlay.className = 'village-modal-backdrop';

    if (state === "ready_to_unlock") {
      overlay.innerHTML = `
        <div class="village-modal-card interactive" style="border-color: #ffd700; box-shadow: 0 16px 48px rgba(0,0,0,0.6), 0 0 35px rgba(255, 215, 0, 0.35);">
          <div class="village-modal-tag">🏛️ Ancient Pedestal • Magical Keyhole</div>
          <h2 class="village-modal-title">Unlock Your Birthday Surprise! ✨🔑</h2>
          <p class="village-modal-body">
            Panda, use your magical key to unlock your birthday surprise!
          </p>
          <div class="village-modal-actions" style="display: flex; gap: 14px; justify-content: center;">
            <button id="btn-use-key" class="btn-primary" style="background: linear-gradient(135deg, #ffd700 0%, #b8860b 100%); color: #1e1302; font-weight: 700; box-shadow: 0 0 24px rgba(255, 215, 0, 0.6); animation: pulse-glow 1.5s infinite alternate;">
              <span>🔑</span> <span>Use Magical Key 🔑</span>
            </button>
            <button id="btn-pedestal-cancel" class="glass-btn">
              <span>Later</span>
            </button>
          </div>
        </div>
      `;
    } else if (state === "key_required") {
      overlay.innerHTML = `
        <div class="village-modal-card interactive">
          <div class="village-modal-tag">🔒 Mechanism Locked</div>
          <h2 class="village-modal-title">Ancient Keyhole Pedestal 🏛️</h2>
          <p class="village-modal-body">
            An elegant stone pedestal engraved with glowing runes. A golden keyhole waits quietly...
            <br><br>
            <span style="color: #ffd700;">✦ Ashitha, explore Panda Village and discover the hidden golden key to awaken this pedestal!</span>
          </p>
          <div class="village-modal-actions">
            <button id="btn-pedestal-cancel" class="btn-primary">
              <span>🔍</span> <span>Search for the Key</span>
            </button>
          </div>
        </div>
      `;
    } else {
      overlay.innerHTML = `
        <div class="village-modal-card interactive">
          <div class="village-modal-tag">✨ Mechanism Awakened</div>
          <h2 class="village-modal-title">Pedestal Unlocked 🌟</h2>
          <p class="village-modal-body">
            Your magical key has unlocked 10 special birthday surprises throughout Panda Village! Touch the magical butterflies to open your gifts. 🦋🎁
          </p>
          <div class="village-modal-actions">
            <button id="btn-pedestal-cancel" class="btn-primary">
              <span>🎁</span> <span>Explore My Gifts</span>
            </button>
          </div>
        </div>
      `;
    }

    document.body.appendChild(overlay);

    const cancelBtn = document.getElementById('btn-pedestal-cancel');
    if (cancelBtn) {
      cancelBtn.addEventListener('click', () => {
        if (window.audioManager) window.audioManager.playChime(1.0);
        overlay.remove();
      });
    }

    const useKeyBtn = document.getElementById('btn-use-key');
    if (useKeyBtn) {
      useKeyBtn.addEventListener('click', () => {
        overlay.remove();
        this.triggerActivationCinematic();
      });
    }
  }

  triggerActivationCinematic() {
    if (this.isCinematicRunning || this.keyActivated) return;
    this.isCinematicRunning = true;
    this.keyActivated = true;

    try {
      localStorage.setItem('panda_key_activated', 'true');
    } catch (e) {}

    if (this.controls) this.controls.enabled = false;

    // STEP 1: The Key Awakens
    this.executeStep1_KeyAwakens(() => {
      // STEP 2: The Sky Opens
      this.executeStep2_SkyOpens(() => {
        // STEP 3: Ten Gifts Descend
        this.executeStep3_TenGiftsDescend(() => {
          // STEP 4 & 5: Landing & Surprise Revealed
          this.executeStep4And5_SurpriseRevealed();
        });
      });
    });
  }

  executeStep1_KeyAwakens(onComplete) {
    const pX = -10.2;
    const pZ = -33.0;
    const pY = this.stage4.getTerrainHeight(pX, pZ);

    gsap.to(this.camera.position, {
      x: -8.0,
      y: pY + 1.8,
      z: -29.2,
      duration: 1.8,
      ease: "power2.inOut"
    });
    if (this.controls) {
      gsap.to(this.controls.target, {
        x: pX,
        y: pY + 1.0,
        z: pZ,
        duration: 1.8,
        ease: "power2.inOut"
      });
    }

    const goldKeyMat = new THREE.MeshStandardMaterial({
      color: 0xffd700,
      metalness: 0.95,
      roughness: 0.12,
      emissive: 0x554000,
      emissiveIntensity: 0.3
    });

    const animKey = new THREE.Group();
    const bowGeo = new THREE.TorusGeometry(0.14, 0.028, 12, 24);
    const bow = new THREE.Mesh(bowGeo, goldKeyMat);
    bow.position.set(0, 0, 0.44);
    animKey.add(bow);

    const stemGeo = new THREE.CylinderGeometry(0.024, 0.028, 0.42, 12);
    stemGeo.rotateX(Math.PI / 2);
    const stem = new THREE.Mesh(stemGeo, goldKeyMat);
    stem.position.set(0, 0, 0.22);
    animKey.add(stem);

    const toothGeo = new THREE.BoxGeometry(0.025, 0.07, 0.07);
    const tooth = new THREE.Mesh(toothGeo, goldKeyMat);
    tooth.position.set(0, -0.06, 0.08);
    animKey.add(tooth);

    animKey.position.set(0, 1.35, 1.25);
    animKey.scale.set(0.01, 0.01, 0.01);
    this.pedestalGroup.add(animKey);
    this.insertedKeyMesh = animKey;

    gsap.to(animKey.scale, {
      x: 1.0,
      y: 1.0,
      z: 1.0,
      duration: 0.6,
      ease: "back.out(1.8)"
    });

    gsap.to(animKey.position, {
      y: 1.12,
      z: 0.72,
      duration: 1.0,
      delay: 0.4,
      ease: "power2.inOut",
      onComplete: () => {
        gsap.to(animKey.rotation, {
          z: Math.PI / 2,
          duration: 0.55,
          ease: "power2.out",
          onComplete: () => {
            if (window.audioManager && window.audioManager.playKeyUnlockSound) {
              window.audioManager.playKeyUnlockSound();
            }

            gsap.to(goldKeyMat, { emissiveIntensity: 2.2, duration: 0.4 });

            if (this.pedestalLight) {
              gsap.to(this.pedestalLight, {
                intensity: 4.8,
                distance: 14.0,
                duration: 0.6,
                yoyo: true,
                repeat: 1
              });
            }

            this.pedestalRuneMats.forEach(mat => {
              gsap.to(mat, { emissiveIntensity: 2.6, duration: 0.5 });
            });

            if (this.pedestalParticles) {
              gsap.to(this.pedestalParticles.position, {
                y: "+=3.5",
                duration: 1.5,
                ease: "power1.out"
              });
            }

            const goldenSun = this.natureGroup.getObjectByProperty('isDirectionalLight', true);
            if (goldenSun) {
              gsap.to(goldenSun, { intensity: 1.4, duration: 2.0 });
              gsap.to(goldenSun.color, { r: 1.0, g: 0.95, b: 0.82, duration: 2.0 });
            }

            setTimeout(onComplete, 900);
          }
        });
      }
    });
  }

  executeStep2_SkyOpens(onComplete) {
    gsap.to(this.camera.position, {
      x: -4.0,
      y: 6.5,
      z: -18.0,
      duration: 2.2,
      ease: "power2.inOut"
    });
    if (this.controls) {
      gsap.to(this.controls.target, {
        x: 0,
        y: 36.0,
        z: -30.0,
        duration: 2.2,
        ease: "power2.inOut"
      });
    }

    if (window.audioManager && window.audioManager.playPortalOpenSound) {
      window.audioManager.playPortalOpenSound();
    }

    this.portalGroup = new THREE.Group();
    this.portalGroup.position.set(0, 36.0, -30.0);
    this.portalGroup.scale.set(0.01, 0.01, 0.01);

    const ring1Mat = new THREE.MeshStandardMaterial({
      color: 0xffd700,
      roughness: 0.2,
      metalness: 0.9,
      emissive: 0xffaa00,
      emissiveIntensity: 1.8,
      side: THREE.DoubleSide
    });
    const ring1Geo = new THREE.TorusGeometry(8.5, 0.22, 10, 48);
    const ring1 = new THREE.Mesh(ring1Geo, ring1Mat);
    ring1.rotation.x = Math.PI / 2;
    this.portalGroup.add(ring1);

    const ring2Mat = new THREE.MeshStandardMaterial({
      color: 0xf472b6,
      roughness: 0.2,
      metalness: 0.8,
      emissive: 0xf472b6,
      emissiveIntensity: 1.6,
      side: THREE.DoubleSide
    });
    const ring2Geo = new THREE.TorusGeometry(6.2, 0.16, 10, 36);
    ring2Geo.rotateX(Math.PI / 2);
    const ring2 = new THREE.Mesh(ring2Geo, ring2Mat);
    this.portalGroup.add(ring2);

    const pCanvas = document.createElement('canvas');
    pCanvas.width = 128;
    pCanvas.height = 128;
    const pCtx = pCanvas.getContext('2d');
    const pGrad = pCtx.createRadialGradient(64, 64, 4, 64, 64, 62);
    pGrad.addColorStop(0, 'rgba(255, 250, 220, 0.95)');
    pGrad.addColorStop(0.3, 'rgba(255, 215, 0, 0.7)');
    pGrad.addColorStop(0.7, 'rgba(244, 114, 182, 0.45)');
    pGrad.addColorStop(1, 'rgba(244, 114, 182, 0)');
    pCtx.fillStyle = pGrad;
    pCtx.fillRect(0, 0, 128, 128);

    const discMat = new THREE.MeshBasicMaterial({
      map: new THREE.CanvasTexture(pCanvas),
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      depthWrite: false
    });
    const discGeo = new THREE.CircleGeometry(6.0, 32);
    discGeo.rotateX(Math.PI / 2);
    const disc = new THREE.Mesh(discGeo, discMat);
    this.portalGroup.add(disc);

    this.portalLight = new THREE.PointLight(0xffeedd, 3.2, 90.0);
    this.portalLight.position.set(0, -1.0, 0);
    this.portalGroup.add(this.portalLight);

    const spCount = 50;
    const spGeo = new THREE.BufferGeometry();
    const spPos = new Float32Array(spCount * 3);
    for (let i = 0; i < spCount; i++) {
      const rad = Math.random() * 6.5;
      const ang = Math.random() * Math.PI * 2;
      spPos[i * 3] = Math.cos(ang) * rad;
      spPos[i * 3 + 1] = -Math.random() * 12.0;
      spPos[i * 3 + 2] = Math.sin(ang) * rad;
    }
    spGeo.setAttribute('position', new THREE.BufferAttribute(spPos, 3));

    const spMat = new THREE.PointsMaterial({
      size: 0.35,
      color: 0xfff0bb,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    this.portalParticles = new THREE.Points(spGeo, spMat);
    this.portalGroup.add(this.portalParticles);

    this.natureGroup.add(this.portalGroup);

    gsap.to(this.portalGroup.scale, {
      x: 1.0,
      y: 1.0,
      z: 1.0,
      duration: 1.8,
      ease: "power2.out",
      onComplete: onComplete
    });
  }

  executeStep3_TenGiftsDescend(onComplete) {
    gsap.to(this.camera.position, {
      x: -1.5,
      y: 9.8,
      z: -7.5,
      duration: 2.8,
      ease: "power2.inOut"
    });
    if (this.controls) {
      gsap.to(this.controls.target, {
        x: 0,
        y: 1.5,
        z: -30.0,
        duration: 2.8,
        ease: "power2.inOut"
      });
    }

    let landedCount = 0;
    const totalGifts = GIFT_DEFINITIONS.length;

    GIFT_DEFINITIONS.forEach((def, idx) => {
      const delay = idx * 0.38;
      setTimeout(() => {
        const giftObj = this.buildGiftMesh(def);
        const startY = 35.0 + Math.random() * 2.0;
        const targetY = this.stage4.getTerrainHeight(def.target.x, def.target.z);

        giftObj.position.set(def.target.x, startY, def.target.z);
        giftObj.rotation.set(
          (Math.random() - 0.5) * 0.4,
          def.rotationY,
          (Math.random() - 0.5) * 0.4
        );
        this.natureGroup.add(giftObj);

        if (window.audioManager && window.audioManager.playGiftChime) {
          window.audioManager.playGiftChime(idx);
        }

        const duration = 2.6 + Math.random() * 0.5;

        gsap.to(giftObj.position, {
          y: targetY + 0.36,
          duration: duration,
          ease: "power1.inOut",
          onComplete: () => {
            this.handleGiftLanding(giftObj, def, targetY);
            landedCount++;
            if (landedCount === totalGifts) {
              setTimeout(onComplete, 800);
            }
          }
        });

        gsap.to(giftObj.rotation, {
          y: "+=" + (Math.PI * 1.5),
          x: 0,
          z: 0,
          duration: duration,
          ease: "power1.out"
        });

        const trail = this.createDescentTrail(giftObj);
        this.gifts.push({
          id: def.id,
          mesh: giftObj,
          def: def,
          isLanded: false,
          trail: trail,
          lidGroup: giftObj.userData.lidGroup,
          magicalObject: giftObj.userData.magicalObject
        });
      }, delay * 1000);
    });
  }

  createDescentTrail(giftMesh) {
    const pCount = 18;
    const pGeo = new THREE.BufferGeometry();
    const pPos = new Float32Array(pCount * 3);
    for (let i = 0; i < pCount; i++) {
      pPos[i * 3] = (Math.random() - 0.5) * 0.6;
      pPos[i * 3 + 1] = Math.random() * 1.8;
      pPos[i * 3 + 2] = (Math.random() - 0.5) * 0.6;
    }
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));

    const pMat = new THREE.PointsMaterial({
      size: 0.16,
      color: 0xffe680,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    const trail = new THREE.Points(pGeo, pMat);
    giftMesh.add(trail);
    return trail;
  }

  handleGiftLanding(giftObj, def, targetY) {
    const giftEntry = this.gifts.find(g => g.id === def.id);
    if (giftEntry) {
      giftEntry.isLanded = true;
      if (giftEntry.trail) {
        gsap.to(giftEntry.trail.material, {
          opacity: 0,
          duration: 0.5,
          onComplete: () => {
            giftObj.remove(giftEntry.trail);
          }
        });
      }
    }

    gsap.fromTo(giftObj.position, 
      { y: targetY + 0.65 },
      {
        y: targetY + 0.36,
        duration: 0.65,
        ease: "bounce.out"
      }
    );

    gsap.fromTo(giftObj.scale,
      { x: 1.15, y: 0.85, z: 1.15 },
      { x: 1.0, y: 1.0, z: 1.0, duration: 0.5, ease: "elastic.out(1, 0.4)" }
    );

    if (window.audioManager && window.audioManager.playGiftLanding) {
      window.audioManager.playGiftLanding();
    }

    this.spawnLandingParticleRing(def.target.x, targetY + 0.05, def.target.z);
  }

  spawnLandingParticleRing(x, y, z) {
    const ringGroup = new THREE.Group();
    ringGroup.position.set(x, y, z);

    const pCount = 28;
    const pGeo = new THREE.BufferGeometry();
    const pPos = new Float32Array(pCount * 3);
    const angles = [];
    for (let i = 0; i < pCount; i++) {
      const ang = (i / pCount) * Math.PI * 2;
      angles.push(ang);
      pPos[i * 3] = Math.cos(ang) * 0.2;
      pPos[i * 3 + 1] = 0.02;
      pPos[i * 3 + 2] = Math.sin(ang) * 0.2;
    }
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));

    const pMat = new THREE.PointsMaterial({
      size: 0.22,
      color: 0xffecc4,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    const pts = new THREE.Points(pGeo, pMat);
    ringGroup.add(pts);
    this.natureGroup.add(ringGroup);

    this.particleRings.push({
      group: ringGroup,
      geo: pGeo,
      mat: pMat,
      angles: angles,
      radius: 0.2,
      maxRadius: 1.8,
      age: 0
    });
  }

  executeStep4And5_SurpriseRevealed() {
    this.giftsRevealed = true;
    try {
      localStorage.setItem('panda_gifts_revealed', 'true');
    } catch (e) {}

    if (this.portalGroup) {
      gsap.to(this.portalGroup.scale, {
        x: 0.01,
        y: 0.01,
        z: 0.01,
        duration: 2.2,
        ease: "power2.in",
        onComplete: () => {
          this.natureGroup.remove(this.portalGroup);
          this.portalGroup = null;
        }
      });
    }

    gsap.to(this.camera.position, {
      x: -3.2,
      y: 3.5,
      z: -17.5,
      duration: 3.0,
      ease: "power2.inOut",
      onComplete: () => {
        if (this.controls) {
          this.controls.enabled = true;
          this.controls.target.set(-2.0, 1.2, -30.0);
        }
        this.isCinematicRunning = false;
      }
    });

    if (this.controls) {
      gsap.to(this.controls.target, {
        x: -2.0,
        y: 1.2,
        z: -30.0,
        duration: 3.0,
        ease: "power2.inOut"
      });
    }

    // Spawn the 10 dedicated interactive butterflies
    this.spawnButterflies();
    this.renderProgressHUD();

    if (window.confetti) {
      window.confetti({
        particleCount: 85,
        spread: 80,
        origin: { y: 0.5 },
        colors: ['#ffd700', '#fbcfe8', '#bae6fd', '#d8b4e2', '#ffffff']
      });
    }

    if (this.stage4 && this.stage4.stageManager) {
      this.stage4.stageManager.updateTracker(5);
    }

    setTimeout(() => {
      this.showSurpriseRevealedModal();
    }, 1200);
  }

  showSurpriseRevealedModal() {
    if (document.getElementById('surprise-revealed-modal')) return;

    const overlay = document.createElement('div');
    overlay.id = 'surprise-revealed-modal';
    overlay.className = 'village-modal-backdrop';
    overlay.innerHTML = `
      <div class="village-modal-card interactive" style="border-color: #ffd700; box-shadow: 0 16px 48px rgba(0,0,0,0.6), 0 0 35px rgba(255, 215, 0, 0.35);">
        <div class="village-modal-tag">🎁 Panda Village • Magical Surprise Revealed</div>
        <h2 class="village-modal-title">Surprise, Panda! 🎁🐼</h2>
        <p class="village-modal-body">
          You did it, Panda! 💖 Your magical key unlocked 10 special birthday surprises, and they have arrived just for you! Explore Panda Village and discover each magical gift. ✨
        </p>
        <div class="village-modal-actions">
          <button id="btn-explore-gifts" class="btn-primary" style="background: linear-gradient(135deg, #ffd700 0%, #b8860b 100%); color: #1e1302; font-weight: 700; box-shadow: 0 0 20px rgba(255, 215, 0, 0.5);">
            <span>🌸</span> <span>Explore My Gifts</span>
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    document.getElementById('btn-explore-gifts').addEventListener('click', () => {
      if (window.audioManager) window.audioManager.playChime(1.2);
      gsap.to(overlay, {
        opacity: 0,
        duration: 0.5,
        ease: "power2.inOut",
        onComplete: () => {
          overlay.remove();
        }
      });
    });
  }

  /* -------------------------------------------------------------
   * 2. REALISTIC 3D GIFT BOX GENERATION & LID GROUPING
   * -----------------------------------------------------------*/
  buildGiftMesh(def) {
    const giftGroup = new THREE.Group();
    giftGroup.name = `GiftBox_${def.id}`;

    let boxMat, lidMat;
    if (def.isRainbow) {
      boxMat = new THREE.MeshStandardMaterial({
        map: this.rainbowTex,
        roughness: 0.32,
        metalness: 0.12
      });
      lidMat = new THREE.MeshStandardMaterial({
        map: this.rainbowTex,
        roughness: 0.32,
        metalness: 0.12
      });
    } else {
      boxMat = new THREE.MeshStandardMaterial({
        color: def.boxColor,
        roughness: 0.35,
        metalness: def.isMetallicRibbon ? 0.08 : 0.04
      });
      lidMat = new THREE.MeshStandardMaterial({
        color: def.lidColor,
        roughness: 0.32,
        metalness: def.isMetallicRibbon ? 0.08 : 0.04
      });
    }

    const ribbonMat = new THREE.MeshStandardMaterial({
      color: def.ribbonColor,
      roughness: def.isMetallicRibbon ? 0.18 : 0.35,
      metalness: def.isMetallicRibbon ? 0.90 : 0.15,
      emissive: def.isMetallicRibbon ? 0x332600 : 0x000000,
      emissiveIntensity: 0.2
    });

    // 1. Box Body
    const boxGeo = new THREE.BoxGeometry(0.86, 0.66, 0.86);
    const boxMesh = new THREE.Mesh(boxGeo, boxMat);
    boxMesh.castShadow = true;
    boxMesh.receiveShadow = true;
    giftGroup.add(boxMesh);

    // Box Ribbons
    const ribXGeo = new THREE.BoxGeometry(0.89, 0.68, 0.16);
    const ribX = new THREE.Mesh(ribXGeo, ribbonMat);
    giftGroup.add(ribX);

    const ribZGeo = new THREE.BoxGeometry(0.16, 0.68, 0.89);
    const ribZ = new THREE.Mesh(ribZGeo, ribbonMat);
    giftGroup.add(ribZ);

    // 2. Separate Animated Lid Group (Lid + Lid Ribbons + 3D Bow)
    const lidGroup = new THREE.Group();
    lidGroup.name = `GiftLid_${def.id}`;

    const lidGeo = new THREE.BoxGeometry(0.91, 0.16, 0.91);
    const lidMesh = new THREE.Mesh(lidGeo, lidMat);
    lidMesh.position.y = 0.33;
    lidMesh.castShadow = true;
    lidGroup.add(lidMesh);

    const lidRibXGeo = new THREE.BoxGeometry(0.93, 0.18, 0.17);
    const lidRibX = new THREE.Mesh(lidRibXGeo, ribbonMat);
    lidRibX.position.y = 0.33;
    lidGroup.add(lidRibX);

    const lidRibZGeo = new THREE.BoxGeometry(0.17, 0.18, 0.93);
    const lidRibZ = new THREE.Mesh(lidRibZGeo, ribbonMat);
    lidRibZ.position.y = 0.33;
    lidGroup.add(lidRibZ);

    // 3D Bow
    const bowGroup = new THREE.Group();
    bowGroup.position.set(0, 0.44, 0);

    const knotGeo = new THREE.SphereGeometry(0.08, 12, 10);
    const knot = new THREE.Mesh(knotGeo, ribbonMat);
    bowGroup.add(knot);

    const loopGeo = new THREE.TorusGeometry(0.14, 0.038, 10, 24, Math.PI * 1.5);
    for (let i = 0; i < 4; i++) {
      const loop = new THREE.Mesh(loopGeo, ribbonMat);
      const ang = (i / 4) * Math.PI * 2 + Math.PI / 4;
      loop.position.set(Math.cos(ang) * 0.11, 0.05, Math.sin(ang) * 0.11);
      loop.rotation.y = ang + Math.PI / 2;
      loop.rotation.x = 0.35;
      bowGroup.add(loop);
    }

    const tail1Curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0, 0.05),
      new THREE.Vector3(0.08, -0.12, 0.28),
      new THREE.Vector3(0.14, -0.32, 0.48),
      new THREE.Vector3(0.16, -0.48, 0.52)
    ]);
    const tail1 = new THREE.Mesh(new THREE.TubeGeometry(tail1Curve, 10, 0.024, 6, false), ribbonMat);
    bowGroup.add(tail1);

    const tail2Curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0, -0.05),
      new THREE.Vector3(-0.12, -0.14, -0.28),
      new THREE.Vector3(-0.18, -0.34, -0.46),
      new THREE.Vector3(-0.20, -0.48, -0.50)
    ]);
    const tail2 = new THREE.Mesh(new THREE.TubeGeometry(tail2Curve, 10, 0.024, 6, false), ribbonMat);
    bowGroup.add(tail2);

    lidGroup.add(bowGroup);
    giftGroup.add(lidGroup);

    // 3. For Box 10: Enchanted Kingdom Star Crystal inside the box
    let magicalObject = null;
    if (def.id === 10) {
      const crystalGroup = new THREE.Group();
      crystalGroup.name = "KingdomStarCrystal";
      const crystalGeo = new THREE.OctahedronGeometry(0.24, 1);
      const crystalMat = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        emissive: 0xec4899,
        emissiveIntensity: 0.8,
        metalness: 0.9,
        roughness: 0.1,
        transparent: true,
        opacity: 0.95
      });
      const crystalMesh = new THREE.Mesh(crystalGeo, crystalMat);
      crystalMesh.scale.set(1.0, 1.4, 1.0);
      crystalGroup.add(crystalMesh);

      const cLight = new THREE.PointLight(0xf472b6, 1.5, 5.0);
      crystalGroup.add(cLight);

      // Hit box for crystal clicking
      const cHitGeo = new THREE.SphereGeometry(0.45, 8, 8);
      const cHitMat = new THREE.MeshBasicMaterial({ visible: false });
      const cHitBox = new THREE.Mesh(cHitGeo, cHitMat);
      cHitBox.userData = { isCrystal: true, def: def };
      crystalGroup.add(cHitBox);
      this.giftInteractiveObjects.push(cHitBox);

      crystalGroup.position.set(0, 0.15, 0);
      giftGroup.add(crystalGroup);
      magicalObject = crystalGroup;
      giftGroup.userData.magicalObject = crystalGroup;
    }

    // 4. Contact Shadow
    const shadowGeo = new THREE.PlaneGeometry(1.4, 1.4);
    shadowGeo.rotateX(-Math.PI / 2);
    const shadowMat = new THREE.MeshBasicMaterial({
      map: this.contactShadowTex,
      transparent: true,
      opacity: 0.8,
      depthWrite: false
    });
    const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
    shadowMesh.position.y = -0.33;
    giftGroup.add(shadowMesh);

    // 5. Raycasting Hit Box for Box
    const hitGeo = new THREE.SphereGeometry(0.72, 8, 8);
    const hitMat = new THREE.MeshBasicMaterial({ visible: false });
    const hitBox = new THREE.Mesh(hitGeo, hitMat);
    hitBox.name = `GiftHitBox_${def.id}`;
    hitBox.userData = { isGift: true, id: def.id, def: def, parentGroup: giftGroup };
    giftGroup.add(hitBox);
    this.giftInteractiveObjects.push(hitBox);

    // If already opened, set lid to open state
    if (this.isGiftOpened(def.id)) {
      lidGroup.position.y = 0.55;
      lidGroup.rotation.x = -0.65;
      lidGroup.rotation.z = 0.25;
      if (magicalObject) {
        magicalObject.position.y = 0.55;
      }
    }

    giftGroup.userData = {
      isGift: true,
      id: def.id,
      def: def,
      lidGroup: lidGroup,
      magicalObject: magicalObject,
      ribbonMat: ribbonMat,
      hitBox: hitBox
    };

    return giftGroup;
  }

  spawnLandedGifts() {
    this.gifts = [];
    GIFT_DEFINITIONS.forEach(def => {
      const giftObj = this.buildGiftMesh(def);
      const targetY = this.stage4.getTerrainHeight(def.target.x, def.target.z);
      giftObj.position.set(def.target.x, targetY + 0.36, def.target.z);
      giftObj.rotation.y = def.rotationY;
      this.natureGroup.add(giftObj);

      this.gifts.push({
        id: def.id,
        mesh: giftObj,
        def: def,
        isLanded: true,
        lidGroup: giftObj.userData.lidGroup,
        magicalObject: giftObj.userData.magicalObject,
        isOpened: this.isGiftOpened(def.id)
      });
    });
  }

  /* -------------------------------------------------------------
   * 3. DEDICATED 10 ANIMATED BUTTERFLIES
   * -----------------------------------------------------------*/
  spawnButterflies() {
    this.butterflies.forEach(b => {
      if (b.mesh && b.mesh.parent) b.mesh.parent.remove(b.mesh);
    });
    this.butterflies = [];
    this.butterflyHitBoxes = [];

    GIFT_DEFINITIONS.forEach(def => {
      // If gift already opened, its butterfly has already flown away into the sky!
      if (this.isGiftOpened(def.id)) return;

      const targetY = this.stage4.getTerrainHeight(def.target.x, def.target.z);
      const bfData = this.createButterflyEntity(def, targetY);
      this.natureGroup.add(bfData.mesh);
      this.butterflies.push(bfData);
      this.butterflyHitBoxes.push(bfData.hitBox);
    });
  }

  createButterflyEntity(def, targetY) {
    const bfGroup = new THREE.Group();
    bfGroup.name = `GiftButterfly_${def.id}`;

    const wingMat = new THREE.MeshStandardMaterial({
      color: def.butterflyColor,
      roughness: 0.28,
      metalness: 0.45,
      emissive: def.butterflyColor,
      emissiveIntensity: 0.45,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.95
    });

    const bodyMat = new THREE.MeshStandardMaterial({ color: 0x1f140a, roughness: 0.7 });

    // Segmented Torso & Head
    const bodyGeo = new THREE.CylinderGeometry(0.018, 0.022, 0.16, 8);
    bodyGeo.rotateX(Math.PI / 2);
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    bfGroup.add(body);

    const headGeo = new THREE.SphereGeometry(0.026, 8, 8);
    const head = new THREE.Mesh(headGeo, bodyMat);
    head.position.set(0, 0, 0.09);
    bfGroup.add(head);

    // Antennae
    [-0.015, 0.015].forEach(ax => {
      const antCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(ax, 0.01, 0.09),
        new THREE.Vector3(ax * 2, 0.05, 0.14),
        new THREE.Vector3(ax * 3, 0.08, 0.18)
      ]);
      const antMesh = new THREE.Mesh(new THREE.TubeGeometry(antCurve, 6, 0.004, 4, false), bodyMat);
      bfGroup.add(antMesh);
    });

    // Realistic Wings (Left & Right Pivots)
    const leftWingPivot = new THREE.Group();
    leftWingPivot.position.set(-0.015, 0.01, 0);

    const lForeGeo = new THREE.PlaneGeometry(0.20, 0.24);
    const lFore = new THREE.Mesh(lForeGeo, wingMat);
    lFore.position.set(-0.09, 0, 0.03);
    lFore.rotation.z = 0.15;
    leftWingPivot.add(lFore);

    const lHindGeo = new THREE.PlaneGeometry(0.14, 0.18);
    const lHind = new THREE.Mesh(lHindGeo, wingMat);
    lHind.position.set(-0.07, 0, -0.07);
    lHind.rotation.z = -0.15;
    leftWingPivot.add(lHind);

    bfGroup.add(leftWingPivot);

    const rightWingPivot = new THREE.Group();
    rightWingPivot.position.set(0.015, 0.01, 0);

    const rFore = new THREE.Mesh(lForeGeo, wingMat);
    rFore.position.set(0.09, 0, 0.03);
    rFore.rotation.z = -0.15;
    rightWingPivot.add(rFore);

    const rHind = new THREE.Mesh(lHindGeo, wingMat);
    rHind.position.set(0.07, 0, -0.07);
    rHind.rotation.z = 0.15;
    rightWingPivot.add(rHind);

    bfGroup.add(rightWingPivot);

    // Magical Glowing Light
    const bfLight = new THREE.PointLight(def.butterflyColor, 0.85, 4.0);
    bfLight.position.set(0, 0.05, 0);
    bfGroup.add(bfLight);

    // Raycasting Hit Box (Sphere radius 0.65 for smooth forgiving clicks)
    const hitGeo = new THREE.SphereGeometry(0.65, 8, 8);
    const hitMat = new THREE.MeshBasicMaterial({ visible: false });
    const hitBox = new THREE.Mesh(hitGeo, hitMat);
    hitBox.name = `ButterflyHitBox_${def.id}`;
    bfGroup.add(hitBox);

    bfGroup.scale.set(1.2, 1.2, 1.2);

    const bfData = {
      id: def.id,
      def: def,
      mesh: bfGroup,
      hitBox: hitBox,
      leftWing: leftWingPivot,
      rightWing: rightWingPivot,
      light: bfLight,
      wingMat: wingMat,
      state: 'flying',
      centerX: def.target.x,
      centerY: targetY + 0.36,
      centerZ: def.target.z,
      angle: Math.random() * Math.PI * 2,
      speed: 1.15 + (def.id % 3) * 0.15,
      flutterFreq: 22.0 + (def.id % 4) * 1.5
    };

    hitBox.userData = { isButterfly: true, butterflyData: bfData };
    return bfData;
  }

  createButterflyMesh(colorHex = 0xffd700) {
    const fakeDef = {
      id: 999,
      butterflyColor: colorHex,
      target: { x: 0, z: 0 }
    };
    const bfData = this.createButterflyEntity(fakeDef, 0);
    return bfData.mesh;
  }

  /* -------------------------------------------------------------
   * 4. BUTTERFLY INTERACTION: "TOUCH THE BUTTERFLY" & BOX OPENING
   * -----------------------------------------------------------*/
  openGiftWithButterfly(bfData) {
    if (!bfData || bfData.state !== 'flying') return;
    this.clearHoverState();
    bfData.state = 'opening';

    const giftId = bfData.id;
    const def = bfData.def;
    const giftEntry = this.gifts.find(g => g.id === giftId);
    if (!giftEntry) return;

    // 1. Butterfly swoops gracefully toward the center of the gift box
    gsap.to(bfData.mesh.position, {
      x: bfData.centerX,
      y: bfData.centerY + 0.45,
      z: bfData.centerZ,
      duration: 0.65,
      ease: "power2.inOut",
      onComplete: () => {
        // 2. Play butterfly touch sound & release burst of magical particles
        if (window.audioManager && window.audioManager.playButterflyTouchSound) {
          window.audioManager.playButterflyTouchSound();
        }

        this.spawnMagicBurst(bfData.centerX, bfData.centerY + 0.45, bfData.centerZ, def.butterflyColor);

        // 3. Smooth Box Opening Animation (Lid lifts & tilts back gracefully)
        if (giftEntry.lidGroup) {
          gsap.to(giftEntry.lidGroup.position, {
            y: 0.55,
            duration: 0.85,
            ease: "power2.out"
          });
          gsap.to(giftEntry.lidGroup.rotation, {
            x: -0.65,
            z: 0.25,
            duration: 0.85,
            ease: "power2.out"
          });

          if (window.audioManager && window.audioManager.playBoxOpenSound) {
            window.audioManager.playBoxOpenSound();
          }
        }

        // For Box 10: Lift the Enchanted Kingdom Crystal
        if (giftId === 10 && giftEntry.magicalObject) {
          gsap.to(giftEntry.magicalObject.position, {
            y: 0.55,
            duration: 1.0,
            ease: "elastic.out(1, 0.5)"
          });
        }

        // 4. Butterfly gently ascends into the sky and disappears in a sparkle trail
        gsap.to(bfData.mesh.position, {
          y: "+=8.5",
          duration: 1.8,
          ease: "power1.in",
          onComplete: () => {
            if (bfData.mesh.parent) bfData.mesh.parent.remove(bfData.mesh);
            bfData.state = 'flown_away';

            // Remove hit box from raycaster
            const idx = this.butterflyHitBoxes.indexOf(bfData.hitBox);
            if (idx !== -1) this.butterflyHitBoxes.splice(idx, 1);
          }
        });

        gsap.to(bfData.mesh.scale, {
          x: 0.01,
          y: 0.01,
          z: 0.01,
          duration: 1.4,
          delay: 0.4
        });

        // 5. Update State & Progress
        if (!this.openedGifts.includes(giftId)) {
          this.openedGifts.push(giftId);
          this.saveOpenedGifts();
          this.renderProgressHUD();
        }
        giftEntry.isOpened = true;

        // Check if all 10 gifts opened
        if (this.openedGifts.length >= GIFT_DEFINITIONS.length) {
          if (window.confetti) {
            window.confetti({ particleCount: 100, spread: 90, origin: { y: 0.6 } });
          }
        }

        // 6. Reveal the unique Gift Content Modal
        setTimeout(() => {
          this.showGiftSurpriseModal(giftId);
        }, 750);
      }
    });
  }

  spawnMagicBurst(x, y, z, colorHex) {
    const burstGroup = new THREE.Group();
    burstGroup.position.set(x, y, z);

    const pCount = 36;
    const pGeo = new THREE.BufferGeometry();
    const pPos = new Float32Array(pCount * 3);
    const vels = [];
    for (let i = 0; i < pCount; i++) {
      pPos[i * 3] = 0;
      pPos[i * 3 + 1] = 0;
      pPos[i * 3 + 2] = 0;
      vels.push({
        x: (Math.random() - 0.5) * 3.2,
        y: Math.random() * 3.5 + 0.8,
        z: (Math.random() - 0.5) * 3.2
      });
    }
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));

    const pMat = new THREE.PointsMaterial({
      size: 0.24,
      color: colorHex,
      transparent: true,
      opacity: 1.0,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    const pts = new THREE.Points(pGeo, pMat);
    burstGroup.add(pts);
    this.natureGroup.add(burstGroup);

    this.magicBursts.push({
      group: burstGroup,
      geo: pGeo,
      mat: pMat,
      vels: vels,
      age: 0,
      lifespan: 1.2
    });
  }

  /* -------------------------------------------------------------
   * 5. UNIQUE GIFT SURPRISE REVEAL MODALS (1 THROUGH 10)
   * -----------------------------------------------------------*/
  showGiftSurpriseModal(giftId) {
    this.clearHoverState();
    const existing = document.getElementById('gift-surprise-modal');
    if (existing) existing.remove();

    if (this.currentAudioPlayer) {
      try { this.currentAudioPlayer.pause(); } catch(e) {}
      this.currentAudioPlayer = null;
    }

    const c = this.giftContents[giftId.toString()] || {};
    const def = GIFT_DEFINITIONS.find(g => g.id === giftId) || {};

    const overlay = document.createElement('div');
    overlay.id = 'gift-surprise-modal';
    overlay.className = 'village-modal-backdrop';

    let cardHtml = '';

    if (giftId === 1) {
      // 1. Birthday Wish
      cardHtml = `
        <div class="village-modal-card interactive" style="border-color: #f472b6; box-shadow: 0 16px 48px rgba(0,0,0,0.6), 0 0 35px rgba(244, 114, 182, 0.4);">
          <div class="village-modal-tag" style="color: #f472b6; border-color: rgba(244, 114, 182, 0.5);">🌸 A BIRTHDAY WISH FOR PANDA</div>
          <h2 class="village-modal-title glow-pink">${c.heading || "Happy Birthday, Ashitha! 🌸🐼"}</h2>
          <p class="village-modal-body" style="font-size: 16px; line-height: 1.85;">
            ${c.message}
          </p>
          <div style="font-style: italic; color: #ffd700; margin-bottom: 24px; font-weight: 600;">
            ${c.signature || "With all my love & warmest wishes 🎂"}
          </div>
          <div class="village-modal-actions">
            <button id="btn-close-surprise" class="btn-primary" style="background: linear-gradient(135deg, #f472b6 0%, #db2777 100%);">
              <span>💖</span> <span>Thank You, Panda! 🌸</span>
            </button>
          </div>
        </div>
      `;
    } else if (giftId === 2) {
      // 2. I Miss You Message
      cardHtml = `
        <div class="village-modal-card interactive" style="border-color: #c084fc; box-shadow: 0 16px 48px rgba(0,0,0,0.6), 0 0 35px rgba(192, 132, 252, 0.4);">
          <div class="village-modal-tag" style="color: #c084fc; border-color: rgba(192, 132, 252, 0.5);">💌 TENDER WORDS • FROM THE HEART</div>
          <h2 class="village-modal-title" style="color: #e9d5ff;">${c.heading || "Every Day I Miss You 💌"}</h2>
          <p class="village-modal-body" style="font-size: 15.5px; line-height: 1.85;">
            ${c.message}
          </p>
          <div style="font-style: italic; color: #fbcfe8; margin-bottom: 24px; font-weight: 600;">
            ${c.signature || "Always thinking of you 🌸"}
          </div>
          <div class="village-modal-actions">
            <button id="btn-close-surprise" class="btn-primary" style="background: linear-gradient(135deg, #c084fc 0%, #9333ea 100%);">
              <span>💌</span> <span>Keep in My Heart</span>
            </button>
          </div>
        </div>
      `;
    } else if (giftId === 3 || giftId === 4) {
      // 3 & 4. Photo Memories
      const photoSrc = (giftId === 3 && window.PHOTO1_DATA_URI) ? window.PHOTO1_DATA_URI :
                       (giftId === 4 && window.PHOTO2_DATA_URI) ? window.PHOTO2_DATA_URI :
                       c.photo_url || "static/photos/photo_memory_1.jpg";

      cardHtml = `
        <div class="village-modal-card interactive" style="max-width: 520px; border-color: ${c.accent_color || '#ffd700'};">
          <div class="village-modal-tag">📸 CHERISHED MEMORY • BOX ${giftId}</div>
          <h2 class="village-modal-title" style="font-size: 24px; margin-bottom: 8px;">${c.heading}</h2>
          
          <div class="photo-frame-container">
            <div class="photo-frame-border ${giftId === 4 ? 'rose-gold' : ''}">
              <img src="${photoSrc}" alt="Ashitha Memory Photo" class="photo-frame-img" onerror="this.src='static/textures/cherry_blossom.png'">
            </div>
            <div class="photo-date-badge">✦ ${c.date || "Treasured Memory • Forever Kept"} ✦</div>
          </div>

          <p class="village-modal-body" style="font-size: 14.5px; margin-bottom: 20px;">
            ${c.caption}
          </p>
          <div class="village-modal-actions">
            <button id="btn-close-surprise" class="btn-primary">
              <span>🌸</span> <span>Cherish This Memory</span>
            </button>
          </div>
        </div>
      `;
    } else if (giftId === 5 || giftId === 6) {
      // 5 & 6. Cute Quotes
      cardHtml = `
        <div class="village-modal-card interactive" style="border-color: ${c.accent_color || '#ffd700'};">
          <div class="village-modal-tag">💭 SWEET MEMORIES • BOX ${giftId}</div>
          <h2 class="village-modal-title" style="font-size: 26px;">${c.heading}</h2>
          
          <div style="background: rgba(12, 10, 24, 0.7); border-left: 4px solid ${c.accent_color || '#ffd700'}; padding: 22px 26px; border-radius: 12px; margin: 16px 0 20px 0; text-align: left;">
            <div style="font-family: 'Playfair Display', Georgia, serif; font-size: 18px; font-style: italic; color: #fff; line-height: 1.7; margin-bottom: 12px;">
              "${c.quote}"
            </div>
            <div style="color: ${c.accent_color || '#ffd700'}; font-weight: 600; font-size: 13px; text-align: right;">
              ${c.author}
            </div>
          </div>

          <p class="village-modal-body" style="font-size: 14.5px; margin-bottom: 22px;">
            ${c.reflection}
          </p>
          <div class="village-modal-actions">
            <button id="btn-close-surprise" class="btn-primary">
              <span>✨</span> <span>Keep Smiling, Panda!</span>
            </button>
          </div>
        </div>
      `;
    } else if (giftId === 7) {
      // 7. Movie & Song
      const audioSrc = (window.PRELOADED_AUDIO_URI && window.PRELOADED_AUDIO_URI.length > 50) 
        ? window.PRELOADED_AUDIO_URI 
        : c.audio_url || "static/audio/birthday_song.mp3";

      cardHtml = `
        <div class="village-modal-card interactive" style="border-color: #fbbf24;">
          <div class="village-modal-tag" style="color: #fbbf24; border-color: rgba(251, 191, 36, 0.4);">🎬🎶 SPECIAL CINEMATIC SURPRISE</div>
          <h2 class="village-modal-title" style="color: #fde68a;">${c.heading}</h2>
          
          <p class="village-modal-body" style="margin-bottom: 10px;">
            ${c.description}
          </p>

          <div class="gift-media-player">
            <div class="player-track-info">
              <div class="player-track-title">${c.song_title || "அழகான நிலவே • Sweet Melody for Panda"}</div>
              <div class="player-track-artist">${c.artist || "Dedicated to Ashitha 💖"}</div>
            </div>

            <audio id="gift-audio-element" src="${audioSrc}" preload="auto"></audio>

            <div class="player-controls-row">
              <button id="player-play-toggle" class="player-play-btn" title="Play Melody">
                ▶
              </button>
            </div>

            <div class="player-progress-container">
              <span id="player-time-current" class="player-time-display">0:00</span>
              <div id="player-progress-track" class="player-progress-bar">
                <div id="player-progress-bar" class="player-progress-fill"></div>
              </div>
              <span id="player-time-total" class="player-time-display">--:--</span>
            </div>
          </div>

          <div class="village-modal-actions">
            <button id="btn-close-surprise" class="btn-primary">
              <span>🌸</span> <span>Close Player</span>
            </button>
          </div>
        </div>
      `;
    } else if (giftId === 8 || giftId === 9) {
      // 8 & 9. Secret Password Clues
      const code = c.code || (giftId === 8 ? "apd43" : "na1");
      const isBlue = (giftId === 9);
      const letters = code.split('');

      if (window.audioManager && window.audioManager.playClueRevealSound) {
        window.audioManager.playClueRevealSound();
      }

      cardHtml = `
        <div class="village-modal-card interactive" style="border-color: ${isBlue ? '#38bdf8' : '#ffd700'}; box-shadow: 0 16px 48px rgba(0,0,0,0.6), 0 0 35px ${isBlue ? 'rgba(56, 189, 248, 0.4)' : 'rgba(255, 215, 0, 0.4)'};">
          <div class="village-modal-tag" style="color: ${isBlue ? '#38bdf8' : '#ffd700'}; border-color: ${isBlue ? 'rgba(56, 189, 248, 0.5)' : 'rgba(255, 215, 0, 0.5)'};">
            📜 ANCIENT SECRET • CLUE ${giftId === 8 ? '1/2' : '2/2'}
          </div>
          <h2 class="village-modal-title" style="color: ${isBlue ? '#7dd3fc' : '#fef08a'};">${c.heading}</h2>
          
          <div class="clue-tiles-container">
            ${letters.map(ch => `<div class="clue-tile ${isBlue ? 'blue' : ''}">${ch}</div>`).join('')}
          </div>

          <div class="clue-pill-box" style="${isBlue ? 'color: #38bdf8; border-color: #38bdf8; background: rgba(56, 189, 248, 0.15);' : ''}">
            Exact Clue: ${code}
          </div>

          <p class="village-modal-body" style="font-size: 15px; line-height: 1.8;">
            ${c.instruction}
          </p>

          <div class="village-modal-actions">
            <button id="btn-close-surprise" class="btn-primary" style="${isBlue ? 'background: linear-gradient(135deg, #38bdf8 0%, #0284c7 100%);' : ''}">
              <span>🗝️</span> <span>I Will Remember!</span>
            </button>
          </div>
        </div>
      `;
    } else if (giftId === 10) {
      // 10. Magical Kingdom Key
      cardHtml = `
        <div class="village-modal-card interactive" style="border-color: #ec4899; box-shadow: 0 16px 48px rgba(0,0,0,0.6), 0 0 40px rgba(236, 72, 153, 0.4);">
          <div class="village-modal-tag" style="color: #ec4899; border-color: rgba(236, 72, 153, 0.5);">👑 FINAL SURPRISE • BOX 10</div>
          <h2 class="village-modal-title" style="color: #fbcfe8;">The Magic to the Kingdom 🌟</h2>
          
          <div style="font-size: 58px; margin: 12px 0; animation: float 2.5s infinite ease-in-out;">
            💎✨
          </div>

          <p class="village-modal-body" style="font-size: 15.5px; line-height: 1.85;">
            ${c.description || "A radiant celestial crystal pulsing with pure fairytale magic! Combine your two secret clues (apd43 and na1) to unlock the Princess Kingdom!"}
          </p>

          <div class="village-modal-actions" style="display: flex; gap: 14px; justify-content: center;">
            <button id="btn-open-password-screen" class="btn-primary" style="background: linear-gradient(135deg, #ec4899 0%, #be185d 100%); font-weight: 700; box-shadow: 0 0 25px rgba(236, 72, 153, 0.6); animation: pulse-glow 1.5s infinite alternate;">
              <span>👑</span> <span>Unlock the Kingdom 🔑</span>
            </button>
            <button id="btn-close-surprise" class="glass-btn">
              <span>Later</span>
            </button>
          </div>
        </div>
      `;
    }

    overlay.innerHTML = cardHtml;
    document.body.appendChild(overlay);

    const closeBtn = document.getElementById('btn-close-surprise');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        if (window.audioManager) window.audioManager.playChime(1.0);
        if (this.currentAudioPlayer) {
          try { this.currentAudioPlayer.pause(); } catch(e) {}
          this.currentAudioPlayer = null;
        }
        overlay.remove();
      });
    }

    // Media Player controls for Box 7
    if (giftId === 7) {
      const audioElem = document.getElementById('gift-audio-element');
      const playToggle = document.getElementById('player-play-toggle');
      const progressFill = document.getElementById('player-progress-bar');
      const trackBar = document.getElementById('player-progress-track');
      const timeCur = document.getElementById('player-time-current');
      const timeTot = document.getElementById('player-time-total');

      this.currentAudioPlayer = audioElem;

      if (playToggle && audioElem) {
        playToggle.addEventListener('click', () => {
          if (audioElem.paused) {
            audioElem.play().then(() => {
              playToggle.innerText = '⏸';
              playToggle.classList.add('playing');
            }).catch(e => {
              console.warn("Audio play prevented:", e);
            });
          } else {
            audioElem.pause();
            playToggle.innerText = '▶';
            playToggle.classList.remove('playing');
          }
        });

        audioElem.addEventListener('timeupdate', () => {
          if (!audioElem.duration) return;
          const pct = (audioElem.currentTime / audioElem.duration) * 100;
          if (progressFill) progressFill.style.width = pct + '%';

          const curM = Math.floor(audioElem.currentTime / 60);
          const curS = Math.floor(audioElem.currentTime % 60).toString().padStart(2, '0');
          if (timeCur) timeCur.innerText = `${curM}:${curS}`;

          const totM = Math.floor(audioElem.duration / 60);
          const totS = Math.floor(audioElem.duration % 60).toString().padStart(2, '0');
          if (timeTot) timeTot.innerText = `${totM}:${totS}`;
        });

        if (trackBar) {
          trackBar.addEventListener('click', (e) => {
            const rect = trackBar.getBoundingClientRect();
            const clickPos = (e.clientX - rect.left) / rect.width;
            if (audioElem.duration) {
              audioElem.currentTime = clickPos * audioElem.duration;
            }
          });
        }
      }
    }

    // Password Screen trigger for Box 10
    const passBtn = document.getElementById('btn-open-password-screen');
    if (passBtn) {
      passBtn.addEventListener('click', () => {
        overlay.remove();
        this.showKingdomPasswordScreen();
      });
    }
  }

  /* -------------------------------------------------------------
   * 6. PASSWORD SYSTEM & KINGDOM TRANSITION
   * -----------------------------------------------------------*/
  showKingdomPasswordScreen() {
    this.clearHoverState();
    const existing = document.getElementById('kingdom-password-modal');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.id = 'kingdom-password-modal';
    overlay.className = 'village-modal-backdrop';
    overlay.innerHTML = `
      <div class="village-modal-card interactive" style="border-color: #ffd700; box-shadow: 0 16px 48px rgba(0,0,0,0.6), 0 0 35px rgba(255, 215, 0, 0.35);">
        <div class="village-modal-tag" style="color: #ffd700; border-color: rgba(255, 215, 0, 0.4);">👑 SECRET KINGDOM PORTAL</div>
        <h2 class="village-modal-title glow-gold">Panda, can you unlock the secret kingdom?</h2>
        <p class="village-modal-body" style="font-size: 14.5px; margin-bottom: 12px;">
          Combine the secret clues you discovered throughout Panda Village to unlock the sacred entrance.
        </p>

        <div class="kingdom-password-box">
          <input type="text" id="kingdom-password-input" class="kingdom-input" placeholder="Enter password..." autocomplete="off">
          <div id="kingdom-error-msg" class="kingdom-error-msg"></div>
          <button id="btn-unlock-kingdom" class="btn-primary" style="background: linear-gradient(135deg, #ffd700 0%, #b8860b 100%); color: #1e1302; font-weight: 700; padding: 12px 32px; font-size: 15px;">
            <span>👑</span> <span>Unlock Kingdom</span>
          </button>
        </div>

        <div class="village-modal-actions">
          <button id="btn-cancel-password" class="glass-btn">
            <span>Cancel</span>
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    const inputElem = document.getElementById('kingdom-password-input');
    const errorElem = document.getElementById('kingdom-error-msg');
    const unlockBtn = document.getElementById('btn-unlock-kingdom');
    const cancelBtn = document.getElementById('btn-cancel-password');

    setTimeout(() => { if (inputElem) inputElem.focus(); }, 150);

    const handleAttempt = () => {
      const val = (inputElem ? inputElem.value : '').trim().toLowerCase();
      // Case-insensitive verification for "panda143"
      if (val === 'panda143') {
        overlay.remove();
        this.triggerKingdomTransition();
      } else {
        if (window.audioManager && window.audioManager.playIncorrectPasswordSound) {
          window.audioManager.playIncorrectPasswordSound();
        }
        if (inputElem) {
          inputElem.classList.remove('shake-error');
          void inputElem.offsetWidth;
          inputElem.classList.add('shake-error');
        }
        if (errorElem) {
          errorElem.innerText = "Not quite, Panda! Remember the secret clues.";
        }
      }
    };

    if (unlockBtn) unlockBtn.addEventListener('click', handleAttempt);
    if (inputElem) {
      inputElem.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') handleAttempt();
      });
    }

    if (cancelBtn) {
      cancelBtn.addEventListener('click', () => {
        if (window.audioManager) window.audioManager.playChime(1.0);
        overlay.remove();
      });
    }
  }

  triggerKingdomTransition() {
    if (window.audioManager && window.audioManager.playKingdomUnlockSound) {
      window.audioManager.playKingdomUnlockSound();
    }

    // 1. Crystal on Box 10 flares with radiant light
    const gift10 = this.gifts.find(g => g.id === 10);
    if (gift10 && gift10.magicalObject) {
      const cLight = gift10.magicalObject.getObjectByProperty('isPointLight', true);
      if (cLight) gsap.to(cLight, { intensity: 8.0, distance: 16.0, duration: 1.2 });
    }

    // 2. Ascending Golden Butterfly leaving trail of golden particles
    const tBf = this.createButterflyMesh(0xffd700);
    const startPos = (gift10 && gift10.mesh) ? gift10.mesh.position : new THREE.Vector3(6.8, 2.0, -17.5);
    tBf.position.set(startPos.x, startPos.y + 0.8, startPos.z);
    tBf.scale.set(1.8, 1.8, 1.8);
    this.natureGroup.add(tBf);

    gsap.to(tBf.position, {
      x: 0,
      y: 28.0,
      z: -45.0,
      duration: 3.5,
      ease: "power2.out"
    });

    // 3. Glowing Kingdom Portal / Doorway appears in the valley clouds
    const kingdomArch = this.createKingdomEntranceMesh();
    kingdomArch.position.set(0, 18.0, -55.0);
    kingdomArch.scale.set(0.01, 0.01, 0.01);
    this.natureGroup.add(kingdomArch);

    gsap.to(kingdomArch.scale, {
      x: 1.0,
      y: 1.0,
      z: 1.0,
      duration: 2.5,
      ease: "elastic.out(1, 0.6)"
    });

    // 4. Camera smoothly moves toward kingdom entrance
    gsap.to(this.camera.position, {
      x: 0,
      y: 16.0,
      z: -26.0,
      duration: 3.8,
      ease: "power2.inOut"
    });
    if (this.controls) {
      gsap.to(this.controls.target, {
        x: 0,
        y: 18.0,
        z: -55.0,
        duration: 3.8,
        ease: "power2.inOut"
      });
    }

    if (window.confetti) {
      window.confetti({ particleCount: 120, spread: 100, origin: { y: 0.4 } });
    }

    // Update StageTracker to Stage 6 (Celestial Wish / Princess Kingdom Entrance)
    if (this.stage4 && this.stage4.stageManager) {
      this.stage4.stageManager.updateTracker(6);
    }

    // Display Kingdom Entrance Modal
    setTimeout(() => {
      this.showKingdomEntranceModal();
    }, 4000);
  }

  createKingdomEntranceMesh() {
    const archGroup = new THREE.Group();
    archGroup.name = "KingdomEntranceArch";

    const goldMat = new THREE.MeshStandardMaterial({
      color: 0xffd700,
      roughness: 0.15,
      metalness: 0.95,
      emissive: 0x664a00,
      emissiveIntensity: 0.8
    });

    const crystalMat = new THREE.MeshStandardMaterial({
      color: 0xfbcfe8,
      roughness: 0.1,
      metalness: 0.8,
      emissive: 0xf472b6,
      emissiveIntensity: 1.2,
      side: THREE.DoubleSide
    });

    // Portal Ring
    const archRing = new THREE.Mesh(new THREE.TorusGeometry(7.5, 0.35, 12, 48), goldMat);
    archGroup.add(archRing);

    // Inner Radiant Disk
    const pCanvas = document.createElement('canvas');
    pCanvas.width = 128;
    pCanvas.height = 128;
    const pCtx = pCanvas.getContext('2d');
    const pGrad = pCtx.createRadialGradient(64, 64, 2, 64, 64, 62);
    pGrad.addColorStop(0, 'rgba(255, 255, 255, 1)');
    pGrad.addColorStop(0.4, 'rgba(251, 207, 232, 0.8)');
    pGrad.addColorStop(0.8, 'rgba(244, 114, 182, 0.4)');
    pGrad.addColorStop(1, 'rgba(244, 114, 182, 0)');
    pCtx.fillStyle = pGrad;
    pCtx.fillRect(0, 0, 128, 128);

    const disc = new THREE.Mesh(
      new THREE.CircleGeometry(7.2, 32),
      new THREE.MeshBasicMaterial({
        map: new THREE.CanvasTexture(pCanvas),
        transparent: true,
        opacity: 0.85,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide
      })
    );
    archGroup.add(disc);

    // Twin Crystal Pillars
    [-7.8, 7.8].forEach(px => {
      const col = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.45, 14.0, 12), goldMat);
      col.position.set(px, -3.5, 0);
      archGroup.add(col);

      const orb = new THREE.Mesh(new THREE.SphereGeometry(0.65, 12, 12), crystalMat);
      orb.position.set(px, 3.8, 0);
      archGroup.add(orb);
    });

    const light = new THREE.PointLight(0xffd700, 4.0, 80.0);
    archGroup.add(light);

    const hitGeo = new THREE.SphereGeometry(8.5, 8, 8);
    const hitMat = new THREE.MeshBasicMaterial({ visible: false });
    const portalHitBox = new THREE.Mesh(hitGeo, hitMat);
    portalHitBox.name = "KingdomPortalHitBox";
    portalHitBox.userData = { isKingdomPortal: true };
    archGroup.add(portalHitBox);
    this.portalHitBox = portalHitBox;

    return archGroup;
  }

  showKingdomEntranceModal() {
    this.clearHoverState();
    if (document.getElementById('kingdom-entrance-modal')) return;

    const overlay = document.createElement('div');
    overlay.id = 'kingdom-entrance-modal';
    overlay.className = 'village-modal-backdrop';
    overlay.innerHTML = `
      <div class="village-modal-card interactive" style="border-color: #ffd700; box-shadow: 0 16px 48px rgba(0,0,0,0.6), 0 0 45px rgba(255, 215, 0, 0.5);">
        <div class="village-modal-tag" style="color: #ffd700; border-color: rgba(255, 215, 0, 0.5);">🏰 THE GATES HAVE OPENED</div>
        <h2 class="village-modal-title glow-gold">The Princess Kingdom Awakens! 👑✨</h2>
        <p class="village-modal-body" style="font-size: 16px; line-height: 1.85;">
          Congratulations, Panda! 💖 You cracked the ancient secret password (<span style="color: #ffd700; font-weight: 700;">panda143</span>) and awakened the grand celestial entrance to the Princess Kingdom!
          <br><br>
          Your fairytale coronation, crystal fountains, and Queen Panda await on the other side.
        </p>
        <div class="village-modal-actions" style="display: flex; gap: 14px; justify-content: center;">
          <button id="btn-enter-kingdom-portal" class="btn-primary" style="background: linear-gradient(135deg, #ffd700 0%, #b8860b 100%); color: #1e1302; font-weight: 700; box-shadow: 0 0 25px rgba(255, 215, 0, 0.6); animation: pulse-glow 1.5s infinite alternate;">
            <span>👑</span> <span>Enter the Kingdom Portal 🌀</span>
          </button>
          <button id="btn-close-kingdom-modal" class="glass-btn">
            <span>Explore Village First</span>
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    const enterBtn = document.getElementById('btn-enter-kingdom-portal');
    if (enterBtn) {
      enterBtn.addEventListener('click', () => {
        if (window.audioManager) window.audioManager.playChime(1.2);
        overlay.remove();
        if (this.stage4 && this.stage4.stageManager) {
          this.stage4.stageManager.goToStage(5);
        }
      });
    }

    document.getElementById('btn-close-kingdom-modal').addEventListener('click', () => {
      if (window.audioManager) window.audioManager.playChime(1.1);
      overlay.remove();
      // Smoothly return camera to valley panorama
      gsap.to(this.camera.position, { x: -2.0, y: 3.5, z: -8.5, duration: 2.5, ease: "power2.inOut" });
      if (this.controls) gsap.to(this.controls.target, { x: 0, y: 2.5, z: -45.0, duration: 2.5 });
    });
  }

  /* -------------------------------------------------------------
   * 7. RAYCASTING INTERACTION (BUTTERFLIES & GIFTS)
   * -----------------------------------------------------------*/
  onPointerMove(event) {
    if (this.isCinematicRunning) return;

    if (event.target && event.target.closest && (event.target.closest('#nature-hud-panel') || event.target.closest('.village-modal-card') || event.target.closest('.glass-btn') || event.target.closest('.top-header') || event.target.closest('.bottom-bar'))) {
      this.clearHoverState();
      return;
    }

    const mouse = new THREE.Vector2(
      (event.clientX / window.innerWidth) * 2 - 1,
      -(event.clientY / window.innerHeight) * 2 + 1
    );

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, this.camera);

    // 1. Check Butterfly Hover
    if (this.butterflyHitBoxes.length > 0) {
      const bfIntersects = raycaster.intersectObjects(this.butterflyHitBoxes);
      if (bfIntersects.length > 0) {
        const hit = bfIntersects[0].object;
        const bfData = hit.userData.butterflyData;

        if (this.hoveredButterfly !== bfData) {
          this.unhighlightHoveredButterfly();
          this.hoveredButterfly = bfData;
          document.body.style.cursor = 'pointer';
          this.highlightButterfly(bfData);
        }
        this.showTooltip(event.clientX, event.clientY, "Touch the Butterfly 🦋");
        return;
      } else if (this.hoveredButterfly) {
        this.unhighlightHoveredButterfly();
        this.hoveredButterfly = null;
        document.body.style.cursor = 'default';
        this.hideTooltip();
      }
    }

    // 2. Check Pedestal Hover
    if (this.pedestalHitBox) {
      const pIntersects = raycaster.intersectObject(this.pedestalHitBox);
      if (pIntersects.length > 0) {
        if (!this.isPedestalHovered) {
          this.isPedestalHovered = true;
          document.body.style.cursor = 'pointer';
          if (this.pedestalLight) this.pedestalLight.intensity = this.keyActivated ? 3.8 : 2.6;
        }
        this.showTooltip(event.clientX, event.clientY, "Magical Keyhole Pedestal 🏛️✨");
        return;
      } else if (this.isPedestalHovered) {
        this.isPedestalHovered = false;
        document.body.style.cursor = 'default';
        if (this.pedestalLight) this.pedestalLight.intensity = this.keyActivated ? 2.5 : 1.3;
        this.hideTooltip();
      }
    }

    // 2b. Check Kingdom Portal Hover
    if (this.portalHitBox) {
      const archIntersects = raycaster.intersectObject(this.portalHitBox);
      if (archIntersects.length > 0) {
        document.body.style.cursor = 'pointer';
        this.showTooltip(event.clientX, event.clientY, "Magical Kingdom Portal • Click to Enter 👑🌀");
        return;
      }
    }

    // 3. Check Gift / Crystal Hover
    if (this.giftInteractiveObjects.length > 0) {
      const gIntersects = raycaster.intersectObjects(this.giftInteractiveObjects);
      if (gIntersects.length > 0) {
        const hit = gIntersects[0].object;

        if (hit.userData.isCrystal) {
          document.body.style.cursor = 'pointer';
          this.showTooltip(event.clientX, event.clientY, "Enchanted Star Crystal • Touch to Unlock 👑");
          return;
        }

        const def = hit.userData.def;
        const parentGroup = hit.userData.parentGroup;
        const isOpened = this.isGiftOpened(def.id);

        if (this.hoveredGift !== parentGroup) {
          this.unhighlightHoveredGift();
          this.hoveredGift = parentGroup;
          document.body.style.cursor = 'pointer';
          this.highlightGift(parentGroup);
        }
        const tipText = isOpened ? `${def.name} • Click to View 🎁` : `${def.name} (Find its Butterfly 🦋)`;
        this.showTooltip(event.clientX, event.clientY, tipText);
        return;
      } else if (this.hoveredGift) {
        this.unhighlightHoveredGift();
        this.hoveredGift = null;
        document.body.style.cursor = 'default';
        this.hideTooltip();
      }
    }
  }

  onPointerClick(event) {
    if (this.isCinematicRunning) return;

    if (event.target && event.target.closest && (event.target.closest('#nature-hud-panel') || event.target.closest('.village-modal-card') || event.target.closest('.glass-btn') || event.target.closest('.top-header') || event.target.closest('.bottom-bar'))) {
      return;
    }

    const mouse = new THREE.Vector2(
      (event.clientX / window.innerWidth) * 2 - 1,
      -(event.clientY / window.innerHeight) * 2 + 1
    );

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, this.camera);

    // 1. Butterfly Click (Primary Interaction)
    if (this.butterflyHitBoxes.length > 0) {
      const bfIntersects = raycaster.intersectObjects(this.butterflyHitBoxes);
      if (bfIntersects.length > 0) {
        const hit = bfIntersects[0].object;
        const bfData = hit.userData.butterflyData;
        this.openGiftWithButterfly(bfData);
        this.hideTooltip();
        return;
      }
    }

    // 2. Pedestal Click
    if (this.pedestalHitBox) {
      const pIntersects = raycaster.intersectObject(this.pedestalHitBox);
      if (pIntersects.length > 0) {
        this.onPedestalClick();
        return;
      }
    }

    // 2b. Kingdom Portal Click
    if (this.portalHitBox) {
      const archIntersects = raycaster.intersectObject(this.portalHitBox);
      if (archIntersects.length > 0) {
        if (this.stage4 && this.stage4.stageManager) {
          this.hideTooltip();
          this.stage4.stageManager.goToStage(5);
          return;
        }
      }
    }

    // 3. Gift or Crystal Click
    if (this.giftInteractiveObjects.length > 0) {
      const gIntersects = raycaster.intersectObjects(this.giftInteractiveObjects);
      if (gIntersects.length > 0) {
        const hit = gIntersects[0].object;

        if (hit.userData.isCrystal) {
          this.showKingdomPasswordScreen();
          return;
        }

        const def = hit.userData.def;
        // If box is already opened, allow re-inspecting its surprise card!
        if (this.isGiftOpened(def.id)) {
          this.showGiftSurpriseModal(def.id);
        } else {
          // If not opened yet, remind her to touch its butterfly!
          const bf = this.butterflies.find(b => b.id === def.id);
          if (bf) {
            this.highlightButterfly(bf);
            this.showTooltip(event.clientX, event.clientY, "Touch the magical butterfly to open this gift! 🦋");
          }
        }
      }
    }
  }

  highlightButterfly(bfData) {
    if (!bfData || !bfData.mesh) return;
    gsap.to(bfData.mesh.scale, { x: 1.6, y: 1.6, z: 1.6, duration: 0.25 });
    if (bfData.light) bfData.light.intensity = 2.2;
    if (bfData.wingMat) bfData.wingMat.emissiveIntensity = 1.2;
  }

  unhighlightHoveredButterfly() {
    if (!this.hoveredButterfly || !this.hoveredButterfly.mesh) return;
    const b = this.hoveredButterfly;
    gsap.to(b.mesh.scale, { x: 1.2, y: 1.2, z: 1.2, duration: 0.25 });
    if (b.light) b.light.intensity = 0.85;
    if (b.wingMat) b.wingMat.emissiveIntensity = 0.45;
  }

  highlightGift(giftGroup) {
    if (!giftGroup) return;
    gsap.to(giftGroup.scale, { x: 1.06, y: 1.06, z: 1.06, duration: 0.25 });
    if (giftGroup.userData.ribbonMat) giftGroup.userData.ribbonMat.emissiveIntensity = 0.65;
  }

  unhighlightHoveredGift() {
    if (!this.hoveredGift) return;
    gsap.to(this.hoveredGift.scale, { x: 1.0, y: 1.0, z: 1.0, duration: 0.25 });
    if (this.hoveredGift.userData.ribbonMat) this.hoveredGift.userData.ribbonMat.emissiveIntensity = 0.2;
  }

  clearHoverState() {
    if (this.isPedestalHovered) {
      this.isPedestalHovered = false;
      document.body.style.cursor = 'default';
      if (this.pedestalLight) this.pedestalLight.intensity = this.keyActivated ? 2.5 : 1.3;
    }
    if (this.hoveredButterfly) {
      this.unhighlightHoveredButterfly();
      this.hoveredButterfly = null;
      document.body.style.cursor = 'default';
    }
    if (this.hoveredGift) {
      this.unhighlightHoveredGift();
      this.hoveredGift = null;
      document.body.style.cursor = 'default';
    }
    this.hideTooltip();
  }

  showTooltip(clientX, clientY, text) {
    if (!this.tooltipElem) {
      this.tooltipElem = document.createElement('div');
      this.tooltipElem.className = 'butterfly-tooltip';
      document.body.appendChild(this.tooltipElem);
    }
    this.tooltipElem.innerText = text;
    this.tooltipElem.style.display = 'block';
    this.tooltipElem.style.left = (clientX + 16) + 'px';
    this.tooltipElem.style.top = (clientY - 38) + 'px';
  }

  hideTooltip() {
    if (this.tooltipElem) {
      this.tooltipElem.style.display = 'none';
    }
  }

  /* -------------------------------------------------------------
   * 8. PER-FRAME UPDATE LOOP
   * -----------------------------------------------------------*/
  update(deltaTime) {
    const time = performance.now() * 0.001;

    // 1. Swirl Pedestal Particles & Breathing Runes
    if (this.pedestalParticles) {
      this.pedestalParticles.rotation.y += deltaTime * 0.35;
      const pos = this.pedestalParticles.geometry.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        let y = pos.getY(i) + deltaTime * 0.12;
        if (y > 2.0) y = 0.5;
        pos.setY(i, y);
      }
      pos.needsUpdate = true;
    }

    if (!this.isCinematicRunning) {
      const breath = 0.28 + Math.sin(time * 2.0) * 0.12;
      this.pedestalRuneMats.forEach(mat => {
        if (!this.keyActivated) mat.emissiveIntensity = breath;
      });
    }

    // 2. Update Sky Portal Rotation (during descent)
    if (this.portalGroup) {
      this.portalGroup.rotation.y += deltaTime * 0.25;
      if (this.portalParticles) this.portalParticles.rotation.y -= deltaTime * 0.45;
    }

    // 3. Update 10 Dedicated Butterflies (Wing Flap & Orbit)
    this.butterflies.forEach(b => {
      if (b.state !== 'flying') return;

      b.angle += b.speed * deltaTime;
      const flap = Math.sin(time * b.flutterFreq) * 0.85;
      if (b.leftWing) b.leftWing.rotation.y = flap;
      if (b.rightWing) b.rightWing.rotation.y = -flap;

      const rad = 0.95 + Math.sin(b.angle * 1.5) * 0.35;
      b.mesh.position.x = b.centerX + Math.cos(b.angle) * rad;
      b.mesh.position.z = b.centerZ + Math.sin(b.angle) * rad;
      b.mesh.position.y = b.centerY + 0.85 + Math.sin(b.angle * 2.2) * 0.25;

      b.mesh.rotation.y = -b.angle + Math.PI / 2;
      b.mesh.rotation.z = Math.cos(b.angle) * 0.2;
    });

    // 4. Update Landing Particle Rings
    for (let r = this.particleRings.length - 1; r >= 0; r--) {
      const ring = this.particleRings[r];
      ring.age += deltaTime;
      ring.radius += deltaTime * 2.2;
      const progress = ring.radius / ring.maxRadius;
      ring.mat.opacity = Math.max(0, 0.9 * (1.0 - progress));

      const pos = ring.geo.attributes.position;
      for (let i = 0; i < ring.angles.length; i++) {
        const ang = ring.angles[i];
        pos.setX(i, Math.cos(ang) * ring.radius);
        pos.setZ(i, Math.sin(ang) * ring.radius);
      }
      pos.needsUpdate = true;

      if (progress >= 1.0) {
        this.natureGroup.remove(ring.group);
        this.particleRings.splice(r, 1);
      }
    }

    // 5. Update Magic Bursts
    for (let b = this.magicBursts.length - 1; b >= 0; b--) {
      const burst = this.magicBursts[b];
      burst.age += deltaTime;
      const progress = burst.age / burst.lifespan;
      burst.mat.opacity = Math.max(0, 1.0 - progress);

      const pos = burst.geo.attributes.position;
      for (let i = 0; i < burst.vels.length; i++) {
        const v = burst.vels[i];
        pos.setX(i, pos.getX(i) + v.x * deltaTime);
        pos.setY(i, pos.getY(i) + v.y * deltaTime);
        pos.setZ(i, pos.getZ(i) + v.z * deltaTime);
        v.y -= 1.8 * deltaTime;
      }
      pos.needsUpdate = true;

      if (progress >= 1.0) {
        this.natureGroup.remove(burst.group);
        this.magicBursts.splice(b, 1);
      }
    }

    // 6. Box 10 Magical Crystal Slow Rotation
    const g10 = this.gifts.find(g => g.id === 10);
    if (g10 && g10.magicalObject && this.isGiftOpened(10)) {
      g10.magicalObject.rotation.y += deltaTime * 0.85;
      g10.magicalObject.position.y = 0.55 + Math.sin(time * 2.0) * 0.08;
    }
  }

  getDefaultGiftContents() {
    return {
      "1": {
        "box": 1,
        "type": "Birthday Wish",
        "title": "A Birthday Wish for Panda",
        "heading": "Happy Birthday, Ashitha! 🌸🐼",
        "message": "Wishing the sweetest, most wonderful Panda in the entire universe a birthday filled with infinite joy, unconditional love, grand success, and sparkling memories! May this year bring you warmth, peace, and dreams fulfilled in the most breathtaking way. You deserve all the happiness the world has to offer! 💖✨",
        "signature": "With all my love & warmest hugs 🎂"
      },
      "2": {
        "box": 2,
        "type": "I Miss You Message",
        "title": "I Miss You, Panda",
        "heading": "Every Day I Miss You 💌",
        "message": "Hey Panda, words can never truly express how much I miss you. Life has its busy hours, but in every quiet moment, my thoughts always drift back to your radiant smile, your infectious laughter, and your gentle voice. You make every day brighter simply by being you. You are so deeply special to me, and you are always close to my heart. 💖🐼",
        "signature": "Always missing you & thinking of you 🌸"
      },
      "3": {
        "box": 3,
        "type": "Photo Memory",
        "title": "Our Memory",
        "heading": "A Moment Frozen in Time 📸",
        "photo_url": "static/photos/photo_memory_1.jpg",
        "caption": "A candid memory filled with sunlight, soft cherry blossoms, and that radiant smile that always lights up my entire world.",
        "date": "Treasured Memory • Ashitha & Panda"
      },
      "4": {
        "box": 4,
        "type": "Photo Memory",
        "title": "Another Beautiful Memory",
        "heading": "Another Beautiful Memory 🖼️",
        "photo_url": "static/photos/photo_memory_2.jpg",
        "caption": "Underneath the starlit sky and warm glowing lanterns, every little step taken together turns into an eternal fairytale memory.",
        "date": "Unforgettable Chapter • Forever Kept"
      },
      "5": {
        "box": 5,
        "type": "Cute Memory Quote",
        "title": "A Cute Little Memory",
        "heading": "Giggles & Little Moments 💭",
        "quote": "The sweetest moments in life are the unplanned ones — the quiet giggles, silly faces, cozy naps, and little smiles that make everything feel magical.",
        "author": "Dedicated to Panda 🐼",
        "reflection": "Every small giggle with you is my favorite memory! 😊"
      },
      "6": {
        "box": 6,
        "type": "Cute Memory Quote",
        "title": "A Memory to Keep",
        "heading": "Forever in the Heart 💖",
        "quote": "Some souls make the entire world brighter just by being in it. You are my favorite reminder that kindness, gentleness, and magic are real.",
        "author": "A Keepsake for Ashitha ✨",
        "reflection": "No matter where the road leads, our shared memories remain forever. 🌟"
      },
      "7": {
        "box": 7,
        "type": "Movie and Song",
        "title": "A Little Movie Surprise",
        "heading": "A Melody Dedicated to You 🎬🎶",
        "audio_url": "static/audio/birthday_song.mp3",
        "song_title": "அழகான நிலவே • Sweet Melody for Panda",
        "artist": "Special Birthday Dedication for Ashitha",
        "description": "Press Play to listen to your dedicated song while the musical notes drift across Panda Village."
      },
      "8": {
        "box": 8,
        "type": "Hidden Password Clue",
        "title": "A Secret Clue",
        "heading": "Secret Password Fragment I 📜",
        "code": "apd43",
        "instruction": "Panda, you have discovered the first sacred clue! Remember this exact code: apd43. It is part of the secret password needed to unlock the gates to the Princess Kingdom!"
      },
      "9": {
        "box": 9,
        "type": "Hidden Password Clue",
        "title": "Another Secret Clue",
        "heading": "Secret Password Fragment II 📜",
        "code": "na1",
        "instruction": "The mystery deepens! You found the second clue: na1. Combine both secret clues (apd43 and na1) to solve the puzzle and reveal the password for the Kingdom!"
      },
      "10": {
        "box": 10,
        "type": "Magical Kingdom Key",
        "title": "The Magic to the Kingdom",
        "heading": "The Celestial Key to the Kingdom 👑✨",
        "prompt_text": "Panda, can you unlock the secret kingdom?",
        "correct_password": "panda143",
        "description": "A radiant celestial crystal pulsing with pure fairytale magic. Click the crystal to enter the secret password and open the entrance to the Princess Kingdom!"
      }
    };
  }

  cleanup() {
    window.removeEventListener('pointermove', this.onPointerMove);
    window.removeEventListener('click', this.onPointerClick);
    this.hideTooltip();

    if (this.currentAudioPlayer) {
      try { this.currentAudioPlayer.pause(); } catch(e) {}
      this.currentAudioPlayer = null;
    }

    ['pedestal-interaction-modal', 'gift-surprise-modal', 'kingdom-password-modal', 'kingdom-entrance-modal', 'surprise-revealed-modal'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.remove();
    });
  }
}

window.MagicalGiftReveal = MagicalGiftReveal;
window.GIFT_DEFINITIONS = GIFT_DEFINITIONS;
