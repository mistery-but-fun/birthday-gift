/**
 * Stage3_Door.js
 * Stage 3: Realistic Magical Ornate Double Door
 * High-detail PBR materials, procedural realistic wood grain & gold filigree,
 * raycasting hover highlight, realistic hinge rotation, and smooth camera flythrough.
 */
class Stage3_Door {
  constructor(stageManager) {
    this.stageManager = stageManager;
    this.scene = stageManager.scene;
    this.camera = stageManager.camera;
    this.container = document.getElementById('modal-container');

    this.doorGroup = null;
    this.leftPivot = null;
    this.rightPivot = null;
    this.doorMeshes = [];
    this.isOpen = false;
    this.isOpening = false;
    this.isHovered = false;

    this.seamGlow = null;
    this.lightShaft = null;
    this.doorParticles = null;

    // Raycasting
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();

    this.onPointerMove = this.onPointerMove.bind(this);
    this.onPointerClick = this.onPointerClick.bind(this);
  }

  enter() {
    this.stageManager.updateTracker(3);

    // Build the 3D Door if not yet created
    if (!this.doorGroup) {
      this.buildRealisticDoor();
    } else {
      this.doorGroup.visible = true;
    }

    // Set up cinematic camera framing looking straight at the magnificent door
    if (this.stageManager.controls) {
      this.stageManager.controls.target.set(0, 3.2, -4.0);
    }

    gsap.to(this.camera.position, {
      x: 0,
      y: 3.2,
      z: 5.5,
      duration: 2.2,
      ease: "power2.out"
    });

    // Render Stage 3 HUD prompt
    this.renderPrompt();

    // Attach raycasting event listeners
    window.addEventListener('pointermove', this.onPointerMove);
    window.addEventListener('click', this.onPointerClick);
  }

  renderPrompt() {
    this.container.innerHTML = `
      <div id="door-hud-card" class="glass-card interactive" style="max-width: 480px; padding: 26px 32px; animation: card-appear 0.8s ease;">
        <div class="card-tag">🚪 Stage 3 • The Gate of Destiny</div>
        <h2 class="card-title" style="font-size: 26px;">The Ancient <span class="glow">Magical Door</span></h2>
        <p class="card-description" style="margin-bottom: 20px; font-size: 14px;">
          The secret riddle has unlocked the threshold. 
          Step forward and click the ornate wooden door to open the gateway to the nature realm.
        </p>
        <div class="card-actions">
          <button id="btn-open-door-manual" class="btn-primary" style="padding: 12px 28px; font-size: 14px;">
            <span>✨</span> <span>Open The Door</span>
          </button>
        </div>
      </div>
    `;

    document.getElementById('btn-open-door-manual').addEventListener('click', () => {
      this.openDoor();
    });
  }

