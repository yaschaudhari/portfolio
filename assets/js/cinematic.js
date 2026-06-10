/* ============================================================
   Yash Chaudhari — Portfolio — cinematic.js
   Atmospheric dusk world in the spirit of immersive WebGL
   showcase sites: gradient sky, hazy horizon glow, sweeping
   light streaks, a slow-rotating faceted crystal, and a lone
   silhouette on a fog-bound plain. Magenta/violet dusk palette.

   Falls back to a CSS gradient when WebGL is unavailable or the
   user prefers reduced motion.
   ============================================================ */
import * as THREE from "three";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { ShaderPass } from "three/addons/postprocessing/ShaderPass.js";
import { FilmPass } from "three/addons/postprocessing/FilmPass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";

const SKY_TOP = new THREE.Color(0x0a0712);
const SKY_HORIZON = new THREE.Color(0xff5db3);
const HORIZON_GLOW = new THREE.Color(0xff79c6);
const VIOLET = new THREE.Color(0x7b2ff7);
const MAGENTA = new THREE.Color(0xff3df0);
const BG = new THREE.Color(0x080510);

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function supportsWebGL() {
  try {
    const c = document.createElement("canvas");
    return !!(window.WebGLRenderingContext && (c.getContext("webgl2") || c.getContext("webgl")));
  } catch (e) { return false; }
}

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
  scene.fog = new THREE.FogExp2(0x180a22, 0.05);

  const camera = new THREE.PerspectiveCamera(58, window.innerWidth / window.innerHeight, 0.1, 600);
  camera.position.set(0, 2.4, 16);
  camera.lookAt(0, 3.2, -60);

  const uTime = { value: 0 };

  /* ---------- Sky dome (vertical dusk gradient + horizon glow) ---------- */
  const sky = new THREE.Mesh(
    new THREE.SphereGeometry(400, 32, 16),
    new THREE.ShaderMaterial({
      side: THREE.BackSide, depthWrite: false, fog: false,
      uniforms: {
        uTop: { value: SKY_TOP }, uHorizon: { value: SKY_HORIZON },
        uGlow: { value: HORIZON_GLOW }, uTime: uTime
      },
      vertexShader: `varying vec3 vDir; void main(){ vDir=normalize(position); gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);} `,
      fragmentShader: `
        varying vec3 vDir; uniform vec3 uTop; uniform vec3 uHorizon; uniform vec3 uGlow; uniform float uTime;
        void main(){
          float h = clamp(vDir.y * 1.4 + 0.15, 0.0, 1.0);
          vec3 col = mix(uHorizon, uTop, pow(h, 0.6));
          // concentrated glow band just above the horizon
          float band = smoothstep(0.22, 0.0, abs(vDir.y - 0.01));
          col += uGlow * band * 0.42;
          // faint front-facing sun bloom toward -z horizon centre
          float centre = smoothstep(0.7, 1.0, -vDir.z) * smoothstep(0.18, 0.0, abs(vDir.y));
          col += uGlow * centre * 0.28;
          gl_FragColor = vec4(col, 1.0);
        }`
    })
  );
  scene.add(sky);

  /* ---------- Fog-bound plain (dark, subtle undulation, faint reflsection of glow) ---------- */
  const groundMat = new THREE.ShaderMaterial({
    transparent: true,
    uniforms: { uTime: uTime, uGlow: { value: HORIZON_GLOW }, uViolet: { value: VIOLET } },
    vertexShader: NOISE_GLSL + `
      uniform float uTime; varying vec3 vWorld; varying float vH;
      void main(){
        vec3 p = position;
        float h = fbm(vec3(p.x*0.03, p.y*0.03, uTime*0.03)) * 1.6;
        p.z += h; vH = h;
        vec4 wp = modelMatrix * vec4(p,1.0); vWorld = wp.xyz;
        gl_Position = projectionMatrix * viewMatrix * wp;
      }`,
    fragmentShader: `
      varying vec3 vWorld; varying float vH; uniform vec3 uGlow; uniform vec3 uViolet;
      void main(){
        float d = length(vWorld.xz - vec2(0.0, -60.0));
        // glow reflected near horizon, fading to dark in the foreground
        float horizonGlow = smoothstep(120.0, 20.0, d) * 0.5;
        vec3 col = mix(vec3(0.02,0.01,0.04), uViolet*0.25, horizonGlow);
        col += uGlow * smoothstep(0.6, 1.4, vH) * 0.15;
        float distFade = 1.0 - smoothstep(40.0, 240.0, length(vWorld - cameraPosition));
        gl_FragColor = vec4(col, distFade);
      }`
  });
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(800, 800, 200, 200), groundMat);
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -0.2;
  scene.add(ground);

  /* ---------- Sweeping light streaks across the sky ---------- */
  const streakMat = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, fog: false,
    uniforms: { uTime: uTime, uColor: { value: MAGENTA } },
    vertexShader: `varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);} `,
    fragmentShader: `
      varying vec2 vUv; uniform float uTime; uniform vec3 uColor;
      void main(){
        float core = smoothstep(0.5, 0.0, abs(vUv.y-0.5));
        float len = smoothstep(0.0,0.15,vUv.x)*smoothstep(1.0,0.7,vUv.x);
        float pulse = 0.55 + 0.45*sin(uTime*0.5 + vUv.x*4.0);
        gl_FragColor = vec4(mix(uColor, vec3(1.0), core*0.5), core*len*0.5*pulse);
      }`
  });
  const streaks = new THREE.Group();
  for (let i = 0; i < 4; i++) {
    const s = new THREE.Mesh(new THREE.PlaneGeometry(260, 2.2), streakMat);
    s.position.set(0, 18 + i * 7, -120);
    s.rotation.z = -0.18 + i * 0.07;
    streaks.add(s);
  }
  scene.add(streaks);

  /* ---------- Floating faceted crystal near the horizon ---------- */
  const crystalGeo = new THREE.IcosahedronGeometry(2.3, 0);
  const crystal = new THREE.Group();
  const crystalSolid = new THREE.Mesh(
    crystalGeo,
    new THREE.MeshBasicMaterial({ color: 0x12091e, transparent: true, opacity: 0.85, fog: false })
  );
  const crystalWire = new THREE.LineSegments(
    new THREE.EdgesGeometry(crystalGeo),
    new THREE.LineBasicMaterial({ color: MAGENTA, transparent: true, opacity: 0.9, fog: false })
  );
  crystal.add(crystalSolid); crystal.add(crystalWire);
  crystal.position.set(0, 4.2, -34);
  crystal.scale.setScalar(1.3);
  scene.add(crystal);

  /* ---------- Lone silhouette on the plain ---------- */
  const figure = new THREE.Group();
  const matSil = new THREE.MeshBasicMaterial({ color: 0x05030a, fog: true });
  const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.16, 0.7, 4, 8), matSil);
  body.position.y = 0.55;
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.16, 12, 12), matSil);
  head.position.y = 1.12;
  figure.add(body); figure.add(head);
  figure.position.set(1.4, 0, -16);
  scene.add(figure);

  /* faint rim glow behind the figure so it reads as a silhouette */
  const rim = new THREE.Mesh(
    new THREE.PlaneGeometry(3, 4),
    new THREE.ShaderMaterial({
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false,
      uniforms: { uColor: { value: HORIZON_GLOW } },
      vertexShader: `varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);} `,
      fragmentShader: `varying vec2 vUv; uniform vec3 uColor; void main(){ float d=length(vUv-vec2(0.5,0.35)); gl_FragColor=vec4(uColor, smoothstep(0.5,0.0,d)*0.35);} `
    })
  );
  rim.position.set(1.4, 0.9, -16.4);
  scene.add(rim);

  /* ---------- Post-processing ---------- */
  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  const bloom = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 0.5, 0.7, 0.82);
  composer.addPass(bloom);
  composer.addPass(new FilmPass(0.28, false));
  const Vignette = {
    uniforms: { tDiffuse: { value: null }, uStrength: { value: 1.15 } },
    vertexShader: `varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);} `,
    fragmentShader: `varying vec2 vUv; uniform sampler2D tDiffuse; uniform float uStrength;
      void main(){ vec4 c=texture2D(tDiffuse,vUv); vec2 uv=(vUv-0.5); float v=smoothstep(0.85,0.2,dot(uv,uv)*uStrength); c.rgb*=mix(0.45,1.0,v); gl_FragColor=c; }`
  };
  composer.addPass(new ShaderPass(Vignette));
  composer.addPass(new OutputPass());

  /* ---------- Interaction ---------- */
  const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
  window.addEventListener("pointermove", (e) => {
    pointer.tx = (e.clientX / window.innerWidth - 0.5);
    pointer.ty = (e.clientY / window.innerHeight - 0.5);
  });
  const state = { scroll: 0, sm: 0 };
  window.__cinematic = {
    setScroll(p) { state.scroll = p; },
    debug() { return { camZ: +camera.position.z.toFixed(2), camY: +camera.position.y.toFixed(2), sm: +state.sm.toFixed(3), scroll: +state.scroll.toFixed(3) }; }
  };

  /* ---------- Scroll-driven camera flythrough ("video on scroll") ----------
     Keyframes interpolated by page-scroll progress (0..1). As you scroll the
     camera flies forward, banks past the crystal and figure, then rises into
     the sky — so scrolling feels like scrubbing a film. */
  const PATH = [
    { s: 0.00, pos: [0,  2.4,  16], look: [0, 3.2,  -60] },
    { s: 0.26, pos: [0,  3.2,  -1], look: [0, 3.6,  -55] },
    { s: 0.50, pos: [3.5, 5.0, -20], look: [0, 4.2,  -60] },
    { s: 0.74, pos: [-3.5, 6.6, -42], look: [0, 4.6,  -82] },
    { s: 1.00, pos: [0,  9.5, -66], look: [0, 6.4, -112] }
  ];
  const _p = new THREE.Vector3();
  const _l = new THREE.Vector3();
  function samplePath(s) {
    let a = PATH[0], b = PATH[PATH.length - 1];
    for (let i = 0; i < PATH.length - 1; i++) {
      if (s >= PATH[i].s && s <= PATH[i + 1].s) { a = PATH[i]; b = PATH[i + 1]; break; }
    }
    const t = a.s === b.s ? 0 : (s - a.s) / (b.s - a.s);
    const te = t * t * (3 - 2 * t); // smoothstep easing
    _p.set(a.pos[0] + (b.pos[0]-a.pos[0])*te, a.pos[1] + (b.pos[1]-a.pos[1])*te, a.pos[2] + (b.pos[2]-a.pos[2])*te);
    _l.set(a.look[0] + (b.look[0]-a.look[0])*te, a.look[1] + (b.look[1]-a.look[1])*te, a.look[2] + (b.look[2]-a.look[2])*te);
  }
  const lookTarget = new THREE.Vector3(0, 3.2, -60);
  camera.position.set(0, 2.4, 16);

  function onResize() {
    const w = window.innerWidth, h = window.innerHeight;
    camera.aspect = w / h; camera.updateProjectionMatrix();
    renderer.setSize(w, h); composer.setSize(w, h); bloom.setSize(w, h);
  }
  window.addEventListener("resize", onResize);

  const clock = new THREE.Clock();
  let running = true;
  document.addEventListener("visibilitychange", () => { running = !document.hidden; if (running) clock.start(); });

  function animate() {
    requestAnimationFrame(animate);
    if (!running) return;
    const dt = Math.min(clock.getDelta(), 0.05);
    uTime.value += dt;

    crystal.rotation.y += dt * 0.18;
    crystal.rotation.x = Math.sin(uTime.value * 0.2) * 0.12;
    crystal.position.y = 4.2 + Math.sin(uTime.value * 0.5) * 0.25;
    crystal.scale.setScalar(1.3 + state.sm * 0.6);

    // smooth the scroll value, then fly the camera along the keyframe path
    state.sm += (state.scroll - state.sm) * 0.07;
    samplePath(state.sm);

    pointer.x += (pointer.tx - pointer.x) * 0.04;
    pointer.y += (pointer.ty - pointer.y) * 0.04;
    camera.position.x += ((_p.x + pointer.x * 2.2) - camera.position.x) * 0.08;
    camera.position.y += ((_p.y - pointer.y * 0.9) - camera.position.y) * 0.08;
    camera.position.z += (_p.z - camera.position.z) * 0.08;
    lookTarget.lerp(_l, 0.08);
    camera.lookAt(lookTarget);

    // world clears as we rise into the sky toward the end
    scene.fog.density = 0.05 - state.sm * 0.028;

    composer.render();
  }
  animate();
  requestAnimationFrame(() => canvas.classList.add("ready"));
}

/* ---------- Entry point ---------- */
const heroCanvas = document.getElementById("cinematic-canvas");
if (!heroCanvas || reduceMotion || !supportsWebGL()) {
  document.body.classList.add("cinematic-off");
} else {
  boot(heroCanvas);
}
