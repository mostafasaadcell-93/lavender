/* Lavender Lounge — 3D hero: a martini glass that pours itself, a lavender sprig on the rim,
   floating 3D lavender and drifting pollen. Three.js (bundled locally in assets/vendor). */
import * as THREE from 'three';
import { RoomEnvironment } from './assets/vendor/RoomEnvironment.js';

const host = document.getElementById('stage3d');
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

function fail() { document.documentElement.classList.add('no3d'); }

let renderer;
try {
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
  if (!renderer.getContext()) throw new Error('no gl');
} catch (e) { fail(); throw e; }

renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.75));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;
renderer.outputColorSpace = THREE.SRGBColorSpace;
host.appendChild(renderer.domElement);

const scene = new THREE.Scene();
const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

const camera = new THREE.PerspectiveCamera(28, 1, 0.1, 100);

/* ---------- lights ---------- */
scene.add(new THREE.HemisphereLight(0xf6f0ff, 0x8a76a8, 0.9));
const key = new THREE.DirectionalLight(0xfff3e6, 2.2); key.position.set(4, 7, 5); scene.add(key);
const rim = new THREE.DirectionalLight(0xb79cff, 2.4); rim.position.set(-5, 3, -4); scene.add(rim);

const world = new THREE.Group(); scene.add(world);
const glassGroup = new THREE.Group(); world.add(glassGroup);

/* ---------- martini glass (lathe, real thickness) ---------- */
const BOWL_Y0 = 1.56, BOWL_Y1 = 2.9, BOWL_R0 = 0.1, BOWL_R1 = 1.32;
const innerR = y => BOWL_R0 + (y - BOWL_Y0) * (BOWL_R1 - BOWL_R0) / (BOWL_Y1 - BOWL_Y0);
const prof = [
  [0, 0], [0.86, 0], [0.92, 0.025], [0.9, 0.06], [0.55, 0.085], [0.2, 0.12], [0.085, 0.2],
  [0.062, 0.5], [0.058, 1.0], [0.07, 1.3], [0.11, 1.42], [0.2, 1.5], [0.6, 1.95], [1.0, 2.43], [1.37, 2.9], [1.385, 2.925],
  [1.36, 2.935], [BOWL_R1, 2.9], [innerR(2.4), 2.4], [innerR(1.9), 1.9], [0.12, BOWL_Y0 + 0.02], [0, BOWL_Y0],
].map(([x, y]) => new THREE.Vector2(x, y));
/* glass = clear reflective body + fresnel edge glow (works on every GPU, no transmission pass) */
const glassGeo = new THREE.LatheGeometry(prof, 96);
const glassMat = new THREE.MeshPhysicalMaterial({
  color: 0xffffff, metalness: 0, roughness: 0.02, transparent: true, opacity: 0.16, depthWrite: false,
  envMapIntensity: 2.4, clearcoat: 1, clearcoatRoughness: 0, specularIntensity: 1, side: THREE.DoubleSide,
});
const fresnelMat = new THREE.ShaderMaterial({
  transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.FrontSide,
  uniforms: { uColor: { value: new THREE.Color(0xf4ecff) }, uPow: { value: 2.6 }, uStr: { value: 0.95 } },
  vertexShader: `varying vec3 vN; varying vec3 vV;
    void main(){ vec4 mv = modelViewMatrix * vec4(position,1.0); vN = normalize(normalMatrix * normal); vV = normalize(-mv.xyz); gl_Position = projectionMatrix * mv; }`,
  fragmentShader: `uniform vec3 uColor; uniform float uPow; uniform float uStr; varying vec3 vN; varying vec3 vV;
    void main(){ float f = pow(1.0 - abs(dot(normalize(vN), normalize(vV))), uPow); gl_FragColor = vec4(uColor * f * uStr, f * uStr); }`,
});
const glass = new THREE.Mesh(glassGeo, glassMat); glass.renderOrder = 2;
const glassEdge = new THREE.Mesh(glassGeo, fresnelMat); glassEdge.renderOrder = 3;
glassGroup.add(glass, glassEdge);
/* a thin bright rim line, like light catching the lip */
const lip = new THREE.Mesh(new THREE.TorusGeometry(1.372, 0.012, 8, 128), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.85 }));
lip.rotation.x = Math.PI / 2; lip.position.y = 2.928; glassGroup.add(lip);

