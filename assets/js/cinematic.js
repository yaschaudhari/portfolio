/* ============================================================
   Yash Chaudhari — Portfolio — cinematic.js
   Milestone 1: immersive Three.js hero world.
   "The Engineering Continuum" — a procedural blueprint terrain,
   a self-assembling particle artifact, atmospheric fog, light
   beams, and cinematic post-processing (bloom + grain + vignette).
   Cyan/obsidian brand palette.

   Falls back silently (CSS gradient) when WebGL is unavailable or
   the user prefers reduced motion. Exposes window.__cinematic for
   later scroll-choreography milestones.
   ============================================================ */
import * as THREE from "three";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { ShaderPass } from "three/addons/postprocessing/ShaderPass.js";
import { FilmPass } from "three/addons/postprocessing/FilmPass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";

const PRIMARY = new THREE.Color(0x00c6ff);
const SECONDARY = new THREE.Color(0x7b2ff7);
const BG = new THREE.Color(0x070a10);

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function supportsWebGL() {
  try {
    const c = document.createElement("canvas");
    return !!(window.WebGLRenderingContext && (c.getContext("webgl2") || c.getContext("webgl")));
  } catch (e) { return false; }
}

/* Shared GLSL: Ashima simplex noise (snoise) */
const NOISE_GLSL = `
vec3 mod289(vec3 x){return x-floor(x*(1.0/289.0))*289.0;}
vec4 mod289(vec4 x){return x-floor(x*(1.0/289.0))*289.0;}
vec4 permute(vec4 x){return mod289(((x*34.0)+1.0)*x);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-0.85373472095314*r;}
float snoise(vec3 v){
  const vec2 C=vec2(1.0/6.0,1.0/3.0); const vec4 D=vec4(0.0,0.5,1.0,2.0);
  vec3 i=floor(v+dot(v,C.yyy)); vec3 x0=v-i+dot(i,C.xxx);
  vec3 g=step(x0.yzx,x0.xyz); vec3 l=1.0-g; vec3 i1=min(g.xyz,l.zxy); vec3 i2=max(g.xyz,l.zxy);
  vec3 x1=x0-i1+C.xxx; vec3 x2=x0-i2+C.yyy; vec3 x3=x0-D.yyy;
  i=mod289(i);
  vec4 p=permute(permute(permute(i.z+vec4(0.0,i1.z,i2.z,1.0))+i.y+vec4(0.0,i1.y,i2.y,1.0))+i.x+vec4(0.0,i1.x,i2.x,1.0));
  float n_=0.142857142857; vec3 ns=n_*D.wyz-D.xzx;
  vec4 j=p-49.0*floor(p*ns.z*ns.z);
  vec4 x_=floor(j*ns.z); vec4 y_=floor(j-7.0*x_);
  vec4 x=x_*ns.x+ns.yyyy; vec4 y=y_*ns.x+ns.yyyy; vec4 h=1.0-abs(x)-abs(y);
  vec4 b0=vec4(x.xy,y.xy); vec4 b1=vec4(x.zw,y.zw);
  vec4 s0=floor(b0)*2.0+1.0; vec4 s1=floor(b1)*2.0+1.0; vec4 sh=-step(h,vec4(0.0));
  vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy; vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;
  vec3 p0=vec3(a0.xy,h.x); vec3 p1=vec3(a0.zw,h.y); vec3 p2=vec3(a1.xy,h.z); vec3 p3=vec3(a1.zw,h.w);
  vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));
  p0*=norm.x; p1*=norm.y; p2*=norm.z; p3*=norm.w;
  vec4 m=max(0.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.0); m=m*m;
  return 42.0*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));
}
float fbm(vec3 p){ float f=0.0,a=0.5; for(int i=0;i<4;i++){ f+=a*snoise(p); p*=2.02; a*=0.5; } return f; }
`;