  buildRealisticDoor() {
    this.doorGroup = new THREE.Group();
    this.doorGroup.position.set(0, 0, -4.0);

    // 1. Procedural Wood Grain & Bump Textures
    const woodTexture = this.generateWoodTexture();
    const woodBumpMap = this.generateWoodBumpMap();
    const goldFiligreeTex = this.generateGoldFiligreeTexture();

    // Materials
    this.woodMaterial = new THREE.MeshStandardMaterial({
      map: woodTexture,
      bumpMap: woodBumpMap,
      bumpScale: 0.05,
      roughness: 0.68,
      metalness: 0.08,
      color: 0x6e472a
    });

    this.goldMaterial = new THREE.MeshStandardMaterial({
      color: 0xd4af37,
      roughness: 0.28,
      metalness: 0.88,
      emissive: 0x3d2b00,
      emissiveIntensity: 0.2
    });

    this.ironMaterial = new THREE.MeshStandardMaterial({
      color: 0x222222,
      roughness: 0.5,
      metalness: 0.8
    });

    const stoneTrimMat = new THREE.MeshStandardMaterial({
      color: 0xd9cebe,
      roughness: 0.8,
      metalness: 0.1
    });

    // 2. Heavy Stone Doorway Frame & Threshold
    const frameDepth = 0.8;
    const frameWidth = 6.4;
    const frameHeight = 7.0;

    // Left Jamb
    const leftJambGeo = new THREE.BoxGeometry(0.5, frameHeight, frameDepth);
    const leftJamb = new THREE.Mesh(leftJambGeo, stoneTrimMat);
    leftJamb.position.set(-2.95, frameHeight / 2 - 0.5, 0);
    leftJamb.castShadow = true;
    leftJamb.receiveShadow = true;
    this.doorGroup.add(leftJamb);

    // Right Jamb
    const rightJamb = leftJamb.clone();
    rightJamb.position.set(2.95, frameHeight / 2 - 0.5, 0);
    this.doorGroup.add(rightJamb);

    // Top Lintel
    const lintelGeo = new THREE.BoxGeometry(frameWidth + 0.6, 0.65, frameDepth + 0.1);
    const lintel = new THREE.Mesh(lintelGeo, stoneTrimMat);
    lintel.position.set(0, frameHeight - 0.45, 0);
    lintel.castShadow = true;
    lintel.receiveShadow = true;
    this.doorGroup.add(lintel);

    // Stone Threshold (Sill)
    const sillGeo = new THREE.BoxGeometry(frameWidth + 0.4, 0.35, frameDepth + 0.3);
    const sill = new THREE.Mesh(sillGeo, stoneTrimMat);
    sill.position.set(0, -0.65, 0);
    sill.receiveShadow = true;
    this.doorGroup.add(sill);

    // Arch Keystones
    const keystoneGeo = new THREE.BoxGeometry(0.8, 0.9, frameDepth + 0.2);
    const keystone = new THREE.Mesh(keystoneGeo, this.goldMaterial);
    keystone.position.set(0, frameHeight - 0.4, 0.05);
    keystone.castShadow = true;
    this.doorGroup.add(keystone);

    // 3. Double Doors (Left & Right Pivots)
    const doorLeafWidth = 2.7;
    const doorLeafHeight = 6.3;
    const doorLeafDepth = 0.22;

    // LEFT DOOR PIVOT (Pivot positioned at left hinge: x = -2.7)
    this.leftPivot = new THREE.Group();
    this.leftPivot.position.set(-2.7, 0, 0);

    const leftLeaf = this.createDoorLeaf(doorLeafWidth, doorLeafHeight, doorLeafDepth, goldFiligreeTex, true);
    leftLeaf.position.set(doorLeafWidth / 2, doorLeafHeight / 2 - 0.5, 0);
    this.leftPivot.add(leftLeaf);
    this.doorGroup.add(this.leftPivot);

    // RIGHT DOOR PIVOT (Pivot positioned at right hinge: x = +2.7)
    this.rightPivot = new THREE.Group();
    this.rightPivot.position.set(2.7, 0, 0);

    const rightLeaf = this.createDoorLeaf(doorLeafWidth, doorLeafHeight, doorLeafDepth, goldFiligreeTex, false);
    rightLeaf.position.set(-doorLeafWidth / 2, doorLeafHeight / 2 - 0.5, 0);
    this.rightPivot.add(rightLeaf);
    this.doorGroup.add(this.rightPivot);

    // 4. Magical Seam Glow (Warm light radiating between panels)
    const seamGeo = new THREE.PlaneGeometry(0.12, 6.2);
    const seamMat = new THREE.MeshBasicMaterial({
      color: 0xffd166,
      transparent: true,
      opacity: 0.75,
      side: THREE.DoubleSide
    });
    this.seamGlow = new THREE.Mesh(seamGeo, seamMat);
    this.seamGlow.position.set(0, 2.65, 0.12);
    this.doorGroup.add(this.seamGlow);

    // Point Light at center seam
    this.doorLight = new THREE.PointLight(0xffbe3b, 1.4, 8, 2);
    this.doorLight.position.set(0, 2.8, 0.5);
    this.doorGroup.add(this.doorLight);

    // Add to main scene
    this.scene.add(this.doorGroup);
  }

  createDoorLeaf(width, height, depth, filigreeTex, isLeft) {
    const leafGroup = new THREE.Group();

    // Main Wooden Slab
    const slabGeo = new THREE.BoxGeometry(width, height, depth);
    const slab = new THREE.Mesh(slabGeo, this.woodMaterial);
    slab.castShadow = true;
    slab.receiveShadow = true;
    leafGroup.add(slab);
    this.doorMeshes.push(slab);

    // Recessed Ornamental Panels (Upper & Lower)
    const panelCols = 1;
    const panelRows = 3;
    const pW = width * 0.72;
    const pH = height * 0.24;

    for (let r = 0; r < panelRows; r++) {
      const pY = (r - 1) * (pH + 0.35);

      // Inset wood frame
      const frameGeo = new THREE.BoxGeometry(pW + 0.08, pH + 0.08, 0.05);
      const frameMesh = new THREE.Mesh(frameGeo, this.goldMaterial);
      frameMesh.position.set(0, pY, depth / 2 + 0.02);
      leafGroup.add(frameMesh);
      this.doorMeshes.push(frameMesh);

      // Gold Filigree Inlay Plate
      const inlayGeo = new THREE.PlaneGeometry(pW, pH);
      const inlayMat = new THREE.MeshStandardMaterial({
        map: filigreeTex,
        transparent: true,
        roughness: 0.3,
        metalness: 0.85,
        color: 0xffd700
      });
      const inlayMesh = new THREE.Mesh(inlayGeo, inlayMat);
      inlayMesh.position.set(0, pY, depth / 2 + 0.05);
      leafGroup.add(inlayMesh);
    }

    // Heavy Forged Hinges (3 per door on hinge side)
    const hingeX = isLeft ? -width / 2 + 0.15 : width / 2 - 0.15;
    [-2.2, 0, 2.2].forEach(hY => {
      const strapGeo = new THREE.BoxGeometry(width * 0.45, 0.18, 0.06);
      const strap = new THREE.Mesh(strapGeo, this.ironMaterial);
      const strapOffsetX = isLeft ? hingeX + (width * 0.45) / 2 : hingeX - (width * 0.45) / 2;
      strap.position.set(strapOffsetX, hY, depth / 2 + 0.03);
      strap.castShadow = true;
      leafGroup.add(strap);

      // Hinge Cylinder Knuckle
      const knuckleGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.26, 12);
      const knuckle = new THREE.Mesh(knuckleGeo, this.ironMaterial);
      knuckle.position.set(hingeX, hY, depth / 2 + 0.04);
      leafGroup.add(knuckle);
    });