/* ---------- liquid: a cone sharing the bowl's apex, so a uniform scale = fill level ---------- */
const FULL = 2.72;
const liqProf = [new THREE.Vector2(0, 0)];
for (let i = 1; i <= 12; i++) { const y = BOWL_Y0 + (FULL - BOWL_Y0) * i / 12; liqProf.push(new THREE.Vector2(innerR(y) - 0.025, y - BOWL_Y0)); }
liqProf.push(new THREE.Vector2(0, FULL - BOWL_Y0));
const liqMat = new THREE.MeshPhysicalMaterial({ color: 0x8a63cf, roughness: 0.12, metalness: 0, clearcoat: 1, clearcoatRoughness: 0.05, sheen: 0.6, sheenColor: new THREE.Color(0xe4d6ff), emissive: 0x3a1c6e, emissiveIntensity: 0.45 });
const liquid = new THREE.Mesh(new THREE.LatheGeometry(liqProf, 72), liqMat); liquid.renderOrder = 1;
const liquidPivot = new THREE.Group(); liquidPivot.position.y = BOWL_Y0; liquidPivot.add(liquid); glassGroup.add(liquidPivot);

/* surface shimmer ring */
const shimmer = new THREE.Mesh(new THREE.RingGeometry(0.2, innerR(FULL) - 0.04, 64), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.12, side: THREE.DoubleSide }));
shimmer.rotation.x = -Math.PI / 2; shimmer.position.y = FULL - BOWL_Y0 + 0.002; liquid.add(shimmer);

/* pour stream */
const streamMat = liqMat.clone(); streamMat.transparent = true; streamMat.opacity = 0.95;
const stream = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.06, 1, 16, 1, true), streamMat);
stream.visible = false; glassGroup.add(stream);

/* ---------- lavender sprig (stem + whorls of buds) ---------- */
const budGeo = new THREE.SphereGeometry(1, 10, 8);
const PURPLES = [0x7d5bb5, 0x8d69c4, 0x6c4ea6, 0x9a7ad0, 0x5f4498];
function sprig(len = 2.2, seed = 1) {
  let s = seed * 9301 + 49297; const rnd = () => ((s = (s * 9301 + 49297) % 233280) / 233280);
  const g = new THREE.Group();
  const curve = new THREE.CatmullRomCurve3([new THREE.Vector3(0, 0, 0), new THREE.Vector3(0.05, len * 0.35, 0.02), new THREE.Vector3(-0.04, len * 0.7, -0.02), new THREE.Vector3(0.02, len, 0)]);
  g.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 24, 0.018, 6), new THREE.MeshStandardMaterial({ color: 0x7c8a68, roughness: 0.8 })));
  const n = 46, mesh = new THREE.InstancedMesh(budGeo, new THREE.MeshStandardMaterial({ roughness: 0.55, metalness: 0 }), n);
  const m = new THREE.Matrix4(), q = new THREE.Quaternion(), sc = new THREE.Vector3(), pos = new THREE.Vector3(), col = new THREE.Color();
  for (let i = 0; i < n; i++) {
    const t = 0.52 + 0.48 * (i / n); const p = curve.getPoint(t);
    const whorl = Math.floor(i / 4), a = (i % 4) * Math.PI / 2 + whorl * 0.7 + rnd() * 0.4;
    const rr = 0.045 + 0.02 * (1 - t);
    pos.set(p.x + Math.cos(a) * rr, p.y + rnd() * 0.03, p.z + Math.sin(a) * rr);
    const size = 0.034 + rnd() * 0.016 - (t - 0.5) * 0.02;
    sc.set(size, size * 1.45, size); q.setFromEuler(new THREE.Euler(rnd() * 0.6, a, Math.cos(a) * 0.5));
    m.compose(pos, q, sc); mesh.setMatrixAt(i, m); mesh.setColorAt(i, col.setHex(PURPLES[i % PURPLES.length]));
  }
  g.add(mesh);
  return g;
}
const garnish = sprig(2.1, 7);
garnish.position.set(0.95, 2.6, 0.25); garnish.rotation.set(0.15, 0, -0.95);
glassGroup.add(garnish);