function boot(canvas) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(BG, 1);

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(BG.getHex(), 0.024);

  const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 400);
  camera.position.set(0, 6, 26);
  camera.lookAt(0, 4, -40);

  const uTime = { value: 0 };

  /* ---------- Procedural blueprint terrain ---------- */
  const terrainMat = new THREE.ShaderMaterial({
    transparent: true,
    uniforms: {
      uTime: uTime,
      uPrimary: { value: PRIMARY },
      uSecondary: { value: SECONDARY },
      uFogColor: { value: BG },
      uFogDensity: { value: 0.024 }
    },
    vertexShader: NOISE_GLSL + `
      varying vec3 vWorld; varying float vH;
      uniform float uTime;
      void main(){
        vec3 p = position;
        float h = fbm(vec3(p.x*0.035, p.y*0.035, uTime*0.05)) * 6.0;
        h += fbm(vec3(p.x*0.12, p.y*0.12, uTime*0.03)) * 1.2;
        p.z += h;
        vH = h;
        vec4 wp = modelMatrix * vec4(p,1.0);
        vWorld = wp.xyz;
        gl_Position = projectionMatrix * viewMatrix * wp;
      }`,
    fragmentShader: `
      varying vec3 vWorld; varying float vH;
      uniform vec3 uPrimary; uniform vec3 uSecondary; uniform vec3 uFogColor; uniform float uFogDensity;
      float gridLine(vec2 c){
        vec2 g = abs(fract(c - 0.5) - 0.5) / fwidth(c);
        return 1.0 - min(min(g.x, g.y), 1.0);
      }
      void main(){
        float g1 = gridLine(vWorld.xz * 0.5);
        float g2 = gridLine(vWorld.xz * 0.1) * 1.4;
        float grid = clamp(g1 * 0.5 + g2, 0.0, 1.0);
        vec3 col = mix(uSecondary * 0.25, uPrimary, clamp(vH * 0.12 + 0.3, 0.0, 1.0));
        float ridge = smoothstep(2.5, 6.0, vH);
        col += uPrimary * ridge * 0.6;
        float alpha = grid * (0.5 + ridge * 0.5);
        // distance fog
        float d = length(vWorld - cameraPosition);
        float fog = 1.0 - exp(-uFogDensity * uFogDensity * d * d);
        col = mix(col, uFogColor, fog);
        alpha *= (1.0 - fog * 0.9);
        if(alpha < 0.01) discard;
        gl_FragColor = vec4(col, alpha);
      }`
  });
  terrainMat.extensions = { derivatives: true };
  const terrain = new THREE.Mesh(new THREE.PlaneGeometry(600, 600, 320, 320), terrainMat);
  terrain.rotation.x = -Math.PI / 2;
  terrain.position.y = -2;
  scene.add(terrain);

  /* ---------- Self-assembling particle artifact ---------- */
  const ico = new THREE.IcosahedronGeometry(4.6, 20);
  const artifactMat = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: {
      uTime: uTime,
      uAssemble: { value: 0.0 },   // 0..1 driven later by scroll
      uPrimary: { value: PRIMARY },
      uSecondary: { value: SECONDARY }
    },
    vertexShader: NOISE_GLSL + `
      uniform float uTime; uniform float uAssemble;
      varying float vGlow;
      void main(){
        vec3 dir = normalize(position);
        float n = fbm(position * 0.25 + vec3(0.0, 0.0, uTime * 0.15));
        // exploded scatter -> assembled form as uAssemble goes 0..1
        float scatter = (1.0 - uAssemble);
        vec3 p = position + dir * (n * (2.5 + scatter * 16.0));
        p += dir * sin(uTime * 0.6 + n * 6.28) * 0.4 * uAssemble;
        vGlow = 0.35 + 0.5 * smoothstep(-0.5, 1.2, n);
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        gl_PointSize = (0.5 + vGlow * 1.1) * (150.0 / -mv.z);
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: `
      uniform vec3 uPrimary; uniform vec3 uSecondary;
      varying float vGlow;
      void main(){
        vec2 uv = gl_PointCoord - 0.5;
        float d = length(uv);
        if(d > 0.5) discard;
        float a = smoothstep(0.5, 0.0, d) * vGlow;
        vec3 col = mix(uSecondary, uPrimary, vGlow);
        gl_FragColor = vec4(col, a);
      }`
  });
  const artifact = new THREE.Points(ico, artifactMat);
  artifact.position.set(12.5, 8.5, -16);
  scene.add(artifact);

  /* a faint solid wire core inside the particles for density */
  const core = new THREE.Mesh(
    new THREE.IcosahedronGeometry(3.0, 1),
    new THREE.MeshBasicMaterial({ color: PRIMARY, wireframe: true, transparent: true, opacity: 0.06 })
  );
  core.position.copy(artifact.position);
  scene.add(core);

  /* ---------- Starfield ---------- */
  const starCount = 1400;
  const starPos = new Float32Array(starCount * 3);
  for (let i = 0; i < starCount; i++) {
    const r = 120 + Math.random() * 180;
    const th = Math.random() * Math.PI * 2;
    const ph = Math.acos(2 * Math.random() - 1);
    starPos[i * 3] = r * Math.sin(ph) * Math.cos(th);
    starPos[i * 3 + 1] = Math.abs(r * Math.cos(ph)) * 0.5 + 10;
    starPos[i * 3 + 2] = -Math.abs(r * Math.sin(ph) * Math.sin(th)) - 20;
  }
  const starGeo = new THREE.BufferGeometry();
  starGeo.setAttribute("position", new THREE.BufferAttribute(starPos, 3));
  const stars = new THREE.Points(starGeo, new THREE.PointsMaterial({
    color: 0x9fdcff, size: 0.7, sizeAttenuation: true, transparent: true, opacity: 0.7, depthWrite: false
  }));
  scene.add(stars);

  /* ---------- Horizon light beams (additive) ---------- */
  const beamMat = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
    uniforms: { uTime: uTime, uColor: { value: PRIMARY } },
    vertexShader: `varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);} `,
    fragmentShader: `
      varying vec2 vUv; uniform float uTime; uniform vec3 uColor;
      void main(){
        float beam = smoothstep(0.5, 0.0, abs(vUv.x - 0.5));
        float fade = smoothstep(0.0, 0.5, vUv.y) * smoothstep(1.0, 0.5, vUv.y);
        float pulse = 0.5 + 0.5 * sin(uTime * 0.4 + vUv.x * 3.0);
        gl_FragColor = vec4(uColor, beam * fade * 0.22 * pulse);
      }`
  });
  const beams = new THREE.Group();
  for (let i = 0; i < 3; i++) {
    const b = new THREE.Mesh(new THREE.PlaneGeometry(120, 60), beamMat);
    b.position.set(-20 + i * 20, 26, -90);
    b.rotation.z = (i - 1) * 0.25;
    beams.add(b);
  }
  scene.add(beams);

  /* ---------- Post-processing ---------- */
  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));

  const bloom = new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight), 0.5, 0.5, 0.9
  );
  composer.addPass(bloom);

  const film = new FilmPass(0.32, false);
  composer.addPass(film);

  const VignetteShader = {
    uniforms: { tDiffuse: { value: null }, uStrength: { value: 1.1 }, uOffset: { value: 1.0 } },
    vertexShader: `varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);} `,
    fragmentShader: `
      varying vec2 vUv; uniform sampler2D tDiffuse; uniform float uStrength; uniform float uOffset;
      void main(){
        vec4 c = texture2D(tDiffuse, vUv);
        vec2 uv = (vUv - 0.5) * uOffset;
        float v = smoothstep(0.85, 0.2, dot(uv, uv) * uStrength);
        c.rgb *= mix(0.55, 1.0, v);
        gl_FragColor = c;
      }`
  };
  composer.addPass(new ShaderPass(VignetteShader));
  composer.addPass(new OutputPass());

  /* ---------- Interaction: mouse parallax + scroll hook ---------- */
  const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
  window.addEventListener("pointermove", (e) => {
    pointer.tx = (e.clientX / window.innerWidth - 0.5);
    pointer.ty = (e.clientY / window.innerHeight - 0.5);
  });

  // Exposed for later scroll-choreography milestones.
  const state = { scroll: 0, assemble: 0 };
  window.__cinematic = {
    setScroll(p) { state.scroll = p; },           // 0..1 page progress
    setAssemble(a) { state.assemble = a; }         // 0..1 artifact build
  };
  // Hero-only auto-assemble on load so it feels alive immediately.
  let booted = performance.now();

  /* ---------- Resize ---------- */
  function onResize() {
    const w = window.innerWidth, h = window.innerHeight;
    camera.aspect = w / h; camera.updateProjectionMatrix();
    renderer.setSize(w, h); composer.setSize(w, h);
    bloom.setSize(w, h);
  }
  window.addEventListener("resize", onResize);

  /* ---------- Render loop (pauses when tab hidden) ---------- */
  const clock = new THREE.Clock();
  let running = true;
  document.addEventListener("visibilitychange", () => {
    running = !document.hidden;
    if (running) clock.start();
  });

  function animate() {
    requestAnimationFrame(animate);
    if (!running) return;
    const dt = Math.min(clock.getDelta(), 0.05);
    uTime.value += dt;

    // intro assemble (0->1 over ~3.5s) unless scroll-driven later
    const introT = Math.min((performance.now() - booted) / 3500, 1);
    const ease = 1 - Math.pow(1 - introT, 3);
    artifactMat.uniforms.uAssemble.value = Math.max(ease, state.assemble);

    artifact.rotation.y += dt * 0.12;
    artifact.rotation.x = Math.sin(uTime.value * 0.15) * 0.15;
    core.rotation.copy(artifact.rotation);
    stars.rotation.y += dt * 0.005;

    // parallax + subtle scroll dolly
    pointer.x += (pointer.tx - pointer.x) * 0.04;
    pointer.y += (pointer.ty - pointer.y) * 0.04;
    camera.position.x = pointer.x * 4;
    camera.position.y = 6 - pointer.y * 2 + state.scroll * 2;
    camera.lookAt(0, 5, -40);

    composer.render();
  }
  animate();

  // reveal canvas once first frame is ready
  requestAnimationFrame(() => canvas.classList.add("ready"));
}

/* ---------- Entry point (after all consts initialized) ---------- */
const heroCanvas = document.getElementById("cinematic-canvas");
if (!heroCanvas || reduceMotion || !supportsWebGL()) {
  document.body.classList.add("cinematic-off");
} else {
  boot(heroCanvas);
}
