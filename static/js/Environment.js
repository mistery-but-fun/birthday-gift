/**
 * Environment.js
 * Sets up realistic lighting, atmospheric fog, terrain, swaying foliage,
 * floating magical particles, and ancient stone gateway.
 */
class Environment {
  constructor(scene) {
    this.scene = scene;
    this.clock = new THREE.Clock();
    this.animatedObjects = [];
    this.fallingPetals = null;
    this.fireflies = null;
    this.entranceGroup = new THREE.Group();
    this.entranceGroup.name = "EntranceEnvironmentGroup";
    this.scene.add(this.entranceGroup);
    window.environment = this;

    this.initSkyAndFog();
    this.initLighting();
    this.initTerrain();
    this.initWelcomePavilion();
    this.initFoliage();
    this.initFallingPetals();
    this.initFireflies();
  }

  hideEntrance() {
    if (this.entranceGroup) this.entranceGroup.visible = false;
    if (this.sky) this.sky.visible = false;
    if (this.fallingPetals) this.fallingPetals.visible = false;
    if (this.fireflies) this.fireflies.visible = false;
    this.scene.fog = new THREE.FogExp2(0xfbcfe8, 0.002);
  }

  showEntrance() {
    if (this.entranceGroup) this.entranceGroup.visible = true;
    if (this.sky) this.sky.visible = true;
    if (this.fallingPetals) this.fallingPetals.visible = true;
    if (this.fireflies) this.fireflies.visible = true;
    this.scene.fog = new THREE.FogExp2(0x1a162b, 0.012);
  }

  initSkyAndFog() {
    // Romantic dusk/dawn pastel fog
    this.scene.fog = new THREE.FogExp2(0x1a162b, 0.012);

    // Dynamic gradient skydome
    const vertexShader = `
      varying vec3 vWorldPosition;
      void main() {
        vec4 worldPosition = modelMatrix * vec4(position, 1.0);
        vWorldPosition = worldPosition.xyz;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `;

    const fragmentShader = `
      uniform vec3 topColor;
      uniform vec3 bottomColor;
      uniform float offset;
      uniform float exponent;
      varying vec3 vWorldPosition;
      void main() {
        float h = normalize(vWorldPosition + offset).y;
        gl_FragColor = vec4(mix(bottomColor, topColor, max(pow(max(h, 0.0), exponent), 0.0)), 1.0);
      }
    `;

    const uniforms = {
      topColor: { value: new THREE.Color(0x231942) },     // Deep twilight purple
      bottomColor: { value: new THREE.Color(0xfbcfe8) },  // Warm pastel dawn pink
      offset: { value: 15 },
      exponent: { value: 0.6 }
    };

    const skyGeo = new THREE.SphereGeometry(300, 32, 15);
    const skyMat = new THREE.ShaderMaterial({
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
      uniforms: uniforms,
      side: THREE.BackSide
    });

    const sky = new THREE.Mesh(skyGeo, skyMat);
    this.sky = sky;
    this.scene.add(sky);
  }

  initLighting() {
    // Soft realistic ambient bounce light
    this.hemiLight = new THREE.HemisphereLight(0xfff0f5, 0x221a28, 0.65);
    this.hemiLight.position.set(0, 50, 0);
    this.scene.add(this.hemiLight);

    // Warm cinematic directional sunlight
    this.sunLight = new THREE.DirectionalLight(0xffecd2, 1.4);
    this.sunLight.position.set(30, 45, 25);
    this.sunLight.castShadow = true;
    this.sunLight.shadow.mapSize.width = 2048;
    this.sunLight.shadow.mapSize.height = 2048;
    this.sunLight.shadow.camera.near = 0.5;
    this.sunLight.shadow.camera.far = 120;
    this.sunLight.shadow.bias = -0.0005;

    const d = 40;
    this.sunLight.shadow.camera.left = -d;
    this.sunLight.shadow.camera.right = d;
    this.sunLight.shadow.camera.top = d;
    this.sunLight.shadow.camera.bottom = -d;

    this.scene.add(this.sunLight);

    // Soft warm accent rim light
    this.rimLight = new THREE.DirectionalLight(0xb8a4f8, 0.5);
    this.rimLight.position.set(-25, 20, -30);
    this.scene.add(this.rimLight);
  }

