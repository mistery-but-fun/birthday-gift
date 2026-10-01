/**
 * Stage5_KingdomEntrance.js
 * 
 * Rich, Realistic, Cinematic 3D Fantasy Royal Kingdom:
 * - Natural Color Grading & Photorealistic Balanced Lighting (No blown-out white glare!)
 * - Soft Blue Atmospheric Sky with gentle drifting white clouds & golden horizon glow
 * - Grand 3D Princess Castle Palace in natural French chateau limestone & slate-blue roofs
 * - Warm Textured Sandstone Cobblestone Promenade with carved stone balustrades
 * - Natural Deep Green Lawn & Symmetrical Parterre Gardens with layered colorful roses & lavender
 * - Flanking Noble Evergreen Trees & Sculpted Botanical Cherry Blossom Trees with realistic petal clusters
 * - Crystal Clear Turquoise Royal Fountain with tiered cascades, moving ripples & mist
 * - Winding Mountain Stream River crossed by Grand Classical Stone Bridges, Waterfalls & Gazebo
 * - Preserved Realistic Queen Panda with fluffy fur, sparkling 3D tiara jewels, breathing, and welcoming gesture
 * - Interactive Welcome Dialogue with name input, Continue 👑, and Not Yet (Look Around) 360° exploration
 */

function base64ToArrayBuffer(base64) {
  const binary_string = window.atob(base64);
  const len = binary_string.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binary_string.charCodeAt(i);
  }
  return bytes.buffer;
}

class Stage5_KingdomEntrance {
  constructor(stageManager) {
    this.stageManager = stageManager;
    this.scene = stageManager.scene;
    this.camera = stageManager.camera;
    this.controls = stageManager.controls;
    this.renderer = stageManager.renderer;

    this.kingdomGroup = null;
    this.tunnelGroup = null;
    this.tunnelParticles = null;
    this.groundGroup = null;
    this.fountainGroup = null;
    this.fountainWaterJet = null;
    this.fountainMistParticles = null;
    this.riverMesh = null;
    this.castleGroup = null;
    this.queenPandaGroup = null;
    this.queenPandaHitBox = null;
    this.crownSparkleLight = null;
    this.lanternLights = [];
    this.petalParticles = null;
    this.sparkleParticles = null;
    this.butterflies = [];
    this.animatedAnimals = [];
    this.floatingTalkButton = null;

    this.isCinematicActive = false;
    this.isDialogueOpen = false;
    this.guestName = "Queen Ashitha";
    this.originalToneMappingExposure = 1.15;

    // Secret Question State (Kingdom Entrance)
    this.hasAnsweredSecret = (typeof localStorage !== 'undefined' && localStorage.getItem('panda_secret_answered') === 'true');
    this.selectedSecretOption = null;
    this.birthdayGiftGroup = null;
    this.birthdayGiftHitBox = null;
    this.treasureChestGroup = null;
    this.treasureChestHitBox = null;
    this.palaceColonnadeGroup = null;
    this.royalThroneGroup = null;
    this.chestSparkles = null;

    // Final Royal Treasure Chest & Celebration State
    this.hasAnsweredChestQuestion = (typeof localStorage !== 'undefined' && localStorage.getItem('panda_chest_question_answered') === 'true');
    this.isChestUnlocked = (typeof localStorage !== 'undefined' && localStorage.getItem('panda_chest_unlocked') === 'true');
    this.isRingRevealed = (typeof localStorage !== 'undefined' && localStorage.getItem('panda_ring_revealed') === 'true');
    this.isCelebrationCompleted = (typeof localStorage !== 'undefined' && localStorage.getItem('panda_celebration_completed') === 'true');
    this.isCelebrationPlaying = false;
    this.selectedChestOption = null;

    this.chestLidPivot = null;
    this.chestInteriorLight = null;
    this.chestHoverPrompt = null;
    this.isChestHovered = false;
    this.royalRingGroup = null;
    this.ringGleamLight = null;

    this.kingPandaGroup = null;
    this.kingPandaHitBox = null;
    this.welcomingPandas = [];
    this.celebrationCard = null;

    // High-Quality Textures with proper aspect ratio tiling & fallback paths
    this.cobbleTex = this.loadTex(window.TEX_COBBLE_URI, 4, 22, 'static/textures/cobblestone_terrace.jpg');
    this.marbleTex = this.loadTex(window.TEX_MARBLE_URI, 4, 4, 'static/textures/royal_marble.jpg');
    this.meadowTex = this.loadTex(window.TEX_MEADOW_URI, 14, 14, 'static/textures/meadow_flowers.jpg');
    this.timberTex = this.loadTex(window.TEX_TIMBER_URI, 1, 4, 'static/textures/weathered_timber.jpg');
    this.blossomTex = this.loadTex(window.TEX_BLOSSOM_URI, 1, 1, 'static/textures/cherry_blossom.png');
    this.queenPandaTex = this.loadTex(window.TEX_QUEEN_PANDA_URI, 1, 1, 'static/textures/queen_panda.png');
    this.queenPandaGiftTex = this.loadTex(window.TEX_QUEEN_PANDA_GIFT_URI, 1, 1, 'static/textures/queen_panda_royal_gift.png');
    this.kingPandaTex = this.loadTex(window.TEX_KING_PANDA_MAMA_URI, 1, 1, 'static/textures/king_panda_mama.png');
    this.celebrationCinematicTex = this.loadTex(window.TEX_CELEBRATION_CINEMATIC_URI, 1, 1, 'static/textures/royal_celebration_cinematic.jpg');
    this.carpetTex = this.loadTex(window.TEX_ROYAL_CARPET_URI, 1, 8, 'static/textures/royal_purple_carpet.jpg');
    this.tapestryTex = this.loadTex(window.TEX_ROYAL_TAPESTRY_URI, 1, 1, 'static/textures/royal_throne_tapestry.jpg');
    this.chestTex = this.loadTex(window.TEX_ROYAL_CHEST_URI, 1, 1, 'static/textures/royal_treasure_chest.jpg');
    this.chestCutoutTex = this.loadTex(window.TEX_ROYAL_CHEST_CUTOUT_URI, 1, 1, 'static/textures/royal_treasure_chest_cutout.png');
    this.softCircleTex = this.createSoftCircleTexture();

    // GLTF Loader
    this.gltfLoader = new THREE.GLTFLoader();

    // Raycasting
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();

    this.onPointerMove = this.onPointerMove.bind(this);
    this.onPointerClick = this.onPointerClick.bind(this);
  }

  loadTex(uri, rx = 1, ry = 1, fallbackPath = null) {
    let source = uri;
    if (!source || source.length < 10) {
      if (fallbackPath) source = fallbackPath;
      else return null;
    }
    try {
      const loader = new THREE.TextureLoader();
      const tex = loader.load(source);
      tex.wrapS = THREE.RepeatWrapping;
      tex.wrapT = THREE.RepeatWrapping;
      tex.repeat.set(rx, ry);
      tex.anisotropy = 8;
      return tex;
    } catch (e) {
      return null;
    }
  }

  createSoftCircleTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    grad.addColorStop(0.0, 'rgba(255, 255, 255, 1)');
    grad.addColorStop(0.35, 'rgba(255, 235, 245, 0.9)');
    grad.addColorStop(0.7, 'rgba(255, 195, 225, 0.35)');
    grad.addColorStop(1.0, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(32, 32, 32, 0, Math.PI * 2);
    ctx.fill();

    const tex = new THREE.CanvasTexture(canvas);
    tex.needsUpdate = true;
    return tex;
  }

  enter(skipCinematic = false) {
    console.log("Entering Stage 5: Realistic 3D Royal Panda Kingdom...");
    this.hasAnsweredSecret = (typeof localStorage !== 'undefined' && localStorage.getItem('panda_secret_answered') === 'true');
    if (this.stageManager) {
      this.stageManager.updateTracker(5);
    }

    // 1. Cleanly dim earlier stage conflicting lights so Stage 5 has 100% controlled, realistic lighting
    if (window.environment && window.environment.dimForKingdom) {
      window.environment.dimForKingdom();
      window.environment.hideEntrance();
    }

    // 2. Set balanced tone mapping exposure to preserve rich stone textures and avoid highlight clipping
    if (this.renderer) {
      this.originalToneMappingExposure = this.renderer.toneMappingExposure || 1.15;
      this.renderer.toneMappingExposure = 0.98;
    }

    // 3. Clear any leftover modals from earlier stages
    const mc = document.getElementById('modal-container');
    if (mc) mc.innerHTML = '';

    const oldModal = document.getElementById('kingdom-entrance-modal');
    if (oldModal) oldModal.remove();
    const pwModal = document.getElementById('kingdom-password-modal');
    if (pwModal) pwModal.remove();
    const inspModal = document.getElementById('gift-inspection-modal');
    if (inspModal) inspModal.remove();
    const villIntro = document.getElementById('village-intro-modal');
    if (villIntro) villIntro.remove();

    // 4. Hide previous stage bottom bar
    const s4Nav = document.querySelector('.bottom-bar');
    if (s4Nav) s4Nav.style.display = 'none';

    // 5. Soft, natural atmospheric distance haze (preserves contrast while adding depth)
    this.scene.fog = new THREE.Fog(0xdbeafe, 190, 560);

    // 6. Build or show 3D Kingdom World
    if (!this.kingdomGroup) {
      this.buildTrue3DKingdomWorld();
    } else {
      this.kingdomGroup.visible = true;
    }

    // Top royal badge
    this.renderTopBadge();

    // Bottom Navigation
    this.renderBottomNavigation();

    if (!skipCinematic) {
      this.startPortalSequence();
    } else {
      this.settleAtTerrace(true);
    }

    window.removeEventListener('pointermove', this.onPointerMove);
    window.removeEventListener('click', this.onPointerClick);
    window.addEventListener('pointermove', this.onPointerMove);
    window.addEventListener('click', this.onPointerClick);
  }

  /* =========================================================================
   * 1. MASTER 3D KINGDOM WORLD BUILDER
   * =======================================================================*/
  buildTrue3DKingdomWorld() {
    this.kingdomGroup = new THREE.Group();
    this.kingdomGroup.name = "True3DKingdomWorld";

    // 1. Magical Transit Tunnel (only active during portal transition)
    this.buildMagicalTunnel();

    // 2. Realistic Soft Blue Sky Dome & Layered Mountains
    this.buildAtmosphericSkyAndMountains();

    // 3. Natural Grounds, Sandstone Promenade & Royal Gardens
    this.buildGroundAndGardens();

    // 4. The Grand Royal Tiered Fountain
    this.buildRoyalFountain();

    // 5. Turquoise River, Waterfalls & Grand Classical Bridges
    this.buildRiverAndBridges();

    // 6. The Grand Princess Castle Palace (French Chateau Limestone & Slate Blue Roofs)
    this.buildGrandPrincessCastle();

    // 7. Queen Panda Courtyard Entrance (Arch, Banner, Lanterns, & Queen Panda)
    this.buildQueenPandaCourtyard();

    // 8. Realistic 3D Wildlife (Swans, Companion Panda, Fairy Butterflies)
    this.buildWildlifeAndAnimals();

    // 9. Floating Petals & Golden Starlight Dust
    this.buildAtmosphericParticles();

    // 10. Cinematic Real-time Dynamic Lighting
    this.setupKingdomLighting();

    this.scene.add(this.kingdomGroup);
  }

  /* -------------------------------------------------------------------------
   * MAGICAL TRANSIT TUNNEL
   * -----------------------------------------------------------------------*/
  buildMagicalTunnel() {
    this.tunnelGroup = new THREE.Group();
    this.tunnelGroup.name = "MagicalTunnel";
    this.tunnelGroup.position.set(0, 18.0, -72.0);
    this.tunnelGroup.visible = false;

    const ringCount = 12;
    const ringMat = new THREE.MeshStandardMaterial({
      color: 0xd4af37,
      emissive: 0xec4899,
      emissiveIntensity: 0.65,
      roughness: 0.25,
      metalness: 0.75,
      transparent: true,
      opacity: 0.85,
      side: THREE.DoubleSide
    });

    for (let i = 0; i < ringCount; i++) {
      const ringGeo = new THREE.TorusGeometry(6.5 - (i * 0.12), 0.14, 8, 36);
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.position.z = (i - ringCount / 2) * 3.0;
      this.tunnelGroup.add(ring);
    }

    const pCount = 350;
    const pGeo = new THREE.BufferGeometry();
    const pPos = new Float32Array(pCount * 3);
    const pColors = new Float32Array(pCount * 3);

    for (let i = 0; i < pCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = 2.0 + Math.random() * 4.2;
      pPos[i * 3] = Math.cos(angle) * radius;
      pPos[i * 3 + 1] = Math.sin(angle) * radius;
      pPos[i * 3 + 2] = -18.0 + Math.random() * 36.0;

      const t = Math.random();
      pColors[i * 3] = 1.0;
      pColors[i * 3 + 1] = 0.8 + t * 0.2;
      pColors[i * 3 + 2] = 0.7 + t * 0.3;
    }

    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    pGeo.setAttribute('color', new THREE.BufferAttribute(pColors, 3));

    const pMat = new THREE.PointsMaterial({
      size: 0.42,
      map: this.softCircleTex,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    this.tunnelParticles = new THREE.Points(pGeo, pMat);
    this.tunnelGroup.add(this.tunnelParticles);
    this.kingdomGroup.add(this.tunnelGroup);
  }

  /* -------------------------------------------------------------------------
   * 2. REALISTIC SOFT BLUE SKY DOME & DISTANT ALPINE MOUNTAINS
   * -----------------------------------------------------------------------*/
  buildAtmosphericSkyAndMountains() {
    const skyGroup = new THREE.Group();
    skyGroup.name = "AtmosphericSky";

    // Sky Dome with natural soft daylight blue, gentle white clouds & warm horizon glow
    const skyGeo = new THREE.SphereGeometry(450, 48, 32);
    skyGeo.scale(-1, 1, 1);

    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');

    // Natural Sky Vertical Atmospheric Gradient (Camera horizon is around y=512)
    const skyGrad = ctx.createLinearGradient(0, 0, 0, 1024);
    skyGrad.addColorStop(0.0, '#1e40af');  // Royal sapphire zenith
    skyGrad.addColorStop(0.18, '#2563eb'); // Deep cerulean
    skyGrad.addColorStop(0.36, '#60a5fa'); // Clear daylight sky blue
    skyGrad.addColorStop(0.48, '#93c5fd'); // Soft atmospheric azure
    skyGrad.addColorStop(0.51, '#e0f2fe'); // Gentle cyan-tinted daylight mist at horizon
    skyGrad.addColorStop(0.53, '#fef08a'); // Warm golden sunlight horizon
    skyGrad.addColorStop(0.56, '#fed7aa'); // Soft gentle peach horizon
    skyGrad.addColorStop(0.70, '#cbd5e1'); // Shaded ground haze
    skyGrad.addColorStop(1.0, '#94a3b8');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, 1024, 1024);

    // Realistic Feathery White Cumulus Cloud Formations
    const drawCloud = (cx, cy, rx, ry, opacity = 0.45) => {
      ctx.save();
      const cGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, rx);
      cGrad.addColorStop(0.0, `rgba(255, 255, 255, ${opacity})`);
      cGrad.addColorStop(0.45, `rgba(255, 250, 245, ${opacity * 0.75})`);
      cGrad.addColorStop(0.8, `rgba(240, 245, 255, ${opacity * 0.3})`);
      cGrad.addColorStop(1.0, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = cGrad;
      ctx.beginPath();
      ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    };

    // Soft layered cloud banks in upper & middle atmosphere
    drawCloud(220, 240, 180, 50, 0.48);
    drawCloud(340, 260, 130, 42, 0.42);
    drawCloud(130, 275, 110, 36, 0.35);

    drawCloud(780, 220, 200, 56, 0.45);
    drawCloud(900, 245, 140, 44, 0.38);

    drawCloud(512, 340, 240, 60, 0.38);
    drawCloud(410, 365, 160, 45, 0.32);
    drawCloud(630, 355, 150, 42, 0.30);

    // Warm golden sunlight halo breaking from upper-right horizon (x: 740, y: 440)
    const sunGrad = ctx.createRadialGradient(740, 440, 20, 740, 440, 220);
    sunGrad.addColorStop(0.0, 'rgba(255, 255, 240, 0.95)');
    sunGrad.addColorStop(0.25, 'rgba(254, 240, 138, 0.65)');
    sunGrad.addColorStop(0.65, 'rgba(253, 186, 116, 0.28)');
    sunGrad.addColorStop(1.0, 'rgba(253, 186, 116, 0)');
    ctx.fillStyle = sunGrad;
    ctx.beginPath();
    ctx.arc(740, 440, 220, 0, Math.PI * 2);
    ctx.fill();

    const skyTex = new THREE.CanvasTexture(canvas);
    const skyMat = new THREE.MeshBasicMaterial({
      map: skyTex,
      depthWrite: false,
      fog: false
    });
    const skyMesh = new THREE.Mesh(skyGeo, skyMat);
    skyMesh.position.set(0, 18.0, -115.0);
    skyGroup.add(skyMesh);

    // Majestic Photorealistic Alpine Mountain Vista (Seamless 360° horizon panorama)
    const mountainTex = this.loadTex(window.TEX_MOUNTAINS_URI, 3, 1);
    if (mountainTex) {
      mountainTex.wrapS = THREE.RepeatWrapping;
      mountainTex.wrapT = THREE.ClampToEdgeWrapping;
      const panoGeo = new THREE.CylinderGeometry(380, 380, 160, 64, 1, true, 0, Math.PI * 2);
      const panoMat = new THREE.MeshBasicMaterial({
        map: mountainTex,
        side: THREE.BackSide,
        depthWrite: false,
        fog: false
      });
      const panoMesh = new THREE.Mesh(panoGeo, panoMat);
      panoMesh.position.set(0, 38.0, -115.0);
      skyGroup.add(panoMesh);
    }

    // Foreground Pine-Clad Rolling Green Foothills (z: -205) providing rich 3D terrain layering
    const forestHillMat = new THREE.MeshStandardMaterial({
      color: 0x14532d, // Deep pine forest green
      roughness: 0.88
    });
    for (let h = -7; h <= 7; h++) {
      const hill = new THREE.Mesh(new THREE.SphereGeometry(34.0, 16, 12), forestHillMat);
      hill.scale.set(1.4, 0.40, 1.0);
      hill.position.set(h * 28.0, 9.0, -205.0 + Math.sin(h * 0.85) * 10.0);
      skyGroup.add(hill);
    }

    this.kingdomGroup.add(skyGroup);
  }

  /* -------------------------------------------------------------------------
   * 3. EXPANSIVE GROUNDS, SANDSTONE PROMENADE & ROYAL BALUSTRADES
   * -----------------------------------------------------------------------*/
  buildGroundAndGardens() {
    this.groundGroup = new THREE.Group();
    this.groundGroup.name = "GroundAndGardens";

    // 1. Sprawling Emerald Lawn Terrain (Deep, rich natural meadow green)
    const grassMat = new THREE.MeshStandardMaterial({
      map: this.meadowTex,
      color: 0x2e6125, // Natural, rich meadow lawn green (no pale mint!)
      roughness: 0.88,
      metalness: 0.02
    });
    const terrainGeo = new THREE.PlaneGeometry(320, 260, 24, 24);
    const terrain = new THREE.Mesh(terrainGeo, grassMat);
    terrain.rotation.x = -Math.PI / 2;
    terrain.position.set(0, 17.15, -150.0);
    terrain.receiveShadow = true;
    this.groundGroup.add(terrain);

    // 2. Grand Textured Sandstone Cobblestone Promenade (Natural warm stone, authentic aspect ratio!)
    const pathMat = new THREE.MeshStandardMaterial({
      map: this.cobbleTex,
      color: 0xdfcfba, // Authentic warm sandstone / European palace paving
      roughness: 0.80,
      metalness: 0.03
    });
    const pathGeo = new THREE.BoxGeometry(14.0, 0.35, 78.0);
    const path = new THREE.Mesh(pathGeo, pathMat);
    path.position.set(0, 17.35, -125.0);
    path.receiveShadow = true;
    this.groundGroup.add(path);

    // Carved Weathered Limestone Curbs
    const curbMat = new THREE.MeshStandardMaterial({
      map: this.marbleTex,
      color: 0x7d6f5d, // Weathered limestone curb
      roughness: 0.82,
      metalness: 0.06
    });

    [-7.1, 7.1].forEach(cx => {
      const curb = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.45, 78.0), curbMat);
      curb.position.set(cx, 17.42, -125.0);
      curb.receiveShadow = true;
      this.groundGroup.add(curb);
    });

