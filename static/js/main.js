/**
 * main.js
 * Core Three.js render loop, camera setup, post-processing/tone mapping,
 * and lifecycle manager for Panda's Magical Birthday World.
 */

let scene, camera, renderer, controls, environment, stageManager;

function init() {
  const container = document.getElementById('webgl-canvas-container');

  // 1. Scene
  scene = new THREE.Scene();

  // 2. Camera (Cinematic perspective)
  const aspect = window.innerWidth / window.innerHeight;
  camera = new THREE.PerspectiveCamera(55, aspect, 0.1, 1000);
  camera.position.set(0, 3.5, 12);

  // 3. Renderer with high-end PBR settings
  renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: false,
    powerPreference: "high-performance"
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;
  renderer.outputEncoding = THREE.sRGBEncoding;

  container.appendChild(renderer.domElement);

  // 4. Orbit Controls
  if (THREE.OrbitControls) {
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2 - 0.05; // Keep camera above ground
    controls.minDistance = 2.5;
    controls.maxDistance = 45;
    controls.target.set(0, 3.5, -4);
  }

  // 5. Build Environment
  environment = new Environment(scene);

  // 6. Initialize Stage Manager
  stageManager = new StageManager(scene, camera, renderer, controls);
  window.stageManager = stageManager;

  // 7. Event Listeners
  window.addEventListener('resize', onWindowResize);

  // Hide initial loading screen if present
  const loader = document.getElementById('loading-screen');
  if (loader) {
    setTimeout(() => {
      loader.style.opacity = '0';
      setTimeout(() => loader.style.display = 'none', 800);
    }, 400);
  }

  // Start Stage 1
  stageManager.start();

  // 8. Start Loop
  animate();
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);

  const deltaTime = clock.getDelta();

  if (controls) {
    controls.update();
  }

  if (environment) {
    environment.update(deltaTime);
  }

  if (stageManager) {
    stageManager.update(deltaTime);
  }

  renderer.render(scene, camera);
}

// Boot up once DOM is ready
window.addEventListener('DOMContentLoaded', () => {
  init();
});
