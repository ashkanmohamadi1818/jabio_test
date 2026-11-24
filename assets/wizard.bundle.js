/* Jabio 3D WebGL Character Rig — "Aether Core" (هسته هولوگرافیک پیشرفته هوش مکانی)
   A stunning, high-end futuristic 3D holographic energy orb and floating gyro-ring core
   inspired by high-end spatial computing and AI navigation, with smooth spring physics and neon PBR shaders. */
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

const clamp = (x, lo, hi) => Math.max(lo, Math.min(hi, x));
const lerp = (a, b, t) => a + (b - a) * t;

class Spring {
  constructor(value = 0, frequency = 12) {
    this.value = value;
    this.velocity = 0;
    this.frequency = frequency;
  }
  step(target, dt, immediate = false) {
    if (immediate) {
      this.value = target;
      this.velocity = 0;
      return this.value;
    }
    const delta = clamp(dt, 0, 0.04);
    const offset = this.value - target;
    const c = this.velocity + this.frequency * offset;
    const att = Math.exp(-this.frequency * delta);
    this.value = target + (offset + c * delta) * att;
    this.velocity = (this.velocity - this.frequency * c * delta) * att;
    if (Math.abs(this.value - target) < 0.0001 && Math.abs(this.velocity) < 0.001) {
      this.value = target;
      this.velocity = 0;
    }
    return this.value;
  }
}

function buildCharacterRig(rimClipPlane) {
  const disposables = [];
  const trackGeo = (g) => { disposables.push(g); return g; };
  const trackMat = (m) => { disposables.push(m); return m; };

  // High-End Futuristic Holographic Shader Materials
  const coreMat = trackMat(new THREE.MeshPhysicalMaterial({
    color: 0x112233,
    roughness: 0.1,
    metalness: 0.8,
    transmission: 0.6,
    thickness: 1.2,
    clearcoat: 1.0,
    clearcoatRoughness: 0.1,
    clippingPlanes: [rimClipPlane],
  }));

  const ringMat = trackMat(new THREE.MeshStandardMaterial({
    color: 0x39BFC2,
    roughness: 0.2,
    metalness: 0.9,
    wireframe: false,
    clippingPlanes: [rimClipPlane],
  }));

  const glowMat = trackMat(new THREE.MeshStandardMaterial({
    color: 0xACF7F0,
    emissive: new THREE.Color(0x39BFC2),
    emissiveIntensity: 2.5,
    roughness: 0.1,
    metalness: 0.2,
    clippingPlanes: [rimClipPlane],
  }));

  const root = new THREE.Group();
  const coreGroup = new THREE.Group();
  root.add(coreGroup);

  // Central Prismatic Crystal Core (Icosahedron)
  const crystalGeo = trackGeo(new THREE.IcosahedronGeometry(0.48, 0));
  const crystalMesh = new THREE.Mesh(crystalGeo, coreMat);
  coreGroup.add(crystalMesh);

  // Inner Glowing Core Sphere
  const innerGeo = trackGeo(new THREE.SphereGeometry(0.24, 32, 32));
  const innerMesh = new THREE.Mesh(innerGeo, glowMat);
  coreGroup.add(innerMesh);

  // Outer Gyroscopic Orbital Rings
  const ring1Geo = trackGeo(new THREE.TorusGeometry(0.72, 0.025, 16, 64));
  const ring1 = new THREE.Mesh(ring1Geo, ringMat);
  ring1.rotation.x = Math.PI / 3;
  coreGroup.add(ring1);

  const ring2Geo = trackGeo(new THREE.TorusGeometry(0.88, 0.018, 16, 64));
  const ring2 = new THREE.Mesh(ring2Geo, ringMat);
  ring2.rotation.y = Math.PI / 4;
  coreGroup.add(ring2);

  // Floating energy nodes along orbits
  const nodeGeo = trackGeo(new THREE.SphereGeometry(0.05, 16, 16));
  const node1 = new THREE.Mesh(nodeGeo, glowMat);
  node1.position.set(0.72, 0, 0);
  ring1.add(node1);

  const node2 = new THREE.Mesh(nodeGeo, glowMat);
  node2.position.set(0, 0.88, 0);
  ring2.add(node2);

  return {
    root,
    coreGroup,
    crystalMesh,
    ring1,
    ring2,
    glowMat,
    dispose: () => {
      disposables.forEach((d) => {
        if (d && typeof d.dispose === 'function') d.dispose();
      });
    },
  };
}