    // 3. Classical Carved Stone Balustrades along Promenade Edges (Matching the reference art!)
    const balustradeStoneMat = new THREE.MeshStandardMaterial({
      map: this.marbleTex,
      color: 0xb5a48e, // Warm carved limestone
      roughness: 0.72,
      metalness: 0.04
    });

    [-7.2, 7.2].forEach(bx => {
      // Plinth base beam
      const plinth = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.30, 56.0), balustradeStoneMat);
      plinth.position.set(bx, 17.55, -118.0);
      this.groundGroup.add(plinth);

      // Coping handrail
      const handrail = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.22, 56.0), balustradeStoneMat);
      handrail.position.set(bx, 18.65, -118.0);
      this.groundGroup.add(handrail);

      // Classical Balusters
      for (let bz = -144; bz <= -92; bz += 1.4) {
        const baluster = new THREE.Group();
        baluster.position.set(bx, 17.70, bz);

        const stem = new THREE.Mesh(
          new THREE.CylinderGeometry(0.10, 0.12, 0.85, 8),
          balustradeStoneMat
        );
        stem.position.y = 0.42;
        baluster.add(stem);

        const waist = new THREE.Mesh(
          new THREE.TorusGeometry(0.13, 0.04, 6, 12),
          balustradeStoneMat
        );
        waist.rotation.x = Math.PI / 2;
        waist.position.y = 0.42;
        baluster.add(waist);

        this.groundGroup.add(baluster);
      }

      // Decorative Balustrade Terminal Piers with glowing stone lanterns
      [-144.0, -118.0, -92.0].forEach(pz => {
        const pier = new THREE.Mesh(new THREE.BoxGeometry(0.72, 1.25, 0.72), balustradeStoneMat);
        pier.position.set(bx, 18.15, pz);
        this.groundGroup.add(pier);

        const lantern = this.createOrnateLantern();
        lantern.position.set(bx, 18.8, pz);
        this.groundGroup.add(lantern);
      });
    });

    // 4. Parterre Garden Beds with Dark Soil & Stone Borders
    const hedgeMat = new THREE.MeshStandardMaterial({
      color: 0x144521, // Deep English boxwood green
      roughness: 0.82
    });

    const soilMat = new THREE.MeshStandardMaterial({
      color: 0x1f150e, // Dark rich fertile compost soil
      roughness: 0.95
    });

    const parterres = [
      { x: -14.5, z: -102.0, w: 9.0, d: 20.0 },
      { x: 14.5,  z: -102.0, w: 9.0, d: 20.0 },
      { x: -14.5, z: -130.0, w: 9.0, d: 22.0 },
      { x: 14.5,  z: -130.0, w: 9.0, d: 22.0 }
    ];

    parterres.forEach(hl => {
      // Trimmed Boxwood Hedge border
      const hedgeOuter = new THREE.Mesh(new THREE.BoxGeometry(hl.w, 0.95, hl.d), hedgeMat);
      hedgeOuter.position.set(hl.x, 17.65, hl.z);
      hedgeOuter.castShadow = true;
      this.groundGroup.add(hedgeOuter);

      // Interior dark flowerbed soil
      const flowerBed = new THREE.Mesh(new THREE.BoxGeometry(hl.w - 1.2, 0.98, hl.d - 1.2), soilMat);
      flowerBed.position.set(hl.x, 17.68, hl.z);
      this.groundGroup.add(flowerBed);

      // Layered vibrant flowers (roses, marigolds, lilies, lavender)
      this.populateFlowerBed(hl.x, 18.25, hl.z, hl.w - 2.0, hl.d - 2.0);
    });

    // 5. Realistic Botanical Cherry Blossom Trees (Lush petal clusters with botanical variation)
    const treePositions = [
      { x: -18.5, z: -94.0,  s: 1.05 },
      { x: 18.5,  z: -94.0,  s: 1.0 },
      { x: -22.5, z: -112.0, s: 1.15 },
      { x: 22.5,  z: -112.0, s: 1.1 },
      { x: -22.5, z: -132.0, s: 1.2 },
      { x: 22.5,  z: -132.0, s: 1.15 },
      { x: -18.0, z: -146.0, s: 1.1 },
      { x: 18.0,  z: -146.0, s: 1.15 }
    ];

    treePositions.forEach(tp => {
      this.buildBotanicalCherryTree(tp.x, 17.3, tp.z, tp.s);
    });

    // 6. Flanking Noble Evergreen Park Trees (Frame the avenue with deep natural greenery)
    const evergreenPositions = [
      { x: -36.0, z: -94.0,  h: 18.0, r: 4.5 },
      { x: 36.0,  z: -94.0,  h: 18.0, r: 4.5 },
      { x: -38.0, z: -118.0, h: 20.0, r: 4.8 },
      { x: 38.0,  z: -118.0, h: 20.0, r: 4.8 },
      { x: -36.0, z: -142.0, h: 19.0, r: 4.6 },
      { x: 36.0,  z: -142.0, h: 19.0, r: 4.6 }
    ];

    const evergreenMat = new THREE.MeshStandardMaterial({
      color: 0x14532d, // Deep rich forest evergreen
      roughness: 0.85
    });

    evergreenPositions.forEach(ep => {
      const egGroup = new THREE.Group();
      egGroup.position.set(ep.x, 17.3, ep.z);

      const trunk = new THREE.Mesh(
        new THREE.CylinderGeometry(0.45, 0.7, 5.5, 8),
        new THREE.MeshStandardMaterial({ color: 0x26170d, roughness: 0.9 })
      );
      trunk.position.y = 2.75;
      egGroup.add(trunk);

      for (let t = 0; t < 3; t++) {
        const cone = new THREE.Mesh(
          new THREE.ConeGeometry(ep.r * (1.0 - t * 0.22), ep.h * 0.38, 8),
          evergreenMat
        );
        cone.position.y = 5.2 + t * 4.2;
        cone.castShadow = true;
        egGroup.add(cone);
      }
      this.groundGroup.add(egGroup);
    });

    // 7. Classical Carved Stone Garden Benches
    const benchPositions = [
      { x: -6.0, z: -104.0, rot: Math.PI / 2 },
      { x: 6.0,  z: -104.0, rot: -Math.PI / 2 },
      { x: -6.0, z: -132.0, rot: Math.PI / 2 },
      { x: 6.0,  z: -132.0, rot: -Math.PI / 2 }
    ];

    benchPositions.forEach(bp => {
      const bench = this.createStoneBench(curbMat);
      bench.position.set(bp.x, 17.4, bp.z);
      bench.rotation.y = bp.rot;
      this.groundGroup.add(bench);
    });

    this.kingdomGroup.add(this.groundGroup);
  }

  populateFlowerBed(cx, cy, cz, width, depth) {
    const flowerColors = [
      0x881337, // Royal crimson deep rose
      0xf472b6, // Soft English rose petal pink
      0xb45309, // Warm golden marigold
      0x581c87, // Royal purple lavender
      0xffffff  // Pure white calla lily
    ];

    const flowerCount = 42;
    for (let i = 0; i < flowerCount; i++) {
      const fx = cx + (Math.random() - 0.5) * width;
      const fz = cz + (Math.random() - 0.5) * depth;
      const color = flowerColors[i % flowerColors.length];

      // Multi-petal natural blossom geometry
      const flowerGroup = new THREE.Group();
      flowerGroup.position.set(fx, cy + (Math.random() - 0.5) * 0.12, fz);

      const petalMat = new THREE.MeshStandardMaterial({
        color: color,
        roughness: 0.55,
        metalness: 0.05
      });

      // 4-5 crossing petals
      for (let p = 0; p < 4; p++) {
        const petal = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.04, 0.12), petalMat);
        petal.rotation.y = (p * Math.PI) / 4;
        flowerGroup.add(petal);
      }

      // Golden center stamen
      const center = new THREE.Mesh(
        new THREE.SphereGeometry(0.06, 6, 6),
        new THREE.MeshBasicMaterial({ color: 0xfde047 })
      );
      center.position.y = 0.04;
      flowerGroup.add(center);

      // Slender dark green stem
      const stem = new THREE.Mesh(
        new THREE.CylinderGeometry(0.02, 0.02, 0.35, 4),
        new THREE.MeshStandardMaterial({ color: 0x166534 })
      );
      stem.position.y = -0.18;
      flowerGroup.add(stem);

      this.groundGroup.add(flowerGroup);
    }
  }

  buildBotanicalCherryTree(x, y, z, scale = 1.0) {
    const treeGroup = new THREE.Group();
    treeGroup.position.set(x, y, z);
    treeGroup.scale.set(scale, scale, scale);

    const trunkMat = new THREE.MeshStandardMaterial({
      map: this.timberTex,
      color: 0x3d281a, // Aged natural bark
      roughness: 0.88
    });

    // Sculpted organic trunk with natural flared base
    const trunk = new THREE.Mesh(
      new THREE.CylinderGeometry(0.55, 0.95, 7.5, 10),
      trunkMat
    );
    trunk.position.y = 3.75;
    trunk.castShadow = true;
    treeGroup.add(trunk);

    // Main Organic Branches
    const branchAngles = [0.2, 1.4, 2.6, 3.9, 5.1];
    branchAngles.forEach(ang => {
      const branch = new THREE.Mesh(
        new THREE.CylinderGeometry(0.22, 0.38, 4.5, 6),
        trunkMat
      );
      branch.position.set(Math.cos(ang) * 1.3, 6.2, Math.sin(ang) * 1.3);
      branch.rotation.set(0.45 * Math.sin(ang), ang, 0.45 * Math.cos(ang));
      treeGroup.add(branch);
    });

    // Photorealistic Blossom Quads (using cherry_blossom.png)
    let blossomQuadMat = null;
    if (this.blossomTex) {
      blossomQuadMat = new THREE.MeshStandardMaterial({
        map: this.blossomTex,
        transparent: true,
        alphaTest: 0.20,
        roughness: 0.65,
        metalness: 0.02,
        side: THREE.DoubleSide
      });
    }

    const canopyPositions = [
      { x: 0,    y: 8.8, z: 0,    r: 3.2 },
      { x: -2.0, y: 8.2, z: 1.4,  r: 2.6 },
      { x: 2.0,  y: 8.3, z: -1.4, r: 2.7 },
      { x: 1.4,  y: 8.6, z: 2.0,  r: 2.5 },
      { x: -1.6, y: 8.1, z: -1.8, r: 2.4 },
      { x: 0,    y: 10.2, z: 0,   r: 2.6 }
    ];

    // Photorealistic Botanical Blossom Branch Clusters (using authentic cherry_blossom.png)
    if (blossomQuadMat) {
      canopyPositions.forEach(cp => {
        // Multi-angled botanical branch quads around each branch node
        for (let q = 0; q < 5; q++) {
          const quad = new THREE.Mesh(new THREE.PlaneGeometry(3.6, 3.6), blossomQuadMat);
          const qAng = (q * Math.PI * 2) / 5 + Math.random() * 0.4;
          const dist = 0.5 + Math.random() * (cp.r * 0.85);
          quad.position.set(
            cp.x + Math.cos(qAng) * dist,
            cp.y + (Math.random() - 0.5) * 1.5,
            cp.z + Math.sin(qAng) * dist
          );
          quad.rotation.set(
            (Math.random() - 0.5) * 0.6,
            qAng + Math.PI / 2 + (Math.random() - 0.5) * 0.4,
            (Math.random() - 0.5) * 0.6
          );
          quad.castShadow = true;
          treeGroup.add(quad);
        }
      });
    }

    this.groundGroup.add(treeGroup);
  }

  createStoneBench(stoneMat) {
    const benchGroup = new THREE.Group();

    // Seat slab
    const seat = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.16, 0.8), stoneMat);
    seat.position.y = 0.65;
    benchGroup.add(seat);

    // Carved classical legs
    [-0.9, 0.9].forEach(lx => {
      const leg = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.65, 0.65), stoneMat);
      leg.position.set(lx, 0.32, 0);
      benchGroup.add(leg);
    });

    return benchGroup;
  }

  /* -------------------------------------------------------------------------
   * 4. THE GRAND ROYAL TIERED FOUNTAIN (CENTRAL PLAZA)
   * -----------------------------------------------------------------------*/
  buildRoyalFountain() {
    this.fountainGroup = new THREE.Group();
    this.fountainGroup.name = "GrandRoyalFountain";
    // Placed at z: -128 so it frames the castle beautifully without obstructing the entrance
    this.fountainGroup.position.set(0, 17.38, -128.0);

    const stoneMat = new THREE.MeshStandardMaterial({
      map: this.marbleTex,
      color: 0xa89882, // Carved limestone with natural shading
      roughness: 0.68,
      metalness: 0.05
    });

    const goldMat = new THREE.MeshStandardMaterial({
      color: 0xc59b27, // Restrained antique gold
      metalness: 0.88,
      roughness: 0.25
    });

    // 1. Octagonal Bottom Basin Wall
    const basinWall = new THREE.Mesh(
      new THREE.CylinderGeometry(6.6, 7.0, 1.4, 8, 1, true),
      stoneMat
    );
    basinWall.position.y = 0.7;
    basinWall.castShadow = true;
    this.fountainGroup.add(basinWall);

    const basinCoping = new THREE.Mesh(
      new THREE.TorusGeometry(6.7, 0.26, 8, 8),
      stoneMat
    );
    basinCoping.rotation.x = Math.PI / 2;
    basinCoping.position.y = 1.4;
    this.fountainGroup.add(basinCoping);

    // Bottom Water Surface (Crystal clear natural turquoise, not solid cyan)
    const waterMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7, // Natural turquoise clear water
      roughness: 0.12,
      metalness: 0.82,
      transparent: true,
      opacity: 0.88
    });
    const poolWater = new THREE.Mesh(new THREE.CircleGeometry(6.5, 24), waterMat);
    poolWater.rotation.x = -Math.PI / 2;
    poolWater.position.y = 1.15;
    this.fountainGroup.add(poolWater);

    // 2. Central Classical Pedestal & Lower Tier Basin
    const lowerPedestal = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.6, 2.2, 12), stoneMat);
    lowerPedestal.position.y = 1.1;
    this.fountainGroup.add(lowerPedestal);

    const lowerBasin = new THREE.Mesh(new THREE.CylinderGeometry(4.0, 3.0, 0.72, 24), stoneMat);
    lowerBasin.position.y = 2.45;
    this.fountainGroup.add(lowerBasin);

    // Overflowing water curtain from lower basin
    const lowerFall = new THREE.Mesh(
      new THREE.CylinderGeometry(4.05, 4.3, 1.3, 24, 1, true),
      new THREE.MeshBasicMaterial({ color: 0xf0fdfa, transparent: true, opacity: 0.65, side: THREE.DoubleSide })
    );
    lowerFall.position.y = 1.8;
    this.fountainGroup.add(lowerFall);

    // 3. Middle Tier Basin
    const midPedestal = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 1.0, 1.8, 12), stoneMat);
    midPedestal.position.y = 3.15;
    this.fountainGroup.add(midPedestal);

    const midBasin = new THREE.Mesh(new THREE.CylinderGeometry(2.5, 1.7, 0.58, 20), stoneMat);
    midBasin.position.y = 4.15;
    this.fountainGroup.add(midBasin);

    const midFall = new THREE.Mesh(
      new THREE.CylinderGeometry(2.55, 2.75, 1.6, 20, 1, true),
      new THREE.MeshBasicMaterial({ color: 0xf0fdfa, transparent: true, opacity: 0.68, side: THREE.DoubleSide })
    );
    midFall.position.y = 3.35;
    this.fountainGroup.add(midFall);

    // 4. Top Basin & Golden Spout
    const topPedestal = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.65, 1.4, 10), stoneMat);
    topPedestal.position.y = 4.75;
    this.fountainGroup.add(topPedestal);

    const topBasin = new THREE.Mesh(new THREE.CylinderGeometry(1.4, 0.95, 0.48, 16), stoneMat);
    topBasin.position.y = 5.55;
    this.fountainGroup.add(topBasin);

    const goldSpout = new THREE.Mesh(new THREE.ConeGeometry(0.32, 1.1, 8), goldMat);
    goldSpout.position.y = 6.25;
    this.fountainGroup.add(goldSpout);

    // 5. Animated Vertical Fountain Water Jet
    const jetGeo = new THREE.CylinderGeometry(0.14, 0.30, 3.2, 8);
    const jetMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.88
    });
    this.fountainWaterJet = new THREE.Mesh(jetGeo, jetMat);
    this.fountainWaterJet.position.y = 7.7;
    this.fountainGroup.add(this.fountainWaterJet);

    // Dynamic Fountain Light (subtle turquoise water sparkle)
    const fLight = new THREE.PointLight(0x38bdf8, 1.2, 16.0);
    fLight.position.set(0, 4.5, 0);
    this.fountainGroup.add(fLight);

    // 6. Splashing Water Mist & Spray Particles (120 particles)
    const mistCount = 120;
    const mistGeo = new THREE.BufferGeometry();
    const mistPos = new Float32Array(mistCount * 3);
    const mistVelocities = [];

    for (let i = 0; i < mistCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = Math.random() * 4.2;
      mistPos[i * 3] = Math.cos(angle) * radius;
      mistPos[i * 3 + 1] = 1.5 + Math.random() * 6.2;
      mistPos[i * 3 + 2] = Math.sin(angle) * radius;

      mistVelocities.push({
        y: -(0.03 + Math.random() * 0.05),
        angle: angle,
        speed: 0.01 + Math.random() * 0.02
      });
    }

    mistGeo.setAttribute('position', new THREE.BufferAttribute(mistPos, 3));
    const mistMat = new THREE.PointsMaterial({
      size: 0.32,
      map: this.softCircleTex,
      color: 0xe0f2fe,
      transparent: true,
      opacity: 0.75,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });

    this.fountainMistParticles = new THREE.Points(mistGeo, mistMat);
    this.fountainMistParticles.userData = { velocities: mistVelocities };
    this.fountainGroup.add(this.fountainMistParticles);

    this.kingdomGroup.add(this.fountainGroup);
  }

  /* -------------------------------------------------------------------------
   * 5. TURQUOISE RIVER, WATERFALLS, BRIDGES & ROYAL GAZEBO
   * -----------------------------------------------------------------------*/
  buildRiverAndBridges() {
    const riverGroup = new THREE.Group();
    riverGroup.name = "RiverAndBridges";

    // 1. Meandering River Waterway (crossing z: -144 to -162)
    const riverGeo = new THREE.PlaneGeometry(280, 18, 32, 8);
    const riverMat = new THREE.MeshStandardMaterial({
      color: 0x0369a1, // Deep natural mountain river turquoise-blue
      roughness: 0.14,
      metalness: 0.85
    });
    this.riverMesh = new THREE.Mesh(riverGeo, riverMat);
    this.riverMesh.rotation.x = -Math.PI / 2;
    this.riverMesh.position.set(0, 14.1, -153.0);
    riverGroup.add(this.riverMesh);

    // Stone Riverbanks (South and North)
    const bankMat = new THREE.MeshStandardMaterial({
      color: 0x475569, // Slate river rock
      roughness: 0.92
    });

    [-143.5, -162.5].forEach(bz => {
      const bank = new THREE.Mesh(new THREE.BoxGeometry(280, 3.8, 3.2), bankMat);
      bank.position.set(0, 15.6, bz);
      riverGroup.add(bank);
    });

    // 2. Grand Classical Arched Stone Bridges crossing the river
    const stoneMat = new THREE.MeshStandardMaterial({
      map: this.marbleTex,
      color: 0xa89781, // Warm weathered bridge limestone
      roughness: 0.72,
      metalness: 0.05
    });

    // Twin Arched Bridges at x: -28 and x: +28
    [-28.0, 28.0].forEach(bx => {
      const bridgeGroup = new THREE.Group();
      bridgeGroup.position.set(bx, 14.2, -153.0);

      // Roadbed
      const road = new THREE.Mesh(new THREE.BoxGeometry(9.0, 0.7, 20.0), stoneMat);
      road.position.set(0, 3.65, 0);
      bridgeGroup.add(road);

      // Semicircular Arch beneath bridge
      const arch = new THREE.Mesh(
        new THREE.TorusGeometry(3.5, 0.75, 8, 20, Math.PI),
        stoneMat
      );
      arch.position.set(0, 1.2, 0);
      arch.rotation.y = Math.PI / 2;
      bridgeGroup.add(arch);

      // Classical Balustrades on sides
      [-4.3, 4.3].forEach(rx => {
        const rail = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.85, 20.0), stoneMat);
        rail.position.set(rx, 4.3, 0);
        bridgeGroup.add(rail);

        // Glowing Bridge Lanterns on end posts
        [-8.5, 8.5].forEach(pz => {
          const post = new THREE.Mesh(new THREE.BoxGeometry(0.65, 1.2, 0.65), stoneMat);
          post.position.set(rx, 4.4, pz);
          bridgeGroup.add(post);

          const bLantern = this.createOrnateLantern();
          bLantern.position.set(rx, 5.2, pz);
          bridgeGroup.add(bLantern);
        });
      });

      riverGroup.add(bridgeGroup);
    });

    // Central Grand Causeway Bridge (Direct path to Castle entrance at x: 0)
    const centerBridge = new THREE.Group();
    centerBridge.position.set(0, 14.2, -153.0);

    const cRoad = new THREE.Mesh(new THREE.BoxGeometry(14.0, 0.7, 20.0), stoneMat);
    cRoad.position.set(0, 3.65, 0);
    centerBridge.add(cRoad);

    // 3 Semicircular Arches beneath central bridge
    [-4.2, 0, 4.2].forEach(ax => {
      const arch = new THREE.Mesh(
        new THREE.TorusGeometry(2.4, 0.6, 8, 16, Math.PI),
        stoneMat
      );
      arch.position.set(ax, 1.3, 0);
      arch.rotation.y = Math.PI / 2;
      centerBridge.add(arch);
    });

    [-6.8, 6.8].forEach(rx => {
      const rail = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.85, 20.0), stoneMat);
      rail.position.set(rx, 4.3, 0);
      centerBridge.add(rail);

      [-8.5, 8.5].forEach(pz => {
        const post = new THREE.Mesh(new THREE.BoxGeometry(0.65, 1.2, 0.65), stoneMat);
        post.position.set(rx, 4.4, pz);
        centerBridge.add(post);

        const bLantern = this.createOrnateLantern();
        bLantern.position.set(rx, 5.2, pz);
        centerBridge.add(bLantern);
      });
    });

    riverGroup.add(centerBridge);

    // 3. Royal Garden Gazebo / Rotunda on East Riverbank (x: 48, z: -153)
    const gazeboGroup = new THREE.Group();
    gazeboGroup.position.set(48.0, 17.4, -153.0);

    // Base podium
    const gPodium = new THREE.Mesh(new THREE.CylinderGeometry(5.0, 5.4, 0.8, 8), stoneMat);
    gPodium.position.y = 0.4;
    gazeboGroup.add(gPodium);

    // 8 Classical Columns
    for (let c = 0; c < 8; c++) {
      const ang = (c * Math.PI * 2) / 8;
      const col = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.28, 4.8, 8), stoneMat);
      col.position.set(Math.cos(ang) * 4.2, 3.2, Math.sin(ang) * 4.2);
      gazeboGroup.add(col);
    }

    // Domed Roof
    const gRoof = new THREE.Mesh(
      new THREE.ConeGeometry(5.4, 3.6, 8),
      new THREE.MeshStandardMaterial({ color: 0x1e3a5f, roughness: 0.45 })
    );
    gRoof.position.y = 7.4;
    gazeboGroup.add(gRoof);

    const gFinial = new THREE.Mesh(
      new THREE.SphereGeometry(0.35, 8, 8),
      new THREE.MeshStandardMaterial({ color: 0xc59b27, metalness: 0.9 })
    );
    gFinial.position.y = 9.4;
    gazeboGroup.add(gFinial);

    riverGroup.add(gazeboGroup);

    // 4. Cascading Rocky Cliff Waterfalls on the Flanks (x: -65 and x: +65)
    [-65.0, 65.0].forEach(fx => {
      const cliffMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.95 });
      const cliff = new THREE.Mesh(new THREE.BoxGeometry(36.0, 16.0, 18.0), cliffMat);
      cliff.position.set(fx, 20.0, -156.0);
      riverGroup.add(cliff);

      // Cascading water sheet
      const fallMat = new THREE.MeshBasicMaterial({
        color: 0xf0fdfa,
        transparent: true,
        opacity: 0.85,
        side: THREE.DoubleSide
      });
      const fall = new THREE.Mesh(new THREE.PlaneGeometry(14.0, 12.0), fallMat);
      fall.position.set(fx, 19.5, -146.8);
      fall.rotation.x = -0.15;
      riverGroup.add(fall);
    });

    this.kingdomGroup.add(riverGroup);
  }

  /* -------------------------------------------------------------------------
   * 6. THE GRAND PRINCESS CASTLE PALACE (CENTRAL LANDMARK)
   * -----------------------------------------------------------------------*/
  buildGrandPrincessCastle() {
    this.castleGroup = new THREE.Group();
    this.castleGroup.name = "GrandPrincessCastle";
    // Majestically elevated at z: -180, rising tall into the royal sky!
    this.castleGroup.position.set(0, 17.5, -180.0);

    // Authentic French Chateau Warm Caen Limestone
    const limestoneMat = new THREE.MeshStandardMaterial({
      map: this.marbleTex,
      color: 0xc8b79f, // Natural warm limestone / soft cream sandstone
      roughness: 0.70,
      metalness: 0.04
    });

    // Darker Carved Architectural Trim Stone for depth and shadow relief
    const trimStoneMat = new THREE.MeshStandardMaterial({
      map: this.marbleTex,
      color: 0x7c6b57, // Darker shaded stone for arches, cornices & plinths
      roughness: 0.78,
      metalness: 0.05
    });

    // Authentic Chateau Slate-Blue Conical Roofs
    const slateRoofMat = new THREE.MeshStandardMaterial({
      color: 0x1e3a5f, // Deep royal slate chateau blue
      emissive: 0x0f2238,
      emissiveIntensity: 0.08,
      roughness: 0.45,
      metalness: 0.35
    });

    // Restrained Antique Royal Gold
    const goldMat = new THREE.MeshStandardMaterial({
      color: 0xc59b27, // Antique royal gold
      metalness: 0.88,
      roughness: 0.25
    });

    // Stained-Glass Window Warm Glow
    const windowGlowMat = new THREE.MeshStandardMaterial({
      color: 0xfef08a,
      emissive: 0xf59e0b,
      emissiveIntensity: 0.9,
      roughness: 0.3
    });

    // 1. Raised Castle Foundation Terrace & Ramparts with Cascading Waterfalls
    const terrace = new THREE.Mesh(new THREE.BoxGeometry(104.0, 4.5, 56.0), trimStoneMat);
    terrace.position.set(0, 2.25, 0);
    terrace.receiveShadow = true;
    this.castleGroup.add(terrace);

    // Arched culvert beneath terrace pouring central waterfall into the river
    const culvertWater = new THREE.Mesh(
      new THREE.PlaneGeometry(12.0, 6.0),
      new THREE.MeshBasicMaterial({ color: 0xf0fdfa, transparent: true, opacity: 0.88, side: THREE.DoubleSide })
    );
    culvertWater.position.set(0, 0.5, 28.1);
    this.castleGroup.add(culvertWater);

    // Sweeping 12-Step Grand Marble Entrance Staircase
    for (let s = 0; s < 12; s++) {
      const step = new THREE.Mesh(
        new THREE.BoxGeometry(18.0 - s * 0.35, 0.32, 1.4),
        limestoneMat
      );
      step.position.set(0, s * 0.32, 28.5 - s * 1.35);
      step.receiveShadow = true;
      this.castleGroup.add(step);
    }

    // 2. Main Central Keep (Multi-story Palace Block)
    const keep = new THREE.Mesh(new THREE.BoxGeometry(40.0, 20.0, 26.0), limestoneMat);
    keep.position.set(0, 14.5, 0);
    keep.castShadow = true;
    this.castleGroup.add(keep);

    // Architectural Trim Bands around the Keep
    const stringCourse = new THREE.Mesh(new THREE.BoxGeometry(40.6, 0.7, 26.6), trimStoneMat);
    stringCourse.position.set(0, 13.0, 0);
    this.castleGroup.add(stringCourse);

    // Crenellated Battlements along Keep Roofline
    for (let bx = -19; bx <= 19; bx += 3.4) {
      const merlon = new THREE.Mesh(new THREE.BoxGeometry(1.8, 1.5, 0.8), trimStoneMat);
      merlon.position.set(bx, 25.2, 12.8);
      this.castleGroup.add(merlon);
    }

    // Grand Entrance Portico with Corinthian Columns
    const portico = new THREE.Mesh(new THREE.BoxGeometry(15.0, 1.2, 5.0), trimStoneMat);
    portico.position.set(0, 9.2, 14.0);
    this.castleGroup.add(portico);

    [-5.6, -1.9, 1.9, 5.6].forEach(cx => {
      const col = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.65, 6.2, 12), limestoneMat);
      col.position.set(cx, 6.1, 14.0);
      this.castleGroup.add(col);
    });

    // Royal Double Doors
    const doorMat = new THREE.MeshStandardMaterial({
      map: this.timberTex,
      color: 0x3e2723, // Deep dark oak
      roughness: 0.8
    });
    const doors = new THREE.Mesh(new THREE.PlaneGeometry(6.4, 8.2), doorMat);
    doors.position.set(0, 7.8, 13.05);
    this.castleGroup.add(doors);

    // Arched stained glass windows across facade (Warm candlelight radiance)
    [-12.5, -6.2, 6.2, 12.5].forEach(wx => {
      const win = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 4.4), windowGlowMat);
      win.position.set(wx, 17.5, 13.25);
      this.castleGroup.add(win);

      // Stone window frame molding projecting forward
      const frame = new THREE.Mesh(new THREE.BoxGeometry(2.9, 4.9, 0.45), trimStoneMat);
      frame.position.set(wx, 17.5, 13.1);
      this.castleGroup.add(frame);
    });

    // 3. Central Soaring Cathedral Tower & Chateau Roof
    const centerTower = new THREE.Mesh(
      new THREE.CylinderGeometry(5.2, 5.8, 22.0, 16),
      limestoneMat
    );
    centerTower.position.set(0, 29.0, 0);
    centerTower.castShadow = true;
    this.castleGroup.add(centerTower);

    // Center Soaring Conical Slate Chateau Roof
    const centerCone = new THREE.Mesh(
      new THREE.ConeGeometry(6.8, 14.0, 16),
      slateRoofMat
    );
    centerCone.position.set(0, 46.5, 0);
    centerCone.castShadow = true;
    this.castleGroup.add(centerCone);

    // Central Golden Imperial Spire & Royal Crest
    const centerSpire = new THREE.Mesh(new THREE.ConeGeometry(0.48, 6.0, 8), goldMat);
    centerSpire.position.set(0, 56.5, 0);
    this.castleGroup.add(centerSpire);

    const crownFinial = new THREE.Mesh(new THREE.SphereGeometry(0.65, 8, 8), goldMat);
    crownFinial.position.set(0, 60.0, 0);
    this.castleGroup.add(crownFinial);

    // 4. Four Majestic Round Drum Corner Bastions (Grounded firmly on the terrace foundation!)
    const cornerTowers = [
      { x: -26.0, z: 10.0,  r: 5.2, h: 30.0 },
      { x: 26.0,  z: 10.0,  r: 5.2, h: 30.0 },
      { x: -32.0, z: -14.0, r: 5.6, h: 34.0 },
      { x: 32.0,  z: -14.0, r: 5.6, h: 34.0 }
    ];

    cornerTowers.forEach(ct => {
      const towerGroup = new THREE.Group();
      // Anchored solidly to the terrace at y: 4.5!
      towerGroup.position.set(ct.x, 4.5, ct.z);

      const drum = new THREE.Mesh(
        new THREE.CylinderGeometry(ct.r, ct.r * 1.05, ct.h, 16),
        limestoneMat
      );
      drum.position.y = ct.h / 2;
      drum.castShadow = true;
      towerGroup.add(drum);

      // Overhanging Corbelled Battlement Gallery
      const corbelGallery = new THREE.Mesh(
        new THREE.CylinderGeometry(ct.r * 1.15, ct.r, 1.4, 16),
        trimStoneMat
      );
      corbelGallery.position.y = ct.h + 0.7;
      towerGroup.add(corbelGallery);

      // Soaring Conical Chateau Roof
      const roofCone = new THREE.Mesh(
        new THREE.ConeGeometry(ct.r * 1.2, 12.0, 16),
        slateRoofMat
      );
      roofCone.position.y = ct.h + 6.7;
      roofCone.castShadow = true;
      towerGroup.add(roofCone);

      // Gold Finial Spire atop tower
      const spire = new THREE.Mesh(new THREE.ConeGeometry(0.35, 3.5, 8), goldMat);
      spire.position.y = ct.h + 14.0;
      towerGroup.add(spire);

      this.castleGroup.add(towerGroup);
    });

    // 5. Flanking Slender Fairy-Tale Turrets (Bartizans) corbelled off the upper keep
    [-19.0, 19.0].forEach(tx => {
      const bartizan = new THREE.Group();
      bartizan.position.set(tx, 22.0, 12.5);

      const corbel = new THREE.Mesh(new THREE.ConeGeometry(1.5, 2.5, 8), trimStoneMat);
      corbel.rotation.x = Math.PI;
      corbel.position.y = -1.25;
      bartizan.add(corbel);

      const turret = new THREE.Mesh(new THREE.CylinderGeometry(1.4, 1.4, 7.0, 10), limestoneMat);
      turret.position.y = 3.5;
      bartizan.add(turret);

      const turretRoof = new THREE.Mesh(new THREE.ConeGeometry(1.7, 5.5, 10), slateRoofMat);
      turretRoof.position.y = 9.75;
      bartizan.add(turretRoof);

      this.castleGroup.add(bartizan);
    });

    // 6. Hanging Royal Silk Castle Banners
    [-12.5, 12.5].forEach(bx => {
      const bannerCanvas = document.createElement('canvas');
      bannerCanvas.width = 128;
      bannerCanvas.height = 384;
      const bCtx = bannerCanvas.getContext('2d');
      bCtx.fillStyle = '#831843'; // Deep Burgundy
      bCtx.fillRect(0, 0, 128, 384);
      bCtx.strokeStyle = '#c59b27';
      bCtx.lineWidth = 6;
      bCtx.strokeRect(8, 8, 112, 368);
      bCtx.font = '52px serif';
      bCtx.textAlign = 'center';
      bCtx.fillText('👑', 64, 160);

      const bTex = new THREE.CanvasTexture(bannerCanvas);
      const bMat = new THREE.MeshStandardMaterial({ map: bTex, side: THREE.DoubleSide });
      const banner = new THREE.Mesh(new THREE.PlaneGeometry(2.0, 6.0), bMat);
      banner.position.set(bx, 15.5, 13.3);
      this.castleGroup.add(banner);
    });

    this.kingdomGroup.add(this.castleGroup);
  }

  /* -------------------------------------------------------------------------
   * 7. QUEEN PANDA COURTYARD & INTERACTION ZONE
   * -----------------------------------------------------------------------*/
  buildQueenPandaCourtyard() {
    const courtyardGroup = new THREE.Group();
    courtyardGroup.name = "QueenPandaCourtyard";

    const stoneMat = new THREE.MeshStandardMaterial({
      map: this.marbleTex,
      color: 0xf5ede2, // Opulent antique marble
      roughness: 0.32,
      metalness: 0.12
    });

    const goldMat = new THREE.MeshStandardMaterial({
      color: 0xd4af37,
      metalness: 0.88,
      roughness: 0.22,
      emissive: 0x5a4205,
      emissiveIntensity: 0.25
    });

    // 1. Polished Royal Marble Terrace & Promenade Floor
    const floorGeo = new THREE.PlaneGeometry(28.0, 65.0);
    floorGeo.rotateX(-Math.PI / 2);
    const floorMat = new THREE.MeshStandardMaterial({
      map: this.marbleTex,
      roughness: 0.25,
      metalness: 0.15,
      color: 0xfcfaf7
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.position.set(0, 17.51, -112.0);
    floor.receiveShadow = true;
    courtyardGroup.add(floor);

    // 2. Royal Purple Velvet Carpet Runner with Golden Damask Border
    const carpetGeo = new THREE.PlaneGeometry(4.8, 58.0);
    carpetGeo.rotateX(-Math.PI / 2);
    const carpetMat = new THREE.MeshStandardMaterial({
      map: this.carpetTex,
      roughness: 0.65,
      metalness: 0.18
    });
    const carpet = new THREE.Mesh(carpetGeo, carpetMat);
    carpet.position.set(0, 17.54, -111.0);
    carpet.receiveShadow = true;
    courtyardGroup.add(carpet);

    // Golden Carpet Edge Trims
    [-2.42, 2.42].forEach(rx => {
      const trim = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.04, 58.0), goldMat);
      trim.position.set(rx, 17.55, -111.0);
      courtyardGroup.add(trim);
    });

    // 3. Flanking Classical Palace Colonnades (Left & Right Fluted Marble Arches)
    [-5.8, 5.8].forEach((colX, sideIdx) => {
      const colZList = [-86, -96, -106, -116, -126, -136];
      colZList.forEach((cz, i) => {
        // Plinth Base
        const plinth = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.6, 1.6), stoneMat);
        plinth.position.set(colX, 17.8, cz);
        courtyardGroup.add(plinth);

        // Gold Torus Ring
        const torus = new THREE.Mesh(new THREE.CylinderGeometry(0.74, 0.74, 0.22, 16), goldMat);
        torus.position.set(colX, 18.2, cz);
        courtyardGroup.add(torus);

        // Fluted Marble Shaft
        const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.52, 0.62, 8.4, 20), stoneMat);
        shaft.position.set(colX, 22.5, cz);
        courtyardGroup.add(shaft);

        // Gold-Adorned Corinthian Capital
        const cap = new THREE.Mesh(new THREE.BoxGeometry(1.65, 0.75, 1.65), goldMat);
        cap.position.set(colX, 27.0, cz);
        courtyardGroup.add(cap);

        // Classical Arch connecting to next column
        if (i < colZList.length - 1) {
          const nextZ = colZList[i + 1];
          const midZ = (cz + nextZ) / 2;
          const arch = new THREE.Mesh(new THREE.TorusGeometry(2.5, 0.44, 12, 24, Math.PI), stoneMat);
          arch.position.set(colX, 27.0, midZ);
          arch.rotation.y = Math.PI / 2;
          courtyardGroup.add(arch);

          // Keystone
          const keystone = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.85, 0.65), goldMat);
          keystone.position.set(colX, 29.5, midZ);
          courtyardGroup.add(keystone);

          // Hanging Royal Velvet Tapestry between outer bays
          if (this.tapestryTex && (i % 2 === 0)) {
            const tapGeo = new THREE.PlaneGeometry(2.8, 5.0);
            const tapMat = new THREE.MeshStandardMaterial({
              map: this.tapestryTex,
              side: THREE.DoubleSide,
              roughness: 0.55
            });
            const tapMesh = new THREE.Mesh(tapGeo, tapMat);
            tapMesh.position.set(colX + (sideIdx === 0 ? -1.0 : 1.0), 23.5, midZ);
            tapMesh.rotation.y = sideIdx === 0 ? Math.PI / 2 : -Math.PI / 2;
            courtyardGroup.add(tapMesh);
          }
        }
      });

      // Continuous Entablature beam on top of columns
      const entablature = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.7, 54.0), stoneMat);
      entablature.position.set(colX, 27.7, -111.0);
      courtyardGroup.add(entablature);
    });

    // 4. Gilded Crystal Chandeliers Overhead along central nave
    [-92, -108, -124].forEach(chanZ => {
      const chanGroup = new THREE.Group();
      chanGroup.position.set(0, 27.0, chanZ);

      // Gold Chain
      const chain = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 3.0, 6), goldMat);
      chain.position.y = -1.5;
      chanGroup.add(chain);

      // Chandelier Ring
      const ring = new THREE.Mesh(new THREE.TorusGeometry(1.1, 0.08, 8, 16), goldMat);
      ring.position.y = -3.0;
      ring.rotation.x = Math.PI / 2;
      chanGroup.add(ring);

      // Crystal Crystals
      const crystalMat = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        roughness: 0.1,
        metalness: 0.9,
        transparent: true,
        opacity: 0.85
      });
      for (let c = 0; c < 8; c++) {
        const cAng = (c / 8) * Math.PI * 2;
        const crystal = new THREE.Mesh(new THREE.TetrahedronGeometry(0.16), crystalMat);
        crystal.position.set(Math.cos(cAng) * 1.1, -3.3, Math.sin(cAng) * 1.1);
        chanGroup.add(crystal);
      }

      // Warm Chandelier Light
      const chanLight = new THREE.PointLight(0xffea88, 1.3, 14.0);
      chanLight.position.y = -3.2;
      chanGroup.add(chanLight);
      this.lanternLights.push(chanLight);

      courtyardGroup.add(chanGroup);
    });

    // 5. Grand Royal Throne Dais & Tapestry at the head of the carpet (z = -138.5)
    const throneGroup = new THREE.Group();
    throneGroup.position.set(0, 17.52, -138.5);

    // 3 Tiered Marble Steps
    const step1 = new THREE.Mesh(new THREE.BoxGeometry(8.5, 0.25, 4.5), stoneMat);
    step1.position.set(0, 0.125, 0);
    throneGroup.add(step1);

    const step2 = new THREE.Mesh(new THREE.BoxGeometry(7.0, 0.25, 3.5), stoneMat);
    step2.position.set(0, 0.375, -0.2);
    throneGroup.add(step2);

    const step3 = new THREE.Mesh(new THREE.BoxGeometry(5.5, 0.25, 2.8), stoneMat);
    step3.position.set(0, 0.625, -0.4);
    throneGroup.add(step3);

    // Gold Trim on steps
    [step1, step2, step3].forEach((st, idx) => {
      const w = 8.5 - idx * 1.5;
      const trimEdge = new THREE.Mesh(new THREE.BoxGeometry(w + 0.1, 0.06, 0.08), goldMat);
      trimEdge.position.set(0, st.position.y + 0.13, st.position.z + (st.geometry.parameters.depth / 2));
      throneGroup.add(trimEdge);
    });

    // Velvet Cushion on Top Step
    const throneVelvetMat = new THREE.MeshStandardMaterial({
      color: 0x4a0e4e, // Royal deep purple velvet
      roughness: 0.5,
      metalness: 0.2
    });

    // Gilded Twin Royal Thrones (King Panda Mama on Left, Queen Panda Ashitha on Right)
    const throneSpacing = 1.35;
    [-throneSpacing, throneSpacing].forEach((tx, idx) => {
      const isKing = (idx === 0);
      const chairBase = new THREE.Mesh(new THREE.BoxGeometry(2.1, 0.5, 1.8), goldMat);
      chairBase.position.set(tx, 1.0, -0.6);
      throneGroup.add(chairBase);

      const cushionMat = isKing ? throneVelvetMat : new THREE.MeshStandardMaterial({
        color: 0x6b1055, // Royal Magenta Velvet for Queen Ashitha
        roughness: 0.5,
        metalness: 0.2
      });

      const chairCushion = new THREE.Mesh(new THREE.BoxGeometry(1.85, 0.25, 1.5), cushionMat);
      chairCushion.position.set(tx, 1.35, -0.6);
      throneGroup.add(chairCushion);

      const chairBack = new THREE.Mesh(new THREE.BoxGeometry(2.1, 3.2, 0.4), goldMat);
      chairBack.position.set(tx, 2.7, -1.3);
      throneGroup.add(chairBack);

      const chairBackPad = new THREE.Mesh(new THREE.BoxGeometry(1.75, 2.7, 0.2), cushionMat);
      chairBackPad.position.set(tx, 2.7, -1.1);
      throneGroup.add(chairBackPad);

      const crownPeak = isKing 
        ? new THREE.Mesh(new THREE.ConeGeometry(0.48, 0.8, 4), goldMat)
        : new THREE.Mesh(new THREE.SphereGeometry(0.35, 16, 16), goldMat);
      crownPeak.position.set(tx, 4.6, -1.3);
      if (isKing) crownPeak.rotation.y = Math.PI / 4;
      throneGroup.add(crownPeak);

      [-0.95, 0.95].forEach(ax => {
        const arm = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.7, 1.4), goldMat);
        arm.position.set(tx + ax, 1.6, -0.6);
        throneGroup.add(arm);
      });
    });

    // Giant Royal Throne Tapestry Hanging Behind Throne
    if (this.tapestryTex) {
      const tapGeo = new THREE.PlaneGeometry(6.4, 9.5);
      const tapMat = new THREE.MeshStandardMaterial({
        map: this.tapestryTex,
        roughness: 0.55,
        side: THREE.DoubleSide
      });
      const grandTapestry = new THREE.Mesh(tapGeo, tapMat);
      grandTapestry.position.set(0, 6.5, -2.4);
      throneGroup.add(grandTapestry);

      // Gold Hanging Crossbar with Finials
      const tapBar = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 7.2, 16), goldMat);
      tapBar.rotation.z = Math.PI / 2;
      tapBar.position.set(0, 11.2, -2.35);
      throneGroup.add(tapBar);

      [-3.65, 3.65].forEach(fx => {
        const finial = new THREE.Mesh(new THREE.SphereGeometry(0.3, 16, 16), goldMat);
        finial.position.set(fx, 11.2, -2.35);
        throneGroup.add(finial);
      });
    }

    // Royal Candelabras flanking the throne
    [-2.8, 2.8].forEach(cx => {
      const cand = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.18, 2.8, 8), goldMat);
      cand.position.set(cx, 1.4, -0.6);
      throneGroup.add(cand);

      const candLight = new THREE.PointLight(0xffb703, 1.5, 9.0);
      candLight.position.set(cx, 3.0, -0.6);
      throneGroup.add(candLight);
      this.lanternLights.push(candLight);
    });

    courtyardGroup.add(throneGroup);

    // 6. Photorealistic 3D Queen Panda Character holding Royal Birthday Gift
    this.queenPandaGroup = new THREE.Group();
    this.queenPandaGroup.name = "QueenPanda3D";
    this.queenPandaGroup.position.set(-2.2, 17.54, -94.5);
    this.queenPandaGroup.rotation.y = 0.22;
    this.queenPandaGroup.scale.set(1.35, 1.35, 1.35);

    // Drop Shadow on the Marble
    const shadowCanvas = document.createElement('canvas');
    shadowCanvas.width = 128;
    shadowCanvas.height = 128;
    const sCtx = shadowCanvas.getContext('2d');
    const sGrad = sCtx.createRadialGradient(64, 64, 0, 64, 64, 64);
    sGrad.addColorStop(0, 'rgba(15, 8, 25, 0.75)');
    sGrad.addColorStop(0.5, 'rgba(15, 8, 25, 0.38)');
    sGrad.addColorStop(1, 'rgba(15, 8, 25, 0)');
    sCtx.fillStyle = sGrad;
    sCtx.beginPath();
    sCtx.arc(64, 64, 64, 0, Math.PI * 2);
    sCtx.fill();

    const shadowTex = new THREE.CanvasTexture(shadowCanvas);
    const shadowMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(2.8, 1.8),
      new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, depthWrite: false })
    );
    shadowMesh.rotation.x = -Math.PI / 2;
    shadowMesh.position.set(0, 0.02, 0.1);
    this.queenPandaGroup.add(shadowMesh);

    // Queen Panda Body Mesh with Gift Texture
    const pandaTexToUse = this.queenPandaGiftTex || this.queenPandaTex;
    if (pandaTexToUse) {
      const pandaGeo = new THREE.PlaneGeometry(3.3, 4.42);
      const pandaMat = new THREE.MeshStandardMaterial({
        map: pandaTexToUse,
        transparent: true,
        alphaTest: 0.05,
        roughness: 0.65,
        metalness: 0.05,
        side: THREE.DoubleSide
      });
      const pandaMesh = new THREE.Mesh(pandaGeo, pandaMat);
      pandaMesh.position.set(0, 2.21, 0);
      pandaMesh.castShadow = true;
      this.queenPandaGroup.add(pandaMesh);
    }

    // Sparkling 3D Jewels atop Royal Tiara
    const crownGroup = new THREE.Group();
    crownGroup.position.set(0.06, 3.82, 0.12);

    const rubyMat = new THREE.MeshStandardMaterial({
      color: 0xf43f5e,
      roughness: 0.1,
      metalness: 0.9,
      emissive: 0xe11d48,
      emissiveIntensity: 0.85
    });
    const diamondMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.05,
      metalness: 0.95,
      emissive: 0xffffff,
      emissiveIntensity: 0.75
    });

    [-0.32, -0.16, 0.0, 0.16, 0.32].forEach((gx, idx) => {
      const mat = (idx % 2 === 0) ? rubyMat : diamondMat;
      const r = (idx === 2) ? 0.07 : 0.048;
      const gem = new THREE.Mesh(new THREE.SphereGeometry(r, 8, 8), mat);
      gem.position.set(gx, Math.cos(gx * 2.2) * 0.08, 0.04);
      crownGroup.add(gem);
    });

    this.crownSparkleLight = new THREE.PointLight(0xffd700, 2.0, 5.5);
    this.crownSparkleLight.position.set(0, 0.15, 0.2);
    crownGroup.add(this.crownSparkleLight);

    this.queenPandaGroup.add(crownGroup);

    // Raycasting Hit Box for Queen Panda & Gift
    const hitGeo = new THREE.BoxGeometry(3.6, 4.8, 2.2);
    const hitMat = new THREE.MeshBasicMaterial({ visible: false });
    this.queenPandaHitBox = new THREE.Mesh(hitGeo, hitMat);
    this.queenPandaHitBox.name = "QueenPandaHitBox";
    this.queenPandaHitBox.position.set(0, 2.2, 0);
    this.queenPandaHitBox.userData = { isQueenPanda: true };
    this.queenPandaGroup.add(this.queenPandaHitBox);

    courtyardGroup.add(this.queenPandaGroup);

    // 7. Realistic 3D Royal Treasure Chest with Separate Hinged Lid & 3D Ring
    this.treasureChestGroup = new THREE.Group();
    this.treasureChestGroup.name = "RoyalTreasureChestGroup";
    this.treasureChestGroup.position.set(-4.3, 17.54, -93.8);
    this.treasureChestGroup.rotation.y = 0.38;
    this.treasureChestGroup.scale.set(1.22, 1.22, 1.22);

    // Drop Shadow for Chest
    const chestShadow = new THREE.Mesh(
      new THREE.PlaneGeometry(3.0, 2.0),
      new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, depthWrite: false })
    );
    chestShadow.rotation.x = -Math.PI / 2;
    chestShadow.position.set(0, 0.02, 0);
    this.treasureChestGroup.add(chestShadow);

    // Rich Wood & Gold Materials for Chest
    const chestWoodMat = new THREE.MeshStandardMaterial({
      color: 0x422006, // Deep polished royal mahogany
      roughness: 0.38,
      metalness: 0.12
    });
    const chestGoldMat = new THREE.MeshStandardMaterial({
      color: 0xffd700, // Antique polished gold trim
      roughness: 0.22,
      metalness: 0.88
    });
    const chestInteriorMat = new THREE.MeshStandardMaterial({
      color: 0x3d0024, // Royal crimson-wine velvet interior
      roughness: 0.65,
      metalness: 0.1
    });

    // 1. Chest Base Box (Outer)
    const baseWidth = 2.2, baseHeight = 1.05, baseDepth = 1.45;
    const chestBaseMesh = new THREE.Mesh(
      new THREE.BoxGeometry(baseWidth, baseHeight, baseDepth),
      chestWoodMat
    );
    chestBaseMesh.position.set(0, baseHeight / 2, 0);
    chestBaseMesh.castShadow = true;
    chestBaseMesh.receiveShadow = true;
    this.treasureChestGroup.add(chestBaseMesh);

    // Interior cavity lining
    const cavityMesh = new THREE.Mesh(
      new THREE.BoxGeometry(baseWidth - 0.2, 0.15, baseDepth - 0.2),
      chestInteriorMat
    );
    cavityMesh.position.set(0, baseHeight - 0.08, 0);
    this.treasureChestGroup.add(cavityMesh);

    // Decorative Gilded Bands on Base
    [-0.7, 0.7].forEach(bx => {
      const band = new THREE.Mesh(
        new THREE.BoxGeometry(0.12, baseHeight + 0.02, baseDepth + 0.02),
        chestGoldMat
      );
      band.position.set(bx, baseHeight / 2, 0);
      this.treasureChestGroup.add(band);
    });

    // Gilded Corner Brackets
    [-baseWidth/2 + 0.04, baseWidth/2 - 0.04].forEach(cx => {
      [-baseDepth/2 + 0.04, baseDepth/2 - 0.04].forEach(cz => {
        const bracket = new THREE.Mesh(
          new THREE.BoxGeometry(0.14, baseHeight + 0.01, 0.14),
          chestGoldMat
        );
        bracket.position.set(cx, baseHeight / 2, cz);
        this.treasureChestGroup.add(bracket);
      });
    });

    // Front Ornate Golden Lock Escutcheon Plate
    const lockPlate = new THREE.Mesh(
      new THREE.BoxGeometry(0.36, 0.38, 0.08),
      chestGoldMat
    );
    lockPlate.position.set(0, baseHeight - 0.18, baseDepth / 2 + 0.03);
    this.treasureChestGroup.add(lockPlate);

    const lockKeyhole = new THREE.Mesh(
      new THREE.CylinderGeometry(0.04, 0.02, 0.1, 8),
      new THREE.MeshBasicMaterial({ color: 0x000000 })
    );
    lockKeyhole.rotation.x = Math.PI / 2;
    lockKeyhole.position.set(0, baseHeight - 0.18, baseDepth / 2 + 0.06);
    this.treasureChestGroup.add(lockKeyhole);

    // Side Handles
    [-baseWidth/2 - 0.04, baseWidth/2 + 0.04].forEach(hx => {
      const handle = new THREE.Mesh(
        new THREE.TorusGeometry(0.14, 0.03, 8, 16),
        chestGoldMat
      );
      handle.position.set(hx, baseHeight * 0.55, 0);
      handle.rotation.y = Math.PI / 2;
      this.treasureChestGroup.add(handle);
    });

    // 2. Realistic Hinged Chest Lid (Rotates smoothly on rear top hinge)
    this.chestLidPivot = new THREE.Group();
    this.chestLidPivot.position.set(0, baseHeight, -baseDepth / 2);

    // Lid arched dome
    const lidRadius = baseDepth / 2;
    const lidArchGeo = new THREE.CylinderGeometry(lidRadius, lidRadius, baseWidth, 24, 1, false, 0, Math.PI);
    const lidArchMesh = new THREE.Mesh(lidArchGeo, chestWoodMat);
    lidArchMesh.rotation.z = Math.PI / 2;
    lidArchMesh.rotation.x = -Math.PI / 2;
    lidArchMesh.position.set(0, 0, lidRadius);
    lidArchMesh.castShadow = true;
    this.chestLidPivot.add(lidArchMesh);

    // Lid side caps
    [-baseWidth/2, baseWidth/2].forEach(lx => {
      const cap = new THREE.Mesh(
        new THREE.CircleGeometry(lidRadius, 24, 0, Math.PI),
        chestWoodMat
      );
      cap.rotation.y = (lx < 0) ? -Math.PI / 2 : Math.PI / 2;
      cap.position.set(lx, 0, lidRadius);
      this.chestLidPivot.add(cap);
    });

    // Lid Gold Bands
    [-0.7, 0.7].forEach(bx => {
      const lidBand = new THREE.Mesh(
        new THREE.CylinderGeometry(lidRadius + 0.015, lidRadius + 0.015, 0.12, 24, 1, false, 0, Math.PI),
        chestGoldMat
      );
      lidBand.rotation.z = Math.PI / 2;
      lidBand.rotation.x = -Math.PI / 2;
      lidBand.position.set(bx, 0, lidRadius);
      this.chestLidPivot.add(lidBand);
    });

    // Front Lock Hasp Clasp (Extends over the base lock)
    const lockHasp = new THREE.Mesh(
      new THREE.BoxGeometry(0.24, 0.32, 0.06),
      chestGoldMat
    );
    lockHasp.position.set(0, -0.08, baseDepth);
    this.chestLidPivot.add(lockHasp);

    // Front Lock Gem (Ruby)
    const lockRuby = new THREE.Mesh(
      new THREE.SphereGeometry(0.06, 8, 8),
      new THREE.MeshStandardMaterial({ color: 0xe11d48, emissive: 0xbe123c, roughness: 0.1, metalness: 0.9 })
    );
    lockRuby.position.set(0, -0.08, baseDepth + 0.04);
    this.chestLidPivot.add(lockRuby);

    // Set initial lid rotation based on persistent state
    if (this.isChestUnlocked) {
      this.chestLidPivot.rotation.x = -Math.PI * 0.65; // Opened!
    } else {
      this.chestLidPivot.rotation.x = 0; // Closed!
    }
    this.treasureChestGroup.add(this.chestLidPivot);

    // 3. Warm Golden Interior Light
    this.chestInteriorLight = new THREE.PointLight(0xffdf78, this.isChestUnlocked ? 3.5 : 0.2, 5.0);
    this.chestInteriorLight.position.set(0, baseHeight + 0.2, 0);
    this.treasureChestGroup.add(this.chestInteriorLight);

    // 4. Starlight Sparkle Particles around the Chest
    const sparkleCount = 48;
    const sparkleGeo = new THREE.BufferGeometry();
    const sparklePos = new Float32Array(sparkleCount * 3);
    const sparkleScales = new Float32Array(sparkleCount);

    for (let s = 0; s < sparkleCount; s++) {
      const rAng = Math.random() * Math.PI * 2;
      const rDist = 0.4 + Math.random() * 1.5;
      sparklePos[s * 3]     = Math.cos(rAng) * rDist;
      sparklePos[s * 3 + 1] = 0.4 + Math.random() * 2.2;
      sparklePos[s * 3 + 2] = Math.sin(rAng) * rDist;
      sparkleScales[s] = Math.random();
    }

    sparkleGeo.setAttribute('position', new THREE.BufferAttribute(sparklePos, 3));
    sparkleGeo.setAttribute('scale', new THREE.BufferAttribute(sparkleScales, 1));

    const sparkleMat = new THREE.PointsMaterial({
      size: 0.18,
      map: this.softCircleTex,
      transparent: true,
      color: 0xffe066,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    this.chestSparkles = new THREE.Points(sparkleGeo, sparkleMat);
    this.treasureChestGroup.add(this.chestSparkles);

    // Warm Golden Chest Glow Light (Exterior)
    const chestGlow = new THREE.PointLight(0xffd700, 1.4, 6.0);
    chestGlow.position.set(0, 1.1, 0.4);
    this.treasureChestGroup.add(chestGlow);
    this.chestGlow = chestGlow;
    this.lanternLights.push(chestGlow);

    // 5. Realistic 3D Royal Ring (A special birthday treasure for Queen Ashitha!)
    this.royalRingGroup = new THREE.Group();
    this.royalRingGroup.name = "RoyalDiamondRing";

    // Polished Gold Band
    const ringBandMat = new THREE.MeshStandardMaterial({
      color: 0xffdf78,
      roughness: 0.12,
      metalness: 0.94
    });
    const ringBand = new THREE.Mesh(
      new THREE.TorusGeometry(0.36, 0.055, 32, 64),
      ringBandMat
    );
    ringBand.rotation.x = Math.PI / 2;
    ringBand.castShadow = true;
    this.royalRingGroup.add(ringBand);

    // Golden Prongs
    const prongMat = new THREE.MeshStandardMaterial({
      color: 0xffdf78,
      roughness: 0.15,
      metalness: 0.92
    });
    for (let p = 0; p < 6; p++) {
      const pAng = (p / 6) * Math.PI * 2;
      const prong = new THREE.Mesh(
        new THREE.CylinderGeometry(0.018, 0.026, 0.18, 8),
        prongMat
      );
      prong.position.set(Math.cos(pAng) * 0.16, 0.36 + 0.08, Math.sin(pAng) * 0.16);
      prong.rotation.z = Math.cos(pAng) * 0.15;
      prong.rotation.x = -Math.sin(pAng) * 0.15;
      this.royalRingGroup.add(prong);
    }

    // Brilliant-Cut Gemstone (Diamond / Sapphire Crystal)
    const ringDiamondMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.04,
      metalness: 0.96,
      flatShading: true,
      emissive: 0x334455,
      emissiveIntensity: 0.45
    });

    // Top table & crown
    const gemCrown = new THREE.Mesh(
      new THREE.CylinderGeometry(0.16, 0.22, 0.08, 12),
      ringDiamondMat
    );
    gemCrown.position.set(0, 0.36 + 0.15, 0);
    this.royalRingGroup.add(gemCrown);

    // Inverted Pavilion
    const gemPavilion = new THREE.Mesh(
      new THREE.ConeGeometry(0.22, 0.22, 12),
      ringDiamondMat
    );
    gemPavilion.rotation.x = Math.PI;
    gemPavilion.position.set(0, 0.36 + 0.02, 0);
    this.royalRingGroup.add(gemPavilion);

    // Accent Side Diamonds on the Band Shoulders
    [-0.22, 0.22].forEach(sx => {
      const accent = new THREE.Mesh(
        new THREE.SphereGeometry(0.028, 8, 8),
        ringDiamondMat
      );
      accent.position.set(sx, 0.32, 0);
      this.royalRingGroup.add(accent);
    });

    // Dynamic Ring Gleam Point Light
    this.ringGleamLight = new THREE.PointLight(0xfffaed, 2.0, 3.5);
    this.ringGleamLight.position.set(0, 0.45, 0.1);
    this.royalRingGroup.add(this.ringGleamLight);

    // Ring initial position & scale
    if (this.isChestUnlocked) {
      this.royalRingGroup.position.set(0, 1.95, 0);
      this.royalRingGroup.scale.set(1.0, 1.0, 1.0);
    } else {
      this.royalRingGroup.position.set(0, 0.65, 0);
      this.royalRingGroup.scale.set(0.01, 0.01, 0.01);
    }
    this.treasureChestGroup.add(this.royalRingGroup);

    // Hit Box for Treasure Chest
    const chestHitGeo = new THREE.BoxGeometry(2.8, 2.6, 2.2);
    const chestHitMat = new THREE.MeshBasicMaterial({ visible: false });
    this.treasureChestHitBox = new THREE.Mesh(chestHitGeo, chestHitMat);
    this.treasureChestHitBox.name = "TreasureChestHitBox";
    this.treasureChestHitBox.position.set(0, 1.2, 0);
    this.treasureChestHitBox.userData = { isTreasureChest: true };
    this.treasureChestGroup.add(this.treasureChestHitBox);

    courtyardGroup.add(this.treasureChestGroup);

    // 8. King Panda Mama Character (Royal Crown, Velvet Cape, Loving Expression)
    this.kingPandaGroup = new THREE.Group();
    this.kingPandaGroup.name = "KingPandaMama";

    const kingShadow = new THREE.Mesh(
      new THREE.PlaneGeometry(3.0, 2.0),
      new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, depthWrite: false })
    );
    kingShadow.rotation.x = -Math.PI / 2;
    kingShadow.position.set(0, 0.02, 0.1);
    this.kingPandaGroup.add(kingShadow);

    const kingTexToUse = this.kingPandaTex || this.queenPandaTex;
    if (kingTexToUse) {
      const kingGeo = new THREE.PlaneGeometry(3.4, 4.5);
      const kingMat = new THREE.MeshStandardMaterial({
        map: kingTexToUse,
        transparent: true,
        alphaTest: 0.05,
        roughness: 0.65,
        metalness: 0.05,
        side: THREE.DoubleSide
      });
      const kingMesh = new THREE.Mesh(kingGeo, kingMat);
      kingMesh.position.set(0, 2.25, 0);
      kingMesh.castShadow = true;
      this.kingPandaGroup.add(kingMesh);
    }

    // 3D Gilded Royal Crown for King Panda Mama
    const kingCrownGroup = new THREE.Group();
    kingCrownGroup.position.set(0, 4.15, 0.1);
    const crownRing = new THREE.Mesh(
      new THREE.TorusGeometry(0.38, 0.05, 8, 24),
      goldMat
    );
    crownRing.rotation.x = Math.PI / 2;
    kingCrownGroup.add(crownRing);

    for (let c = 0; c < 5; c++) {
      const cAng = (c / 5) * Math.PI * 2;
      const peak = new THREE.Mesh(
        new THREE.ConeGeometry(0.08, 0.22, 6),
        goldMat
      );
      peak.position.set(Math.cos(cAng) * 0.38, 0.12, Math.sin(cAng) * 0.38);
      kingCrownGroup.add(peak);

      const ruby = new THREE.Mesh(
        new THREE.SphereGeometry(0.045, 8, 8),
        new THREE.MeshStandardMaterial({ color: 0xe11d48, emissive: 0xbe123c, roughness: 0.1, metalness: 0.9 })
      );
      ruby.position.set(Math.cos(cAng) * 0.38, 0.22, Math.sin(cAng) * 0.38);
      kingCrownGroup.add(ruby);
    }

    const kingCrownLight = new THREE.PointLight(0xffd700, 1.8, 5.0);
    kingCrownLight.position.set(0, 0.2, 0.2);
    kingCrownGroup.add(kingCrownLight);
    this.kingPandaGroup.add(kingCrownGroup);

    // Initial positioning for King Panda Mama & Queen Panda
    if (this.isCelebrationCompleted) {
      // Seated on the Twin Royal Thrones!
      this.kingPandaGroup.position.set(-1.3, 18.5, -138.2);
      this.kingPandaGroup.scale.set(1.35, 1.35, 1.35);
      this.kingPandaGroup.rotation.y = 0.0;

      this.queenPandaGroup.position.set(1.3, 18.5, -138.2);
      this.queenPandaGroup.rotation.y = 0.0;
    } else {
      // Standing on the courtyard terrace, looking warmly toward Queen Ashitha
      this.kingPandaGroup.position.set(3.2, 17.54, -93.5);
      this.kingPandaGroup.rotation.y = -0.32;
      this.kingPandaGroup.scale.set(1.35, 1.35, 1.35);
    }

    courtyardGroup.add(this.kingPandaGroup);

    // 9. Welcoming Pandas Group (varied sizes, natural festive behaviors)
    this.welcomingPandas = [];
    const pandaPositions = [
      { x: -5.8, y: 17.54, z: -102.0, rotY: 0.6, scale: 0.92, type: 'waving', phase: 0.0 },
      { x: 5.6,  y: 17.54, z: -104.0, rotY: -0.55, scale: 0.98, type: 'clapping', phase: 1.2 },
      { x: -6.2, y: 17.54, z: -118.0, rotY: 0.45, scale: 0.95, type: 'bowing', phase: 2.1 },
      { x: 6.4,  y: 17.54, z: -120.0, rotY: -0.4, scale: 0.90, type: 'waving', phase: 3.4 },
      { x: -4.8, y: 17.54, z: -132.0, rotY: 0.35, scale: 0.96, type: 'clapping', phase: 4.0 },
      { x: 4.8,  y: 17.54, z: -132.0, rotY: -0.35, scale: 0.94, type: 'waving', phase: 5.2 }
    ];

    pandaPositions.forEach((pd) => {
      const pGroup = new THREE.Group();
      pGroup.position.set(pd.x, pd.y, pd.z);
      pGroup.rotation.y = pd.rotY;
      pGroup.scale.set(pd.scale, pd.scale, pd.scale);

      const pShadow = new THREE.Mesh(
        new THREE.PlaneGeometry(2.2, 1.5),
        new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, depthWrite: false })
      );
      pShadow.rotation.x = -Math.PI / 2;
      pShadow.position.set(0, 0.02, 0);
      pGroup.add(pShadow);

      const pMesh = new THREE.Mesh(
        new THREE.PlaneGeometry(2.4, 3.2),
        new THREE.MeshStandardMaterial({
          map: this.queenPandaTex,
          transparent: true,
          alphaTest: 0.05,
          roughness: 0.7,
          side: THREE.DoubleSide
        })
      );
      pMesh.position.set(0, 1.6, 0);
      pMesh.castShadow = true;
      pGroup.add(pMesh);

      // Cute accessory: small festive bow or golden collar
      const collar = new THREE.Mesh(
        new THREE.TorusGeometry(0.24, 0.04, 8, 16),
        goldMat
      );
      collar.rotation.x = Math.PI / 2;
      collar.position.set(0, 2.2, 0.1);
      pGroup.add(collar);

      courtyardGroup.add(pGroup);
      this.welcomingPandas.push({
        group: pGroup,
        mesh: pMesh,
        type: pd.type,
        phase: pd.phase,
        baseY: pd.y,
        baseRotY: pd.rotY
      });
    });

    this.kingdomGroup.add(courtyardGroup);
  }

  createOrnateLantern() {
    const lGroup = new THREE.Group();

    const stoneMat = new THREE.MeshStandardMaterial({
      map: this.marbleTex,
      color: 0x94826d,
      roughness: 0.65
    });
    const bronzeMat = new THREE.MeshStandardMaterial({
      color: 0x2b211b,
      metalness: 0.85,
      roughness: 0.35
    });
    const glassMat = new THREE.MeshBasicMaterial({ color: 0xffea88 });
    const goldCapMat = new THREE.MeshStandardMaterial({ color: 0xc59b27, metalness: 0.88, roughness: 0.25 });

    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.18, 1.8, 8), stoneMat);
    post.position.y = 0.9;
    lGroup.add(post);

    const bulb = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.12, 0.42, 8), glassMat);
    bulb.position.y = 2.0;
    lGroup.add(bulb);

    const cap = new THREE.Mesh(new THREE.ConeGeometry(0.28, 0.32, 8), goldCapMat);
    cap.position.y = 2.35;
    lGroup.add(cap);

    const light = new THREE.PointLight(0xffea88, 1.1, 7.0);
    light.position.y = 2.0;
    lGroup.add(light);
    this.lanternLights.push(light);

    return lGroup;
  }

  /* -------------------------------------------------------------------------
   * 8. REALISTIC 3D WILDLIFE & ANIMATED ANIMALS
   * -----------------------------------------------------------------------*/
  buildWildlifeAndAnimals() {
    // 1. Animated Flapping 3D Fairy Butterflies
    const bfPositions = [
      { x: -5.0, y: 19.5, z: -96.0, color: 0xf43f5e },
      { x: 3.5,  y: 19.2, z: -100.0, color: 0x38bdf8 },
      { x: -9.5, y: 19.8, z: -105.0, color: 0xfbbf24 },
      { x: 8.0,  y: 19.4, z: -112.0, color: 0xa855f7 },
      { x: -2.0, y: 20.2, z: -115.0, color: 0xec4899 },
      { x: 5.5,  y: 19.6, z: -125.0, color: 0x34d399 }
    ];

    const wingGeo = new THREE.PlaneGeometry(0.24, 0.32);
    wingGeo.translate(0.12, 0, 0);

    bfPositions.forEach(bp => {
      const bfGroup = new THREE.Group();
      bfGroup.position.set(bp.x, bp.y, bp.z);

      const bColor = new THREE.Color(bp.color);
      const wingMat = new THREE.MeshStandardMaterial({
        color: bColor,
        side: THREE.DoubleSide,
        roughness: 0.35,
        metalness: 0.1,
        emissive: bColor,
        emissiveIntensity: 0.25
      });

      const leftWing = new THREE.Mesh(wingGeo, wingMat);
      leftWing.position.set(-0.12, 0, 0);
      bfGroup.add(leftWing);

      const rightWing = new THREE.Mesh(wingGeo, wingMat);
      rightWing.position.set(0.12, 0, 0);
      bfGroup.add(rightWing);

      this.butterflies.push({
        group: bfGroup,
        leftWing: leftWing,
        rightWing: rightWing,
        baseX: bp.x,
        baseY: bp.y,
        baseZ: bp.z,
        phase: Math.random() * Math.PI * 2
      });

      this.kingdomGroup.add(bfGroup);
    });

    // 2. Swimming Water Birds (Ducks/Swans in the turquoise river)
    if (window.PRELOADED_DUCK_B64 && window.PRELOADED_DUCK_B64.length > 100) {
      try {
        const buffer = base64ToArrayBuffer(window.PRELOADED_DUCK_B64);
        this.gltfLoader.parse(buffer, '', (gltf) => {
          const duck = gltf.scene || gltf.scene.children[0];
          duck.scale.set(0.016, 0.016, 0.016);
          duck.position.set(-18.0, 14.1, -153.0);
          duck.rotation.y = -Math.PI / 2;
          this.kingdomGroup.add(duck);
          this.animatedAnimals.push({ mesh: duck, type: 'swimming_duck', baseZ: -153.0 });
        });
      } catch (e) {
        console.warn("Could not parse Duck.glb:", e);
      }
    }

    // 3. Stork soaring gracefully above the river valley
    if (window.PRELOADED_STORK_B64 && window.PRELOADED_STORK_B64.length > 100) {
      try {
        const buffer = base64ToArrayBuffer(window.PRELOADED_STORK_B64);
        this.gltfLoader.parse(buffer, '', (gltf) => {
          const stork = gltf.scene || gltf.scene.children[0];
          stork.scale.set(0.024, 0.024, 0.024);
          stork.position.set(22.0, 26.5, -145.0);
          stork.rotation.y = Math.PI / 3;
          this.kingdomGroup.add(stork);
        });
      } catch (e) {
        console.warn("Could not parse Stork.glb:", e);
      }
    }

    // 4. Companion Panda resting near the garden hedges
    if (window.PRELOADED_PANDA_B64 && window.PRELOADED_PANDA_B64.length > 100) {
      try {
        const buffer = base64ToArrayBuffer(window.PRELOADED_PANDA_B64);
        this.gltfLoader.parse(buffer, '', (gltf) => {
          const panda = gltf.scene || gltf.scene.children[0];
          panda.scale.set(0.95, 0.95, 0.95);
          panda.position.set(16.5, 17.4, -104.0);
          panda.rotation.y = -1.2;
          this.kingdomGroup.add(panda);
        });
      } catch (e) {
        console.warn("Could not parse Panda.glb:", e);
      }
    }
  }

  /* -------------------------------------------------------------------------
   * 9. ATMOSPHERIC PARTICLES (PETALS & FAIRY STARLIGHT DUST)
   * -----------------------------------------------------------------------*/
  buildAtmosphericParticles() {
    // 1. Falling Cherry Blossom Petals
    const petalCount = 85;
    const petalGeo = new THREE.BufferGeometry();
    const petalPositions = new Float32Array(petalCount * 3);
    const petalVelocities = [];

    for (let i = 0; i < petalCount; i++) {
      petalPositions[i * 3] = -22.0 + Math.random() * 44.0;
      petalPositions[i * 3 + 1] = 17.5 + Math.random() * 12.0;
      petalPositions[i * 3 + 2] = -90.0 - Math.random() * 55.0;
      petalVelocities.push({
        y: -(0.012 + Math.random() * 0.022),
        x: (Math.random() - 0.5) * 0.014,
        z: (Math.random() - 0.5) * 0.012
      });
    }

    petalGeo.setAttribute('position', new THREE.BufferAttribute(petalPositions, 3));
    const petalMat = new THREE.PointsMaterial({
      color: 0xfbcfe8,
      size: 0.35,
      map: this.softCircleTex,
      transparent: true,
      opacity: 0.8,
      depthWrite: false,
      blending: THREE.NormalBlending
    });

    this.petalParticles = new THREE.Points(petalGeo, petalMat);
    this.petalParticles.userData = { velocities: petalVelocities };
    this.kingdomGroup.add(this.petalParticles);

    // 2. Floating Golden Starlight Dust
    const sparkleCount = 65;
    const sparkleGeo = new THREE.BufferGeometry();
    const sparklePos = new Float32Array(sparkleCount * 3);

    for (let i = 0; i < sparkleCount; i++) {
      sparklePos[i * 3] = -18.0 + Math.random() * 36.0;
      sparklePos[i * 3 + 1] = 18.0 + Math.random() * 10.0;
      sparklePos[i * 3 + 2] = -95.0 - Math.random() * 65.0;
    }

    sparkleGeo.setAttribute('position', new THREE.BufferAttribute(sparklePos, 3));
    const sparkleMat = new THREE.PointsMaterial({
      color: 0xffe082,
      size: 0.28,
      map: this.softCircleTex,
      transparent: true,
      opacity: 0.85,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });
    this.sparkleParticles = new THREE.Points(sparkleGeo, sparkleMat);
    this.kingdomGroup.add(this.sparkleParticles);
  }

  /* -------------------------------------------------------------------------
   * 10. REAL-TIME CINEMATIC LIGHTING (BALANCED, NATURAL, NON-BLOWN-OUT)
   * -----------------------------------------------------------------------*/
  setupKingdomLighting() {
    // Primary Golden Daylight Sunlight (Balanced intensity with soft shadows)
    const sunLight = new THREE.DirectionalLight(0xfffaed, 1.20);
    sunLight.position.set(-45, 60, -65);
    sunLight.target.position.set(0, 18, -135);
    this.kingdomGroup.add(sunLight);
    this.kingdomGroup.add(sunLight.target);

    // Natural Sky & Earth Bounce Hemisphere Light (Sky Blue + Earth Green)
    const hemiLight = new THREE.HemisphereLight(0x93c5fd, 0x2e5c26, 0.44);
    this.kingdomGroup.add(hemiLight);

    // Subtle Ambient Fill (Soft fill for shaded areas without flattening contrast)
    const ambientLight = new THREE.AmbientLight(0xfff7ed, 0.20);
    this.kingdomGroup.add(ambientLight);
  }

  /* =========================================================================
   * 2. SLOW-MOVING CINEMATIC ENTRANCE
   * =======================================================================*/
  startPortalSequence() {
    this.isCinematicActive = true;
    if (this.controls) this.controls.enabled = false;

    if (this.tunnelGroup) {
      this.tunnelGroup.visible = true;
    }

    // Camera starts inside the glowing portal tunnel
    this.camera.position.set(0, 18.2, -58.0);
    this.camera.lookAt(0, 18.2, -80.0);

    if (window.audioManager && window.audioManager.playPortalWhoosh) {
      window.audioManager.playPortalWhoosh();
    }

    // Smooth forward glide through the portal into the grand kingdom
    gsap.to(this.camera.position, {
      x: 0.0,
      y: 19.8,
      z: -86.0,
      duration: 5.2,
      ease: "power2.inOut",
      onUpdate: () => {
        if (this.tunnelParticles) {
          this.tunnelParticles.rotation.z += 0.025;
        }
      },
      onComplete: () => {
        this.settleAtTerrace();
      }
    });

    if (this.controls) {
      gsap.to(this.controls.target, {
        x: -0.6,
        y: 20.2,
        z: -125.0,
        duration: 5.2,
        ease: "power2.inOut"
      });
    }
  }

  settleAtTerrace(immediate = false) {
    this.isCinematicActive = false;

    if (this.tunnelGroup) {
      this.tunnelGroup.visible = false;
    }

    gsap.killTweensOf(this.camera.position);
    if (this.controls) gsap.killTweensOf(this.controls.target);

    this.renderTopBadge();
    this.renderBottomNavigation();

    if (immediate) {
      this.camera.position.set(0.0, 18.8, -84.0);
      if (this.controls) {
        this.controls.target.set(0.1, 19.4, -98.0);
        this.controls.update();
        if (this.hasAnsweredSecret) {
          this.controls.enabled = true;
          this.controls.minDistance = 2.5;
          this.controls.maxDistance = 75.0;
          this.controls.maxPolarAngle = Math.PI / 2 - 0.04;
          this.renderFloatingTalkButton();
        } else {
          this.controls.enabled = false;
          this.showSecretQuestionDialogue();
        }
      }
      return;
    }

    // Position camera on the terrace with view of Queen Panda, carpet, fountain and distant throne
    gsap.to(this.camera.position, {
      x: 0.0,
      y: 18.8,
      z: -84.0,
      duration: 1.8,
      ease: "power2.out"
    });

    if (this.controls) {
      gsap.to(this.controls.target, {
        x: 0.1,
        y: 19.4,
        z: -98.0,
        duration: 1.8,
        ease: "power2.out",
        onComplete: () => {
          if (this.hasAnsweredSecret) {
            this.controls.enabled = true;
            this.controls.minDistance = 2.5;
            this.controls.maxDistance = 75.0;
            this.controls.maxPolarAngle = Math.PI / 2 - 0.04;
            this.renderFloatingTalkButton();
          } else {
            this.controls.enabled = false;
            this.showSecretQuestionDialogue();
          }
        }
      });
    }

    if (window.audioManager && window.audioManager.playPandaGreetingSound) {
      setTimeout(() => {
        window.audioManager.playPandaGreetingSound();
      }, 350);
    }

    if (this.hasAnsweredSecret) {
      setTimeout(() => {
        if (typeof showToast === 'function') {
          showToast("👑 Welcome back to your Kingdom, Queen Ashitha! 👑🐼 Your Panda has been waiting for you! 💖");
        }
      }, 600);
    }
  }

  /* =========================================================================
   * 3. ROYAL SECRET NICKNAME QUESTION DIALOGUE PANEL
   * =======================================================================*/
  showWelcomeDialogue() {
    this.showSecretQuestionDialogue();
  }

  showSecretQuestionDialogue() {
    if (this.isDialogueOpen) return;
    this.isDialogueOpen = true;

    if (this.floatingTalkButton) {
      this.floatingTalkButton.remove();
      this.floatingTalkButton = null;
    }

    const existing = document.getElementById('queen-welcome-dialogue');
    if (existing) existing.remove();

    const container = document.createElement('div');
    container.id = 'queen-welcome-dialogue';
    container.className = 'royal-question-container interactive';

    container.innerHTML = `
      <div class="royal-question-card" id="royal-card">
        <!-- Floating Purple Crown Crest at Top -->
        <div class="royal-crown-crest">👑</div>

        <h2 class="royal-question-title">Do you want to see your Panda? 🐼</h2>
        <div class="royal-question-subtitle">Before we go inside, can you answer one question?</div>

        <!-- Question Input Pill matching reference art -->
        <div class="royal-input-pill">
          <span class="royal-paw-icon">🐾</span>
          <span>What is your panda nick name?</span>
        </div>

        <!-- 4 Options Grid -->
        <div class="royal-options-grid">
          <button class="royal-opt-btn" data-val="Mama">
            <span>🐾</span> <span>Mama</span>
          </button>
          <button class="royal-opt-btn" data-val="Papa">
            <span>Papa</span>
          </button>
          <button class="royal-opt-btn" data-val="Baby">
            <span>Baby</span>
          </button>
          <button class="royal-opt-btn" data-val="Chellam">
            <span>Chellam</span>
          </button>
        </div>

        <!-- Feedback Message Area -->
        <div id="royal-feedback" class="royal-feedback-msg" style="display: none;"></div>

        <!-- Action Row -->
        <div class="royal-action-row">
          <button id="royal-submit-continue" class="royal-submit-btn">
            <span>🐾</span> <span>Continue</span>
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(container);

    // Animate Card Entrance
    gsap.fromTo(container.querySelector('.royal-question-card'),
      { opacity: 0, y: 35, scale: 0.94 },
      { opacity: 1, y: 0, scale: 1, duration: 0.55, ease: "back.out(1.4)" }
    );

    // Interaction Logic
    const optButtons = container.querySelectorAll('.royal-opt-btn');
    const feedbackEl = document.getElementById('royal-feedback');
    const submitBtn = document.getElementById('royal-submit-continue');
    const cardEl = document.getElementById('royal-card');

    optButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        optButtons.forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        this.selectedSecretOption = btn.dataset.val;

        if (this.selectedSecretOption.toLowerCase() === 'mama') {
          // Success State
          feedbackEl.className = 'royal-feedback-msg success';
          feedbackEl.style.display = 'block';
          feedbackEl.innerHTML = '💖 You got it right, Panda! Your Panda is waiting for you inside!';

          submitBtn.className = 'royal-submit-btn pulse-enter';
          submitBtn.innerHTML = '<span>👑</span> <span>Enter My Kingdom 👑</span>';

          if (window.audioManager && window.audioManager.playMagicHarp) {
            window.audioManager.playMagicHarp();
          } else if (window.audioManager && window.audioManager.playChime) {
            window.audioManager.playChime(1.2);
          }

          if (window.confetti) {
            window.confetti({
              particleCount: 80,
              spread: 75,
              origin: { x: 0.72, y: 0.52 },
              colors: ['#ffd700', '#f472b6', '#c084fc', '#ffffff']
            });
          }
        } else {
          // Incorrect Option
          btn.classList.add('shake-anim');
          setTimeout(() => btn.classList.remove('shake-anim'), 500);

          feedbackEl.className = 'royal-feedback-msg error';
          feedbackEl.style.display = 'block';
          feedbackEl.innerHTML = 'Oops, Panda! Try again. 💕';

          if (window.audioManager && window.audioManager.playChime) {
            window.audioManager.playChime(0.65);
          }

          submitBtn.className = 'royal-submit-btn';
          submitBtn.innerHTML = '<span>🐾</span> <span>Continue</span>';
        }
      });
    });

    submitBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (this.selectedSecretOption && this.selectedSecretOption.toLowerCase() === 'mama') {
        // Correct - Proceed with Kingdom Entrance!
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem('panda_secret_answered', 'true');
        }
        this.hasAnsweredSecret = true;

        gsap.to(container, {
          opacity: 0,
          scale: 0.95,
          duration: 0.45,
          onComplete: () => {
            container.remove();
            this.isDialogueOpen = false;
            this.startKingdomEntryCinematic();
          }
        });
      } else {
        // Not selected or wrong
        cardEl.classList.add('shake-anim');
        setTimeout(() => cardEl.classList.remove('shake-anim'), 500);

        feedbackEl.className = 'royal-feedback-msg error';
        feedbackEl.style.display = 'block';
        feedbackEl.innerHTML = 'Please select the correct secret nickname to unlock the kingdom! 💕';

        if (window.audioManager && window.audioManager.playChime) {
          window.audioManager.playChime(0.65);
        }
      }
    });
  }

  /* =========================================================================
   * 4. CINEMATIC KINGDOM ENTRY SEQUENCE
   * =======================================================================*/
  startKingdomEntryCinematic() {
    this.isCinematicActive = true;
    if (this.controls) this.controls.enabled = false;

    // 1. Fanfare & Greeting Sound
    if (window.audioManager && window.audioManager.playMagicHarp) {
      window.audioManager.playMagicHarp();
    }
    if (window.audioManager && window.audioManager.playPandaGreetingSound) {
      setTimeout(() => window.audioManager.playPandaGreetingSound(), 800);
    }

    // 2. Chandelier & Torch Lighting Flare
    this.lanternLights.forEach(ll => {
      gsap.to(ll, { intensity: 3.2, duration: 1.5, yoyo: true, repeat: 1 });
    });
    if (this.crownSparkleLight) {
      gsap.to(this.crownSparkleLight, { intensity: 3.5, duration: 1.5 });
    }

    // 3. Celebratory Confetti Blast
    if (window.confetti) {
      window.confetti({
        particleCount: 160,
        spread: 95,
        origin: { y: 0.4 },
        colors: ['#ffd700', '#f472b6', '#a855f7', '#ffffff']
      });
    }

    // 4. Camera Glide Forward down the Royal Purple Carpet into the Courtyard
    gsap.to(this.camera.position, {
      x: -0.6,
      y: 19.3,
      z: -89.5,
      duration: 4.8,
      ease: "power2.inOut"
    });

    if (this.controls) {
      gsap.to(this.controls.target, {
        x: -2.2,
        y: 19.2,
        z: -94.5,
        duration: 4.8,
        ease: "power2.inOut",
        onComplete: () => {
          this.isCinematicActive = false;
          this.controls.enabled = true;
          this.controls.minDistance = 2.5;
          this.controls.maxDistance = 75.0;
          this.controls.maxPolarAngle = Math.PI / 2 - 0.04;

          this.renderBottomNavigation();
          this.renderFloatingTalkButton();

          if (typeof showToast === 'function') {
            showToast("👑 Welcome to your kingdom, Queen Ashitha! 👑🐼 Your Panda has been waiting for you! 💖");
          }
        }
      });
    }
  }

  /* =========================================================================
   * 5. TOP BADGE & BOTTOM NAVIGATION
   * =======================================================================*/
  renderTopBadge() {
    let badge = document.getElementById('palace-top-badge');
    if (!badge) {
      badge = document.createElement('div');
      badge.id = 'palace-top-badge';
      badge.className = 'palace-top-badge interactive';
      badge.innerHTML = `
        <div class="palace-badge-icon">🐼</div>
        <div class="palace-badge-text">
          <span class="palace-badge-title">PANDA KINGDOM</span>
          <span class="palace-badge-sub">Queen's Royal Palace</span>
        </div>
      `;
      document.body.appendChild(badge);
    }

    // Golden Key Badge Pill
    const hasKey = (typeof localStorage !== 'undefined' && localStorage.getItem('panda_golden_key') === 'collected') ||
                   (this.stageManager && this.stageManager.collectedKey);
    let keyBadge = document.getElementById('palace-key-badge');
    if (!keyBadge) {
      keyBadge = document.createElement('div');
      keyBadge.id = 'palace-key-badge';
      keyBadge.style.position = 'absolute';
      keyBadge.style.top = '18px';
      keyBadge.style.right = '200px';
      keyBadge.style.zIndex = '50';
      keyBadge.style.display = hasKey ? 'flex' : 'none';
      keyBadge.style.alignItems = 'center';
      keyBadge.style.gap = '8px';
      keyBadge.style.padding = '8px 18px';
      keyBadge.style.background = 'linear-gradient(135deg, rgba(30, 10, 45, 0.88), rgba(65, 20, 90, 0.85))';
      keyBadge.style.border = '1.5px solid #ffd700';
      keyBadge.style.borderRadius = '24px';
      keyBadge.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.4), 0 0 12px rgba(255, 215, 0, 0.4)';
      keyBadge.style.backdropFilter = 'blur(10px)';
      keyBadge.style.color = '#ffd700';
      keyBadge.style.fontSize = '13px';
      keyBadge.style.fontWeight = '700';
      keyBadge.innerHTML = `<span>🔑</span> <span>Golden Key Collected</span>`;
      document.body.appendChild(keyBadge);
    }
  }

  renderBottomNavigation() {
    let retBtn = document.getElementById('btn-return-to-village');
    if (!retBtn) {
      retBtn = document.createElement('button');
      retBtn.id = 'btn-return-to-village';
      retBtn.className = 'return-village-btn interactive';
      retBtn.style.position = 'absolute';
      retBtn.style.left = '32px';
      retBtn.style.bottom = '22px';
      retBtn.style.zIndex = '60';
      retBtn.innerHTML = `<span>←</span> <span>Return to Panda Village</span>`;
      document.body.appendChild(retBtn);

      retBtn.addEventListener('click', () => {
        this.returnToPandaVillage();
      });
    }

    let centerHint = document.getElementById('kingdom-center-hint');
    if (!centerHint) {
      centerHint = document.createElement('div');
      centerHint.id = 'kingdom-center-hint';
      centerHint.className = 'kingdom-bottom-hint';
      centerHint.style.position = 'absolute';
      centerHint.style.left = '50%';
      centerHint.style.bottom = '22px';
      centerHint.style.transform = 'translateX(-50%)';
      centerHint.style.zIndex = '60';
      document.body.appendChild(centerHint);
    }

    if (this.hasAnsweredSecret) {
      centerHint.innerHTML = `<span>🏰</span> <span>Drag to explore Queen Ashitha's Royal Palace • Click Panda or Chest ✨</span>`;
    } else {
      centerHint.innerHTML = `<span>📜</span> <span>Answer the question to enter the kingdom.</span>`;
    }
  }

  renderFloatingTalkButton() {
    if (this.floatingTalkButton) return;
    const btn = document.createElement('button');
    btn.id = 'btn-floating-talk';
    btn.className = 'floating-talk-btn interactive';
    btn.style.position = 'absolute';
    btn.style.right = '32px';
    btn.style.bottom = '68px';
    btn.style.zIndex = '70';
    btn.style.padding = '10px 22px';
    btn.style.background = 'linear-gradient(135deg, #a21caf 0%, #db2777 100%)';
    btn.style.border = '1.5px solid #ffd700';
    btn.style.borderRadius = '24px';
    btn.style.color = '#fff';
    btn.style.fontSize = '14px';
    btn.style.fontWeight = '700';
    btn.style.cursor = 'pointer';
    btn.style.boxShadow = '0 6px 20px rgba(162, 28, 175, 0.45), 0 0 15px rgba(255, 215, 0, 0.4)';
    btn.style.backdropFilter = 'blur(10px)';
    btn.style.transition = 'all 0.3s ease';
    btn.innerHTML = `<span>💬</span> <span>Royal Secret Question</span>`;

    btn.addEventListener('click', () => {
      this.showSecretQuestionDialogue();
    });

    document.body.appendChild(btn);
    this.floatingTalkButton = btn;
  }

  /* =========================================================================
   * 6. RETURN TO PANDA VILLAGE & CLEANUP
   * =======================================================================*/
  returnToPandaVillage() {
    console.log("Returning to Panda Village (Stage 4)...");
    this.cleanup();

    if (this.stageManager && this.stageManager.goToStage) {
      this.stageManager.goToStage(4);
    }
  }

  cleanup() {
    if (window.environment && window.environment.restoreFromKingdom) {
      window.environment.restoreFromKingdom();
    }

    if (this.renderer && this.originalToneMappingExposure !== undefined) {
      this.renderer.toneMappingExposure = this.originalToneMappingExposure;
    }

    const dialogue = document.getElementById('queen-welcome-dialogue');
    if (dialogue) dialogue.remove();
    this.isDialogueOpen = false;

    const topBadge = document.getElementById('palace-top-badge');
    if (topBadge) topBadge.remove();

    const keyBadge = document.getElementById('palace-key-badge');
    if (keyBadge) keyBadge.remove();

    const retBtn = document.getElementById('btn-return-to-village');
    if (retBtn) retBtn.remove();

    const cHint = document.getElementById('kingdom-center-hint');
    if (cHint) cHint.remove();

    if (this.floatingTalkButton) {
      this.floatingTalkButton.remove();
      this.floatingTalkButton = null;
    }

    const giftModal = document.getElementById('royal-gift-modal');
    if (giftModal) giftModal.remove();

    const chestModal = document.getElementById('royal-chest-modal');
    if (chestModal) chestModal.remove();

    const qModal = document.getElementById('royal-chest-question-modal');
    if (qModal) qModal.remove();

    const cCard = document.getElementById('royal-celebration-card');
    if (cCard) cCard.remove();

    const vModal = document.getElementById('royal-video-modal');
    if (vModal) vModal.remove();

    const rBanner = document.getElementById('royal-ring-banner');
    if (rBanner) rBanner.remove();

    this.hideChestHoverPrompt();

    if (this.kingdomGroup) {
      this.kingdomGroup.visible = false;
    }

    window.removeEventListener('pointermove', this.onPointerMove);
    window.removeEventListener('click', this.onPointerClick);

    const s4Nav = document.querySelector('.bottom-bar');
    if (s4Nav) s4Nav.style.display = 'flex';
  }

  /* =========================================================================
   * 7. INTERACTION & RAYCASTING (PANDA & TREASURE CHEST)
   * =======================================================================*/
  openBirthdayGiftModal() {
    const existing = document.getElementById('royal-gift-modal');
    if (existing) existing.remove();

    if (window.audioManager && window.audioManager.playMagicHarp) {
      window.audioManager.playMagicHarp();
    }
    if (window.confetti) {
      window.confetti({
        particleCount: 120,
        spread: 80,
        origin: { x: 0.35, y: 0.55 },
        colors: ['#f472b6', '#ffd700', '#c084fc', '#ffffff']
      });
    }

    const modal = document.createElement('div');
    modal.id = 'royal-gift-modal';
    modal.className = 'royal-popup-modal interactive';
    modal.innerHTML = `
      <div class="royal-popup-icon">🎁✨</div>
      <h2 class="royal-popup-title">Queen Ashitha's Royal Birthday Gift 👑💖</h2>
      <p class="royal-popup-desc">
        "Happy Birthday, Queen Ashitha! 🐼💕 This royal gift from your Panda is filled with endless love, happiness, sweet memories, and magical moments crafted just for you! Every single sparkle in this kingdom belongs to you today."
      </p>
      <button class="royal-popup-close-btn" id="btn-close-gift-modal">Thank You, Panda! 💖</button>
    `;
    document.body.appendChild(modal);

    document.getElementById('btn-close-gift-modal').addEventListener('click', () => {
      gsap.to(modal, { opacity: 0, scale: 0.9, duration: 0.3, onComplete: () => modal.remove() });
    });
  }

  showChestHoverPrompt(cx, cy) {
    if (this.isChestUnlocked) return;
    let prompt = document.getElementById('royal-chest-hover-prompt');
    if (!prompt) {
      prompt = document.createElement('div');
      prompt.id = 'royal-chest-hover-prompt';
      prompt.className = 'royal-chest-hover-prompt';
      prompt.innerHTML = `<span>👑</span> <span>A Royal Secret Awaits You! 👑</span>`;
      document.body.appendChild(prompt);
      this.chestHoverPrompt = prompt;
    }
    prompt.style.left = `${cx}px`;
    prompt.style.top = `${cy - 18}px`;
    prompt.style.opacity = '1';
  }

  hideChestHoverPrompt() {
    const prompt = document.getElementById('royal-chest-hover-prompt');
    if (prompt) {
      prompt.style.opacity = '0';
      setTimeout(() => { if (prompt.parentNode) prompt.remove(); }, 250);
      this.chestHoverPrompt = null;
    }
  }

  showChestSecretQuestionModal() {
    if (this.isChestUnlocked) {
      this.showRingCelebrationOptions();
      return;
    }

    if (this.controls) this.controls.enabled = false;
    this.hideChestHoverPrompt();

    const existing = document.getElementById('royal-chest-question-modal');
    if (existing) existing.remove();

    const modal = document.createElement('div');
    modal.id = 'royal-chest-question-modal';
    modal.className = 'royal-chest-question-modal interactive';
    modal.innerHTML = `
      <div class="royal-chest-dialogue-card" id="royal-chest-card">
        <div class="royal-chest-crest">👑💖</div>
        <h2 class="royal-chest-title">One Last Secret Question, Queen Ashitha! 🐼💖</h2>
        <div class="royal-chest-question-text">
          What does your favourite person call you most of the time? 💕
        </div>

        <div class="royal-chest-options-grid">
          <button class="royal-chest-option-btn" data-val="Papa">
            <span>🐾</span> <span>Papa</span>
          </button>
          <button class="royal-chest-option-btn" data-val="Baby">
            <span>Baby</span>
          </button>
          <button class="royal-chest-option-btn" data-val="Chellam">
            <span>Chellam</span>
          </button>
          <button class="royal-chest-option-btn" data-val="Thangam">
            <span>Thangam</span>
          </button>
        </div>

        <div id="royal-chest-feedback" class="royal-chest-feedback-box"></div>

        <div id="royal-chest-action-row" style="display: none;">
          <button id="btn-unlock-treasure" class="royal-chest-unlock-btn">
            <span>👑</span> <span>Unlock My Treasure 👑</span>
          </button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);

    gsap.fromTo(modal.querySelector('.royal-chest-dialogue-card'),
      { opacity: 0, scale: 0.92, y: 30 },
      { opacity: 1, scale: 1, y: 0, duration: 0.45, ease: "back.out(1.4)" }
    );

    const optionBtns = modal.querySelectorAll('.royal-chest-option-btn');
    const feedbackBox = document.getElementById('royal-chest-feedback');
    const actionRow = document.getElementById('royal-chest-action-row');
    const unlockBtn = document.getElementById('btn-unlock-treasure');

    optionBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        optionBtns.forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        const selectedVal = btn.getAttribute('data-val');
        this.selectedChestOption = selectedVal;

        if (selectedVal.toLowerCase() === 'papa') {
          // Correct Answer!
          feedbackBox.className = 'royal-chest-feedback-box success';
          feedbackBox.innerHTML = '💖 You remembered it, Queen Ashitha! 💖 Your royal treasure is waiting for you!';
          actionRow.style.display = 'block';

          if (window.audioManager && window.audioManager.playMagicHarp) {
            window.audioManager.playMagicHarp();
          } else if (window.audioManager && window.audioManager.playChime) {
            window.audioManager.playChime(1.2);
          }

          if (window.confetti) {
            window.confetti({
              particleCount: 90,
              spread: 70,
              origin: { x: 0.5, y: 0.55 },
              colors: ['#ffd700', '#f472b6', '#a855f7', '#ffffff']
            });
          }
        } else {
          // Incorrect: Allow retry without revealing correct answer
          btn.classList.add('shake-anim');
          setTimeout(() => btn.classList.remove('shake-anim'), 500);

          feedbackBox.className = 'royal-chest-feedback-box error';
          feedbackBox.innerHTML = 'Almost, Panda! Try once more. 💕';
          actionRow.style.display = 'none';

          if (window.audioManager && window.audioManager.playChime) {
            window.audioManager.playChime(0.65);
          }
        }
      });
    });

    unlockBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (this.selectedChestOption && this.selectedChestOption.toLowerCase() === 'papa') {
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem('panda_chest_question_answered', 'true');
          localStorage.setItem('panda_chest_unlocked', 'true');
        }
        this.hasAnsweredChestQuestion = true;
        this.isChestUnlocked = true;

        gsap.to(modal, {
          opacity: 0,
          scale: 0.95,
          duration: 0.35,
          onComplete: () => {
            modal.remove();
            this.openTreasureChestAndRevealRing();
          }
        });
      }
    });
  }

  /* =========================================================================
   * STAGE 3: TREASURE CHEST OPENING & 3D RING REVEAL
   * =======================================================================*/
  openTreasureChestAndRevealRing() {
    this.isCinematicActive = true;
    if (this.controls) this.controls.enabled = false;

    // 1. Camera focuses smoothly on the closed treasure chest
    gsap.to(this.camera.position, {
      x: -4.3,
      y: 19.35,
      z: -90.8,
      duration: 2.2,
      ease: "power2.inOut"
    });

    if (this.controls) {
      gsap.to(this.controls.target, {
        x: -4.3,
        y: 18.6,
        z: -93.8,
        duration: 2.2,
        ease: "power2.inOut"
      });
    }

    // 2. Queen Panda smiles and gestures affectionately toward the chest
    if (this.queenPandaGroup) {
      gsap.to(this.queenPandaGroup.rotation, {
        z: 0.08,
        yoyo: true,
        repeat: 3,
        duration: 0.55
      });
    }

    // 3. Chest lock flashes with warm golden starlight
    if (this.chestGlow) {
      gsap.to(this.chestGlow, {
        intensity: 4.8,
        duration: 0.8,
        yoyo: true,
        repeat: 1
      });
    }

    if (window.audioManager && window.audioManager.playMagicHarp) {
      setTimeout(() => window.audioManager.playMagicHarp(), 400);
    }

    // 4. Chest lid unlocks and opens with smooth realistic 3D hinge animation
    if (this.chestLidPivot) {
      gsap.to(this.chestLidPivot.rotation, {
        x: -Math.PI * 0.65,
        duration: 2.6,
        delay: 0.8,
        ease: "power2.inOut"
      });
    }

    // 5. Warm golden interior light shines from inside
    if (this.chestInteriorLight) {
      gsap.to(this.chestInteriorLight, {
        intensity: 3.8,
        duration: 2.0,
        delay: 1.0
      });
    }

    // 6. Realistic 3D Ring slowly rises and floats above the chest
    if (this.royalRingGroup) {
      gsap.to(this.royalRingGroup.position, {
        y: 1.95,
        duration: 3.0,
        delay: 1.4,
        ease: "power2.out"
      });
      gsap.to(this.royalRingGroup.scale, {
        x: 1.0,
        y: 1.0,
        z: 1.0,
        duration: 2.6,
        delay: 1.4,
        ease: "back.out(1.2)"
      });
    }

    // 7. Camera moves closer to focus on the sparkling ring
    setTimeout(() => {
      gsap.to(this.camera.position, {
        x: -4.3,
        y: 19.45,
        z: -91.5,
        duration: 2.4,
        ease: "power2.out"
      });

      // Show Ring Reveal Banner
      const existingBanner = document.getElementById('royal-ring-banner');
      if (existingBanner) existingBanner.remove();

      const banner = document.createElement('div');
      banner.id = 'royal-ring-banner';
      banner.className = 'royal-ring-banner interactive';
      banner.innerHTML = `<span>💍</span> <span>A Little Treasure for My Queen Ashitha! 💍💖</span>`;
      document.body.appendChild(banner);

      if (window.confetti) {
        window.confetti({
          particleCount: 120,
          spread: 85,
          origin: { x: 0.38, y: 0.6 },
          colors: ['#ffd700', '#ffffff', '#f472b6', '#c084fc']
        });
      }

      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('panda_ring_revealed', 'true');
      }
      this.isRingRevealed = true;

      // After 4.2 seconds of admiring the ring, transition to Stage 4 Birthday Celebration!
      setTimeout(() => {
        gsap.to(banner, {
          opacity: 0,
          y: -15,
          duration: 0.6,
          onComplete: () => {
            banner.remove();
            this.startBirthdayCelebrationCinematic();
          }
        });
      }, 4200);
    }, 2200);
  }

  /* =========================================================================
   * STAGE 4: ROYAL BIRTHDAY CELEBRATION (HUG, ROYAL WALK, THRONE & PANDAS)
   * =======================================================================*/
  startBirthdayCelebrationCinematic() {
    this.isCinematicActive = true;
    this.isCelebrationPlaying = true;
    if (this.controls) this.controls.enabled = false;

    // 1. Play the royal birthday song if available
    if (window.audioManager && window.audioManager.playBgm) {
      window.audioManager.playBgm();
    }

    // 2. Wide cinematic transition shot of the castle courtyard
    gsap.to(this.camera.position, {
      x: 0.0,
      y: 20.8,
      z: -85.5,
      duration: 3.2,
      ease: "power2.inOut"
    });

    if (this.controls) {
      gsap.to(this.controls.target, {
        x: 0.0,
        y: 19.0,
        z: -110.0,
        duration: 3.2,
        ease: "power2.inOut"
      });
    }

    // 3. King Panda Mama gently approaches Queen Panda Ashitha
    if (this.kingPandaGroup) {
      // Turn and walk towards Queen Panda (-2.2, 17.54, -94.5)
      gsap.to(this.kingPandaGroup.position, {
        x: -3.1,
        z: -94.5,
        duration: 3.6,
        delay: 0.5,
        ease: "power1.inOut"
      });
      gsap.to(this.kingPandaGroup.rotation, {
        y: 0.25,
        duration: 1.0,
        delay: 0.5
      });
    }

    // 4. Warm Affectionate Hug Sequence
    setTimeout(() => {
      // Gentle lean together in warm hug embrace
      if (this.kingPandaGroup && this.queenPandaGroup) {
        gsap.to(this.kingPandaGroup.position, { x: -2.7, duration: 1.2, ease: "power1.out" });
        gsap.to(this.queenPandaGroup.position, { x: -2.0, duration: 1.2, ease: "power1.out" });

        // Gentle affectionate tilt
        gsap.to(this.kingPandaGroup.rotation, { z: -0.06, duration: 1.2, ease: "power1.out" });
        gsap.to(this.queenPandaGroup.rotation, { z: 0.06, duration: 1.2, ease: "power1.out" });
      }

      // Close-up camera glide during the hug
      gsap.to(this.camera.position, {
        x: -2.35,
        y: 19.5,
        z: -90.2,
        duration: 2.8,
        ease: "power1.inOut"
      });
      if (this.controls) {
        gsap.to(this.controls.target, {
          x: -2.35,
          y: 19.0,
          z: -94.5,
          duration: 2.8,
          ease: "power1.inOut"
        });
      }

      // Floating heart burst particles
      if (window.confetti) {
        window.confetti({
          particleCount: 50,
          spread: 60,
          origin: { x: 0.48, y: 0.52 },
          colors: ['#f43f5e', '#fbcfe8', '#ffd700']
        });
      }

      if (window.audioManager && window.audioManager.playMagicHarp) {
        window.audioManager.playMagicHarp();
      }

      // 5. Hand-in-paw Royal Walk along the flower-lined purple & gold carpet toward throne
      setTimeout(() => {
        // Return rotation upright facing forward toward throne
        if (this.kingPandaGroup && this.queenPandaGroup) {
          gsap.to(this.kingPandaGroup.rotation, { z: 0, y: 0, duration: 0.8 });
          gsap.to(this.queenPandaGroup.rotation, { z: 0, y: 0, duration: 0.8 });

          // Walk down the carpet to the dais
          gsap.to(this.kingPandaGroup.position, {
            x: -1.3,
            z: -136.5,
            duration: 7.2,
            ease: "linear"
          });
          gsap.to(this.queenPandaGroup.position, {
            x: 1.3,
            z: -136.5,
            duration: 7.2,
            ease: "linear"
          });
        }

        // Camera smoothly tracks behind and alongside them down the royal carpet promenade
        gsap.to(this.camera.position, {
          x: 0.0,
          y: 20.8,
          z: -122.0,
          duration: 7.2,
          ease: "linear"
        });
        if (this.controls) {
          gsap.to(this.controls.target, {
            x: 0.0,
            y: 19.5,
            z: -138.5,
            duration: 7.2,
            ease: "linear"
          });
        }

        // 6. Step onto dais & sit side-by-side on the Twin Royal Thrones!
        setTimeout(() => {
          if (this.kingPandaGroup && this.queenPandaGroup) {
            gsap.to(this.kingPandaGroup.position, {
              x: -1.3,
              y: 18.5,
              z: -138.2,
              duration: 1.8,
              ease: "power2.out"
            });
            gsap.to(this.queenPandaGroup.position, {
              x: 1.3,
              y: 18.5,
              z: -138.2,
              duration: 1.8,
              ease: "power2.out"
            });
          }

          // 7. Welcoming Pandas celebrate enthusiastically!
          if (window.confetti) {
            window.confetti({
              particleCount: 160,
              spread: 100,
              origin: { x: 0.5, y: 0.4 },
              colors: ['#ffd700', '#f472b6', '#a855f7', '#ffffff']
            });
          }

          // 8. Camera pulls back into grand majestic crane shot
          gsap.to(this.camera.position, {
            x: 0.0,
            y: 23.5,
            z: -118.0,
            duration: 3.5,
            ease: "power2.out"
          });
          if (this.controls) {
            gsap.to(this.controls.target, {
              x: 0.0,
              y: 19.8,
              z: -138.5,
              duration: 3.5,
              ease: "power2.out",
              onComplete: () => {
                this.isCinematicActive = false;
                this.isCelebrationPlaying = false;
                if (this.controls) {
                  this.controls.enabled = true;
                  this.controls.minDistance = 3.0;
                  this.controls.maxDistance = 85.0;
                  this.controls.maxPolarAngle = Math.PI / 2 - 0.04;
                }
                this.renderBirthdayPresentationCard();
              }
            });
          }

          if (typeof localStorage !== 'undefined') {
            localStorage.setItem('panda_celebration_completed', 'true');
          }
          this.isCelebrationCompleted = true;

        }, 7400);
      }, 3400);
    }, 4200);
  }

  /* =========================================================================
   * BIRTHDAY PRESENTATION CARD & CONTROLS
   * =======================================================================*/
  renderBirthdayPresentationCard() {
    const existing = document.getElementById('royal-celebration-card');
    if (existing) existing.remove();

    const card = document.createElement('div');
    card.id = 'royal-celebration-card';
    card.className = 'royal-celebration-card interactive';
    card.innerHTML = `
      <div style="font-size: 38px; margin-bottom: 4px; animation: pulse-glow 2s infinite alternate;">👑🎂🐼</div>
      <h1 class="royal-celebration-title">HAPPY BIRTHDAY, ASHITHA! 👑🐼💖</h1>
      <div class="royal-celebration-subtitle">Queen of the Panda World</div>
      <p class="royal-celebration-msg">
        "A special little gift for our Queen. May your kingdom always be filled with love, happiness, and magical memories. 💖"
      </p>

      <div class="royal-celebration-actions">
        <button class="btn-royal-action gold" id="btn-watch-video">
          <span>🎬</span> <span>Watch Cinematic Video</span>
        </button>
        <button class="btn-royal-action" id="btn-replay-celebration">
          <span>🔄</span> <span>Replay Celebration</span>
        </button>
        <button class="btn-royal-action" id="btn-explore-kingdom">
          <span>🏰</span> <span>Explore Kingdom (360°)</span>
        </button>
      </div>
    `;
    document.body.appendChild(card);
    this.celebrationCard = card;

    document.getElementById('btn-watch-video').addEventListener('click', () => {
      this.openCinematicVideoModal();
    });

    document.getElementById('btn-replay-celebration').addEventListener('click', () => {
      card.remove();
      this.replayCelebration();
    });

    document.getElementById('btn-explore-kingdom').addEventListener('click', () => {
      gsap.to(card, {
        opacity: 0.15,
        y: 40,
        duration: 0.35,
        onComplete: () => {
          card.style.pointerEvents = 'auto';
          // Hovering over bottom brings card back into view
          card.onmouseenter = () => gsap.to(card, { opacity: 1, y: 0, duration: 0.25 });
          card.onmouseleave = () => gsap.to(card, { opacity: 0.2, y: 40, duration: 0.35 });
        }
      });
      if (this.controls) this.controls.enabled = true;
    });
  }

  showRingCelebrationOptions() {
    // Focus camera smoothly on the ring & chest
    if (this.controls) this.controls.enabled = true;
    gsap.to(this.camera.position, {
      x: -4.3,
      y: 19.45,
      z: -91.5,
      duration: 2.0,
      ease: "power2.out"
    });
    if (this.controls) {
      gsap.to(this.controls.target, {
        x: -4.3,
        y: 18.9,
        z: -93.8,
        duration: 2.0,
        ease: "power2.out"
      });
    }

    if (!document.getElementById('royal-celebration-card')) {
      this.renderBirthdayPresentationCard();
    }
  }

  openCinematicVideoModal() {
    const existing = document.getElementById('royal-video-modal');
    if (existing) existing.remove();

    // Pause ambient stage BGM so it does not clash with the video's Tamil birthday song
    if (window.audioManager && window.audioManager.pauseBgm) {
      window.audioManager.pauseBgm();
    }

    // Determine correct Streamlit static serving origin
    let origin = window.location.origin;
    try {
      if (window.top && window.top.location && window.top.location.origin) {
        origin = window.top.location.origin;
      }
    } catch(e) {}

    const timestamp = Date.now();
    const primaryUrl = `/app/static/video/birthday_celebration.mp4?v=${timestamp}`;
    const absoluteUrl = `${origin}/app/static/video/birthday_celebration.mp4?v=${timestamp}`;

    const modal = document.createElement('div');
    modal.id = 'royal-video-modal';
    modal.className = 'royal-video-modal interactive';
    modal.innerHTML = `
      <div style="font-family: 'Cinzel Decorative', cursive; font-size: 21px; color: #ffd700; margin-bottom: 12px; font-weight: 700; text-align: center; text-shadow: 0 0 15px rgba(255, 215, 0, 0.5);">
        👑 Queen Ashitha's Royal Birthday Celebration 🎬💖
      </div>
      <div class="royal-video-wrapper" id="royal-video-wrapper" style="position: relative;">
        <video id="royal-celebration-video" class="royal-video-element" controls autoplay playsinline loop preload="auto">
          <source src="${primaryUrl}" type="video/mp4">
          <source src="${absoluteUrl}" type="video/mp4">
          Your browser does not support HTML5 video.
        </video>
        <!-- Unmute banner for browsers with strict audio autoplay policies -->
        <div id="royal-unmute-banner" style="display: none; position: absolute; top: 15px; left: 50%; transform: translateX(-50%); background: rgba(18, 6, 28, 0.92); color: #ffd700; padding: 10px 22px; border-radius: 25px; border: 1.5px solid #ffd700; font-family: 'Cinzel Decorative', cursive; font-size: 13px; cursor: pointer; z-index: 10; box-shadow: 0 0 20px rgba(255,215,0,0.5); pointer-events: auto;">
          🔊 Sound Muted by Browser &bull; Click to Unmute Song! 🎵
        </div>
        <!-- Seamless cinematic slideshow fallback -->
        <div id="royal-slideshow-container" style="display: none; position: absolute; top: 0; left: 0; width: 100%; height: 100%; overflow: hidden; background: #000;">
          <div id="slideshow-slide" style="width: 100%; height: 100%; background-size: cover; background-position: center; transition: opacity 0.8s ease, transform 4.5s ease-out;"></div>
          <div style="position: absolute; bottom: 15px; left: 50%; transform: translateX(-50%); color: #ffd700; font-family: 'Cinzel Decorative', serif; font-size: 14px; background: rgba(0,0,0,0.7); padding: 8px 20px; border-radius: 20px; border: 1px solid #ffd700; letter-spacing: 1px;" id="slideshow-caption">
            👑 Queen Ashitha's Royal Realm
          </div>
        </div>
      </div>
      <div class="royal-video-controls" style="display: flex; gap: 14px; margin-top: 18px;">
        <a href="${primaryUrl}" target="_blank" rel="noopener noreferrer" class="btn-royal-action" style="text-decoration: none; display: inline-flex; align-items: center; gap: 6px; padding: 10px 20px; background: rgba(255,215,0,0.15); border: 1px solid #ffd700; border-radius: 20px; color: #ffd700; font-family: 'Cinzel Decorative', cursive; font-size: 13px; font-weight: 600;">
          <span>🎥</span> <span>Open Video in Full Tab</span>
        </a>
        <button class="btn-royal-action gold" id="btn-close-video" style="cursor: pointer;">
          <span>🏰</span> <span>Back to Royal Kingdom</span>
        </button>
      </div>
    `;
    document.body.appendChild(modal);

    const vid = document.getElementById('royal-celebration-video');
    const unmuteBanner = document.getElementById('royal-unmute-banner');
    const slideshowContainer = document.getElementById('royal-slideshow-container');
    const slide = document.getElementById('slideshow-slide');
    const caption = document.getElementById('slideshow-caption');

    let isSlideshowActive = false;

    const startSlideshowFallback = () => {
      if (isSlideshowActive) return;
      isSlideshowActive = true;
      if (vid) vid.style.display = 'none';
      if (unmuteBanner) unmuteBanner.style.display = 'none';
      if (slideshowContainer) slideshowContainer.style.display = 'block';

      if (window.audioManager && window.audioManager.playBgm) {
        window.audioManager.playBgm();
      }

      const slidesData = [
        { src: window.TEX_CASTLE_ESTABLISHING_URI || 'static/textures/royal_castle_establishing.jpg', text: '🏰 Grand Castle Courtyard of the Panda Kingdom' },
        { src: window.TEX_PANDA_HUG_URI || 'static/textures/panda_royal_hug.jpg', text: '💖 King Panda Mama & Queen Panda Ashitha\'s Heartfelt Hug' },
        { src: window.TEX_PANDA_WALK_URI || 'static/textures/panda_royal_walk.jpg', text: '🌸 Walking Hand-in-Paw Along the Royal Pathway' },
        { src: window.TEX_CELEBRATION_CINEMATIC_URI || 'static/textures/royal_celebration_cinematic.jpg', text: '👑 Happy Birthday Queen Ashitha! Seated on the Royal Throne' }
      ];

      let curIdx = 0;
      const showSlide = (idx) => {
        if (!document.getElementById('royal-video-modal')) return;
        const s = slidesData[idx];
        slide.style.opacity = '0';
        slide.style.transform = 'scale(1.0)';
        setTimeout(() => {
          slide.style.backgroundImage = `url('${s.src}')`;
          slide.style.opacity = '1';
          slide.style.transform = 'scale(1.08)';
          if (caption) caption.innerText = s.text;
        }, 250);
      };

      showSlide(0);
      const interval = setInterval(() => {
        if (!document.getElementById('royal-video-modal')) {
          clearInterval(interval);
          return;
        }
        curIdx = (curIdx + 1) % slidesData.length;
        showSlide(curIdx);
      }, 4500);
    };

    if (unmuteBanner) {
      unmuteBanner.addEventListener('click', (e) => {
        e.stopPropagation();
        if (vid) {
          vid.muted = false;
          vid.play().catch(() => {});
        }
        unmuteBanner.style.display = 'none';
      });
    }

    if (vid) {
      vid.src = primaryUrl;
      vid.load();

      vid.addEventListener('click', () => {
        if (vid.muted) {
          vid.muted = false;
          if (unmuteBanner) unmuteBanner.style.display = 'none';
        }
      });

      vid.addEventListener('error', (e) => {
        console.warn("Video element error encountered, engaging cinematic fallback:", vid.error, e);
        startSlideshowFallback();
      });

      const loadTimeout = setTimeout(() => {
        if (vid.readyState === 0) {
          console.warn("Video load timeout, engaging cinematic fallback");
          startSlideshowFallback();
        }
      }, 4000);

      vid.addEventListener('loadedmetadata', () => {
        clearTimeout(loadTimeout);
      });

      const playPromise = vid.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          console.log("Unmuted autoplay restricted, switching to muted autoplay:", err);
          vid.muted = true;
          vid.play().then(() => {
            if (unmuteBanner) unmuteBanner.style.display = 'block';
          }).catch((err2) => {
            console.log("Muted autoplay also blocked:", err2);
            if (unmuteBanner) {
              unmuteBanner.innerHTML = '▶ Tap Here to Play Celebration Video! 🎬';
              unmuteBanner.style.display = 'block';
            }
          });
        });
      }
    }

    document.getElementById('btn-close-video').addEventListener('click', () => {
      if (vid) vid.pause();
      modal.remove();
      // Resume stage ambient music when video closes
      if (window.audioManager && window.audioManager.playBgm) {
        window.audioManager.playBgm();
      }
    });
  }

  replayCelebration() {
    console.log("Replaying royal birthday celebration...");
    // Reset positions to courtyard starting spots
    if (this.kingPandaGroup) {
      this.kingPandaGroup.position.set(3.2, 17.54, -93.5);
      this.kingPandaGroup.rotation.set(0, -0.32, 0);
    }
    if (this.queenPandaGroup) {
      this.queenPandaGroup.position.set(-2.2, 17.54, -94.5);
      this.queenPandaGroup.rotation.set(0, 0.22, 0);
    }
    this.startBirthdayCelebrationCinematic();
  }

  onPointerMove(e) {
    if (!this.kingdomGroup || !this.kingdomGroup.visible || !this.camera || this.isCinematicActive) return;

    this.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    this.mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.camera);
    const hitTargets = [];
    if (this.queenPandaHitBox) hitTargets.push(this.queenPandaHitBox);
    if (this.treasureChestHitBox) hitTargets.push(this.treasureChestHitBox);

    const intersects = this.raycaster.intersectObjects(hitTargets, true);
    if (intersects.length > 0) {
      const hit = intersects[0].object;
      document.body.style.cursor = 'pointer';

      if (hit.userData.isTreasureChest) {
        this.isChestHovered = true;
        if (this.chestGlow) this.chestGlow.intensity = 3.2;
        if (!this.isChestUnlocked) {
          this.showChestHoverPrompt(e.clientX, e.clientY);
        }
      } else {
        this.isChestHovered = false;
        this.hideChestHoverPrompt();
        if (this.chestGlow && !this.isChestUnlocked) this.chestGlow.intensity = 1.4;
      }
    } else {
      this.isChestHovered = false;
      this.hideChestHoverPrompt();
      if (this.chestGlow && !this.isChestUnlocked) this.chestGlow.intensity = 1.4;
      document.body.style.cursor = 'default';
    }
  }

  onPointerClick(e) {
    if (!this.kingdomGroup || !this.kingdomGroup.visible || !this.camera || this.isCinematicActive) return;

    if (e.target && (e.target.closest('.interactive') || e.target.closest('button') || e.target.closest('input'))) {
      return;
    }

    this.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    this.mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.camera);
    const hitTargets = [];
    if (this.queenPandaHitBox) hitTargets.push(this.queenPandaHitBox);
    if (this.treasureChestHitBox) hitTargets.push(this.treasureChestHitBox);

    const intersects = this.raycaster.intersectObjects(hitTargets, true);
    if (intersects.length > 0) {
      const hit = intersects[0].object;
      if (hit.userData.isQueenPanda) {
        this.openBirthdayGiftModal();
      } else if (hit.userData.isTreasureChest) {
        this.hideChestHoverPrompt();
        if (!this.isChestUnlocked) {
          this.showChestSecretQuestionModal();
        } else {
          this.showRingCelebrationOptions();
        }
      }
    }
  }

  /* =========================================================================
   * 7. FRAME UPDATE LOOP (ANIMATIONS, WATER, BUTTERFLIES, PARTICLES)
   * =======================================================================*/
  update(time) {
    if (!this.kingdomGroup || !this.kingdomGroup.visible) return;

    // 1. Natural Breathing & Gentle Greeting Tilt for Queen Panda
    if (this.queenPandaGroup) {
      const breath = Math.sin(time * 2.2) * 0.014;
      this.queenPandaGroup.scale.y = 1.30 + breath;
      this.queenPandaGroup.scale.x = 1.30 - breath * 0.5;
      this.queenPandaGroup.rotation.z = Math.sin(time * 2.0) * 0.015;
    }

    // 2. Sparkling Ruby Tiara Dynamic Point Light
    if (this.crownSparkleLight) {
      this.crownSparkleLight.intensity = 1.8 + Math.sin(time * 4.5) * 0.5;
    }

    // 2b. Royal Treasure Chest Starlight Aura & Floating 3D Ring Animation
    if (this.chestSparkles) {
      this.chestSparkles.rotation.y = time * 0.45;
    }

    if (this.royalRingGroup && this.isRingRevealed) {
      this.royalRingGroup.rotation.y += 0.016;
      this.royalRingGroup.position.y = 1.95 + Math.sin(time * 2.2) * 0.04;
    }

    if (this.ringGleamLight && this.isRingRevealed) {
      this.ringGleamLight.intensity = 1.6 + Math.sin(time * 3.8) * 0.4;
    }

    // 2c. King Panda Mama Natural Breathing
    if (this.kingPandaGroup) {
      const kBreath = Math.sin(time * 2.1) * 0.014;
      this.kingPandaGroup.scale.y = 1.35 + kBreath;
      this.kingPandaGroup.scale.x = 1.35 - kBreath * 0.4;
    }

    // 2d. Welcoming Pandas Festive Animations (Waving, Clapping, Bowing)
    if (this.welcomingPandas && this.welcomingPandas.length > 0) {
      this.welcomingPandas.forEach(wp => {
        const t = time + wp.phase;
        if (wp.type === 'waving') {
          wp.mesh.rotation.z = Math.sin(t * 3.5) * 0.09;
          wp.group.position.y = wp.baseY + Math.sin(t * 2.8) * 0.04;
        } else if (wp.type === 'clapping') {
          const clap = Math.sin(t * 6.5);
          wp.mesh.scale.x = (1.0 + clap * 0.05);
        } else if (wp.type === 'bowing') {
          wp.mesh.rotation.x = Math.max(0, Math.sin(t * 1.6)) * 0.20;
        }
      });
    }

    // 3. Fountain Water Jet & Splashes Animation
    if (this.fountainWaterJet) {
      this.fountainWaterJet.scale.y = 1.0 + Math.sin(time * 6.0) * 0.08;
      this.fountainWaterJet.scale.x = 1.0 + Math.cos(time * 5.0) * 0.06;
    }

    if (this.fountainMistParticles) {
      const pos = this.fountainMistParticles.geometry.attributes.position;
      const vels = this.fountainMistParticles.userData.velocities;
      for (let i = 0; i < pos.count; i++) {
        pos.array[i * 3 + 1] += vels[i].y;
        pos.array[i * 3] += Math.cos(vels[i].angle) * vels[i].speed;
        pos.array[i * 3 + 2] += Math.sin(vels[i].angle) * vels[i].speed;

        // Reset if reached water pool
        if (pos.array[i * 3 + 1] < 1.3) {
          pos.array[i * 3 + 1] = 6.2 + Math.random() * 2.0;
          pos.array[i * 3] = (Math.random() - 0.5) * 0.5;
          pos.array[i * 3 + 2] = (Math.random() - 0.5) * 0.5;
        }
      }
      pos.needsUpdate = true;
    }

    // 4. Shimmering Turquoise River Motion
    if (this.riverMesh) {
      this.riverMesh.rotation.z = Math.sin(time * 0.6) * 0.012;
    }

    // 5. Flapping 3D Fairy Butterflies
    this.butterflies.forEach(bf => {
      const flap = Math.sin(time * 18.0 + bf.phase);
      bf.leftWing.rotation.y = flap * 0.85;
      bf.rightWing.rotation.y = -flap * 0.85;

      // Fluttering flight motion
      bf.group.position.x = bf.baseX + Math.sin(time * 1.5 + bf.phase) * 1.4;
      bf.group.position.y = bf.baseY + Math.sin(time * 3.0 + bf.phase) * 0.45;
      bf.group.position.z = bf.baseZ + Math.cos(time * 1.5 + bf.phase) * 1.2;
    });

    // 6. Swimming Animals (Duck/Swan gentle bobbing)
    this.animatedAnimals.forEach(ea => {
      if (ea.type === 'swimming_duck' && ea.mesh) {
        ea.mesh.position.z = ea.baseZ + Math.sin(time * 0.8) * 1.8;
        ea.mesh.position.y = 14.1 + Math.sin(time * 2.2) * 0.05;
        ea.mesh.rotation.y = -Math.PI / 2 + Math.cos(time * 0.8) * 0.15;
      }
    });

    // 7. Falling Cherry Blossom Petals
    if (this.petalParticles) {
      const pos = this.petalParticles.geometry.attributes.position;
      const vels = this.petalParticles.userData.velocities;
      for (let i = 0; i < pos.count; i++) {
        pos.array[i * 3 + 1] += vels[i].y;
        pos.array[i * 3] += vels[i].x + Math.sin(time + i) * 0.005;
        pos.array[i * 3 + 2] = vels[i].z;

        // Reset if fallen below ground
        if (pos.array[i * 3 + 1] < 17.0) {
          pos.array[i * 3 + 1] = 28.5;
          pos.array[i * 3] = -22.0 + Math.random() * 44.0;
          pos.array[i * 3 + 2] = -90.0 - Math.random() * 55.0;
        }
      }
      pos.needsUpdate = true;
    }

    // 8. Floating Golden Starlight Dust
    if (this.sparkleParticles) {
      const sPos = this.sparkleParticles.geometry.attributes.position;
      for (let i = 0; i < sPos.count; i++) {
        sPos.array[i * 3 + 1] += Math.sin(time * 1.5 + i) * 0.006;
      }
      sPos.needsUpdate = true;
    }
  }

  destroy() {
    if (window.environment && window.environment.restoreFromKingdom) {
      window.environment.restoreFromKingdom();
    }
    if (this.renderer && this.originalToneMappingExposure !== undefined) {
      this.renderer.toneMappingExposure = this.originalToneMappingExposure;
    }
    if (this.kingdomGroup) {
      this.scene.remove(this.kingdomGroup);
      this.kingdomGroup = null;
    }
    const d = document.getElementById('queen-welcome-dialogue');
    if (d) d.remove();
    const tb = document.getElementById('kingdom-top-badge');
    if (tb) tb.remove();
    const rb = document.getElementById('btn-return-to-village');
    if (rb) rb.remove();
    const ch = document.getElementById('kingdom-center-hint');
    if (ch) ch.remove();
    const rh = document.getElementById('kingdom-right-hint');
    if (rh) rh.remove();
    if (this.floatingTalkButton) {
      this.floatingTalkButton.remove();
      this.floatingTalkButton = null;
    }
    window.removeEventListener('pointermove', this.onPointerMove);
    window.removeEventListener('click', this.onPointerClick);
  }
}

// Attach globally
window.Stage5_KingdomEntrance = Stage5_KingdomEntrance;