/* floating sprigs around the glass */
const floaters = [];
const FL = [[-1.9, 4.3, -1.2, 0.7], [2.7, 3.4, -1.8, 0.7], [-1.7, 0.2, 0.6, 0.5], [2.4, 0.9, 0.2, 0.6], [-3.0, 2.4, -3.2, 0.6], [3.3, 1.8, -2.8, 0.85]];
FL.forEach(([x, y, z, s], i) => {
  const f = sprig(1.6, i + 3); f.scale.setScalar(s); f.position.set(x, y, z);
  f.rotation.set(Math.random() * 1.2 - 0.6, Math.random() * Math.PI, Math.random() * 1.6 - 0.8);
  f.userData = { base: f.position.clone(), rot: f.rotation.clone(), ph: Math.random() * 6.28, sp: 0.4 + Math.random() * 0.5 };
  world.add(f); floaters.push(f);
});

/* pollen */
const POLLEN = 140;
const pollen = new THREE.InstancedMesh(new THREE.SphereGeometry(0.022, 6, 4), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.7 }), POLLEN);
const pd = [];
for (let i = 0; i < POLLEN; i++) pd.push({ x: (Math.random() - .5) * 9, y: Math.random() * 6 - 0.5, z: (Math.random() - .5) * 5 - 1, v: 0.08 + Math.random() * 0.18, ph: Math.random() * 6.28, s: 0.5 + Math.random() * 1.3 });
world.add(pollen);

/* soft contact shadow */
const shCanvas = document.createElement('canvas'); shCanvas.width = shCanvas.height = 128;
const sctx = shCanvas.getContext('2d'); const grd = sctx.createRadialGradient(64, 64, 4, 64, 64, 64);
grd.addColorStop(0, 'rgba(60,35,95,.45)'); grd.addColorStop(1, 'rgba(60,35,95,0)'); sctx.fillStyle = grd; sctx.fillRect(0, 0, 128, 128);
const shadow = new THREE.Mesh(new THREE.PlaneGeometry(3.4, 3.4), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(shCanvas), transparent: true, depthWrite: false }));
shadow.rotation.x = -Math.PI / 2; shadow.position.y = 0.002; glassGroup.add(shadow);

/* ---------- layout ---------- */
function layout() {
  const w = host.clientWidth, h = host.clientHeight;
  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  const narrow = w / h < 0.9;
  camera.position.set(0, narrow ? 2.3 : 2.0, narrow ? 12.5 : 10.5);
  camera.lookAt(0, 1.55, 0);
  // on wide screens push the glass into the right half so it never sits under the headline
  if (narrow) camera.clearViewOffset(); else camera.setViewOffset(w, h, -w * Math.min(0.2, (w / h - 0.9) * 0.25), 0, w, h);
  camera.updateProjectionMatrix();
}
layout(); addEventListener('resize', layout);

/* ---------- pour logic ---------- */
let fill = reduce ? 1 : 0, target = 1, draining = false, nextColor = null;
const curCol = new THREE.Color(0x8a63cf), tgtCol = new THREE.Color(0x8a63cf);
function setFill(s) { liquidPivot.scale.setScalar(Math.max(0.0001, s)); liquidPivot.visible = s > 0.01; }
setFill(fill);
window.LLScene = {
  pour(hex) {               // drain, then refill in a new colour
    nextColor = new THREE.Color(hex);
    if (reduce) { curCol.copy(nextColor); tgtCol.copy(nextColor); liqMat.color.copy(curCol); streamMat.color.copy(curCol); return; }
    draining = true; target = 0;
  },
};

