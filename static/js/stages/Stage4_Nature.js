/**
 * Stage4_Nature.js
 * Stage 4: Photorealistic 3D Wildlife & Nature Sanctuary
 * 
 * Visually matches the user's reference image with cinematic realism:
 * - Panoramic alpine mountain vista with misty ridges, cascading waterfall, and golden sunrise rays
 * - Photorealistic PBR textured terrain with lush green grass, white daisies, and pink cosmos wildflowers
 * - Realistic Giant Pandas with high-resolution fur textures, accurate anatomy, and varied continuous behaviors
 *   1. Mother Giant Panda in foreground seated, holding and eating fresh bamboo stalks with lifelike chewing & arm motion
 *   2. Baby Panda Cub nestled against mother panda looking affectionately forward
 *   3. Riverbank Panda seated by the water watching the swimming swans
 *   4. Bamboo Grove Panda 1 seated in bamboo thicket stripping leaves
 *   5. Bamboo Grove Panda 2 standing on hind legs gnawing on tall bamboo cane
 *   6. Hillside Lounging Panda reclining on grassy slope scratching its belly
 *   7. River Boulder Panda curled up asleep with deep rhythmic breathing
 *   8. Bridge Walker Panda walking on all 4 legs towards the bridge with natural gait
 *   9. Cottage Flowerbed Panda sitting amongst blossoms sniffing petals
 *   10. Rolling Playful Cub on its back kicking its paws in the air
 *   11. Waterfall Basin Explorer Panda exploring the mist
 *   12. Curious Cub peeking through daisies near the rabbits
 * - Realistic Cottontail Rabbits nestled in the foreground flower glade
 * - Spotted Fallow Deer Family (Buck with majestic branching antlers, grazing Doe, and spotted Fawn)
 * - Animated Woodland Fox (rigged Fox.glb)
 * - Swimming River Swans and Ducks (Duck.glb)
 * - Cerulean Bluebirds perched on blooming cherry tree boughs
 * - Rigged soaring birds (Stork.glb, Flamingo.glb) in high flight paths
 * - Monarch and Swallowtail fluttering butterflies
 * - Gnarled old-growth Cherry Blossom tree arching overhead with photo-realistic blossom clusters & drifting petals
 * - Dedicated Bamboo Sanctuary Grove with segmented canes and delicate leaves
 * - Rustic carved wooden signpost in foreground: "Nature is where your happiness lives... - Panda 💖"
 * - Traditional Japanese stone pagoda garden lantern (tōrō) with warm flickering amber flame
 * - Arched wooden timber bridge with warm glowing lantern posts and stone abutments
 * - Cozy rustic woodland log cottage with glowing amber windows and stone chimney nestled in cherry trees
 * - 8 Cinematic Viewpoint presets in the HUD for seamless exploration
 */

class Stage4_Nature {
  constructor(stageManager) {
    this.stageManager = stageManager;
    this.scene = stageManager.scene;
    this.camera = stageManager.camera;
    this.controls = stageManager.controls;
    this.container = document.getElementById('modal-container');

    this.natureGroup = null;
    this.mixers = [];
    this.animatedEntities = [];
    this.waterMesh = null;
    this.waterfallMesh = null;
    this.mistParticles = null;
    this.petalParticles = null;
    this.butterflies = [];
    this.birds = [];
    this.trees = [];
    this.bambooNodes = [];
    this.lanternLights = [];
    this.clock = new THREE.Clock();

    // Hidden Golden Key & Panda Village State
    this.hasCollectedKey = (typeof localStorage !== 'undefined' && localStorage.getItem('panda_golden_key') === 'true') || (this.stageManager && this.stageManager.collectedKey);
    this.hasDismissedVillageIntro = false;
    this.goldenKeyMesh = null;
    this.keyGroup = null;
    this.keyLight = null;
    this.keySparkles = null;
    this.goldenButterfly = null;
    this.interactiveKeyObjects = [];
    this.isKeyHovered = false;
    this.tooltipElem = null;
    this.giftReveal = null;

    // Raycasting for key hover & collection
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();

    this.onPointerMove = this.onPointerMove.bind(this);
    this.onPointerClick = this.onPointerClick.bind(this);

    this.gltfLoader = (window.THREE && THREE.GLTFLoader) ? new THREE.GLTFLoader() : null;

    // Load High-Resolution Photographic Textures
    this.mountainsTex = this.loadTexture(window.TEX_MOUNTAINS_URI, 1, 1);
    this.pandaFurTex = this.loadTexture(window.TEX_PANDA_FUR_URI, 1, 1);
    this.meadowTex = this.loadTexture(window.TEX_MEADOW_URI, 18, 18);
    this.timberTex = this.loadTexture(window.TEX_TIMBER_URI, 2, 2);
    this.blossomTex = this.loadTexture(window.TEX_BLOSSOM_URI, 1, 1);
  }

  loadTexture(dataUri, repeatX = 1, repeatY = 1) {
    if (!dataUri || dataUri.length < 50) return null;
    try {
      const loader = new THREE.TextureLoader();
      const tex = loader.load(dataUri);
      tex.wrapS = THREE.RepeatWrapping;
      tex.wrapT = THREE.RepeatWrapping;
      tex.repeat.set(repeatX, repeatY);
      tex.anisotropy = 8;
      return tex;
    } catch (e) {
      console.warn("Failed to load texture URI:", e);
      return null;
    }
  }

  enter() {
    this.stageManager.updateTracker(4);

    // Cleanly hide Stage 1 & 2 entrance pavilion and low-poly trees so Stage 4 has 100% full visibility
    if (window.environment) {
      window.environment.hideEntrance();
    }

    // Hide Stage 3 door
    if (this.stageManager && this.stageManager.stages[3] && this.stageManager.stages[3].doorGroup) {
      this.stageManager.stages[3].doorGroup.visible = false;
    }

    if (!this.natureGroup) {
      this.buildNatureWorld();
    } else {
      this.natureGroup.visible = true;
    }

    // Update Top Header Inventory Badge
    this.updateInventoryHUD(this.hasCollectedKey);

    // Set orbit controls target to center of scenic valley
    if (this.controls) {
      this.controls.target.set(0, 2.5, -45.0);
      this.controls.minDistance = 2.5;
      this.controls.maxDistance = 160;
    }

    // Panoramic entry camera position matching the reference image view
    gsap.to(this.camera.position, {
      x: -2.0,
      y: 3.5,
      z: -8.5,
      duration: 3.0,
      ease: "power2.out"
    });

    this.renderNatureHUD();

    // Show Village Introduction Modal on entry
    if (!this.hasDismissedVillageIntro) {
      this.showVillageIntroModal();
    }

    // Register Raycasting Listeners for Hidden Key Hover & Click
    window.removeEventListener('pointermove', this.onPointerMove);
    window.removeEventListener('click', this.onPointerClick);
    window.addEventListener('pointermove', this.onPointerMove);
    window.addEventListener('click', this.onPointerClick);
  }