export function wizardMarkup() {
  return '<div style="width:100%;height:100%"></div>';
}

export function mountWizard(hostEl) {
  const container = hostEl.querySelector('.wizard-rig');
  if (!container) return () => {};

  const width = 196;
  const height = 140;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(36, width / height, 0.1, 20);
  camera.position.set(0, 0, 3.5);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.localClippingEnabled = true;
  container.appendChild(renderer.domElement);

  const pmremGenerator = new THREE.PMREMGenerator(renderer);
  pmremGenerator.compileEquirectangularShader();
  const roomScene = new RoomEnvironment();
  const envRT = pmremGenerator.fromScene(roomScene);
  scene.environment = envRT.texture;

  const rimClipPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0.35);
  const coreBot = buildCharacterRig(rimClipPlane);
  scene.add(coreBot.root);

  const ambient = new THREE.AmbientLight(0xffffff, 1.4);
  scene.add(ambient);

  const keyLight = new THREE.DirectionalLight(0xffffff, 2.5);
  keyLight.position.set(2, 4, 3);
  scene.add(keyLight);

  const fillLight = new THREE.DirectionalLight(0x39BFC2, 2.0);
  fillLight.position.set(-3, -1, 2);
  scene.add(fillLight);

  const emailInput = hostEl.querySelector('#email');
  const passwordInput = hostEl.querySelector('#password');

  let pointerX = 0;
  let pointerY = 0;
  let pointerInside = false;

  const onPointerMove = (e) => {
    const rect = container.getBoundingClientRect();
    const nx = (e.clientX - rect.left) / rect.width;
    const ny = (e.clientY - rect.top) / rect.height;
    pointerX = clamp(nx * 2 - 1, -1, 1);
    pointerY = clamp(-(ny * 2 - 1), -1, 1);
  };

  const onPointerEnter = () => { pointerInside = true; };
  const onPointerLeave = () => {
    pointerInside = false;
    pointerX = 0;
    pointerY = 0;
  };

  container.addEventListener('pointermove', onPointerMove);
  container.addEventListener('pointerenter', onPointerEnter);
  container.addEventListener('pointerleave', onPointerLeave);

  const lookXSpring = new Spring(0, 10);
  const lookYSpring = new Spring(0, 10);

  let clock = new THREE.Clock();
  let frameId = null;
  let contextLost = false;

  renderer.domElement.addEventListener('webglcontextlost', (e) => {
    e.preventDefault();
    contextLost = true;
  }, false);

  renderer.domElement.addEventListener('webglcontextrestored', () => {
    contextLost = false;
  }, false);

  function tick() {
    const dt = clock.getDelta();
    const now = clock.getElapsedTime();

    const activeField = document.activeElement;
    const typing = activeField === emailInput || activeField === passwordInput;

    const xTarget = pointerInside ? pointerX * 0.8 : 0;
    const yTarget = pointerInside ? pointerY * 0.8 : 0;

    const lx = lookXSpring.step(xTarget, dt, false);
    const ly = lookYSpring.step(yTarget, dt, false);

    // Smooth floating & rotation animation
    coreBot.coreGroup.position.x = lx * 0.3;
    coreBot.coreGroup.position.y = ly * 0.3 + Math.sin(now * 2.2) * 0.08;

    coreBot.crystalMesh.rotation.x += dt * (typing ? 2.5 : 1.0);
    coreBot.crystalMesh.rotation.y += dt * (typing ? 3.0 : 1.2);

    coreBot.ring1.rotation.z += dt * 1.5;
    coreBot.ring2.rotation.x -= dt * 1.8;

    coreBot.glowMat.emissiveIntensity = 2.0 + Math.sin(now * 5.0) * (typing ? 1.5 : 0.6);

    if (!contextLost) {
      renderer.render(scene, camera);
    }
    frameId = requestAnimationFrame(tick);
  }

  frameId = requestAnimationFrame(tick);

  return () => {
    cancelAnimationFrame(frameId);
    container.removeEventListener('pointermove', onPointerMove);
    container.removeEventListener('pointerenter', onPointerEnter);
    container.removeEventListener('pointerleave', onPointerLeave);
    if (coreBot) coreBot.dispose();
    if (envRT) envRT.dispose();
    if (renderer) renderer.dispose();
  };
}

window.LRWizard = { wizardMarkup, mountWizard };