  dimForKingdom() {
    if (this.sunLight) this.sunLight.intensity = 0.0;
    if (this.hemiLight) this.hemiLight.intensity = 0.0;
    if (this.rimLight) this.rimLight.intensity = 0.0;
  }

  restoreFromKingdom() {
    if (this.sunLight) this.sunLight.intensity = 1.4;
    if (this.hemiLight) this.hemiLight.intensity = 0.65;
    if (this.rimLight) this.rimLight.intensity = 0.5;
  }

  initTerrain() {
    // Create organic undulating ground
    const width = 160;
    const depth = 160;
    const segments = 90;
    const geometry = new THREE.PlaneGeometry(width, depth, segments, segments);
    geometry.rotateX(-Math.PI / 2);

    const pos = geometry.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);

      // Natural gentle hills with a flattened central pathway for the entrance
      const distFromCenter = Math.sqrt(x * x + z * z);
      let y = Math.sin(x * 0.08) * Math.cos(z * 0.08) * 2.2;
      y += Math.sin(x * 0.03 + 1.2) * Math.cos(z * 0.04) * 3.5;

      // Flatten the path around origin
      if (Math.abs(x) < 8 && z > -15 && z < 25) {
        y *= 0.15;
      }

      pos.setY(i, y);
    }
    geometry.computeVertexNormals();

    // High detail realistic grass & soil shader/material
    const groundMaterial = new THREE.MeshStandardMaterial({
      color: 0x2d4a22,
      roughness: 0.85,
      metalness: 0.1,
      flatShading: false
    });

    const ground = new THREE.Mesh(geometry, groundMaterial);
    ground.receiveShadow = true;
    ground.position.y = -1.0;
    this.entranceGroup.add(ground);

    // Decorative flagstone path
    this.createCobblestonePath();
  }

  createCobblestonePath() {
    const pathGroup = new THREE.Group();
    const stoneGeo = new THREE.CylinderGeometry(0.65, 0.75, 0.12, 7);
    const stoneMat = new THREE.MeshStandardMaterial({
      color: 0xa89f91,
      roughness: 0.9,
      metalness: 0.05
    });

    for (let z = 20; z >= -12; z -= 1.4) {
      const numStones = 2 + Math.floor(Math.random() * 2);
      for (let s = 0; s < numStones; s++) {
        const stone = new THREE.Mesh(stoneGeo, stoneMat);
        const offsetX = (s - (numStones - 1) / 2) * 1.3 + (Math.random() - 0.5) * 0.3;
        stone.position.set(offsetX, -0.92, z + (Math.random() - 0.5) * 0.3);
        stone.rotation.y = Math.random() * Math.PI;
        stone.scale.set(
          0.8 + Math.random() * 0.4,
          1,
          0.8 + Math.random() * 0.4
        );
        stone.receiveShadow = true;
        stone.castShadow = true;
        pathGroup.add(stone);
      }
    }
    this.entranceGroup.add(pathGroup);
  }

  initWelcomePavilion() {
    // Grand ornate carved stone entrance arch
    const archGroup = new THREE.Group();
    archGroup.position.set(0, 0, -4);

    const stoneMat = new THREE.MeshStandardMaterial({
      color: 0xe2d9cc,
      roughness: 0.65,
      metalness: 0.15
    });

    const goldMat = new THREE.MeshStandardMaterial({
      color: 0xd4af37,
      roughness: 0.3,
      metalness: 0.85,
      emissive: 0x3d2b00,
      emissiveIntensity: 0.2
    });

    // Left and Right Classical Pillars
    [-4.5, 4.5].forEach((posX) => {
      // Pillar Base
      const baseGeo = new THREE.BoxGeometry(1.6, 0.8, 1.6);
      const base = new THREE.Mesh(baseGeo, stoneMat);
      base.position.set(posX, -0.5, 0);
      base.castShadow = true;
      base.receiveShadow = true;
      archGroup.add(base);

      // Fluted Column
      const columnGeo = new THREE.CylinderGeometry(0.55, 0.6, 7.5, 20);
      const column = new THREE.Mesh(columnGeo, stoneMat);
      column.position.set(posX, 3.4, 0);
      column.castShadow = true;
      column.receiveShadow = true;
      archGroup.add(column);

      // Gold Filigree Rings
      const ringGeo = new THREE.TorusGeometry(0.65, 0.08, 12, 24);
      const ringBottom = new THREE.Mesh(ringGeo, goldMat);
      ringBottom.rotation.x = Math.PI / 2;
      ringBottom.position.set(posX, 0.2, 0);
      archGroup.add(ringBottom);

      const ringTop = new THREE.Mesh(ringGeo, goldMat);
      ringTop.rotation.x = Math.PI / 2;
      ringTop.position.set(posX, 6.8, 0);
      archGroup.add(ringTop);

      // Hanging Crystal Lantern
      this.createHangingLantern(archGroup, posX, 5.0, 0.9);
    });

    // Grand Arch Top Span
    const archBeamGeo = new THREE.BoxGeometry(11, 0.9, 1.4);
    const archBeam = new THREE.Mesh(archBeamGeo, stoneMat);
    archBeam.position.set(0, 7.3, 0);
    archBeam.castShadow = true;
    archGroup.add(archBeam);

    // Upper Arch Pediment with Gold Inlay
    const pedimentGeo = new THREE.CylinderGeometry(5.2, 5.2, 0.8, 32, 1, false, 0, Math.PI);
    const pediment = new THREE.Mesh(pedimentGeo, stoneMat);
    pediment.rotation.z = -Math.PI / 2;
    pediment.rotation.y = Math.PI / 2;
    pediment.position.set(0, 7.3, 0);
    pediment.castShadow = true;
    archGroup.add(pediment);

    // Carved Golden Emblem in Center of Arch: "PANDA'S REALM"
    const crestGeo = new THREE.CylinderGeometry(1.2, 1.2, 0.2, 24);
    const crest = new THREE.Mesh(crestGeo, goldMat);
    crest.rotation.x = Math.PI / 2;
    crest.position.set(0, 8.8, 0.45);
    crest.castShadow = true;
    archGroup.add(crest);

    // Floating 3D Greeting Sign Ribbon
    this.createGreetingSign(archGroup);

    this.entranceGroup.add(archGroup);
  }

  createHangingLantern(parentGroup, x, y, z) {
    const lanternGroup = new THREE.Group();
    lanternGroup.position.set(x, y, z);

    // Metal Frame
    const frameMat = new THREE.MeshStandardMaterial({
      color: 0x2c2621,
      roughness: 0.4,
      metalness: 0.9
    });

    const capGeo = new THREE.ConeGeometry(0.35, 0.4, 6);
    const cap = new THREE.Mesh(capGeo, frameMat);
    cap.position.y = 0.35;
    lanternGroup.add(cap);

    // Glowing Crystal Core
    const glassGeo = new THREE.CylinderGeometry(0.22, 0.25, 0.5, 8);
    const glassMat = new THREE.MeshStandardMaterial({
      color: 0xffe6a3,
      emissive: 0xffd27d,
      emissiveIntensity: 1.6,
      transparent: true,
      opacity: 0.9
    });
    const glass = new THREE.Mesh(glassGeo, glassMat);
    lanternGroup.add(glass);

    // Point Light casting warm soft glow
    const pointLight = new THREE.PointLight(0xffc966, 1.2, 10, 2);
    pointLight.position.set(0, 0, 0);
    lanternGroup.add(pointLight);

    parentGroup.add(lanternGroup);
    this.animatedObjects.push({
      mesh: lanternGroup,
      baseY: y,
      speed: 1.5 + Math.random(),
      type: 'lanternSway'
    });
  }

  createGreetingSign(parentGroup) {
    // 3D Canvas-rendered luxury banner
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');

    // Gradient background
    const grad = ctx.createLinearGradient(0, 0, 1024, 256);
    grad.addColorStop(0, 'rgba(25, 20, 45, 0.95)');
    grad.addColorStop(0.5, 'rgba(45, 30, 75, 0.98)');
    grad.addColorStop(1, 'rgba(25, 20, 45, 0.95)');
    ctx.fillStyle = grad;
    ctx.roundRect(10, 10, 1004, 236, 30);
    ctx.fill();

    // Gold filigree border
    ctx.lineWidth = 6;
    ctx.strokeStyle = '#d4af37';
    ctx.stroke();

    ctx.lineWidth = 2;
    ctx.strokeStyle = '#fbcfe8';
    ctx.roundRect(24, 24, 976, 208, 22);
    ctx.stroke();

    // Text: Panda's Magical Birthday World
    ctx.textAlign = 'center';
    ctx.font = 'bold 50px "Cinzel Decorative", Georgia, serif';
    ctx.fillStyle = '#fce7f3';
    ctx.shadowColor = '#d4af37';
    ctx.shadowBlur = 15;
    ctx.fillText("PANDA'S MAGICAL REALM", 512, 105);

    // Subtitle: For Ashitha
    ctx.font = 'italic 34px "Playfair Display", serif';
    ctx.fillStyle = '#fef08a';
    ctx.shadowBlur = 8;
    ctx.fillText("Dedicated with Infinite Love to Ashitha 💖", 512, 175);

    const bannerTexture = new THREE.CanvasTexture(canvas);
    bannerTexture.anisotropy = 8;

    const bannerMat = new THREE.MeshStandardMaterial({
      map: bannerTexture,
      transparent: true,
      roughness: 0.4,
      metalness: 0.2
    });

    const bannerGeo = new THREE.PlaneGeometry(6.5, 1.4);
    const bannerMesh = new THREE.Mesh(bannerGeo, bannerMat);
    bannerMesh.position.set(0, 7.35, 0.75);
    parentGroup.add(bannerMesh);

    this.animatedObjects.push({
      mesh: bannerMesh,
      baseY: 7.35,
      type: 'gentleHover'
    });
  }

  initFoliage() {
    // Beautiful Cherry Blossom Trees flanking the entrance
    const treePositions = [
      { x: -9, z: -2, scale: 1.2 },
      { x: 9, z: -1, scale: 1.3 },
      { x: -14, z: 8, scale: 1.4 },
      { x: 13, z: 7, scale: 1.15 },
      { x: -18, z: -10, scale: 1.5 },
      { x: 17, z: -9, scale: 1.45 }
    ];

    treePositions.forEach((pos) => {
      this.createCherryBlossomTree(pos.x, pos.z, pos.scale);
    });
  }

  createCherryBlossomTree(x, z, scale) {
    const treeGroup = new THREE.Group();
    treeGroup.position.set(x, -0.8, z);
    treeGroup.scale.set(scale, scale, scale);

    // Trunk
    const trunkMat = new THREE.MeshStandardMaterial({
      color: 0x4a3224,
      roughness: 0.9,
      metalness: 0.05
    });

    const trunkGeo = new THREE.CylinderGeometry(0.35, 0.6, 4.5, 9);
    const trunk = new THREE.Mesh(trunkGeo, trunkMat);
    trunk.position.y = 2.2;
    trunk.castShadow = true;
    trunk.receiveShadow = true;
    treeGroup.add(trunk);

    // Branches
    const branchMat = trunkMat;
    for (let b = 0; b < 4; b++) {
      const branchGeo = new THREE.CylinderGeometry(0.15, 0.25, 2.2, 6);
      const branch = new THREE.Mesh(branchGeo, branchMat);
      const angle = (b / 4) * Math.PI * 2;
      branch.position.set(Math.cos(angle) * 0.8, 3.8, Math.sin(angle) * 0.8);
      branch.rotation.z = Math.cos(angle) * 0.6;
      branch.rotation.x = Math.sin(angle) * 0.6;
      branch.castShadow = true;
      treeGroup.add(branch);
    }

    // Lush Pink Blossom Clouds
    const blossomColors = [0xfbcfe8, 0xf472b6, 0xffe4e6];
    for (let c = 0; c < 6; c++) {
      const radius = 1.3 + Math.random() * 0.7;
      const canopyGeo = new THREE.DodecahedronGeometry(radius, 2);
      const canopyMat = new THREE.MeshStandardMaterial({
        color: blossomColors[c % blossomColors.length],
        roughness: 0.7,
        metalness: 0.05,
        flatShading: true
      });
      const canopy = new THREE.Mesh(canopyGeo, canopyMat);
      const angle = (c / 6) * Math.PI * 2;
      canopy.position.set(
        Math.cos(angle) * 1.5,
        4.8 + (c % 3) * 0.7,
        Math.sin(angle) * 1.5
      );
      canopy.castShadow = true;
      treeGroup.add(canopy);
    }

    this.entranceGroup.add(treeGroup);
    this.animatedObjects.push({
      mesh: treeGroup,
      baseRotZ: treeGroup.rotation.z,
      type: 'treeSway',
      seed: Math.random() * 5
    });
  }

  initFallingPetals() {
    const petalCount = 450;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(petalCount * 3);
    const scales = new Float32Array(petalCount);
    const speeds = new Float32Array(petalCount);

    for (let i = 0; i < petalCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 60;
      positions[i * 3 + 1] = 1 + Math.random() * 22;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 50;
      scales[i] = 0.15 + Math.random() * 0.2;
      speeds[i] = 0.5 + Math.random() * 0.8;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    // Custom circle / petal texture
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    const grad = ctx.createRadialGradient(32, 32, 4, 32, 32, 30);
    grad.addColorStop(0, '#ffffff');
    grad.addColorStop(0.4, '#fbcfe8');
    grad.addColorStop(0.9, '#f472b6');
    grad.addColorStop(1, 'rgba(244, 114, 182, 0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(32, 32, 28, 0, Math.PI * 2);
    ctx.fill();

    const petalTexture = new THREE.CanvasTexture(canvas);

    const material = new THREE.PointsMaterial({
      size: 0.5,
      map: petalTexture,
      transparent: true,
      opacity: 0.85,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });

    this.fallingPetals = new THREE.Points(geometry, material);
    this.scene.add(this.fallingPetals);
  }

  initFireflies() {
    const fireflyCount = 120;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(fireflyCount * 3);

    for (let i = 0; i < fireflyCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 45;
      positions[i * 3 + 1] = 0.5 + Math.random() * 8;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 40;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    const grad = ctx.createRadialGradient(32, 32, 2, 32, 32, 28);
    grad.addColorStop(0, '#ffffff');
    grad.addColorStop(0.3, '#fde047');
    grad.addColorStop(0.8, 'rgba(253, 224, 71, 0.4)');
    grad.addColorStop(1, 'rgba(253, 224, 71, 0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(32, 32, 28, 0, Math.PI * 2);
    ctx.fill();

    const fireflyTexture = new THREE.CanvasTexture(canvas);

    const material = new THREE.PointsMaterial({
      size: 0.6,
      map: fireflyTexture,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    this.fireflies = new THREE.Points(geometry, material);
    this.scene.add(this.fireflies);
  }

  update(deltaTime) {
    const time = this.clock.getElapsedTime();

    // Sway trees and lanterns
    this.animatedObjects.forEach((obj) => {
      if (obj.type === 'treeSway') {
        obj.mesh.rotation.z = Math.sin(time * 0.8 + obj.seed) * 0.025;
      } else if (obj.type === 'lanternSway') {
        obj.mesh.rotation.z = Math.sin(time * obj.speed) * 0.04;
      } else if (obj.type === 'gentleHover') {
        obj.mesh.position.y = obj.baseY + Math.sin(time * 1.4) * 0.08;
      }
    });

    // Animate falling petals
    if (this.fallingPetals) {
      const pos = this.fallingPetals.geometry.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        let y = pos.getY(i) - (0.6 + (i % 5) * 0.15) * deltaTime;
        let x = pos.getX(i) + Math.sin(time + i) * 0.4 * deltaTime;
        let z = pos.getZ(i) + Math.cos(time + i) * 0.3 * deltaTime;

        if (y < -0.8) {
          y = 18 + Math.random() * 4;
          x = (Math.random() - 0.5) * 50;
          z = (Math.random() - 0.5) * 45;
        }

        pos.setY(i, y);
        pos.setX(i, x);
        pos.setZ(i, z);
      }
      pos.needsUpdate = true;
    }

    // Animate fireflies drifting
    if (this.fireflies) {
      const pos = this.fireflies.geometry.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        let x = pos.getX(i) + Math.sin(time * 0.6 + i) * 0.25 * deltaTime;
        let y = pos.getY(i) + Math.cos(time * 0.8 + i) * 0.2 * deltaTime;
        let z = pos.getZ(i) + Math.sin(time * 0.5 + i * 2) * 0.25 * deltaTime;

        pos.setX(i, x);
        pos.setY(i, y);
        pos.setZ(i, z);
      }
      pos.needsUpdate = true;
    }
  }
}

window.Environment = Environment;