/* ---------- pointer ---------- */
let px = 0, py = 0, tx = 0, ty = 0;
addEventListener('pointermove', e => { px = e.clientX / innerWidth * 2 - 1; py = e.clientY / innerHeight * 2 - 1; }, { passive: true });
let tiltBeta = null;
addEventListener('deviceorientation', e => { if (e.gamma != null) { px = Math.max(-1, Math.min(1, e.gamma / 30)); py = Math.max(-1, Math.min(1, (e.beta - 45) / 30)); tiltBeta = 1; } }, { passive: true });

/* ---------- loop (pauses when the hero is off screen) ---------- */
let visible = true, raf = 0, last = performance.now(), t0 = last;
new IntersectionObserver(es => { visible = es[0].isIntersecting; if (visible && !raf) raf = requestAnimationFrame(tick); }, { threshold: 0 }).observe(host);
document.addEventListener('visibilitychange', () => { if (!document.hidden && visible && !raf) { last = performance.now(); raf = requestAnimationFrame(tick); } });
const M = new THREE.Matrix4(), V = new THREE.Vector3(), Q = new THREE.Quaternion(), S3 = new THREE.Vector3();
const startDelay = reduce ? 0 : 900;

function tick(now) {
  raf = 0;
  if (!visible || document.hidden) return;
  const dt = Math.min(0.05, (now - last) / 1000); last = now;
  const t = (now - t0) / 1000;

  // pointer parallax
  tx += (px - tx) * 0.05; ty += (py - ty) * 0.05;
  world.rotation.y = tx * 0.35; world.rotation.x = ty * 0.08;
  glassGroup.rotation.y += reduce ? 0 : dt * 0.25;
  const scrollP = Math.min(1, scrollY / innerHeight);
  world.position.y = scrollP * 1.2; glassGroup.rotation.z = scrollP * 0.12;

  // pour / drain
  if (now - t0 > startDelay) {
    const speed = draining ? 1.6 : 0.42;
    fill += Math.sign(target - fill) * Math.min(Math.abs(target - fill), dt * speed);
    if (draining && fill <= 0.001) { draining = false; target = 1; if (nextColor) { curCol.copy(nextColor); nextColor = null; } }
  }
  tgtCol.copy(curCol); liqMat.color.lerp(tgtCol, 0.2); streamMat.color.copy(liqMat.color);
  setFill(fill);
  const pouring = !draining && fill < 0.995 && now - t0 > startDelay && !reduce;
  stream.visible = pouring;
  if (pouring) {
    const top = 5.6, bottom = BOWL_Y0 + (FULL - BOWL_Y0) * fill;
    stream.scale.y = top - bottom; stream.position.set(0, (top + bottom) / 2, 0);
    stream.scale.x = stream.scale.z = 0.8 + Math.sin(t * 30) * 0.12;
  }
  liquid.rotation.y = t * 0.4;
  shimmer.material.opacity = 0.08 + Math.sin(t * 2.2) * 0.05;

  // floating sprigs
  if (!reduce) floaters.forEach(f => {
    const u = f.userData;
    f.position.y = u.base.y + Math.sin(t * u.sp + u.ph) * 0.18;
    f.rotation.z = u.rot.z + Math.sin(t * u.sp * 0.8 + u.ph) * 0.12;
    f.rotation.y = u.rot.y + t * 0.05 * u.sp;
  });

  // pollen
  for (let i = 0; i < POLLEN; i++) {
    const d = pd[i];
    if (!reduce) { d.y += d.v * dt; if (d.y > 5.8) d.y = -0.5; }
    V.set(d.x + Math.sin(t * 0.5 + d.ph) * 0.25, d.y, d.z);
    S3.setScalar(d.s * (0.6 + 0.4 * Math.sin(t * 2 + d.ph)));
    M.compose(V, Q, S3); pollen.setMatrixAt(i, M);
  }
  pollen.instanceMatrix.needsUpdate = true;

  renderer.render(scene, camera);
  raf = requestAnimationFrame(tick);
}
raf = requestAnimationFrame(tick);
document.documentElement.classList.add('has3d');