  renderNatureHUD() {
    if (this.container) {
      this.container.classList.add('nature-active');
      this.container.innerHTML = `
        <div id="nature-hud-panel" class="nature-hud-dock interactive">
          <button class="glass-btn viewpoint-btn" data-view="mother_cub">
            <span>🐼</span> <span>Mother & Cub</span>
          </button>
          <button class="glass-btn viewpoint-btn" data-view="bamboo_grove">
            <span>🎋</span> <span>Bamboo Sanctuary</span>
          </button>
          <button class="glass-btn viewpoint-btn" data-view="bridge">
            <span>🌉</span> <span>Timber Bridge</span>
          </button>
          <button class="glass-btn viewpoint-btn" data-view="pedestal">
            <span>🏛️</span> <span>Magical Pedestal</span>
          </button>
          <button class="glass-btn viewpoint-btn" data-view="deer_fox">
            <span>🦌</span> <span>Deer & Fox Glade</span>
          </button>
          <button class="glass-btn viewpoint-btn" data-view="rabbits">
            <span>🐇</span> <span>Rabbit Meadow</span>
          </button>
          <button class="glass-btn viewpoint-btn" data-view="cottage">
            <span>🏡</span> <span>Forest Cottage</span>
          </button>
          <button class="glass-btn viewpoint-btn" data-view="waterfall">
            <span>🌊</span> <span>Waterfall & Mist</span>
          </button>
          <button class="glass-btn viewpoint-btn" data-view="panorama">
            <span>🌄</span> <span>Valley Panorama</span>
          </button>
        </div>
      `;
    }

    document.querySelectorAll('.viewpoint-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const view = e.currentTarget.getAttribute('data-view');
        this.switchViewpoint(view);
      });
    });
  }

  switchViewpoint(view) {
    if (window.audioManager) window.audioManager.playChime(1.1);

    if (view === 'mother_cub') {
      // Intimate close-up of Mother Panda eating bamboo with Baby Cub, wooden sign & lantern
      gsap.to(this.camera.position, { x: -4.8, y: 1.8, z: -13.0, duration: 2.2, ease: "power2.inOut" });
      if (this.controls) gsap.to(this.controls.target, { x: -5.5, y: 0.9, z: -17.0, duration: 2.2 });
    } else if (view === 'bamboo_grove') {
      // Dedicated Bamboo Sanctuary with pandas climbing & eating
      gsap.to(this.camera.position, { x: -9.5, y: 3.5, z: -23.0, duration: 2.2, ease: "power2.inOut" });
      if (this.controls) gsap.to(this.controls.target, { x: -16.5, y: 2.0, z: -35.0, duration: 2.2 });
    } else if (view === 'bridge') {
      // Arched wooden bridge with glowing lanterns & large cherry blossom tree with the hidden key
      gsap.to(this.camera.position, { x: -3.8, y: 2.5, z: -27.5, duration: 2.2, ease: "power2.inOut" });
      if (this.controls) gsap.to(this.controls.target, { x: -5.6, y: 1.1, z: -35.0, duration: 2.2 });
    } else if (view === 'pedestal') {
      // Intimate viewpoint of Ancient Magical Pedestal near Timber Bridge
      gsap.to(this.camera.position, { x: -8.0, y: 1.8, z: -29.2, duration: 2.2, ease: "power2.inOut" });
      if (this.controls) gsap.to(this.controls.target, { x: -10.2, y: 0.9, z: -33.0, duration: 2.2 });
    } else if (view === 'deer_fox') {
      // Spotted fallow deer family and woodland fox
      gsap.to(this.camera.position, { x: 11.5, y: 3.0, z: -32.0, duration: 2.2, ease: "power2.inOut" });
      if (this.controls) gsap.to(this.controls.target, { x: 15.0, y: 1.8, z: -41.0, duration: 2.2 });
    } else if (view === 'rabbits') {
      // Macro close-up of Cottontail Rabbits nestled in the daisies
      gsap.to(this.camera.position, { x: 0.2, y: 0.8, z: -16.5, duration: 2.2, ease: "power2.inOut" });
      if (this.controls) gsap.to(this.controls.target, { x: 0.2, y: 0.0, z: -19.5, duration: 2.2 });
    } else if (view === 'cottage') {
      // Rustic timber log cottage surrounded by cherry blossoms
      gsap.to(this.camera.position, { x: 18.5, y: 4.2, z: -38.0, duration: 2.5, ease: "power2.inOut" });
      if (this.controls) gsap.to(this.controls.target, { x: 26.0, y: 3.5, z: -48.0, duration: 2.5 });
    } else if (view === 'waterfall') {
      // Majestic multi-tier waterfall and rising mist
      gsap.to(this.camera.position, { x: -2.0, y: 4.0, z: -50.0, duration: 2.5, ease: "power2.inOut" });
      if (this.controls) gsap.to(this.controls.target, { x: -14.0, y: 11.0, z: -82.0, duration: 2.5 });
    } else if (view === 'panorama') {
      // Grand cinematic wide shot matching reference image composition
      gsap.to(this.camera.position, { x: -2.0, y: 3.5, z: -8.5, duration: 2.5, ease: "power2.inOut" });
      if (this.controls) gsap.to(this.controls.target, { x: 0, y: 2.5, z: -45.0, duration: 2.5 });
    }
  }

  /* -------------------------------------------------------------
   * TERRAIN HEIGHT MATHEMATICAL FUNCTION
   * -----------------------------------------------------------*/
  getTerrainHeight(x, z) {
    if (z > -10) return -0.6;

    // Rolling gentle topography
    let y = Math.sin(x * 0.05) * Math.cos(z * 0.04) * 1.5;
    y += Math.sin(x * 0.02 + 0.6) * Math.cos(z * 0.025) * 2.2;

    // Left hillside (Bamboo grove & Cherry trees)
    if (x < -18) {
      y += Math.pow((Math.abs(x) - 18) * 0.16, 1.4) * 2.2;
    }

    // Right hillside (Cottage plateau & forest)
    if (x > 18) {
      y += Math.pow((x - 18) * 0.16, 1.4) * 2.5;
    }

    // High waterfall cliff at back-left (x ~ -14, z ~ -82)
    const distFromCliff = Math.hypot(x + 14, z + 82);
    if (distFromCliff < 24) {
      y += (24 - distFromCliff) * 0.75;
    }

    // River Channel carved into valley floor
    const riverCenter = Math.sin((z + 18) * 0.052) * 5.8;
    const distFromRiver = Math.abs(x - riverCenter);
    if (distFromRiver < 6.8 && z < -13 && z > -86) {
      const depth = (1.0 - distFromRiver / 6.8) * 2.4;
      y -= depth;
    }

    return y - 0.75;
  }

  buildNatureWorld() {
    this.natureGroup = new THREE.Group();
    this.natureGroup.name = "RealisticNatureWorld";

    // 1. Golden Hour Sky, Sun & Lighting
    this.setupNatureLighting();
    this.buildAtmosphericSky();

    // 2. Realistic Rolling Terrain & River Stones
    this.buildRealisticTerrain();

    // 3. Flowing Mountain River with caustics & reflections
    this.buildFlowingRiver();

    // 4. Cascading Multi-tier Waterfall & Rising Mist
    this.buildWaterfall();

    // 5. Arched Timber Bridge with glowing post lanterns
    this.buildWoodenBridge();

    // 6. Rustic Woodland Log Cottage
    this.buildForestCottage();

    // 7. Rustic Wooden Signpost ("Nature is where your happiness lives... - Panda 💖")
    this.buildSignpost();

    // 8. Traditional Japanese Stone Pagoda Garden Lantern (Tōrō)
    this.buildStoneLantern();

    // 9. Dedicated Bamboo Sanctuary Grove
    this.buildBambooGrove();

    // 10. Gnarled Old-Growth Cherry Blossom Trees & Drifting Petals
    this.buildCherryTrees();
    this.buildForegroundCherryCanopy();
    this.buildBridgeCherryTreeAndKey();

    // 11. Wildflower Meadows (Daisies, Cosmos, Lavender)
    this.buildMeadowFlora();

    // 12. Giant Pandas (12+ Individual Pandas with unique behaviors)
    this.buildPandaSanctuary();

    // 13. Cottontail Rabbits, Spotted Deer, Foxes, Swans, Ducks, Perched Bluebirds, Flying Storks & Butterflies
    this.buildWildlifeFauna();

    // 14. Magical Keyhole Pedestal & 10 Birthday Gifts Reveal
    if (window.MagicalGiftReveal) {
      this.giftReveal = new MagicalGiftReveal(this);
      this.giftReveal.init();
    }

    this.scene.add(this.natureGroup);
  }

  /* -------------------------------------------------------------
   * 1. NATURE LIGHTING & ATMOSPHERE
   * -----------------------------------------------------------*/
  setupNatureLighting() {
    // Balanced warm golden hour sunlight matching reference photo
    const goldenSun = new THREE.DirectionalLight(0xffeed0, 1.15);
    goldenSun.position.set(30, 36, -55);
    goldenSun.target.position.set(0, 1.5, -40);
    goldenSun.castShadow = true;
    goldenSun.shadow.mapSize.width = 2048;
    goldenSun.shadow.mapSize.height = 2048;
    goldenSun.shadow.camera.near = 5;
    goldenSun.shadow.camera.far = 140;
    const d = 50;
    goldenSun.shadow.camera.left = -d;
    goldenSun.shadow.camera.right = d;
    goldenSun.shadow.camera.top = d;
    goldenSun.shadow.camera.bottom = -d;
    goldenSun.shadow.bias = -0.0004;
    this.natureGroup.add(goldenSun);
    this.natureGroup.add(goldenSun.target);

    // Warm peach sky to rich forest-green bounce light
    const hemiLight = new THREE.HemisphereLight(0xfef0dc, 0x224816, 0.6);
    hemiLight.position.set(0, 45, -40);
    this.natureGroup.add(hemiLight);

    // Soft fill light for mountain shadowed areas
    const fillLight = new THREE.DirectionalLight(0xcfd8dc, 0.3);
    fillLight.position.set(-28, 24, -20);
    this.natureGroup.add(fillLight);
  }

  buildAtmosphericSky() {
    // Golden Hour Sky Dome
    const skyGeo = new THREE.SphereGeometry(150, 32, 24);
    skyGeo.scale(-1, 1, 1);

    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');
    const grad = ctx.createLinearGradient(0, 1024, 0, 0);
    grad.addColorStop(0.0, '#fed7aa'); // warm golden peach at horizon
    grad.addColorStop(0.2, '#fde68a'); // luminous golden yellow
    grad.addColorStop(0.45, '#f472b6'); // soft rose twilight
    grad.addColorStop(0.7, '#c084fc'); // lavender violet
    grad.addColorStop(1.0, '#4338ca'); // deep twilight azure
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1024, 1024);

    const skyTex = new THREE.CanvasTexture(canvas);
    const skyMat = new THREE.MeshBasicMaterial({ map: skyTex, depthWrite: false });
    const skyMesh = new THREE.Mesh(skyGeo, skyMat);
    skyMesh.position.set(0, 0, -50);
    this.natureGroup.add(skyMesh);

    // Radiant Sun Disk
    const sunGeo = new THREE.CircleGeometry(4.5, 32);
    const sunCanvas = document.createElement('canvas');
    sunCanvas.width = 256;
    sunCanvas.height = 256;
    const sCtx = sunCanvas.getContext('2d');
    const sGrad = sCtx.createRadialGradient(128, 128, 10, 128, 128, 128);
    sGrad.addColorStop(0.0, 'rgba(255, 255, 245, 1.0)');
    sGrad.addColorStop(0.25, 'rgba(254, 240, 138, 0.85)');
    sGrad.addColorStop(0.6, 'rgba(251, 146, 60, 0.35)');
    sGrad.addColorStop(1.0, 'rgba(251, 146, 60, 0.0)');
    sCtx.fillStyle = sGrad;
    sCtx.fillRect(0, 0, 256, 256);

    const sunMat = new THREE.MeshBasicMaterial({
      map: new THREE.CanvasTexture(sunCanvas),
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    const sunMesh = new THREE.Mesh(sunGeo, sunMat);
    sunMesh.position.set(28, 24, -85);
    sunMesh.lookAt(0, 3, -15);
    this.natureGroup.add(sunMesh);

    // Distant Majestic Mountain Ranges
    this.buildDistantMountains();
  }

  buildDistantMountains() {
    if (this.mountainsTex) {
      // High-resolution panoramic alpine mountain backdrop with soaring peaks, waterfall, sunbeams & clouds
      const width = 175;
      const height = 75;
      const panoGeo = new THREE.PlaneGeometry(width, height, 24, 4);
      const pos = panoGeo.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        const x = pos.getX(i);
        pos.setZ(i, -(x * x) * 0.0028);
      }
      panoGeo.computeVertexNormals();

      const panoMat = new THREE.MeshBasicMaterial({
        map: this.mountainsTex,
        side: THREE.DoubleSide,
        depthWrite: false,
        fog: false // Keep crystal clear through scene atmospheric haze
      });
      const panoMesh = new THREE.Mesh(panoGeo, panoMat);
      panoMesh.position.set(0, 24.0, -82.0);
      this.natureGroup.add(panoMesh);
    }
  }

  /* -------------------------------------------------------------
   * 2. REALISTIC TERRAIN & PROCEDURAL GRASS TEXTURE
   * -----------------------------------------------------------*/
  buildRealisticTerrain() {
    const width = 160;
    const depth = 135;
    const segments = 120;
    const geometry = new THREE.PlaneGeometry(width, depth, segments, segments);
    geometry.rotateX(-Math.PI / 2);

    const pos = geometry.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i) - 68; // covers z from -0.5 to -135
      pos.setZ(i, z);
      pos.setY(i, this.getTerrainHeight(x, z));
    }
    geometry.computeVertexNormals();

    const terrainMat = new THREE.MeshStandardMaterial({
      map: this.meadowTex || this.generateRealisticGrassTexture(),
      color: new THREE.Color(0x386a20), // Rich lush emerald grass color matching reference photo
      roughness: 0.85,
      metalness: 0.02
    });

    const terrain = new THREE.Mesh(geometry, terrainMat);
    terrain.receiveShadow = true;
    this.natureGroup.add(terrain);

    // Natural mossy boulders along the riverbank & meadows
    this.buildRiverBoulders();
  }

  generateRealisticGrassTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#2d5e18';
    ctx.fillRect(0, 0, 1024, 1024);
    const tex = new THREE.CanvasTexture(canvas);
    tex.anisotropy = 8;
    return tex;
  }

  buildRiverBoulders() {
    const rockMat = new THREE.MeshStandardMaterial({
      color: 0x383430, // Natural dark slate river boulder
      roughness: 0.88,
      metalness: 0.08
    });

    const wetRockMat = new THREE.MeshStandardMaterial({
      color: 0x22201e, // Dark wet river stone near waterline
      roughness: 0.28, // wet sheen
      metalness: 0.18
    });

    const boulderSpots = [
      // Natural river stones along banks & stepping stones
      { x: -2.8, z: -18.2, s: 0.75, wet: true },
      { x: 2.6, z: -19.5, s: 0.8, wet: true },
      { x: -0.6, z: -23.5, s: 0.7, wet: true },
      { x: -4.5, z: -25.5, s: 1.1, wet: true },
      { x: 4.8, z: -27.5, s: 1.2, wet: true },
      // Midground & bridge flanking rocks
      { x: -7.0, z: -35, s: 1.5, wet: false },
      { x: 7.2, z: -37, s: 1.4, wet: false },
      { x: -4.5, z: -42, s: 1.8, wet: true }, // Flat sleeping rock for Panda 7!
      { x: 6.2, z: -48, s: 1.5, wet: true },
      // Upstream waterfall pool boulders
      { x: -16.0, z: -74, s: 2.8, wet: true },
      { x: -10.0, z: -76, s: 2.4, wet: true },
      { x: -18.5, z: -80, s: 3.0, wet: true },
      // Meadow boulders
      { x: 18.0, z: -36, s: 1.3, wet: false },
      { x: -20.0, z: -30, s: 1.4, wet: false },
      { x: -9.5, z: -15, s: 0.9, wet: false } // Beside stone lantern
    ];

    boulderSpots.forEach(b => {
      const geo = new THREE.DodecahedronGeometry(b.s, 1);
      const mesh = new THREE.Mesh(geo, b.wet ? wetRockMat : rockMat);
      const y = this.getTerrainHeight(b.x, b.z) + b.s * 0.28;
      mesh.position.set(b.x, y, b.z);
      // Flatter, natural river rock aspect ratio
      mesh.scale.set(1.25, 0.45, 1.15);
      mesh.rotation.set(Math.random() * 0.4, Math.random() * Math.PI, Math.random() * 0.4);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      this.natureGroup.add(mesh);
    });
  }

  /* -------------------------------------------------------------
   * 3. FLOWING RIVER
   * -----------------------------------------------------------*/
  buildFlowingRiver() {
    const riverGeo = new THREE.PlaneGeometry(10.5, 78, 28, 64);
    riverGeo.rotateX(-Math.PI / 2);

    const pos = riverGeo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const z = pos.getZ(i) - 49;
      pos.setZ(i, z);
      const riverCenter = Math.sin((z + 18) * 0.052) * 5.8;
      pos.setX(i, pos.getX(i) + riverCenter);
    }
    riverGeo.computeVertexNormals();

    const waterTex = this.generateWaterTexture();
    waterTex.wrapS = THREE.RepeatWrapping;
    waterTex.wrapT = THREE.RepeatWrapping;
    waterTex.repeat.set(3, 16);

    const waterMat = new THREE.MeshStandardMaterial({
      color: 0x1db3ab,
      map: waterTex,
      roughness: 0.08,
      metalness: 0.35,
      transparent: true,
      opacity: 0.86
    });

    this.waterMesh = new THREE.Mesh(riverGeo, waterMat);
    this.waterMesh.position.y = -1.48;
    this.natureGroup.add(this.waterMesh);
  }

  generateWaterTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#105658';
    ctx.fillRect(0, 0, 512, 512);

    for (let i = 0; i < 90; i++) {
      ctx.strokeStyle = `rgba(210, 252, 255, ${0.15 + Math.random() * 0.35})`;
      ctx.lineWidth = 1.5 + Math.random() * 2.0;
      ctx.beginPath();
      let y = Math.random() * 512;
      ctx.moveTo(0, y);
      for (let x = 0; x < 512; x += 22) {
        ctx.quadraticCurveTo(x + 11, y + (Math.random() - 0.5) * 14, x + 22, y);
      }
      ctx.stroke();
    }

    return new THREE.CanvasTexture(canvas);
  }

  /* -------------------------------------------------------------
   * 4. CASCADE WATERFALL WITH BILLOWING MIST PARTICLES
   * -----------------------------------------------------------*/
  buildWaterfall() {
    const cliffGroup = new THREE.Group();
    cliffGroup.position.set(-14, 0, -82);

    const rockMat = new THREE.MeshStandardMaterial({
      color: 0x36322e,
      roughness: 0.95,
      metalness: 0.05
    });

    // 3 Tiered Granite Rock Ledges
    for (let t = 0; t < 3; t++) {
      const tierGeo = new THREE.BoxGeometry(22 - t * 3.5, 6, 11);
      const tier = new THREE.Mesh(tierGeo, rockMat);
      tier.position.set(0, t * 5.2 + 2.5, -t * 2.8);
      tier.castShadow = true;
      tier.receiveShadow = true;
      cliffGroup.add(tier);
    }

    // Cascading Rushing Water Curtain
    const fallGeo = new THREE.PlaneGeometry(9.5, 17, 18, 30);
    const fallTex = this.generateWaterfallTexture();
    fallTex.wrapS = THREE.RepeatWrapping;
    fallTex.wrapT = THREE.RepeatWrapping;
    fallTex.repeat.set(1, 3);

    const fallMat = new THREE.MeshStandardMaterial({
      color: 0xe0f7fa,
      map: fallTex,
      roughness: 0.1,
      metalness: 0.2,
      transparent: true,
      opacity: 0.92
    });

    this.waterfallMesh = new THREE.Mesh(fallGeo, fallMat);
    this.waterfallMesh.position.set(0, 9.2, 1.5);
    this.waterfallMesh.rotation.x = 0.15;
    cliffGroup.add(this.waterfallMesh);

    // Billowing Soft Mist Particles
    const mistCount = 220;
    const mistGeo = new THREE.BufferGeometry();
    const mistPos = new Float32Array(mistCount * 3);

    for (let i = 0; i < mistCount; i++) {
      mistPos[i * 3] = (Math.random() - 0.5) * 14;
      mistPos[i * 3 + 1] = Math.random() * 5.5;
      mistPos[i * 3 + 2] = (Math.random() - 0.5) * 9 + 3.0;
    }

    mistGeo.setAttribute('position', new THREE.BufferAttribute(mistPos, 3));

    const mistCanvas = document.createElement('canvas');
    mistCanvas.width = 64;
    mistCanvas.height = 64;
    const mCtx = mistCanvas.getContext('2d');
    const grad = mCtx.createRadialGradient(32, 32, 2, 32, 32, 30);
    grad.addColorStop(0, 'rgba(255, 255, 255, 0.85)');
    grad.addColorStop(0.5, 'rgba(235, 250, 255, 0.4)');
    grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
    mCtx.fillStyle = grad;
    mCtx.beginPath();
    mCtx.arc(32, 32, 30, 0, Math.PI * 2);
    mCtx.fill();

    const mistMat = new THREE.PointsMaterial({
      size: 4.2,
      map: new THREE.CanvasTexture(mistCanvas),
      transparent: true,
      opacity: 0.65,
      depthWrite: false,
      blending: THREE.NormalBlending
    });

    this.mistParticles = new THREE.Points(mistGeo, mistMat);
    cliffGroup.add(this.mistParticles);

    this.natureGroup.add(cliffGroup);
  }

  generateWaterfallTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#6ad9cc';
    ctx.fillRect(0, 0, 256, 512);

    for (let i = 0; i < 280; i++) {
      ctx.strokeStyle = `rgba(255, 255, 255, ${0.45 + Math.random() * 0.55})`;
      ctx.lineWidth = 1 + Math.random() * 4.0;
      const x = Math.random() * 256;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x + (Math.random() - 0.5) * 10, 512);
      ctx.stroke();
    }

    return new THREE.CanvasTexture(canvas);
  }

  /* -------------------------------------------------------------
   * 5. ARCHED TIMBER BRIDGE WITH GLOWING POST LANTERNS
   * -----------------------------------------------------------*/
  buildWoodenBridge() {
    const bridgeGroup = new THREE.Group();
    const riverX = Math.sin((-38 + 18) * 0.052) * 5.8;
    bridgeGroup.position.set(riverX, -0.55, -38);

    const woodMat = new THREE.MeshStandardMaterial({
      map: this.timberTex,
      color: 0x6e4a2e,
      roughness: 0.85,
      metalness: 0.05
    });

    const bridgeSpan = 14.5;
    const plankCount = 28;
    const bridgeWidth = 3.8;

    for (let i = 0; i < plankCount; i++) {
      const t = i / (plankCount - 1);
      const x = (t - 0.5) * bridgeSpan;
      const y = Math.sin(t * Math.PI) * 1.6;

      const plankGeo = new THREE.BoxGeometry(0.46, 0.15, bridgeWidth);
      const plank = new THREE.Mesh(plankGeo, woodMat);
      plank.position.set(x, y, 0);
      plank.rotation.z = -Math.cos(t * Math.PI) * 0.22;
      plank.castShadow = true;
      plank.receiveShadow = true;
      bridgeGroup.add(plank);

      if (i % 4 === 0) {
        [-bridgeWidth / 2 + 0.12, bridgeWidth / 2 - 0.12].forEach(z => {
          const postGeo = new THREE.BoxGeometry(0.15, 1.35, 0.15);
          const post = new THREE.Mesh(postGeo, woodMat);
          post.position.set(x, y + 0.65, z);
          post.castShadow = true;
          bridgeGroup.add(post);

          if (i === 4 || i === 24) {
            const lanternMesh = this.createBridgePostLantern();
            lanternMesh.position.set(x, y + 1.4, z);
            bridgeGroup.add(lanternMesh);
          }
        });
      }
    }

    [-bridgeWidth / 2 + 0.12, bridgeWidth / 2 - 0.12].forEach(z => {
      const railGeo = new THREE.CylinderGeometry(0.09, 0.09, bridgeSpan + 0.6, 8);
      const rail = new THREE.Mesh(railGeo, woodMat);
      rail.rotation.z = Math.PI / 2;
      rail.position.set(0, 1.8, z);
      rail.castShadow = true;
      bridgeGroup.add(rail);
    });

    const stoneMat = new THREE.MeshStandardMaterial({
      color: 0x6e6b66,
      roughness: 0.9,
      metalness: 0.1
    });

    [-bridgeSpan / 2 - 0.6, bridgeSpan / 2 + 0.6].forEach(x => {
      const pierGeo = new THREE.BoxGeometry(1.8, 2.8, bridgeWidth + 1.0);
      const pier = new THREE.Mesh(pierGeo, stoneMat);
      pier.position.set(x, -0.65, 0);
      pier.castShadow = true;
      pier.receiveShadow = true;
      bridgeGroup.add(pier);
    });

    const bridgeLight = new THREE.PointLight(0xffa834, 1.6, 12);
    bridgeLight.position.set(0, 2.5, 0);
    bridgeGroup.add(bridgeLight);
    this.lanternLights.push(bridgeLight);

    this.natureGroup.add(bridgeGroup);
  }

  createBridgePostLantern() {
    const lGroup = new THREE.Group();
    const woodMat = new THREE.MeshStandardMaterial({ color: 0x3d2716, roughness: 0.9 });
    const glowMat = new THREE.MeshBasicMaterial({ color: 0xffd277 });

    const frameGeo = new THREE.BoxGeometry(0.3, 0.42, 0.3);
    const frame = new THREE.Mesh(frameGeo, woodMat);
    lGroup.add(frame);

    const coreGeo = new THREE.BoxGeometry(0.22, 0.32, 0.22);
    const core = new THREE.Mesh(coreGeo, glowMat);
    lGroup.add(core);

    const roofGeo = new THREE.ConeGeometry(0.28, 0.2, 4);
    const roof = new THREE.Mesh(roofGeo, woodMat);
    roof.position.y = 0.3;
    roof.rotation.y = Math.PI / 4;
    lGroup.add(roof);

    return lGroup;
  }

  /* -------------------------------------------------------------
   * 6. RUSTIC WOODLAND LOG COTTAGE
   * -----------------------------------------------------------*/
  buildForestCottage() {
    const cottageGroup = new THREE.Group();
    const cX = 26.0;
    const cZ = -48.0;
    const cY = this.getTerrainHeight(cX, cZ);
    cottageGroup.position.set(cX, cY, cZ);

    const logMat = new THREE.MeshStandardMaterial({
      map: this.timberTex,
      color: 0x5a3e26,
      roughness: 0.88,
      metalness: 0.05
    });

    const roofMat = new THREE.MeshStandardMaterial({
      map: this.timberTex,
      color: 0x3a281c,
      roughness: 0.85
    });

    const stoneMat = new THREE.MeshStandardMaterial({
      color: 0x635e58,
      roughness: 0.92
    });

    const windowGlowMat = new THREE.MeshBasicMaterial({ color: 0xffcf68 });

    const cabinGeo = new THREE.BoxGeometry(7.2, 4.2, 6.0);
    const cabin = new THREE.Mesh(cabinGeo, logMat);
    cabin.position.y = 2.1;
    cabin.castShadow = true;
    cabin.receiveShadow = true;
    cottageGroup.add(cabin);

    const roofGeo = new THREE.ConeGeometry(5.8, 3.2, 4);
    roofGeo.rotateY(Math.PI / 4);
    roofGeo.scale(1.1, 1.0, 0.95);
    const roof = new THREE.Mesh(roofGeo, roofMat);
    roof.position.y = 5.8;
    roof.castShadow = true;
    cottageGroup.add(roof);

    const porchGeo = new THREE.BoxGeometry(6.4, 0.3, 2.2);
    const porch = new THREE.Mesh(porchGeo, logMat);
    porch.position.set(0, 0.25, 3.6);
    porch.castShadow = true;
    cottageGroup.add(porch);

    const chimneyGeo = new THREE.BoxGeometry(1.2, 7.5, 1.2);
    const chimney = new THREE.Mesh(chimneyGeo, stoneMat);
    chimney.position.set(2.6, 4.2, -1.8);
    chimney.castShadow = true;
    cottageGroup.add(chimney);

    const winGeo = new THREE.PlaneGeometry(1.1, 1.3);
    const win1 = new THREE.Mesh(winGeo, windowGlowMat);
    win1.position.set(-1.8, 2.2, 3.02);
    cottageGroup.add(win1);

    const win2 = new THREE.Mesh(winGeo, windowGlowMat);
    win2.position.set(1.8, 2.2, 3.02);
    cottageGroup.add(win2);

    const cottageLight = new THREE.PointLight(0xffa834, 2.2, 14);
    cottageLight.position.set(0, 2.5, 2.8);
    cottageGroup.add(cottageLight);
    this.lanternLights.push(cottageLight);

    for (let p = 0; p < 8; p++) {
      const stepGeo = new THREE.CylinderGeometry(0.55 + Math.random() * 0.2, 0.65, 0.12, 7);
      const step = new THREE.Mesh(stepGeo, stoneMat);
      step.position.set(-p * 1.5, 0.1 - p * 0.15, 4.5 + p * 1.6);
      step.receiveShadow = true;
      cottageGroup.add(step);
    }

    this.natureGroup.add(cottageGroup);
  }

  /* -------------------------------------------------------------
   * 7. RUSTIC WOODEN SIGNPOST
   * "Nature is where your happiness lives... - Panda 💖"
   * -----------------------------------------------------------*/
  buildSignpost() {
    const signGroup = new THREE.Group();
    const sX = -7.8;
    const sZ = -16.0;
    const sY = this.getTerrainHeight(sX, sZ);
    signGroup.position.set(sX, sY, sZ);
    signGroup.rotation.y = 0.25;

    const woodMat = new THREE.MeshStandardMaterial({
      map: this.timberTex,
      color: 0x5a3e26,
      roughness: 0.9,
      metalness: 0.05
    });

    const postGeo = new THREE.CylinderGeometry(0.12, 0.15, 2.5, 8);
    const post = new THREE.Mesh(postGeo, woodMat);
    post.position.y = 1.25;
    post.castShadow = true;
    signGroup.add(post);

    const boardCanvas = document.createElement('canvas');
    boardCanvas.width = 512;
    boardCanvas.height = 340;
    const bCtx = boardCanvas.getContext('2d');

    bCtx.fillStyle = '#3e2716';
    bCtx.fillRect(0, 0, 512, 340);

    for (let i = 0; i < 40; i++) {
      bCtx.strokeStyle = `rgba(20, 10, 4, ${0.25 + Math.random() * 0.35})`;
      bCtx.lineWidth = 1 + Math.random() * 3.5;
      const y = Math.random() * 340;
      bCtx.beginPath();
      bCtx.moveTo(0, y);
      bCtx.lineTo(512, y + (Math.random() - 0.5) * 8);
      bCtx.stroke();
    }

    bCtx.strokeStyle = '#22140a';
    bCtx.lineWidth = 8;
    bCtx.strokeRect(10, 10, 492, 320);

    bCtx.fillStyle = '#fff0d4';
    bCtx.font = 'bold 36px "Cinzel", "Georgia", serif';
    bCtx.textAlign = 'center';
    bCtx.fillText('Nature is', 256, 75);
    bCtx.fillText('where your', 256, 125);
    bCtx.fillText('happiness lives...', 256, 175);

    bCtx.fillStyle = '#fbcfe8';
    bCtx.font = 'italic 30px "Cinzel Decorative", cursive';
    bCtx.fillText('- Panda 💖', 256, 255);

    const boardTex = new THREE.CanvasTexture(boardCanvas);
    const boardGeo = new THREE.BoxGeometry(2.4, 1.5, 0.14);
    const boardMat = new THREE.MeshStandardMaterial({
      map: boardTex,
      roughness: 0.82,
      metalness: 0.05
    });

    const board = new THREE.Mesh(boardGeo, boardMat);
    board.position.set(0, 1.85, 0.08);
    board.castShadow = true;
    signGroup.add(board);

    this.natureGroup.add(signGroup);
  }

  /* -------------------------------------------------------------
   * 8. TRADITIONAL JAPANESE STONE PAGODA GARDEN LANTERN (TŌRŌ)
   * -----------------------------------------------------------*/
  buildStoneLantern() {
    const lanternGroup = new THREE.Group();
    const lX = -8.8;
    const lZ = -14.8;
    const lY = this.getTerrainHeight(lX, lZ);
    lanternGroup.position.set(lX, lY, lZ);

    const stoneMat = new THREE.MeshStandardMaterial({
      color: 0x5a5651,
      roughness: 0.92,
      metalness: 0.08
    });

    const flameGlowMat = new THREE.MeshBasicMaterial({ color: 0xffb74d });

    const baseGeo = new THREE.CylinderGeometry(0.55, 0.65, 0.35, 6);
    const base = new THREE.Mesh(baseGeo, stoneMat);
    base.position.y = 0.18;
    base.castShadow = true;
    base.receiveShadow = true;
    lanternGroup.add(base);

    const pillarGeo = new THREE.CylinderGeometry(0.24, 0.3, 0.7, 6);
    const pillar = new THREE.Mesh(pillarGeo, stoneMat);
    pillar.position.y = 0.7;
    pillar.castShadow = true;
    lanternGroup.add(pillar);

    const midGeo = new THREE.CylinderGeometry(0.58, 0.45, 0.22, 6);
    const mid = new THREE.Mesh(midGeo, stoneMat);
    mid.position.y = 1.15;
    mid.castShadow = true;
    lanternGroup.add(mid);

    const coreGeo = new THREE.CylinderGeometry(0.24, 0.24, 0.5, 6);
    const core = new THREE.Mesh(coreGeo, flameGlowMat);
    core.position.y = 1.5;
    lanternGroup.add(core);

    for (let p = 0; p < 6; p++) {
      const postGeo = new THREE.BoxGeometry(0.08, 0.5, 0.08);
      const post = new THREE.Mesh(postGeo, stoneMat);
      const angle = (p / 6) * Math.PI * 2;
      post.position.set(Math.cos(angle) * 0.38, 1.5, Math.sin(angle) * 0.38);
      post.castShadow = true;
      lanternGroup.add(post);
    }

    const roofGeo = new THREE.ConeGeometry(0.85, 0.42, 6);
    const roof = new THREE.Mesh(roofGeo, stoneMat);
    roof.position.y = 1.95;
    roof.castShadow = true;
    lanternGroup.add(roof);

    const finialGeo = new THREE.SphereGeometry(0.12, 8, 8);
    const finial = new THREE.Mesh(finialGeo, stoneMat);
    finial.position.y = 2.22;
    lanternGroup.add(finial);

    const lanternLight = new THREE.PointLight(0xff9933, 2.5, 9.5);
    lanternLight.position.set(0, 1.5, 0);
    lanternLight.castShadow = true;
    lanternGroup.add(lanternLight);
    this.lanternLights.push(lanternLight);

    this.natureGroup.add(lanternGroup);
  }

  /* -------------------------------------------------------------
   * 9. DEDICATED BAMBOO SANCTUARY GROVE
   * -----------------------------------------------------------*/
  buildBambooGrove() {
    const bambooGroup = new THREE.Group();

    const stalkCoords = [
      { x: -13.5, z: -28 }, { x: -15.0, z: -30 }, { x: -16.5, z: -27 },
      { x: -14.2, z: -33 }, { x: -17.5, z: -34 }, { x: -19.0, z: -31 },
      { x: -15.8, z: -37 }, { x: -18.2, z: -39 }, { x: -21.0, z: -36 },
      { x: -13.0, z: -41 }, { x: -16.0, z: -43 }, { x: -19.5, z: -45 }
    ];

    stalkCoords.forEach((bc, idx) => {
      const bY = this.getTerrainHeight(bc.x, bc.z);
      const stalk = this.createBambooStalk(4.5 + (idx % 4) * 0.8);
      stalk.position.set(bc.x, bY, bc.z);
      stalk.rotation.y = Math.random() * Math.PI;
      bambooGroup.add(stalk);
      this.bambooNodes.push(stalk);
    });

    this.natureGroup.add(bambooGroup);
  }

  createBambooStalk(height) {
    const stalkGroup = new THREE.Group();

    const bambooMat = new THREE.MeshStandardMaterial({
      color: 0x5a9a32,
      roughness: 0.65,
      metalness: 0.08
    });

    const nodeMat = new THREE.MeshStandardMaterial({
      color: 0x82b545,
      roughness: 0.7
    });

    const leafMat = new THREE.MeshStandardMaterial({
      color: 0x4f8e28,
      roughness: 0.5,
      side: THREE.DoubleSide
    });

    const segments = Math.floor(height / 0.85);
    for (let s = 0; s < segments; s++) {
      const segGeo = new THREE.CylinderGeometry(0.12 - s * 0.008, 0.13 - s * 0.008, 0.8, 8);
      const seg = new THREE.Mesh(segGeo, bambooMat);
      seg.position.y = s * 0.85 + 0.4;
      seg.castShadow = true;
      stalkGroup.add(seg);

      const ringGeo = new THREE.TorusGeometry(0.14 - s * 0.008, 0.025, 6, 12);
      ringGeo.rotateX(Math.PI / 2);
      const ring = new THREE.Mesh(ringGeo, nodeMat);
      ring.position.y = s * 0.85 + 0.8;
      stalkGroup.add(ring);

      if (s >= 2) {
        for (let l = 0; l < 3; l++) {
          const leafGeo = new THREE.PlaneGeometry(0.24, 0.85);
          const leaf = new THREE.Mesh(leafGeo, leafMat);
          const angle = (l / 3) * Math.PI * 2 + s;
          leaf.position.set(Math.cos(angle) * 0.28, s * 0.85 + 0.8, Math.sin(angle) * 0.28);
          leaf.rotation.set(0.65, angle, 0.45);
          leaf.castShadow = true;
          stalkGroup.add(leaf);
        }
      }
    }

    return stalkGroup;
  }

  /* -------------------------------------------------------------
   * 10. CHERRY BLOSSOM TREES & DRIFTING SAKURA PETALS
   * -----------------------------------------------------------*/
  buildCherryTrees() {
    // 1. Foreground Cherry Tree Arch
    const foreTree = this.createPhotorealisticCherryTree(1.85, true);
    const ftX = -12.5;
    const ftZ = -17.0;
    foreTree.position.set(ftX, this.getTerrainHeight(ftX, ftZ), ftZ);
    this.natureGroup.add(foreTree);
    this.trees.push(foreTree);

    // 2. Cherry blossom trees framing the valley & cottage
    const treeSpots = [
      { x: 16, z: -24, s: 1.4 },
      { x: -22, z: -44, s: 1.6 },
      { x: 23, z: -42, s: 1.5 },
      { x: 31, z: -52, s: 1.7 },
      { x: -25, z: -64, s: 1.4 },
      { x: 18, z: -72, s: 1.6 },
      { x: -24, z: -78, s: 1.8 }
    ];

    treeSpots.forEach(ts => {
      const y = this.getTerrainHeight(ts.x, ts.z);
      const tree = this.createPhotorealisticCherryTree(ts.s, false);
      tree.position.set(ts.x, y, ts.z);
      this.natureGroup.add(tree);
      this.trees.push(tree);
    });

    // 3. Drifting Sakura Petals Particle System
    this.buildDriftingPetals();
  }

  createPhotorealisticCherryTree(scale, isForeground) {
    const treeGroup = new THREE.Group();
    treeGroup.scale.set(scale, scale, scale);

    const trunkMat = new THREE.MeshStandardMaterial({
      map: this.timberTex,
      color: 0x322216,
      roughness: 0.92,
      metalness: 0.04
    });

    // 1. Organic Tapered & Curved Trunk
    const trunkLowerGeo = new THREE.CylinderGeometry(0.52, 0.9, 3.2, 10);
    const trunkLower = new THREE.Mesh(trunkLowerGeo, trunkMat);
    trunkLower.position.y = 1.6;
    trunkLower.rotation.z = -0.08;
    trunkLower.castShadow = true;
    trunkLower.receiveShadow = true;
    treeGroup.add(trunkLower);

    const trunkUpperGeo = new THREE.CylinderGeometry(0.35, 0.54, 2.8, 10);
    const trunkUpper = new THREE.Mesh(trunkUpperGeo, trunkMat);
    trunkUpper.position.set(0.2, 4.0, 0.1);
    trunkUpper.rotation.set(0.12, 0, 0.15);
    trunkUpper.castShadow = true;
    treeGroup.add(trunkUpper);

    // Natural curved limbs spreading outwards
    const branchConfigs = [
      { x: 1.2, y: 4.8, z: 0.8, rx: 0.35, rz: 0.65, s: 3.2, r: 0.22 },
      { x: -1.1, y: 4.5, z: -0.6, rx: -0.25, rz: -0.6, s: 2.9, r: 0.2 },
      { x: 0.2, y: 5.2, z: 1.4, rx: 0.65, rz: 0.15, s: 3.0, r: 0.2 },
      { x: 0.6, y: 5.4, z: -1.2, rx: -0.55, rz: 0.35, s: 2.8, r: 0.18 },
      { x: -0.8, y: 5.6, z: 0.9, rx: 0.45, rz: -0.45, s: 2.6, r: 0.16 },
      { x: 0.9, y: 5.8, z: -0.5, rx: -0.3, rz: 0.5, s: 2.5, r: 0.16 }
    ];

    branchConfigs.forEach(bc => {
      const branchGeo = new THREE.CylinderGeometry(bc.r * 0.7, bc.r, bc.s, 8);
      const branch = new THREE.Mesh(branchGeo, trunkMat);
      branch.position.set(bc.x, bc.y, bc.z);
      branch.rotation.set(bc.rx, 0, bc.rz);
      branch.castShadow = true;
      treeGroup.add(branch);
    });

    // Puffy Pink Blossom Clouds covering the branches
    const cloudMat = new THREE.MeshStandardMaterial({
      color: 0xfbcfe8,
      roughness: 0.85,
      transparent: true,
      opacity: 0.75
    });

    // Layer 1: Volumetric soft blossom puffy base spheres
    const cloudSpots = [
      { x: 1.4, y: 5.8, z: 0.8, r: 1.8 },
      { x: -1.2, y: 5.5, z: -0.6, r: 1.7 },
      { x: 0.3, y: 6.2, z: 1.3, r: 1.9 },
      { x: 0.7, y: 6.4, z: -1.1, r: 1.75 },
      { x: 0.0, y: 6.8, z: 0.0, r: 2.1 }
    ];
    cloudSpots.forEach(cs => {
      const cGeo = new THREE.SphereGeometry(cs.r, 8, 8);
      const cMesh = new THREE.Mesh(cGeo, cloudMat);
      cMesh.position.set(cs.x, cs.y, cs.z);
      cMesh.scale.set(1.1, 0.85, 1.05);
      treeGroup.add(cMesh);
    });

    // Layer 2: Photorealistic Blossom Petal Clusters
    const clusterRadius = 1.6;
    for (let c = 0; c < 12; c++) {
      const angle = (c / 12) * Math.PI * 2;
      const dist = 1.5 + (c % 3) * 0.5;
      const cluster = this.createBlossomCluster(clusterRadius);
      cluster.position.set(
        Math.cos(angle) * dist,
        5.6 + (c % 4) * 0.65,
        Math.sin(angle) * dist
      );
      treeGroup.add(cluster);
    }

    if (isForeground) {
      const bluebird1 = this.createPerchedBluebird();
      bluebird1.position.set(1.5, 4.8, 0.9);
      bluebird1.rotation.set(0, -0.6, 0.1);
      treeGroup.add(bluebird1);

      const bluebird2 = this.createPerchedBluebird();
      bluebird2.position.set(1.9, 5.1, 0.6);
      bluebird2.rotation.set(0, -0.9, -0.1);
      treeGroup.add(bluebird2);
    }

    return treeGroup;
  }

  createBlossomCluster(radius) {
    const cluster = new THREE.Group();

    if (this.blossomTex) {
      const blossomMat = new THREE.MeshStandardMaterial({
        map: this.blossomTex,
        transparent: true,
        alphaTest: 0.08,
        roughness: 0.65,
        side: THREE.DoubleSide
      });

      for (let i = 0; i < 7; i++) {
        const pGeo = new THREE.PlaneGeometry(radius * 1.5, radius * 1.5);
        const p = new THREE.Mesh(pGeo, blossomMat);
        const angle = (i / 7) * Math.PI * 2;
        const elev = ((i % 3) - 1) * 0.45;
        p.position.set(Math.cos(angle) * radius * 0.6, elev * radius, Math.sin(angle) * radius * 0.6);
        p.rotation.set(Math.random() * 0.8, angle + Math.PI / 2, Math.random() * 0.8);
        p.castShadow = true;
        cluster.add(p);
      }
    } else {
      const canopyGeo = new THREE.DodecahedronGeometry(radius, 2);
      const canopyMat = new THREE.MeshStandardMaterial({ color: 0xfbcfe8, roughness: 0.7 });
      const canopy = new THREE.Mesh(canopyGeo, canopyMat);
      cluster.add(canopy);
    }

    return cluster;
  }

  createPerchedBluebird() {
    const bird = new THREE.Group();
    bird.scale.set(0.28, 0.28, 0.28);

    const blueMat = new THREE.MeshStandardMaterial({ color: 0x1d4ed8, roughness: 0.5 });
    const breastMat = new THREE.MeshStandardMaterial({ color: 0xf97316, roughness: 0.6 });
    const darkMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.2 });

    const bodyGeo = new THREE.SphereGeometry(0.35, 10, 8);
    bodyGeo.scale(0.8, 0.9, 1.3);
    const body = new THREE.Mesh(bodyGeo, blueMat);
    bird.add(body);

    const breastGeo = new THREE.SphereGeometry(0.24, 8, 8);
    breastGeo.scale(0.8, 0.9, 0.7);
    const breast = new THREE.Mesh(breastGeo, breastMat);
    breast.position.set(0, -0.06, 0.22);
    bird.add(breast);

    const headGeo = new THREE.SphereGeometry(0.22, 10, 8);
    const head = new THREE.Mesh(headGeo, blueMat);
    head.position.set(0, 0.24, 0.32);
    bird.add(head);

    const beakGeo = new THREE.ConeGeometry(0.06, 0.2, 5);
    beakGeo.rotateX(Math.PI / 2);
    const beak = new THREE.Mesh(beakGeo, darkMat);
    beak.position.set(0, 0.22, 0.56);
    bird.add(beak);

    const tailGeo = new THREE.BoxGeometry(0.12, 0.05, 0.5);
    const tail = new THREE.Mesh(tailGeo, blueMat);
    tail.position.set(0, 0.05, -0.58);
    tail.rotation.x = -0.3;
    bird.add(tail);

    return bird;
  }

  buildForegroundCherryCanopy() {
    const canopyGroup = new THREE.Group();

    const barkMat = new THREE.MeshStandardMaterial({
      map: this.timberTex,
      color: 0x2b1b11,
      roughness: 0.92,
      metalness: 0.04
    });

    // 1. Massive Foreground Left Trunk
    const trunkGeo = new THREE.CylinderGeometry(0.85, 1.25, 9.5, 12);
    const trunk = new THREE.Mesh(trunkGeo, barkMat);
    trunk.position.set(-11.5, 4.0, -15.5);
    trunk.rotation.set(0.12, 0, -0.15);
    trunk.castShadow = true;
    trunk.receiveShadow = true;
    canopyGroup.add(trunk);

    // Sweeping Horizontal Boughs framing the very top of the frame
    const boughConfigs = [
      { x: -9.5, y: 7.2, z: -14.8, rx: 0.15, ry: 0.35, rz: 0.72, len: 5.5, r: 0.35 },
      { x: -6.5, y: 7.8, z: -14.0, rx: 0.1, ry: -0.2, rz: 0.88, len: 4.8, r: 0.28 },
      { x: -3.8, y: 8.2, z: -13.5, rx: -0.12, ry: 0.25, rz: 1.02, len: 4.2, r: 0.22 },
      { x: -1.2, y: 8.4, z: -13.2, rx: -0.15, ry: 0.15, rz: 1.12, len: 3.5, r: 0.18 }
    ];

    boughConfigs.forEach(bc => {
      const bGeo = new THREE.CylinderGeometry(bc.r * 0.75, bc.r, bc.len, 8);
      const bMesh = new THREE.Mesh(bGeo, barkMat);
      bMesh.position.set(bc.x, bc.y, bc.z);
      bMesh.rotation.set(bc.rx, bc.ry, bc.rz);
      bMesh.castShadow = true;
      canopyGroup.add(bMesh);
    });

    // Hanging clusters of vibrant pink blossoms framing the top edge
    const clusterPositions = [
      { x: -9.0, y: 7.5, z: -14.5, s: 1.8 },
      { x: -7.0, y: 7.9, z: -13.8, s: 1.9 },
      { x: -4.8, y: 8.3, z: -13.2, s: 1.8 },
      { x: -2.8, y: 8.5, z: -12.8, s: 1.7 },
      { x: -1.0, y: 8.6, z: -12.5, s: 1.6 },
      { x: -8.0, y: 6.8, z: -14.8, s: 1.6 },
      { x: -5.8, y: 7.1, z: -14.0, s: 1.7 }
    ];

    clusterPositions.forEach(cp => {
      const cluster = this.createBlossomCluster(cp.s);
      cluster.position.set(cp.x, cp.y, cp.z);
      canopyGroup.add(cluster);
    });

    // Perched Cerulean Bluebird in the foreground tree branch
    const bluebird1 = this.createPerchedBluebird();
    bluebird1.position.set(-4.5, 8.1, -13.2);
    bluebird1.rotation.set(0.1, -0.6, 0.05);
    bluebird1.scale.set(1.4, 1.4, 1.4);
    canopyGroup.add(bluebird1);

    // 2. Upper Right Framing Branch
    const rightBoughGeo = new THREE.CylinderGeometry(0.18, 0.28, 4.8, 8);
    const rightBough = new THREE.Mesh(rightBoughGeo, barkMat);
    rightBough.position.set(7.5, 8.2, -14.5);
    rightBough.rotation.set(-0.2, 0.3, -0.85);
    canopyGroup.add(rightBough);

    const rightClusters = [
      { x: 5.5, y: 8.4, z: -13.8, s: 1.7 },
      { x: 7.2, y: 8.5, z: -14.2, s: 1.8 },
      { x: 8.8, y: 8.2, z: -14.8, s: 1.6 }
    ];
    rightClusters.forEach(rc => {
      const cl = this.createBlossomCluster(rc.s);
      cl.position.set(rc.x, rc.y, rc.z);
      canopyGroup.add(cl);
    });

    // Right perched bluebirds
    const bluebird2 = this.createPerchedBluebird();
    bluebird2.position.set(5.8, 8.35, -13.9);
    bluebird2.rotation.set(0, -1.2, 0);
    bluebird2.scale.set(1.3, 1.3, 1.3);
    canopyGroup.add(bluebird2);

    this.natureGroup.add(canopyGroup);
  }

  buildDriftingPetals() {
    const petalCount = 260;
    const petalGeo = new THREE.BufferGeometry();
    const petalPos = new Float32Array(petalCount * 3);

    for (let i = 0; i < petalCount; i++) {
      petalPos[i * 3] = (Math.random() - 0.5) * 55;
      petalPos[i * 3 + 1] = 0.5 + Math.random() * 12;
      petalPos[i * 3 + 2] = -12 - Math.random() * 55;
    }

    petalGeo.setAttribute('position', new THREE.BufferAttribute(petalPos, 3));

    const pCanvas = document.createElement('canvas');
    pCanvas.width = 32;
    pCanvas.height = 32;
    const pCtx = pCanvas.getContext('2d');
    pCtx.fillStyle = '#fbcfe8';
    pCtx.beginPath();
    pCtx.ellipse(16, 16, 14, 8, Math.PI / 4, 0, Math.PI * 2);
    pCtx.fill();

    const petalMat = new THREE.PointsMaterial({
      size: 0.35,
      map: new THREE.CanvasTexture(pCanvas),
      transparent: true,
      opacity: 0.85,
      depthWrite: false
    });

    this.petalParticles = new THREE.Points(petalGeo, petalMat);
    this.natureGroup.add(this.petalParticles);
  }

  /* -------------------------------------------------------------
   * 10B. LARGE CHERRY BLOSSOM TREE & HIDDEN GOLDEN KEY NEAR BRIDGE
   * -----------------------------------------------------------*/
  buildBridgeCherryTreeAndKey() {
    const tX = -8.6;
    const tZ = -35.2;
    const tY = this.getTerrainHeight(tX, tZ);

    // 1. Majestic Large Cherry Blossom Tree
    const tree = this.createPhotorealisticCherryTree(2.05, false);
    tree.position.set(tX, tY, tZ);
    this.natureGroup.add(tree);
    this.trees.push(tree);

    // 2. Visible Gnarled Tree Roots Radiating on the Grassy Bank
    const rootMat = new THREE.MeshStandardMaterial({
      map: this.timberTex,
      color: 0x362316,
      roughness: 0.92,
      metalness: 0.04
    });

    const rootGroup = new THREE.Group();
    rootGroup.position.set(tX, tY, tZ);

    // Primary Prominent Root curving forward toward riverbank beside the key
    const root1Curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0.45, 0),
      new THREE.Vector3(0.5, 0.24, 0.5),
      new THREE.Vector3(1.05, 0.14, 1.05),
      new THREE.Vector3(1.65, 0.05, 1.65),
      new THREE.Vector3(2.1, -0.05, 2.0)
    ]);
    const root1Geo = new THREE.TubeGeometry(root1Curve, 16, 0.24, 8, false);
    const root1Mesh = new THREE.Mesh(root1Geo, rootMat);
    root1Mesh.castShadow = true;
    root1Mesh.receiveShadow = true;
    rootGroup.add(root1Mesh);

    // Secondary Root branching to the left
    const root2Curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0.35, 0),
      new THREE.Vector3(-0.4, 0.12, 0.4),
      new THREE.Vector3(-0.9, 0.05, 0.7),
      new THREE.Vector3(-1.3, -0.04, 0.9)
    ]);
    const root2Geo = new THREE.TubeGeometry(root2Curve, 12, 0.18, 8, false);
    const root2Mesh = new THREE.Mesh(root2Geo, rootMat);
    root2Mesh.castShadow = true;
    root2Mesh.receiveShadow = true;
    rootGroup.add(root2Mesh);

    // Tertiary Root reaching toward bridge approach
    const root3Curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0.38, 0),
      new THREE.Vector3(0.5, 0.14, -0.5),
      new THREE.Vector3(1.1, 0.05, -0.8),
      new THREE.Vector3(1.6, -0.03, -1.0)
    ]);
    const root3Geo = new THREE.TubeGeometry(root3Curve, 12, 0.16, 8, false);
    const root3Mesh = new THREE.Mesh(root3Geo, rootMat);
    root3Mesh.castShadow = true;
    root3Mesh.receiveShadow = true;
    rootGroup.add(root3Mesh);

    this.natureGroup.add(rootGroup);

    // 3. Bed of Soft Green Moss & Fallen Cherry Blossom Petals Beside Root
    const kX = tX + 1.25;
    const kZ = tZ + 1.35;
    const kY = this.getTerrainHeight(kX, kZ) + 0.16;

    const mossMat = new THREE.MeshStandardMaterial({
      color: 0x366820,
      roughness: 0.95,
      metalness: 0.02
    });
    const mossGeo = new THREE.SphereGeometry(0.58, 8, 6);
    mossGeo.scale(1.2, 0.25, 0.85);
    const mossMesh = new THREE.Mesh(mossGeo, mossMat);
    mossMesh.position.set(kX, kY - 0.06, kZ);
    mossMesh.receiveShadow = true;
    this.natureGroup.add(mossMesh);

    // Scattered Fallen Cherry Blossom Petals on and around the moss/root
    const petalMat = new THREE.MeshStandardMaterial({
      color: 0xfbcfe8,
      roughness: 0.8,
      side: THREE.DoubleSide
    });
    for (let p = 0; p < 18; p++) {
      const pGeo = new THREE.PlaneGeometry(0.1, 0.16);
      const petal = new THREE.Mesh(pGeo, petalMat);
      const angle = Math.random() * Math.PI * 2;
      const dist = 0.2 + Math.random() * 0.7;
      petal.position.set(
        kX + Math.cos(angle) * dist,
        kY - 0.02 + Math.random() * 0.04,
        kZ + Math.sin(angle) * dist
      );
      petal.rotation.set(-Math.PI / 2 + (Math.random() - 0.5) * 0.2, 0, Math.random() * Math.PI);
      this.natureGroup.add(petal);
    }

    // 4. Clue: A Small Golden Butterfly Occasionally Flying Near the Tree
    this.buildGoldenButterflyClue(tX, tY, tZ);

    // 5. The Hidden Magical Golden Key (Spawn only if not already collected)
    if (!this.hasCollectedKey) {
      this.buildGoldenKey(kX, kY, kZ);
    }
  }

  /* -------------------------------------------------------------
   * 10C. REALISTIC MAGICAL GOLDEN KEY (PBR METALLIC, FILIGREE)
   * -----------------------------------------------------------*/
  buildGoldenKey(kX, kY, kZ) {
    this.keyGroup = new THREE.Group();
    this.keyGroup.name = "HiddenGoldenKey";
    this.keyGroup.position.set(kX, kY, kZ);
    // Resting gracefully at an angle beside the visible tree root & moss bed
    this.keyGroup.rotation.set(0.18, 0.55, -0.22);
    this.keyGroup.scale.set(1.15, 1.15, 1.15);

    // Realistic Detailed Metallic Gold PBR Materials
    this.goldKeyMat = new THREE.MeshStandardMaterial({
      color: 0xffd700,
      metalness: 0.92,
      roughness: 0.16,
      emissive: 0x554000,
      emissiveIntensity: 0.28
    });

    const goldAccentMat = new THREE.MeshStandardMaterial({
      color: 0xffe877,
      metalness: 0.96,
      roughness: 0.10,
      emissive: 0x664a00,
      emissiveIntensity: 0.35
    });

    // 1. Ornate Bow (Handle) - Elegant Fantasy Filigree Design
    const bowOuterGeo = new THREE.TorusGeometry(0.24, 0.045, 16, 32);
    const bowOuter = new THREE.Mesh(bowOuterGeo, this.goldKeyMat);
    bowOuter.castShadow = true;
    this.keyGroup.add(bowOuter);

    // Inner Filigree Interlocking Rings
    const loopGeo = new THREE.TorusGeometry(0.08, 0.02, 12, 24);
    for (let i = 0; i < 3; i++) {
      const loop = new THREE.Mesh(loopGeo, goldAccentMat);
      const ang = (i / 3) * Math.PI * 2;
      loop.position.set(Math.cos(ang) * 0.1, Math.sin(ang) * 0.1, 0);
      this.keyGroup.add(loop);
    }

    // Central Cabochon Flower Stud
    const cabochonGeo = new THREE.SphereGeometry(0.045, 12, 12);
    const cabochon = new THREE.Mesh(cabochonGeo, goldAccentMat);
    this.keyGroup.add(cabochon);

    // Top Crest / Crown of the Bow
    const crestGeo = new THREE.TorusGeometry(0.06, 0.02, 8, 16, Math.PI);
    const crest = new THREE.Mesh(crestGeo, this.goldKeyMat);
    crest.position.set(0, 0.28, 0);
    this.keyGroup.add(crest);

    // 2. Collar with Decorative Engraved Bead Rings
    const collarGeo = new THREE.CylinderGeometry(0.06, 0.075, 0.1, 16);
    const collar = new THREE.Mesh(collarGeo, this.goldKeyMat);
    collar.position.set(0, -0.28, 0);
    collar.castShadow = true;
    this.keyGroup.add(collar);

    const beadRingGeo = new THREE.TorusGeometry(0.072, 0.016, 8, 20);
    beadRingGeo.rotateX(Math.PI / 2);
    const beadRing = new THREE.Mesh(beadRingGeo, goldAccentMat);
    beadRing.position.set(0, -0.32, 0);
    this.keyGroup.add(beadRing);

    // 3. Stem / Fluted Shaft with Small Magical Engraved Rings
    const shaftGeo = new THREE.CylinderGeometry(0.042, 0.048, 0.72, 16);
    const shaft = new THREE.Mesh(shaftGeo, this.goldKeyMat);
    shaft.position.set(0, -0.72, 0);
    shaft.castShadow = true;
    this.keyGroup.add(shaft);

    // 3 Ornamental Engraved Bands along the Shaft
    [-0.52, -0.72, -0.92].forEach(yPos => {
      const bandGeo = new THREE.CylinderGeometry(0.052, 0.052, 0.035, 16);
      const band = new THREE.Mesh(bandGeo, goldAccentMat);
      band.position.set(0, yPos, 0);
      this.keyGroup.add(band);
    });

    // 4. Bit (Teeth) with Fantasy Key Cutouts
    const bitBaseGeo = new THREE.BoxGeometry(0.04, 0.26, 0.18);
    const bitBase = new THREE.Mesh(bitBaseGeo, this.goldKeyMat);
    bitBase.position.set(0, -0.92, 0.11);
    bitBase.castShadow = true;
    this.keyGroup.add(bitBase);

    // Tooth Step
    const toothGeo = new THREE.BoxGeometry(0.04, 0.08, 0.08);
    const tooth = new THREE.Mesh(toothGeo, goldAccentMat);
    tooth.position.set(0, -0.83, 0.22);
    this.keyGroup.add(tooth);

    // 5. Partial Concealment (~40% concealed by moss clump & sakura petal, ~60% discoverable)
    const concealMossGeo = new THREE.SphereGeometry(0.18, 6, 6);
    concealMossGeo.scale(1.1, 0.35, 0.9);
    const concealMossMat = new THREE.MeshStandardMaterial({
      color: 0x315e1c,
      roughness: 0.95
    });
    const concealMoss = new THREE.Mesh(concealMossGeo, concealMossMat);
    concealMoss.position.set(0.02, -1.02, 0.12);
    this.keyGroup.add(concealMoss);

    const concealPetalGeo = new THREE.PlaneGeometry(0.09, 0.14);
    const concealPetalMat = new THREE.MeshStandardMaterial({
      color: 0xfbcfe8,
      roughness: 0.75,
      side: THREE.DoubleSide
    });
    const concealPetal = new THREE.Mesh(concealPetalGeo, concealPetalMat);
    concealPetal.position.set(0.04, -0.96, 0.15);
    concealPetal.rotation.set(-0.3, 0.2, 0.4);
    this.keyGroup.add(concealPetal);

    // 6. Subtle Golden Glow (PointLight)
    this.keyLight = new THREE.PointLight(0xffd700, 1.2, 8.0);
    this.keyLight.position.set(0, -0.3, 0.2);
    this.keyGroup.add(this.keyLight);

    // 7. Floating Golden Particles (24 sparkling golden dust motes)
    const particleCount = 24;
    const particleGeo = new THREE.BufferGeometry();
    const particlePos = new Float32Array(particleCount * 3);
    for (let p = 0; p < particleCount; p++) {
      particlePos[p * 3] = (Math.random() - 0.5) * 0.9;
      particlePos[p * 3 + 1] = -1.1 + Math.random() * 1.5;
      particlePos[p * 3 + 2] = (Math.random() - 0.5) * 0.9;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePos, 3));

    const pCanvas = document.createElement('canvas');
    pCanvas.width = 32;
    pCanvas.height = 32;
    const pCtx = pCanvas.getContext('2d');
    const pGrad = pCtx.createRadialGradient(16, 16, 1, 16, 16, 15);
    pGrad.addColorStop(0, 'rgba(255, 245, 180, 1)');
    pGrad.addColorStop(0.4, 'rgba(255, 215, 0, 0.8)');
    pGrad.addColorStop(1, 'rgba(255, 215, 0, 0)');
    pCtx.fillStyle = pGrad;
    pCtx.beginPath();
    pCtx.arc(16, 16, 15, 0, Math.PI * 2);
    pCtx.fill();

    const particleMat = new THREE.PointsMaterial({
      size: 0.18,
      map: new THREE.CanvasTexture(pCanvas),
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    this.keySparkles = new THREE.Points(particleGeo, particleMat);
    this.keyGroup.add(this.keySparkles);

    // 8. Hit Box for smooth & forgiving Raycasting
    const hitGeo = new THREE.SphereGeometry(0.75, 8, 8);
    const hitMat = new THREE.MeshBasicMaterial({ visible: false });
    this.keyHitBox = new THREE.Mesh(hitGeo, hitMat);
    this.keyHitBox.name = "KeyHitBox";
    this.keyHitBox.position.set(0, -0.5, 0.05);
    this.keyGroup.add(this.keyHitBox);

    this.natureGroup.add(this.keyGroup);

    // Register all meshes for raycaster intersection
    this.interactiveKeyObjects = [this.keyHitBox, bowOuter, collar, shaft, bitBase];
  }

  /* -------------------------------------------------------------
   * 10D. GOLDEN BUTTERFLY CLUE
   * -----------------------------------------------------------*/
  buildGoldenButterflyClue(tX, tY, tZ) {
    const bfGroup = new THREE.Group();
    const wingMat = new THREE.MeshStandardMaterial({
      color: 0xffd54f,
      roughness: 0.35,
      metalness: 0.65,
      emissive: 0x886600,
      emissiveIntensity: 0.4,
      side: THREE.DoubleSide
    });

    const bodyMat = new THREE.MeshStandardMaterial({
      color: 0x3d2716,
      roughness: 0.7
    });

    const bodyGeo = new THREE.CylinderGeometry(0.018, 0.018, 0.16, 6);
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.rotation.x = Math.PI / 2;
    bfGroup.add(body);

    const wingGeo = new THREE.PlaneGeometry(0.18, 0.22);

    const leftWing = new THREE.Mesh(wingGeo, wingMat);
    leftWing.position.x = -0.09;
    bfGroup.add(leftWing);

    const rightWing = new THREE.Mesh(wingGeo, wingMat);
    rightWing.position.x = 0.09;
    bfGroup.add(rightWing);

    bfGroup.scale.set(1.4, 1.4, 1.4);
    this.natureGroup.add(bfGroup);

    this.goldenButterfly = {
      mesh: bfGroup,
      leftWing: leftWing,
      rightWing: rightWing,
      centerX: tX,
      centerY: tY + 2.0,
      centerZ: tZ,
      angle: 0,
      speed: 0.95,
      flutterFreq: 18.0
    };
  }

  /* -------------------------------------------------------------
   * RAYCASTING HOVER & CLICK INTERACTIONS
   * -----------------------------------------------------------*/
  onPointerMove(event) {
    if (this.hasCollectedKey || !this.keyGroup) return;

    // Ignore if cursor is over interactive UI elements
    if (event.target && event.target.closest && (event.target.closest('#nature-hud-panel') || event.target.closest('.village-modal-card') || event.target.closest('.glass-btn') || event.target.closest('.top-header') || event.target.closest('.bottom-bar'))) {
      if (this.isKeyHovered) {
        this.isKeyHovered = false;
        document.body.style.cursor = 'default';
        this.hideKeyTooltip();
      }
      return;
    }

    this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObjects(this.interactiveKeyObjects, true);

    if (intersects.length > 0) {
      if (!this.isKeyHovered) {
        this.isKeyHovered = true;
        document.body.style.cursor = 'pointer';
        if (this.goldKeyMat) this.goldKeyMat.emissiveIntensity = 0.85;
        if (this.keyLight) this.keyLight.intensity = 3.5;
      }
      this.showKeyTooltip(event.clientX, event.clientY);
    } else {
      if (this.isKeyHovered) {
        this.isKeyHovered = false;
        document.body.style.cursor = 'default';
        if (this.goldKeyMat) this.goldKeyMat.emissiveIntensity = 0.28;
        if (this.keyLight) this.keyLight.intensity = 1.2;
        this.hideKeyTooltip();
      }
    }
  }

  onPointerClick(event) {
    if (this.hasCollectedKey || !this.keyGroup) return;

    if (event.target && event.target.closest && (event.target.closest('#nature-hud-panel') || event.target.closest('.village-modal-card') || event.target.closest('.glass-btn') || event.target.closest('.top-header') || event.target.closest('.bottom-bar'))) {
      return;
    }

    this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObjects(this.interactiveKeyObjects, true);

    if (intersects.length > 0) {
      this.collectGoldenKey();
    }
  }

  collectGoldenKey() {
    if (this.hasCollectedKey) return;
    this.hasCollectedKey = true;

    if (this.stageManager) {
      this.stageManager.collectedKey = true;
    }
    try {
      localStorage.setItem('panda_golden_key', 'true');
    } catch (e) {}

    document.body.style.cursor = 'default';
    this.hideKeyTooltip();

    // 1. Play Gentle Magical Sound
    if (window.audioManager) {
      window.audioManager.playMagicHarp();
      setTimeout(() => {
        if (window.audioManager) window.audioManager.playChime(1.35);
      }, 500);
    }

    // 2. Confetti & Golden Sparkles
    if (window.confetti) {
      window.confetti({
        particleCount: 65,
        spread: 75,
        origin: { y: 0.6 },
        colors: ['#ffd700', '#ffe066', '#ffffff', '#fbcfe8']
      });
    }

    // 3. Realistic 3D Key Collection Animation
    if (this.keyGroup) {
      if (this.keyLight) {
        gsap.to(this.keyLight, { intensity: 5.0, distance: 15, duration: 0.6 });
      }

      gsap.to(this.keyGroup.position, {
        y: "+=2.4",
        duration: 1.4,
        ease: "power2.out"
      });

      gsap.to(this.keyGroup.rotation, {
        y: "+=18.84", // 3 full revolutions
        z: "+=0.6",
        duration: 1.4,
        ease: "power2.inOut"
      });

      gsap.to(this.keyGroup.scale, {
        x: 0.0,
        y: 0.0,
        z: 0.0,
        duration: 0.5,
        delay: 0.9,
        ease: "power2.in",
        onComplete: () => {
          if (this.keyGroup) {
            this.keyGroup.visible = false;
            this.natureGroup.remove(this.keyGroup);
          }
        }
      });
    }

    // 4. Update HUD Inventory
    this.updateInventoryHUD(true);

    // 5. Display Key Found Message Modal
    setTimeout(() => {
      this.showKeyFoundModal();
    }, 750);
  }

  showVillageIntroModal() {
    if (document.getElementById('village-intro-modal')) return;

    const overlay = document.createElement('div');
    overlay.id = 'village-intro-modal';
    overlay.className = 'village-modal-backdrop';
    overlay.innerHTML = `
      <div class="village-modal-card">
        <div class="village-modal-tag">🌸 Panda Village Exploration • Chapter 1</div>
        <h2 class="village-modal-title">Welcome to Panda Village, <span class="glow-pink">Ashitha!</span> 🐼🌸</h2>
        <p class="village-modal-body">
          Hey, Panda! 💖 Your magical birthday adventure begins here! Explore this beautiful village, wander through the magical forest, meet your adorable animal friends and discover the hidden golden key. 🔑 Your special birthday surprises are waiting for you! Find the key to unlock the next magical part of your adventure. Are you ready, Panda? Let's explore! ✨
        </p>
        <div class="village-modal-actions">
          <button id="btn-explore-village" class="btn-primary">
            <span>🌸</span> <span>Explore Panda Village</span>
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    document.getElementById('btn-explore-village').addEventListener('click', () => {
      if (window.audioManager) window.audioManager.playChime(1.2);
      this.hasDismissedVillageIntro = true;
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

  showKeyFoundModal() {
    if (document.getElementById('key-found-modal')) return;

    const overlay = document.createElement('div');
    overlay.id = 'key-found-modal';
    overlay.className = 'village-modal-backdrop';
    overlay.innerHTML = `
      <div class="village-modal-card">
        <div class="village-modal-tag">🔑 Secret Discovered • Item Collected</div>
        <h2 class="village-modal-title">You Found the <span class="glow-gold">Magical Key!</span> 🔑💖</h2>
        <p class="village-modal-body">
          Yay, Panda! 🐼💕 You found the hidden golden key! ✨ Your curiosity has unlocked the next secret of Panda Village. Keep your magical key safe, because a wonderful birthday surprise is waiting to be revealed. 🌸🎁
          <br><br>
          <span style="color: #ffd700; font-size: 13.5px;">✦ Take your key to the ancient stone pedestal near the Timber Bridge to unlock your birthday surprise! 🏛️✨</span>
        </p>
        <div class="village-modal-actions">
          <button id="btn-keep-exploring" class="btn-primary">
            <span>✨</span> <span>Go to Magical Pedestal 🏛️</span>
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    document.getElementById('btn-keep-exploring').addEventListener('click', () => {
      if (window.audioManager) window.audioManager.playChime(1.1);
      gsap.to(overlay, {
        opacity: 0,
        duration: 0.5,
        ease: "power2.inOut",
        onComplete: () => {
          overlay.remove();
          this.switchViewpoint('pedestal');
        }
      });
    });
  }

  showKeyTooltip(clientX, clientY) {
    if (!this.tooltipElem) {
      this.tooltipElem = document.createElement('div');
      this.tooltipElem.className = 'key-tooltip';
      this.tooltipElem.innerText = 'A mysterious golden key... 🔑';
      document.body.appendChild(this.tooltipElem);
    }
    this.tooltipElem.style.display = 'block';
    this.tooltipElem.style.left = (clientX + 16) + 'px';
    this.tooltipElem.style.top = (clientY - 38) + 'px';
  }

  hideKeyTooltip() {
    if (this.tooltipElem) {
      this.tooltipElem.style.display = 'none';
    }
  }

  updateInventoryHUD(hasKey = null) {
    if (hasKey === null) hasKey = this.hasCollectedKey;
    const slot = document.getElementById('inventory-slot');
    if (!slot) return;

    if (hasKey) {
      slot.innerHTML = `
        <div class="inventory-badge active" title="Magical Golden Key found in Panda Village">
          <span class="badge-icon">🔑</span>
          <span class="badge-text">Golden Key Collected</span>
        </div>
      `;
    } else {
      slot.innerHTML = '';
    }
  }

  cleanup() {
    window.removeEventListener('pointermove', this.onPointerMove);
    window.removeEventListener('click', this.onPointerClick);
    this.hideKeyTooltip();
    const intro = document.getElementById('village-intro-modal');
    if (intro) intro.remove();
    const found = document.getElementById('key-found-modal');
    if (found) found.remove();
    if (this.giftReveal && typeof this.giftReveal.cleanup === 'function') {
      this.giftReveal.cleanup();
    }
  }

  /* -------------------------------------------------------------
   * 11. WILDFLOWER MEADOWS (Daisies, Cosmos, Lavender)
   * -----------------------------------------------------------*/
  buildMeadowFlora() {
    const flowerGroup = new THREE.Group();

    const daisyPetalGeo = new THREE.CylinderGeometry(0.18, 0.18, 0.04, 10);
    const daisyPetalMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.6 });
    const daisyCoreGeo = new THREE.SphereGeometry(0.09, 8, 8);
    const daisyCoreMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.4 });
    const cosmosMat = new THREE.MeshStandardMaterial({ color: 0xf472b6, roughness: 0.5 });
    const lavenderMat = new THREE.MeshStandardMaterial({ color: 0xa855f7, roughness: 0.6 });

    const stemGeo = new THREE.CylinderGeometry(0.015, 0.015, 0.45, 4);
    const stemMat = new THREE.MeshStandardMaterial({ color: 0x3d7a22, roughness: 0.85 });

    for (let i = 0; i < 280; i++) {
      const fX = (Math.random() - 0.5) * 36;
      const fZ = -14 - Math.random() * 42;
      const fY = this.getTerrainHeight(fX, fZ);

      const riverCenter = Math.sin((fZ + 18) * 0.052) * 5.8;
      if (Math.abs(fX - riverCenter) < 4.2) continue;

      const singleFlower = new THREE.Group();
      singleFlower.position.set(fX, fY, fZ);

      const stem = new THREE.Mesh(stemGeo, stemMat);
      stem.position.y = 0.22;
      singleFlower.add(stem);

      const type = i % 3;
      if (type === 0) {
        const petals = new THREE.Mesh(daisyPetalGeo, daisyPetalMat);
        petals.position.y = 0.45;
        singleFlower.add(petals);

        const core = new THREE.Mesh(daisyCoreGeo, daisyCoreMat);
        core.position.y = 0.48;
        singleFlower.add(core);
      } else if (type === 1) {
        const petals = new THREE.Mesh(daisyPetalGeo, cosmosMat);
        petals.position.y = 0.45;
        singleFlower.add(petals);
      } else {
        const spireGeo = new THREE.CylinderGeometry(0.04, 0.08, 0.35, 6);
        const spire = new THREE.Mesh(spireGeo, lavenderMat);
        spire.position.y = 0.48;
        singleFlower.add(spire);
      }

      const s = 0.75 + Math.random() * 0.45;
      singleFlower.scale.set(s, s, s);
      flowerGroup.add(singleFlower);
    }

    this.natureGroup.add(flowerGroup);
  }

  /* -------------------------------------------------------------
   * 12. GIANT PANDAS SANCTUARY (12+ INDIVIDUAL PANDAS)
   * -----------------------------------------------------------*/
  buildPandaSanctuary() {
    // 1. MOTHER PANDA (Foreground Left: Seated, holding bamboo, eating!)
    const motherPanda = this.createAnatomicalPanda({
      scale: 1.45,
      isSeated: true,
      hasBamboo: true,
      isCub: false
    });
    const mX = -4.5;
    const mZ = -17.5;
    const mY = this.getTerrainHeight(mX, mZ);
    motherPanda.position.set(mX, mY, mZ);
    motherPanda.rotation.y = 0.45;
    this.natureGroup.add(motherPanda);

    this.animatedEntities.push({
      type: 'panda_mother',
      mesh: motherPanda,
      head: motherPanda.userData.head,
      eatingArm: motherPanda.userData.rightArm,
      ears: motherPanda.userData.ears,
      bamboo: motherPanda.userData.bambooShoot
    });

    // 2. BABY PANDA CUB (Foreground Left: Leaning against mother panda!)
    const babyCub = this.createAnatomicalPanda({
      scale: 0.82,
      isSeated: true,
      hasBamboo: false,
      isCub: true
    });
    const cX = -3.2;
    const cZ = -17.2;
    const cY = this.getTerrainHeight(cX, cZ);
    babyCub.position.set(cX, cY, cZ);
    babyCub.rotation.y = 0.15;
    this.natureGroup.add(babyCub);

    this.animatedEntities.push({
      type: 'panda_cub',
      mesh: babyCub,
      head: babyCub.userData.head,
      ears: babyCub.userData.ears
    });

    // 3. RIVERBANK PANDA (Seated on grassy bank watching the water)
    const riverPanda = this.createAnatomicalPanda({ scale: 1.35, isSeated: true });
    const rX = 7.5;
    const rZ = -28.0;
    riverPanda.position.set(rX, this.getTerrainHeight(rX, rZ), rZ);
    riverPanda.rotation.y = -Math.PI * 0.75;
    this.natureGroup.add(riverPanda);
    this.animatedEntities.push({ type: 'panda_look', mesh: riverPanda, head: riverPanda.userData.head });

    // 4. BAMBOO GROVE PANDA 1 (Seated inside thicket stripping leaves)
    const grovePanda1 = this.createAnatomicalPanda({ scale: 1.4, isSeated: true, hasBamboo: true });
    const g1X = -15.0;
    const g1Z = -32.0;
    grovePanda1.position.set(g1X, this.getTerrainHeight(g1X, g1Z), g1Z);
    grovePanda1.rotation.y = 0.6;
    this.natureGroup.add(grovePanda1);
    this.animatedEntities.push({ type: 'panda_eat', mesh: grovePanda1, head: grovePanda1.userData.head, arm: grovePanda1.userData.rightArm });

    // 5. BAMBOO GROVE PANDA 2 (Standing on hind legs reaching for bamboo)
    const grovePanda2 = this.createAnatomicalPanda({ scale: 1.35, isStanding: true });
    const g2X = -18.0;
    const g2Z = -36.0;
    grovePanda2.position.set(g2X, this.getTerrainHeight(g2X, g2Z), g2Z);
    grovePanda2.rotation.y = 1.1;
    this.natureGroup.add(grovePanda2);

    // 6. HILLSIDE RECLINING PANDA (Lounging lazily on sunlit slope)
    const hillPanda = this.createAnatomicalPanda({ scale: 1.4, isReclining: true });
    const hX = -22.0;
    const hZ = -48.0;
    hillPanda.position.set(hX, this.getTerrainHeight(hX, hZ), hZ);
    hillPanda.rotation.set(0.2, 0.8, -0.3);
    this.natureGroup.add(hillPanda);

    // 7. SNOOZING BOULDER PANDA (Curled up sleeping on river boulder)
    const sleepPanda = this.createAnatomicalPanda({ scale: 1.3, isCurled: true });
    const bX = -4.5;
    const bZ = -42.0;
    sleepPanda.position.set(bX, this.getTerrainHeight(bX, bZ) + 1.2, bZ);
    sleepPanda.rotation.y = -0.4;
    this.natureGroup.add(sleepPanda);
    this.animatedEntities.push({ type: 'panda_sleep', mesh: sleepPanda });

    // 8. BRIDGE WALKER PANDA (Walking along path towards bridge on all 4s)
    const walkPanda = this.createAnatomicalPanda({ scale: 1.35, isWalking: true });
    const wX = 4.0;
    const wZ = -36.0;
    walkPanda.position.set(wX, this.getTerrainHeight(wX, wZ), wZ);
    walkPanda.rotation.y = -Math.PI * 0.45;
    this.natureGroup.add(walkPanda);
    this.animatedEntities.push({
      type: 'panda_walk',
      mesh: walkPanda,
      fl: walkPanda.userData.frontLeft,
      fr: walkPanda.userData.frontRight,
      bl: walkPanda.userData.backLeft,
      br: walkPanda.userData.backRight
    });

    // 9. COTTAGE FLOWERBED PANDA (Sitting near cottage path sniffing flowers)
    const cottagePanda = this.createAnatomicalPanda({ scale: 1.35, isSeated: true });
    const cpX = 22.0;
    const cpZ = -42.0;
    cottagePanda.position.set(cpX, this.getTerrainHeight(cpX, cpZ), cpZ);
    cottagePanda.rotation.y = -1.2;
    this.natureGroup.add(cottagePanda);
    this.animatedEntities.push({ type: 'panda_sniff', mesh: cottagePanda, head: cottagePanda.userData.head });

    // 10. ROLLING PLAYFUL CUB (Lying on back kicking paws in the grass)
    const rollCub = this.createAnatomicalPanda({ scale: 0.85, isRolling: true, isCub: true });
    const rcX = 14.0;
    const rcZ = -34.0;
    rollCub.position.set(rcX, this.getTerrainHeight(rcX, rcZ) + 0.45, rcZ);
    rollCub.rotation.x = Math.PI;
    this.natureGroup.add(rollCub);
    this.animatedEntities.push({ type: 'panda_roll', mesh: rollCub });

    // 11. WATERFALL BASIN PANDA (Distant explorer exploring near misty falls)
    const fallsPanda = this.createAnatomicalPanda({ scale: 1.3, isSeated: true });
    const fpX = -10.0;
    const fpZ = -66.0;
    fallsPanda.position.set(fpX, this.getTerrainHeight(fpX, fpZ), fpZ);
    fallsPanda.rotation.y = 0.5;
    this.natureGroup.add(fallsPanda);

    // 12. CURIOUS DAISY CUB (Peeking out from behind daisies near rabbits)
    const daisyCub = this.createAnatomicalPanda({ scale: 0.78, isCub: true });
    const dcX = 1.5;
    const dcZ = -22.0;
    daisyCub.position.set(dcX, this.getTerrainHeight(dcX, dcZ), dcZ);
    daisyCub.rotation.y = -0.3;
    this.natureGroup.add(daisyCub);
  }

  createAnatomicalPanda(config = {}) {
    const panda = new THREE.Group();
    const scale = config.scale || 1.35;
    panda.scale.set(scale, scale, scale);

    // High-Resolution Photographic Fur Materials
    const whiteFurMat = new THREE.MeshStandardMaterial({
      map: this.pandaFurTex,
      color: 0xfcf8ee, // Creamy natural panda fur
      roughness: 0.72,
      metalness: 0.02
    });

    const blackFurMat = new THREE.MeshStandardMaterial({
      map: this.pandaFurTex,
      color: 0x111110, // Deep jet-black panda fur
      roughness: 0.82,
      metalness: 0.02
    });

    const eyeMat = new THREE.MeshStandardMaterial({
      color: 0x050505,
      roughness: 0.08,
      metalness: 0.95
    });

    const noseMat = new THREE.MeshStandardMaterial({
      color: 0x141414,
      roughness: 0.35
    });

    // 1. Plump Body & Shoulders
    const bodyGeo = new THREE.SphereGeometry(0.72, 22, 18);
    bodyGeo.scale(1.05, 1.15, 1.35);
    const body = new THREE.Mesh(bodyGeo, whiteFurMat);
    body.position.set(0, 0.85, 0);
    body.castShadow = true;
    panda.add(body);

    // Black Shoulder Saddle Band
    const saddleGeo = new THREE.CylinderGeometry(0.74, 0.77, 0.82, 20);
    saddleGeo.rotateX(Math.PI / 2);
    const saddle = new THREE.Mesh(saddleGeo, blackFurMat);
    saddle.position.set(0, 0.95, 0.28);
    saddle.castShadow = true;
    panda.add(saddle);

    // 2. Rounded Head with Chubby Cheeks
    const headGroup = new THREE.Group();
    headGroup.position.set(0, 1.55, 0.75);

    const skullGeo = new THREE.SphereGeometry(0.56, 22, 18);
    skullGeo.scale(1.18, 1.02, 1.08); // Cute chubby cheeks
    const skull = new THREE.Mesh(skullGeo, whiteFurMat);
    skull.castShadow = true;
    headGroup.add(skull);

    // Black Teardrop Eye Patches
    [-0.26, 0.26].forEach((ex, idx) => {
      const patchGeo = new THREE.SphereGeometry(0.16, 12, 10);
      patchGeo.scale(0.85, 1.3, 0.5);
      const patch = new THREE.Mesh(patchGeo, blackFurMat);
      patch.position.set(ex, 0.08, 0.45);
      patch.rotation.z = (idx === 0) ? 0.35 : -0.35;
      headGroup.add(patch);

      const eyeGeo = new THREE.SphereGeometry(0.065, 10, 10);
      const eye = new THREE.Mesh(eyeGeo, eyeMat);
      eye.position.set(ex, 0.08, 0.52);
      headGroup.add(eye);
    });

    // Rounded Black Ears
    const earsGroup = new THREE.Group();
    [-0.42, 0.42].forEach(ex => {
      const earGeo = new THREE.SphereGeometry(0.18, 12, 10);
      earGeo.scale(1.0, 1.0, 0.45);
      const ear = new THREE.Mesh(earGeo, blackFurMat);
      ear.position.set(ex, 0.48, -0.05);
      earsGroup.add(ear);
    });
    headGroup.add(earsGroup);

    // Muzzle & Moist Nose
    const muzzleGeo = new THREE.SphereGeometry(0.25, 14, 12);
    muzzleGeo.scale(1.1, 0.88, 1.15);
    const muzzle = new THREE.Mesh(muzzleGeo, whiteFurMat);
    muzzle.position.set(0, -0.12, 0.46);
    headGroup.add(muzzle);

    const noseGeo = new THREE.SphereGeometry(0.09, 10, 10);
    noseGeo.scale(1.3, 0.8, 0.9);
    const nose = new THREE.Mesh(noseGeo, noseMat);
    nose.position.set(0, -0.06, 0.68);
    headGroup.add(nose);

    panda.add(headGroup);

    // 3. Articulated Limbs & Paws
    let rightArmMesh = null;
    let bambooShoot = null;

    if (config.isSeated) {
      body.rotation.x = -0.35;
      headGroup.position.set(0, 1.45, 0.55);

      const armGeo = new THREE.CylinderGeometry(0.18, 0.16, 0.85, 10);
      const leftArm = new THREE.Mesh(armGeo, blackFurMat);
      leftArm.position.set(-0.52, 0.85, 0.45);
      leftArm.rotation.set(0.65, 0, 0.45);
      leftArm.castShadow = true;
      panda.add(leftArm);

      rightArmMesh = new THREE.Mesh(armGeo, blackFurMat);
      rightArmMesh.position.set(0.52, 0.85, 0.45);
      rightArmMesh.rotation.set(0.75, 0, -0.45);
      rightArmMesh.castShadow = true;
      panda.add(rightArmMesh);

      const legGeo = new THREE.CylinderGeometry(0.22, 0.2, 0.9, 10);
      const leftLeg = new THREE.Mesh(legGeo, blackFurMat);
      leftLeg.position.set(-0.55, 0.35, 0.55);
      leftLeg.rotation.set(1.2, 0, -0.35);
      leftLeg.castShadow = true;
      panda.add(leftLeg);

      const rightLeg = new THREE.Mesh(legGeo, blackFurMat);
      rightLeg.position.set(0.55, 0.35, 0.55);
      rightLeg.rotation.set(1.2, 0, 0.35);
      rightLeg.castShadow = true;
      panda.add(rightLeg);

      const pawGeo = new THREE.SphereGeometry(0.18, 10, 8);
      pawGeo.scale(1.0, 0.6, 1.3);
      [-0.55, 0.55].forEach(px => {
        const paw = new THREE.Mesh(pawGeo, blackFurMat);
        paw.position.set(px, 0.15, 0.95);
        panda.add(paw);
      });

      if (config.hasBamboo) {
        bambooShoot = new THREE.Group();
        const bMat = new THREE.MeshStandardMaterial({ color: 0x65a30d, roughness: 0.5 });
        const bGeo = new THREE.CylinderGeometry(0.04, 0.04, 1.6, 6);
        const bCane = new THREE.Mesh(bGeo, bMat);
        bCane.rotation.set(0.4, 0, -0.2);
        bambooShoot.add(bCane);

        const lMat = new THREE.MeshStandardMaterial({ color: 0x84cc16, side: THREE.DoubleSide });
        for (let l = 0; l < 4; l++) {
          const lGeo = new THREE.PlaneGeometry(0.14, 0.45);
          const leaf = new THREE.Mesh(lGeo, lMat);
          leaf.position.set(0.08, 0.4 + l * 0.25, 0);
          leaf.rotation.set(0.3, l * 1.5, 0.5);
          bambooShoot.add(leaf);
        }

        bambooShoot.position.set(0.25, 1.1, 0.7);
        panda.add(bambooShoot);
      }
    } else {
      const legGeo = new THREE.CylinderGeometry(0.18, 0.15, 0.85, 10);
      const fl = new THREE.Mesh(legGeo, blackFurMat);
      fl.position.set(-0.45, 0.42, 0.55);
      fl.castShadow = true;
      panda.add(fl);

      const fr = new THREE.Mesh(legGeo, blackFurMat);
      fr.position.set(0.45, 0.42, 0.55);
      fr.castShadow = true;
      panda.add(fr);

      const bl = new THREE.Mesh(legGeo, blackFurMat);
      bl.position.set(-0.48, 0.42, -0.55);
      bl.castShadow = true;
      panda.add(bl);

      const br = new THREE.Mesh(legGeo, blackFurMat);
      br.position.set(0.48, 0.42, -0.55);
      br.castShadow = true;
      panda.add(br);

      panda.userData.frontLeft = fl;
      panda.userData.frontRight = fr;
      panda.userData.backLeft = bl;
      panda.userData.backRight = br;
    }

    const tailGeo = new THREE.SphereGeometry(0.14, 8, 8);
    const tail = new THREE.Mesh(tailGeo, whiteFurMat);
    tail.position.set(0, 0.7, -0.85);
    panda.add(tail);

    panda.userData.head = headGroup;
    panda.userData.ears = earsGroup;
    panda.userData.rightArm = rightArmMesh;
    panda.userData.bambooShoot = bambooShoot;

    return panda;
  }

  /* -------------------------------------------------------------
   * 13. WILDLIFE FAUNA: RABBITS, SPOTTED DEER, FOX, SWANS, BIRDS & BUTTERFLIES
   * -----------------------------------------------------------*/
  buildWildlifeFauna() {
    this.buildCottontailRabbits();
    this.buildSpottedDeerFamily();
    this.buildRiverWaterfowl();
    this.buildButterflies();
    this.loadRiggedGLBWildlife();
  }

  buildCottontailRabbits() {
    const rabbitGroup = new THREE.Group();

    const rabbitSpots = [
      { x: 0.9, z: -16.8, rot: -0.45 }, // Right foreground grassy bank among daisies
      { x: 2.6, z: -17.6, rot: -0.9 },  // Grazing near cosmos wildflowers
      { x: -2.2, z: -15.8, rot: 0.55 }  // Near mother panda wildflower glade
    ];

    rabbitSpots.forEach((rp, idx) => {
      const rY = this.getTerrainHeight(rp.x, rp.z);
      const rabbit = this.createRealisticRabbitMesh();
      rabbit.position.set(rp.x, rY, rp.z);
      rabbit.rotation.y = rp.rot;
      rabbitGroup.add(rabbit);

      this.animatedEntities.push({
        type: 'rabbit',
        mesh: rabbit,
        ears: rabbit.userData.ears,
        head: rabbit.userData.head,
        baseY: rY,
        timer: idx * 2.1
      });
    });

    this.natureGroup.add(rabbitGroup);
  }

  createRealisticRabbitMesh() {
    const rGroup = new THREE.Group();
    rGroup.scale.set(1.15, 1.15, 1.15);

    const agoutiFurMat = new THREE.MeshStandardMaterial({
      color: 0x93785b,
      roughness: 0.78,
      metalness: 0.04
    });

    const whiteFurMat = new THREE.MeshStandardMaterial({
      color: 0xf5ede4,
      roughness: 0.85
    });

    const bodyGeo = new THREE.SphereGeometry(0.32, 12, 10);
    bodyGeo.scale(0.85, 0.95, 1.3);
    const body = new THREE.Mesh(bodyGeo, agoutiFurMat);
    body.position.set(0, 0.32, 0);
    body.castShadow = true;
    rGroup.add(body);

    const chestGeo = new THREE.SphereGeometry(0.2, 8, 8);
    chestGeo.scale(0.8, 0.8, 1.0);
    const chest = new THREE.Mesh(chestGeo, whiteFurMat);
    chest.position.set(0, 0.26, 0.22);
    rGroup.add(chest);

    const headGroup = new THREE.Group();
    headGroup.position.set(0, 0.52, 0.34);

    const headGeo = new THREE.SphereGeometry(0.2, 12, 10);
    headGeo.scale(0.9, 1.0, 1.1);
    const head = new THREE.Mesh(headGeo, agoutiFurMat);
    headGroup.add(head);

    const eyeGeo = new THREE.SphereGeometry(0.035, 6, 6);
    const eyeMat = new THREE.MeshStandardMaterial({ color: 0x080808, roughness: 0.1 });
    [-0.11, 0.11].forEach(ex => {
      const eye = new THREE.Mesh(eyeGeo, eyeMat);
      eye.position.set(ex, 0.06, 0.1);
      headGroup.add(eye);
    });

    const earGroup = new THREE.Group();
    [-0.08, 0.08].forEach((ex, idx) => {
      const earGeo = new THREE.CylinderGeometry(0.035, 0.06, 0.44, 6);
      earGeo.scale(0.45, 1.0, 1.0);
      const ear = new THREE.Mesh(earGeo, agoutiFurMat);
      ear.position.set(ex, 0.28, -0.05);
      ear.rotation.set(-0.25, 0, (idx === 0 ? -0.15 : 0.15));
      earGroup.add(ear);
    });
    headGroup.add(earGroup);
    rGroup.add(headGroup);

    const tailGeo = new THREE.SphereGeometry(0.12, 8, 8);
    const tail = new THREE.Mesh(tailGeo, whiteFurMat);
    tail.position.set(0, 0.38, -0.44);
    rGroup.add(tail);

    rGroup.userData = { head: headGroup, ears: earGroup };
    return rGroup;
  }

  buildSpottedDeerFamily() {
    const deerGroup = new THREE.Group();

    const buck = this.createSpottedDeerMesh(true, 1.35);
    const bX = 14.5;
    const bZ = -41.0;
    buck.position.set(bX, this.getTerrainHeight(bX, bZ), bZ);
    buck.rotation.y = -Math.PI * 0.42;
    deerGroup.add(buck);

    const doe = this.createSpottedDeerMesh(false, 1.25);
    const dX = 18.0;
    const dZ = -44.0;
    doe.position.set(dX, this.getTerrainHeight(dX, dZ), dZ);
    doe.rotation.y = -Math.PI * 0.78;
    deerGroup.add(doe);

    const fawn = this.createSpottedDeerMesh(false, 0.75);
    const fX = 16.5;
    const fZ = -43.0;
    fawn.position.set(fX, this.getTerrainHeight(fX, fZ), fZ);
    fawn.rotation.y = -Math.PI * 0.65;
    deerGroup.add(fawn);

    this.animatedEntities.push({
      type: 'deer_family',
      buckHead: buck.userData.neckPivot,
      doeHead: doe.userData.neckPivot,
      buckEars: buck.userData.ears
    });

    this.natureGroup.add(deerGroup);
  }

  createSpottedDeerMesh(hasAntlers, scale = 1.3) {
    const deer = new THREE.Group();
    deer.scale.set(scale, scale, scale);

    const tawnyFurMat = new THREE.MeshStandardMaterial({
      color: 0x965328, // Warm rich deer pelt
      roughness: 0.72,
      metalness: 0.04
    });

    const whiteUnderbellyMat = new THREE.MeshStandardMaterial({
      color: 0xfbf7f0,
      roughness: 0.8
    });

    const darkEyeMat = new THREE.MeshStandardMaterial({
      color: 0x050505,
      roughness: 0.08,
      metalness: 0.95
    });

    const hoofMat = new THREE.MeshStandardMaterial({
      color: 0x1f1b17,
      roughness: 0.4
    });

    // Anatomical Torso (Chest + Flank smooth blended spheres)
    const torsoGroup = new THREE.Group();
    const chestGeo = new THREE.SphereGeometry(0.52, 14, 12);
    chestGeo.scale(0.85, 1.05, 1.25);
    const chest = new THREE.Mesh(chestGeo, tawnyFurMat);
    chest.position.set(0, 1.62, 0.35);
    chest.castShadow = true;
    torsoGroup.add(chest);

    const bellyGeo = new THREE.SphereGeometry(0.48, 14, 12);
    bellyGeo.scale(0.82, 0.98, 1.35);
    const belly = new THREE.Mesh(bellyGeo, tawnyFurMat);
    belly.position.set(0, 1.58, -0.25);
    belly.castShadow = true;
    torsoGroup.add(belly);

    // White bib on chest
    const bibGeo = new THREE.SphereGeometry(0.28, 10, 8);
    bibGeo.scale(0.7, 0.9, 0.8);
    const bib = new THREE.Mesh(bibGeo, whiteUnderbellyMat);
    bib.position.set(0, 1.6, 0.72);
    torsoGroup.add(bib);

    deer.add(torsoGroup);

    // Natural white spots along back and flanks
    for (let s = 0; s < 14; s++) {
      const spotGeo = new THREE.CircleGeometry(0.045, 8);
      const spot = new THREE.Mesh(spotGeo, whiteUnderbellyMat);
      const side = s % 2 === 0 ? 0.42 : -0.42;
      spot.position.set(side, 1.75 + (Math.random() - 0.5) * 0.25, -0.45 + (s / 14) * 0.9);
      spot.rotation.y = side > 0 ? Math.PI / 2 : -Math.PI / 2;
      deer.add(spot);
    }

    // Slender Graceful Legs
    const legCoords = [
      { x: -0.28, z: 0.42 }, { x: 0.28, z: 0.42 },
      { x: -0.28, z: -0.52 }, { x: 0.28, z: -0.52 }
    ];

    legCoords.forEach(lp => {
      const legGroup = new THREE.Group();
      legGroup.position.set(lp.x, 0, lp.z);

      const upperGeo = new THREE.CylinderGeometry(0.09, 0.065, 0.85, 8);
      const upper = new THREE.Mesh(upperGeo, tawnyFurMat);
      upper.position.y = 1.15;
      upper.castShadow = true;
      legGroup.add(upper);

      const lowerGeo = new THREE.CylinderGeometry(0.06, 0.042, 0.85, 8);
      const lower = new THREE.Mesh(lowerGeo, tawnyFurMat);
      lower.position.y = 0.42;
      lower.castShadow = true;
      legGroup.add(lower);

      const hoofGeo = new THREE.CylinderGeometry(0.045, 0.055, 0.1, 8);
      const hoof = new THREE.Mesh(hoofGeo, hoofMat);
      hoof.position.y = 0.05;
      legGroup.add(hoof);

      deer.add(legGroup);
    });

    // Elegant Slender Neck
    const neckPivot = new THREE.Group();
    neckPivot.position.set(0, 1.85, 0.65);

    const neckGeo = new THREE.CylinderGeometry(0.18, 0.26, 0.95, 10);
    neckGeo.rotateX(0.42);
    const neck = new THREE.Mesh(neckGeo, tawnyFurMat);
    neck.position.set(0, 0.38, 0.18);
    neck.castShadow = true;
    neckPivot.add(neck);

    // Anatomical Deer Head with slender snout
    const headGroup = new THREE.Group();
    headGroup.position.set(0, 0.82, 0.35);

    const skullGeo = new THREE.SphereGeometry(0.22, 12, 10);
    skullGeo.scale(0.88, 0.95, 1.25);
    const skull = new THREE.Mesh(skullGeo, tawnyFurMat);
    headGroup.add(skull);

    const muzzleGeo = new THREE.SphereGeometry(0.14, 10, 8);
    muzzleGeo.scale(0.85, 0.8, 1.35);
    const muzzle = new THREE.Mesh(muzzleGeo, whiteUnderbellyMat);
    muzzle.position.set(0, -0.06, 0.35);
    headGroup.add(muzzle);

    const noseGeo = new THREE.SphereGeometry(0.05, 8, 8);
    const nose = new THREE.Mesh(noseGeo, hoofMat);
    nose.position.set(0, -0.04, 0.52);
    headGroup.add(nose);

    // Big gentle eyes
    [-0.14, 0.14].forEach(ex => {
      const eyeGeo = new THREE.SphereGeometry(0.045, 8, 8);
      const eye = new THREE.Mesh(eyeGeo, darkEyeMat);
      eye.position.set(ex, 0.06, 0.14);
      headGroup.add(eye);
    });

    // Alert, expressive ears
    const earGroup = new THREE.Group();
    [-0.15, 0.15].forEach((ex, idx) => {
      const earGeo = new THREE.ConeGeometry(0.07, 0.38, 6);
      earGeo.scale(0.5, 1.0, 1.0);
      const ear = new THREE.Mesh(earGeo, tawnyFurMat);
      ear.position.set(ex, 0.24, -0.05);
      ear.rotation.set(-0.25, 0, idx === 0 ? 0.45 : -0.45);
      earGroup.add(ear);
    });
    headGroup.add(earGroup);

    // Branching Antlers for the Buck
    if (hasAntlers) {
      const antlerMat = new THREE.MeshStandardMaterial({ color: 0x42362c, roughness: 0.65 });
      [-0.12, 0.12].forEach(ax => {
        const beamGeo = new THREE.CylinderGeometry(0.028, 0.045, 1.15, 6);
        const beam = new THREE.Mesh(beamGeo, antlerMat);
        beam.position.set(ax, 0.6, -0.04);
        beam.rotation.set(-0.35, 0, ax * -0.45);
        beam.castShadow = true;
        headGroup.add(beam);

        const tine1Geo = new THREE.CylinderGeometry(0.018, 0.028, 0.4, 5);
        const tine1 = new THREE.Mesh(tine1Geo, antlerMat);
        tine1.position.set(ax * 1.35, 0.72, 0.08);
        tine1.rotation.set(0.45, 0, ax * -0.35);
        headGroup.add(tine1);

        const tine2Geo = new THREE.CylinderGeometry(0.015, 0.024, 0.35, 5);
        const tine2 = new THREE.Mesh(tine2Geo, antlerMat);
        tine2.position.set(ax * 1.6, 0.95, -0.05);
        tine2.rotation.set(-0.15, 0, ax * -0.6);
        headGroup.add(tine2);
      });
    }

    neckPivot.add(headGroup);
    deer.add(neckPivot);

    deer.userData = { neckPivot: neckPivot, ears: earGroup };
    return deer;
  }

  buildRiverWaterfowl() {
    const waterGroup = new THREE.Group();

    const swan1 = this.createSwanMesh();
    swan1.position.set(-0.5, -1.45, -30.0);
    waterGroup.add(swan1);

    const swan2 = this.createSwanMesh();
    swan2.position.set(1.8, -1.45, -45.0);
    swan2.rotation.y = Math.PI * 0.8;
    waterGroup.add(swan2);

    this.animatedEntities.push({
      type: 'swan',
      mesh1: swan1,
      mesh2: swan2
    });

    this.natureGroup.add(waterGroup);
  }

  createSwanMesh() {
    const swan = new THREE.Group();
    swan.scale.set(0.85, 0.85, 0.85);

    const whiteMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.4 });
    const orangeMat = new THREE.MeshStandardMaterial({ color: 0xf97316, roughness: 0.3 });
    const blackMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.1 });

    const bodyGeo = new THREE.SphereGeometry(0.42, 12, 10);
    bodyGeo.scale(0.8, 0.7, 1.4);
    const body = new THREE.Mesh(bodyGeo, whiteMat);
    swan.add(body);

    const neckGeo = new THREE.CylinderGeometry(0.08, 0.11, 0.9, 8);
    const neck = new THREE.Mesh(neckGeo, whiteMat);
    neck.position.set(0, 0.42, 0.45);
    neck.rotation.x = -0.35;
    swan.add(neck);

    const headGeo = new THREE.SphereGeometry(0.12, 8, 8);
    const head = new THREE.Mesh(headGeo, whiteMat);
    head.position.set(0, 0.82, 0.58);
    swan.add(head);

    const beakGeo = new THREE.ConeGeometry(0.045, 0.22, 6);
    beakGeo.rotateX(Math.PI / 2);
    const beak = new THREE.Mesh(beakGeo, orangeMat);
    beak.position.set(0, 0.8, 0.74);
    swan.add(beak);

    const knobGeo = new THREE.SphereGeometry(0.035, 6, 6);
    const knob = new THREE.Mesh(knobGeo, blackMat);
    knob.position.set(0, 0.84, 0.65);
    swan.add(knob);

    return swan;
  }

  buildButterflies() {
    const configs = [
      { color: 0xf97316, x: -5, z: -18 },
      { color: 0xf97316, x: 2, z: -20 },
      { color: 0xfbbf24, x: -7, z: -24 },
      { color: 0x3b82f6, x: 12, z: -30 },
      { color: 0xd946ef, x: 20, z: -40 }
    ];

    configs.forEach((cfg, idx) => {
      const bGroup = new THREE.Group();
      const bY = this.getTerrainHeight(cfg.x, cfg.z) + 0.95;
      bGroup.position.set(cfg.x, bY, cfg.z);

      const wingMat = new THREE.MeshStandardMaterial({
        color: cfg.color,
        roughness: 0.4,
        metalness: 0.2,
        side: THREE.DoubleSide
      });

      const wingGeo = new THREE.PlaneGeometry(0.26, 0.32);
      wingGeo.rotateY(Math.PI / 2);

      const leftWing = new THREE.Mesh(wingGeo, wingMat);
      leftWing.position.set(-0.13, 0, 0);
      bGroup.add(leftWing);

      const rightWing = new THREE.Mesh(wingGeo, wingMat);
      rightWing.position.set(0.13, 0, 0);
      bGroup.add(rightWing);

      this.butterflies.push({
        mesh: bGroup,
        leftWing: leftWing,
        rightWing: rightWing,
        baseX: cfg.x,
        baseY: bY,
        baseZ: cfg.z,
        speed: 1.2 + idx * 0.25,
        flutterFreq: 16 + idx * 2
      });

      this.natureGroup.add(bGroup);
    });
  }

  loadRiggedGLBWildlife() {
    if (!this.gltfLoader) return;

    const base64ToArrayBuffer = (base64) => {
      const binary = window.atob(base64);
      const len = binary.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binary.charCodeAt(i);
      }
      return bytes.buffer;
    };

    if (window.PRELOADED_FOX_B64 && window.PRELOADED_FOX_B64.length > 100) {
      try {
        const buffer = base64ToArrayBuffer(window.PRELOADED_FOX_B64);
        this.gltfLoader.parse(buffer, '', (gltf) => {
          const fox = gltf.scene || gltf.scene.children[0];
          fox.scale.set(0.016, 0.016, 0.016);
          const fX = 18.0;
          const fZ = -28.0;
          fox.position.set(fX, this.getTerrainHeight(fX, fZ), fZ);
          fox.rotation.y = -Math.PI * 0.7;
          fox.castShadow = true;

          const mixer = new THREE.AnimationMixer(fox);
          if (gltf.animations && gltf.animations.length > 0) {
            const action = mixer.clipAction(gltf.animations[0]);
            action.play();
            this.mixers.push(mixer);
          }

          this.natureGroup.add(fox);
          console.log("Loaded rigged Fox.glb successfully!");
        });
      } catch (e) {
        console.warn("Error loading Fox.glb:", e);
      }
    }

    if (window.PRELOADED_DUCK_B64 && window.PRELOADED_DUCK_B64.length > 100) {
      try {
        const buffer = base64ToArrayBuffer(window.PRELOADED_DUCK_B64);
        this.gltfLoader.parse(buffer, '', (gltf) => {
          const duck = gltf.scene || gltf.scene.children[0];
          duck.scale.set(0.55, 0.55, 0.55);
          duck.position.set(2.0, -1.5, -25.0);
          this.natureGroup.add(duck);

          this.animatedEntities.push({
            type: 'swimming_duck',
            mesh: duck,
            baseX: 2.0,
            baseZ: -25.0
          });
          console.log("Loaded Duck.glb successfully!");
        });
      } catch (e) {
        console.warn("Error loading Duck.glb:", e);
      }
    }

    const birdModels = [];
    if (window.PRELOADED_STORK_B64 && window.PRELOADED_STORK_B64.length > 100) {
      birdModels.push({ b64: window.PRELOADED_STORK_B64, scale: 0.018, y: 18, speed: 0.65, name: 'Stork' });
    }
    if (window.PRELOADED_FLAMINGO_B64 && window.PRELOADED_FLAMINGO_B64.length > 100) {
      birdModels.push({ b64: window.PRELOADED_FLAMINGO_B64, scale: 0.015, y: 22, speed: 0.6, name: 'Flamingo' });
    }

    birdModels.forEach((m, idx) => {
      try {
        const buffer = base64ToArrayBuffer(m.b64);
        this.gltfLoader.parse(buffer, '', (gltf) => {
          const bird = gltf.scene || gltf.scene.children[0];
          bird.scale.set(m.scale, m.scale, m.scale);
          bird.position.set(-20 + idx * 25, m.y, -50);
          bird.castShadow = true;

          const mixer = new THREE.AnimationMixer(bird);
          if (gltf.animations && gltf.animations.length > 0) {
            const action = mixer.clipAction(gltf.animations[0]);
            action.play();
            this.mixers.push(mixer);
          }

          this.natureGroup.add(bird);
          this.birds.push({
            mesh: bird,
            radius: 38 + idx * 10,
            angle: idx * Math.PI,
            speed: m.speed * 0.32,
            height: m.y
          });
          console.log(`Loaded rigged GLB bird: ${m.name}`);
        });
      } catch (e) {
        console.warn(`Error initializing bird ${m.name}:`, e);
      }
    });
  }

  /* -------------------------------------------------------------
   * RENDER & ANIMATION LOOP UPDATE
   * -----------------------------------------------------------*/
  update(deltaTime) {
    const time = this.clock.getElapsedTime();

    // 1. River Water Continuous Flow
    if (this.waterMesh && this.waterMesh.material.map) {
      this.waterMesh.material.map.offset.y -= deltaTime * 0.085;
    }

    // 2. Waterfall Rapids Scrolling & Billowing Mist
    if (this.waterfallMesh && this.waterfallMesh.material.map) {
      this.waterfallMesh.material.map.offset.y -= deltaTime * 0.75;
    }

    if (this.mistParticles) {
      const pos = this.mistParticles.geometry.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        let y = pos.getY(i) + deltaTime * 1.5;
        let x = pos.getX(i) + Math.sin(time + i) * deltaTime * 0.7;
        if (y > 5.5) {
          y = 0;
          x = (Math.random() - 0.5) * 14;
        }
        pos.setY(i, y);
        pos.setX(i, x);
      }
      pos.needsUpdate = true;
    }

    // 3. Drifting Sakura Petals in the Wind
    if (this.petalParticles) {
      const pos = this.petalParticles.geometry.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        let y = pos.getY(i) - deltaTime * 0.85;
        let x = pos.getX(i) + Math.sin(time * 0.7 + i) * deltaTime * 1.2;
        let z = pos.getZ(i) + deltaTime * 0.45;

        if (y < 0) {
          y = 10 + Math.random() * 2;
          x = (Math.random() - 0.5) * 55;
          z = -12 - Math.random() * 55;
        }
        pos.setY(i, y);
        pos.setX(i, x);
        pos.setZ(i, z);
      }
      pos.needsUpdate = true;
    }

    // 4. Tree & Bamboo Sway in the Gentle Breeze
    this.trees.forEach((tree, idx) => {
      tree.rotation.z = Math.sin(time * 0.75 + idx) * 0.022;
    });

    this.bambooNodes.forEach((stalk, idx) => {
      stalk.rotation.z = Math.sin(time * 1.1 + idx * 0.5) * 0.035;
    });

    // 5. Lantern Light Subtle Flame Flickering
    this.lanternLights.forEach((light, idx) => {
      light.intensity = 2.2 + Math.sin(time * 8.0 + idx * 2.0) * 0.25;
    });

    // 6. Rigged GLB Animation Mixers & High Flight Circles
    this.mixers.forEach(mixer => mixer.update(deltaTime));

    this.birds.forEach(b => {
      b.angle += b.speed * deltaTime;
      b.mesh.position.x = Math.sin(b.angle) * b.radius;
      b.mesh.position.z = -55 + Math.cos(b.angle) * (b.radius * 0.65);
      b.mesh.rotation.y = b.angle + Math.PI / 2;
    });

    // 7. Fluttering Butterflies
    this.butterflies.forEach(bf => {
      const flap = Math.sin(time * bf.flutterFreq) * 0.85;
      bf.leftWing.rotation.z = flap;
      bf.rightWing.rotation.z = -flap;

      bf.mesh.position.x = bf.baseX + Math.sin(time * bf.speed) * 1.8;
      bf.mesh.position.y = bf.baseY + Math.sin(time * bf.speed * 2.2) * 0.4;
      bf.mesh.position.z = bf.baseZ + Math.cos(time * bf.speed) * 1.8;
      bf.mesh.rotation.y = time * bf.speed + Math.PI / 2;
    });

    // 8. Dynamic Wildlife & Panda Behaviors
    this.animatedEntities.forEach(ent => {
      if (ent.type === 'panda_mother') {
        const eatCycle = (Math.sin(time * 1.8) + 1.0) * 0.5;
        if (ent.eatingArm) ent.eatingArm.rotation.x = 0.75 + eatCycle * 0.28;
        if (ent.head) {
          ent.head.rotation.x = 0.08 + eatCycle * 0.12;
          ent.head.rotation.y = Math.sin(time * 0.6) * 0.08;
        }
        if (ent.ears) ent.ears.rotation.z = Math.sin(time * 3.5) * 0.06;
      } else if (ent.type === 'panda_cub') {
        if (ent.head) {
          ent.head.rotation.y = Math.sin(time * 0.9) * 0.22;
          ent.head.rotation.z = Math.cos(time * 0.7) * 0.08;
        }
      } else if (ent.type === 'panda_walk') {
        const walkCycle = time * 3.2;
        ent.fl.rotation.x = Math.sin(walkCycle) * 0.45;
        ent.fr.rotation.x = -Math.sin(walkCycle) * 0.45;
        ent.bl.rotation.x = -Math.sin(walkCycle) * 0.45;
        ent.br.rotation.x = Math.sin(walkCycle) * 0.45;
        ent.mesh.position.y = this.getTerrainHeight(ent.mesh.position.x, ent.mesh.position.z) + Math.abs(Math.sin(walkCycle * 2)) * 0.06;
      } else if (ent.type === 'panda_roll') {
        ent.mesh.rotation.z = Math.sin(time * 2.2) * 0.35;
        ent.mesh.rotation.y = Math.cos(time * 1.5) * 0.25;
      } else if (ent.type === 'panda_sleep') {
        const breathe = 1.0 + Math.sin(time * 1.1) * 0.04;
        ent.mesh.scale.y = 1.3 * breathe;
      } else if (ent.type === 'panda_eat') {
        if (ent.arm) ent.arm.rotation.x = 0.7 + Math.sin(time * 2.2) * 0.25;
        if (ent.head) ent.head.rotation.x = 0.1 + Math.sin(time * 2.2) * 0.1;
      } else if (ent.type === 'panda_look' || ent.type === 'panda_sniff') {
        if (ent.head) ent.head.rotation.y = Math.sin(time * 0.6) * 0.3;
      } else if (ent.type === 'rabbit') {
        ent.timer += deltaTime;
        const cycle = ent.timer % 4.5;
        const curY = this.getTerrainHeight(ent.mesh.position.x, ent.mesh.position.z);

        if (cycle < 0.65) {
          const hop = Math.sin((cycle / 0.65) * Math.PI) * 0.42;
          ent.mesh.position.y = curY + hop;
          ent.mesh.position.z -= deltaTime * 0.85;
        } else {
          ent.mesh.position.y = curY;
          if (ent.ears) ent.ears.rotation.y = Math.sin(time * 4.2) * 0.15;
          if (ent.head) ent.head.rotation.x = Math.sin(time * 2.0) * 0.08;
        }

        if (ent.mesh.position.z < -26.0) ent.mesh.position.z = -19.2;
      } else if (ent.type === 'deer_family') {
        if (ent.buckHead) {
          ent.buckHead.rotation.x = -0.12 + Math.sin(time * 0.6) * 0.18;
          ent.buckHead.rotation.y = Math.sin(time * 0.4) * 0.15;
        }
        if (ent.doeHead) {
          ent.doeHead.rotation.x = 0.52 + Math.sin(time * 0.5) * 0.12;
        }
        if (ent.buckEars) {
          ent.buckEars.rotation.z = Math.sin(time * 3.0) * 0.12;
        }
      } else if (ent.type === 'swan') {
        ent.mesh1.position.z = -30.0 + Math.sin(time * 0.4) * 4.5;
        ent.mesh1.position.x = -0.5 + Math.cos(time * 0.3) * 0.8;
        ent.mesh2.position.z = -45.0 + Math.cos(time * 0.35) * 3.5;
      } else if (ent.type === 'swimming_duck') {
        ent.mesh.position.z = ent.baseZ + Math.sin(time * 0.5) * 2.8;
        ent.mesh.position.x = ent.baseX + Math.cos(time * 0.4) * 0.6;
      }
    });

    // 9. Golden Butterfly Clue Animation
    if (this.goldenButterfly) {
      const gb = this.goldenButterfly;
      gb.angle += gb.speed * deltaTime;
      const flap = Math.sin(time * gb.flutterFreq) * 0.85;
      gb.leftWing.rotation.z = flap;
      gb.rightWing.rotation.z = -flap;

      // Gentle curved orbit around the cherry tree dipping near the root/key
      const rad = 3.6 + Math.sin(gb.angle * 1.5) * 1.2;
      gb.mesh.position.x = gb.centerX + Math.cos(gb.angle) * rad;
      gb.mesh.position.z = gb.centerZ + Math.sin(gb.angle) * rad;
      const dip = Math.sin(gb.angle * 0.8) * 1.0;
      gb.mesh.position.y = gb.centerY + dip;
      gb.mesh.rotation.y = -gb.angle + Math.PI / 2;
    }

    // 10. Golden Key Sparkles & Proximity Glow / Clues
    if (this.keyGroup && !this.hasCollectedKey) {
      if (this.keySparkles) {
        this.keySparkles.rotation.y += deltaTime * 0.45;
        const sPos = this.keySparkles.geometry.attributes.position;
        for (let i = 0; i < sPos.count; i++) {
          let y = sPos.getY(i) + deltaTime * 0.16;
          if (y > 0.6) y = -1.1;
          sPos.setY(i, y);
        }
        sPos.needsUpdate = true;
      }

      // Proximity Glow: When Ashitha approaches the key, gently increase its glow
      const camDist = this.camera.position.distanceTo(this.keyGroup.position);
      if (camDist < 18.0) {
        const glowFactor = 1.0 - (camDist / 18.0);
        if (this.keyLight && !this.isKeyHovered) {
          this.keyLight.intensity = 1.2 + glowFactor * 1.8;
        }
        if (this.goldKeyMat && !this.isKeyHovered) {
          this.goldKeyMat.emissiveIntensity = 0.28 + glowFactor * 0.35;
        }

        // Small visual hint when she gets close without revealing exact location
        if (camDist < 14.0) {
          const hint = document.getElementById('hint-text');
          if (hint && !hint.dataset.customHint) {
            hint.dataset.customHint = "shimmer";
            hint.innerText = "✦ A faint golden shimmer caught your eye near the cherry blossom tree... ✨";
          }
        }
      } else {
        if (this.keyLight && !this.isKeyHovered) this.keyLight.intensity = 1.2;
        if (this.goldKeyMat && !this.isKeyHovered) this.goldKeyMat.emissiveIntensity = 0.28;
        const hint = document.getElementById('hint-text');
        if (hint && hint.dataset.customHint === "shimmer") {
          delete hint.dataset.customHint;
          hint.innerText = "Explore Panda Village to discover the hidden golden key! 🔑";
        }
      }
    }

    // 11. Magical Keyhole Pedestal & Gifts Update Loop
    if (this.giftReveal && typeof this.giftReveal.update === 'function') {
      this.giftReveal.update(deltaTime);
    }
  }
}

window.Stage4_Nature = Stage4_Nature;