    // Ornate Golden Door Handle / Ring Knocker (Placed near center seam)
    const handleX = isLeft ? width / 2 - 0.35 : -width / 2 + 0.35;
    const handleY = 0;

    // Escutcheon Backplate
    const plateGeo = new THREE.CylinderGeometry(0.24, 0.28, 0.06, 16);
    const plate = new THREE.Mesh(plateGeo, this.goldMaterial);
    plate.rotation.x = Math.PI / 2;
    plate.position.set(handleX, handleY, depth / 2 + 0.04);
    plate.castShadow = true;
    leafGroup.add(plate);
    this.doorMeshes.push(plate);

    // Hanging Gold Torus Ring
    const ringGeo = new THREE.TorusGeometry(0.18, 0.04, 12, 24);
    const ring = new THREE.Mesh(ringGeo, this.goldMaterial);
    ring.position.set(handleX, handleY - 0.14, depth / 2 + 0.09);
    ring.castShadow = true;
    leafGroup.add(ring);
    this.doorMeshes.push(ring);

    return leafGroup;
  }

  generateWoodTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');

    // Base rich oak gradient
    const grad = ctx.createLinearGradient(0, 0, 1024, 0);
    grad.addColorStop(0, '#3e2415');
    grad.addColorStop(0.3, '#5c381e');
    grad.addColorStop(0.7, '#4a2c16');
    grad.addColorStop(1, '#3a2012');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1024, 1024);

    // Realistic vertical grain fibers
    ctx.lineWidth = 1;
    for (let i = 0; i < 900; i++) {
      const x = Math.random() * 1024;
      const alpha = 0.08 + Math.random() * 0.18;
      ctx.strokeStyle = Math.random() > 0.5 ? `rgba(25, 12, 5, ${alpha})` : `rgba(110, 70, 40, ${alpha})`;
      ctx.beginPath();
      let currentX = x;
      ctx.moveTo(currentX, 0);
      for (let y = 0; y < 1024; y += 40) {
        currentX += (Math.random() - 0.5) * 3;
        ctx.lineTo(currentX, y);
      }
      ctx.stroke();
    }

    // 4 Vertical Plank Grooves
    const plankWidth = 1024 / 4;
    for (let p = 1; p < 4; p++) {
      const px = p * plankWidth;
      ctx.fillStyle = 'rgba(10, 5, 2, 0.75)';
      ctx.fillRect(px - 3, 0, 6, 1024);

      // Light bevel edge
      ctx.fillStyle = 'rgba(130, 90, 55, 0.4)';
      ctx.fillRect(px + 3, 0, 2, 1024);
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.anisotropy = 8;
    return texture;
  }

  generateWoodBumpMap() {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#808080';
    ctx.fillRect(0, 0, 512, 512);

    // Bump fibers
    for (let i = 0; i < 400; i++) {
      const x = Math.random() * 512;
      ctx.strokeStyle = Math.random() > 0.5 ? '#a0a0a0' : '#606060';
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x + (Math.random() - 0.5) * 6, 512);
      ctx.stroke();
    }

    // Plank grooves
    for (let p = 1; p < 4; p++) {
      const px = p * (512 / 4);
      ctx.fillStyle = '#101010';
      ctx.fillRect(px - 2, 0, 4, 512);
    }

    return new THREE.CanvasTexture(canvas);
  }

  generateGoldFiligreeTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');

    ctx.clearRect(0, 0, 512, 256);

    // Ornate gold floral scrolls
    ctx.strokeStyle = '#ffd700';
    ctx.lineWidth = 3;
    ctx.shadowColor = '#d4af37';
    ctx.shadowBlur = 8;

    // Corner rosettes
    ctx.strokeRect(12, 12, 488, 232);
    ctx.strokeRect(20, 20, 472, 216);

    // Center floral medallion
    ctx.beginPath();
    ctx.arc(256, 128, 48, 0, Math.PI * 2);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(256, 128, 24, 0, Math.PI * 2);
    ctx.stroke();

    // Symmetrical curlicues
    ctx.beginPath();
    ctx.moveTo(100, 128);
    ctx.bezierCurveTo(150, 80, 200, 160, 256, 128);
    ctx.bezierCurveTo(312, 96, 362, 176, 412, 128);
    ctx.stroke();

    return new THREE.CanvasTexture(canvas);
  }

  onPointerMove(event) {
    if (this.isOpen || this.isOpening) return;

    this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObjects(this.doorMeshes, true);

    if (intersects.length > 0) {
      if (!this.isHovered) {
        this.isHovered = true;
        document.body.style.cursor = 'pointer';
        this.setHoverHighlight(true);
      }
    } else {
      if (this.isHovered) {
        this.isHovered = false;
        document.body.style.cursor = 'default';
        this.setHoverHighlight(false);
      }
    }
  }

  setHoverHighlight(hovered) {
    if (this.woodMaterial) {
      gsap.to(this.woodMaterial.color, {
        r: hovered ? 0.55 : 0.43,
        g: hovered ? 0.38 : 0.28,
        b: hovered ? 0.22 : 0.16,
        duration: 0.3
      });
    }
    if (this.doorLight) {
      gsap.to(this.doorLight, {
        intensity: hovered ? 2.4 : 1.4,
        duration: 0.3
      });
    }
  }

  onPointerClick(event) {
    if (this.isOpen || this.isOpening) return;

    // Check if clicked the interactive HUD button or raycasted on the door
    this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObjects(this.doorMeshes, true);

    if (intersects.length > 0) {
      this.openDoor();
    }
  }

  openDoor() {
    if (this.isOpen || this.isOpening) return;
    this.isOpening = true;
    document.body.style.cursor = 'default';

    // Remove event listeners
    window.removeEventListener('pointermove', this.onPointerMove);
    window.removeEventListener('click', this.onPointerClick);

    // Audio SFX
    window.audioManager.playDeepResonance();
    setTimeout(() => {
      window.audioManager.playMagicHarp();
    }, 800);

    // Confetti / golden sparks
    if (window.confetti) {
      window.confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.5 },
        colors: ['#ffd700', '#fbcfe8', '#ffffff', '#e0a96d']
      });
    }

    // Fade out HUD card
    const card = document.getElementById('door-hud-card');
    if (card) {
      gsap.to(card, {
        opacity: 0,
        y: -30,
        duration: 0.6,
        onComplete: () => {
          this.container.innerHTML = '';
        }
      });
    }

    // Golden light surge
    if (this.doorLight) {
      gsap.to(this.doorLight, {
        intensity: 5.0,
        distance: 20,
        duration: 1.5,
        ease: "power2.in"
      });
    }

    if (this.seamGlow) {
      gsap.to(this.seamGlow.scale, {
        x: 18,
        duration: 2.0,
        ease: "power2.out"
      });
      gsap.to(this.seamGlow.material, {
        opacity: 0,
        duration: 3.0,
        delay: 0.5
      });
    }

    // Smooth realistic door opening animation
    // Left door rotates inwards (negative Y)
    gsap.to(this.leftPivot.rotation, {
      y: -Math.PI * 0.60, // -108 degrees
      duration: 3.6,
      ease: "power2.inOut"
    });

    // Right door rotates inwards (positive Y)
    gsap.to(this.rightPivot.rotation, {
      y: Math.PI * 0.60, // +108 degrees
      duration: 3.6,
      ease: "power2.inOut"
    });

    // Camera flythrough smoothly traversing through the open doorway toward the nature world
    gsap.to(this.camera.position, {
      x: 0,
      y: 3.0,
      z: -9.5, // Fly completely past the doorway (z = -4) into the nature realm
      duration: 4.8,
      delay: 0.8,
      ease: "power2.inOut",
      onUpdate: () => {
        if (this.stageManager.controls) {
          this.stageManager.controls.target.set(0, 2.8, -20);
        }
      },
      onComplete: () => {
        this.isOpen = true;
        this.isOpening = false;
        this.onDoorOpened();
      }
    });
  }

  onDoorOpened() {
    this.stageManager.goToStage(4);
  }
}

window.Stage3_Door = Stage3_Door;
