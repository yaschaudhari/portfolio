/* ============================================================
   Yash Chaudhari — Portfolio — main.js
   Shader background, custom cursor, typewriter, scroll reveal,
   stat counters, vanilla-tilt init, and screenshot lightbox.
   Every block guards its own elements so the file is safe to
   load on every page (index + project pages).
   ============================================================ */
(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- WebGL particle-grid shader background ---------- */
  (function shaderBackground() {
    var canvas = document.getElementById("shader-canvas");
    if (!canvas || reduceMotion) return;

    function syncSize() {
      var w = canvas.clientWidth || window.innerWidth;
      var h = canvas.clientHeight || window.innerHeight;
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
    }
    if (typeof ResizeObserver !== "undefined") {
      new ResizeObserver(syncSize).observe(canvas);
    }
    syncSize();

    var gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
    if (!gl) return;

    var vs =
      "attribute vec2 a_position;varying vec2 v_texCoord;" +
      "void main(){v_texCoord=a_position*0.5+0.5;gl_Position=vec4(a_position,0.0,1.0);}";
    var fs =
      "precision highp float;uniform float u_time;uniform vec2 u_resolution;uniform vec2 u_mouse;" +
      "varying vec2 v_texCoord;" +
      "float hash(vec2 p){p=fract(p*vec2(123.34,456.21));p+=dot(p,p+45.32);return fract(p.x*p.y);}" +
      "void main(){" +
      "vec2 uv=(gl_FragCoord.xy*2.0-u_resolution.xy)/min(u_resolution.x,u_resolution.y);" +
      "vec2 mouse=(u_mouse.xy/u_resolution.xy)*2.0-1.0;mouse.y*=-1.0;" +
      "vec3 color=vec3(0.02,0.03,0.06);" +
      "vec2 grid=fract(gl_FragCoord.xy/40.0);" +
      "float line=step(0.98,grid.x)+step(0.98,grid.y);" +
      "color+=line*vec3(0.05,0.1,0.2);" +
      "for(float i=0.0;i<60.0;i++){" +
      "float h=hash(vec2(i,1.0));" +
      "vec2 p=vec2(sin(u_time*0.1+h*6.28),cos(u_time*0.15+h*6.28))*0.8;" +
      "float dMouse=length(uv-mouse);p+=(mouse-uv)*exp(-dMouse*4.0)*0.1;" +
      "float dist=length(uv-p);float circle=0.0015/dist;" +
      "vec3 pCol=mix(vec3(0.0,0.78,1.0),vec3(0.48,0.18,0.97),h);" +
      "color+=circle*pCol;" +
      "if(i<15.0){float h2=hash(vec2(i+1.0,2.0));" +
      "vec2 p2=vec2(sin(u_time*0.08+h2*6.28),cos(u_time*0.12+h2*6.28))*0.7;" +
      "float lineDist=length(uv-mix(p,p2,clamp(dot(uv-p,p2-p)/dot(p2-p,p2-p),0.0,1.0)));" +
      "color+=(0.0003/lineDist)*pCol*smoothstep(0.4,0.0,length(p-p2));}}" +
      "gl_FragColor=vec4(color,1.0);}";

    function compile(type, src) {
      var s = gl.createShader(type);
      gl.shaderSource(s, src);
      gl.compileShader(s);
      return s;
    }
    var prog = gl.createProgram();
    gl.attachShader(prog, compile(gl.VERTEX_SHADER, vs));
    gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, fs));
    gl.linkProgram(prog);
    gl.useProgram(prog);

    var buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    var loc = gl.getAttribLocation(prog, "a_position");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    var uTime = gl.getUniformLocation(prog, "u_time");
    var uRes = gl.getUniformLocation(prog, "u_resolution");
    var uMouse = gl.getUniformLocation(prog, "u_mouse");
    var mouse = { x: 0, y: 0 };

    window.addEventListener("mousemove", function (e) {
      var rect = canvas.getBoundingClientRect();
      if (rect.width && rect.height) {
        mouse.x = ((e.clientX - rect.left) / rect.width) * canvas.width;
        mouse.y = (1 - (e.clientY - rect.top) / rect.height) * canvas.height;
      }
    });

    function render(t) {
      if (typeof ResizeObserver === "undefined") syncSize();
      gl.viewport(0, 0, canvas.width, canvas.height);
      if (uTime) gl.uniform1f(uTime, t * 0.001);
      if (uRes) gl.uniform2f(uRes, canvas.width, canvas.height);
      if (uMouse) gl.uniform2f(uMouse, mouse.x, mouse.y);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      requestAnimationFrame(render);
    }
    render(0);
  })();

  /* ---------- Custom cursor ---------- */
  (function customCursor() {
    var dot = document.getElementById("cursor-dot");
    var ring = document.getElementById("cursor-ring");
    if (!dot || !ring) return;
    if (!window.matchMedia("(pointer: fine)").matches) return;

    document.body.classList.add("has-custom-cursor");
    var rx = 0, ry = 0, mx = 0, my = 0;

    window.addEventListener("mousemove", function (e) {
      mx = e.clientX; my = e.clientY;
      dot.style.left = mx + "px";
      dot.style.top = my + "px";
    });
    (function follow() {
      rx += (mx - rx) * 0.18;
      ry += (my - ry) * 0.18;
      ring.style.left = rx + "px";
      ring.style.top = ry + "px";
      requestAnimationFrame(follow);
    })();

    document.querySelectorAll('a, button, .hover-target, .shot').forEach(function (el) {
      el.addEventListener("mouseenter", function () { document.body.classList.add("cursor-hover"); });
      el.addEventListener("mouseleave", function () { document.body.classList.remove("cursor-hover"); });
    });
  })();

  /* ---------- Typewriter (hero) ---------- */
  (function typewriter() {
    var el = document.getElementById("typewriter-text");
    if (!el) return;
    var phrases = (el.getAttribute("data-phrases") || "").split("|").filter(Boolean);
    if (!phrases.length) return;

    if (reduceMotion) { el.textContent = phrases[0]; return; }

    var pi = 0, txt = "", deleting = false;
    function tick() {
      var full = phrases[pi];
      txt = deleting ? full.substring(0, txt.length - 1) : full.substring(0, txt.length + 1);
      el.textContent = txt;
      var delta = deleting ? 50 : 100;
      if (!deleting && txt === full) { delta = 1800; deleting = true; }
      else if (deleting && txt === "") { deleting = false; pi = (pi + 1) % phrases.length; delta = 450; }
      setTimeout(tick, delta);
    }
    setTimeout(tick, 1900);
  })();

  /* ---------- Scroll reveal ---------- */
  (function scrollReveal() {
    var els = document.querySelectorAll(".reveal");
    if (!els.length) return;
    if (reduceMotion || !("IntersectionObserver" in window)) {
      els.forEach(function (el) { el.classList.add("active"); });
      return;
    }
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { entry.target.classList.add("active"); obs.unobserve(entry.target); }
      });
    }, { threshold: 0.12 });
    els.forEach(function (el) { obs.observe(el); });
  })();

  /* ---------- Stat counters ---------- */
  (function statCounters() {
    var counters = document.querySelectorAll(".stat-counter");
    if (!counters.length) return;
    if (reduceMotion || !("IntersectionObserver" in window)) {
      counters.forEach(function (c) { c.textContent = c.getAttribute("data-target"); });
      return;
    }
    var obs = new IntersectionObserver(function (entries, o) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var raw = entry.target.getAttribute("data-target");
        var target = parseFloat(raw);
        var isFloat = raw.indexOf(".") !== -1;
        var count = 0;
        var inc = target / (1600 / 16);
        (function step() {
          count += inc;
          if (count < target) {
            entry.target.textContent = isFloat ? count.toFixed(1) : Math.ceil(count);
            requestAnimationFrame(step);
          } else {
            entry.target.textContent = raw;
          }
        })();
        o.unobserve(entry.target);
      });
    }, { threshold: 0.5 });
    counters.forEach(function (c) { obs.observe(c); });
  })();

  /* ---------- Loader fade ---------- */
  (function loader() {
    var el = document.getElementById("loader");
    if (!el) return;
    var hide = function () {
      el.style.opacity = "0";
      el.style.visibility = "hidden";
      setTimeout(function () { el.style.display = "none"; }, 400);
    };
    setTimeout(hide, reduceMotion ? 200 : 1800);
  })();

  /* Native browser scrolling — no smooth-scroll library. */

  /* ---------- Mobile nav toggle ---------- */
  (function mobileNav() {
    var btn = document.getElementById("nav-toggle");
    var menu = document.getElementById("nav-mobile");
    if (!btn || !menu) return;
    btn.addEventListener("click", function () { menu.classList.toggle("hidden"); });
    menu.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () { menu.classList.add("hidden"); });
    });
  })();

  /* ---------- vanilla-tilt init (if loaded) ---------- */
  (function initTilt() {
    if (reduceMotion) return;
    if (window.VanillaTilt && document.querySelector("[data-tilt]")) {
      window.VanillaTilt.init(document.querySelectorAll("[data-tilt]"), {
        max: 5, speed: 400, glare: true, "max-glare": 0.18
      });
    }
  })();

  /* ---------- Lightbox (project galleries) ---------- */
  (function lightbox() {
    var shots = Array.prototype.slice.call(document.querySelectorAll("[data-lightbox]"));
    if (!shots.length) return;

    var lb = document.getElementById("lightbox");
    var lbImg = document.getElementById("lb-img");
    var lbCap = document.getElementById("lb-caption");
    var lbCount = document.getElementById("lb-counter");
    if (!lb || !lbImg) return;

    var idx = 0;
    function show(i) {
      idx = (i + shots.length) % shots.length;
      var node = shots[idx];
      var src = node.getAttribute("href") || node.getAttribute("data-src");
      var cap = node.getAttribute("data-caption") || "";
      lbImg.src = src;
      lbImg.alt = cap;
      if (lbCap) lbCap.textContent = cap;
      if (lbCount) lbCount.textContent = String(idx + 1).padStart(2, "0") + " / " + String(shots.length).padStart(2, "0");
    }
    function open(i) { show(i); lb.classList.add("open"); document.body.style.overflow = "hidden"; }
    function close() { lb.classList.remove("open"); document.body.style.overflow = ""; }

    shots.forEach(function (node, i) {
      node.addEventListener("click", function (e) { e.preventDefault(); open(i); });
    });
    lb.querySelector(".lb-close").addEventListener("click", close);
    lb.querySelector(".lb-prev").addEventListener("click", function () { show(idx - 1); });
    lb.querySelector(".lb-next").addEventListener("click", function () { show(idx + 1); });
    lb.addEventListener("click", function (e) { if (e.target === lb) close(); });
    document.addEventListener("keydown", function (e) {
      if (!lb.classList.contains("open")) return;
      if (e.key === "Escape") close();
      else if (e.key === "ArrowLeft") show(idx - 1);
      else if (e.key === "ArrowRight") show(idx + 1);
    });
  })();
})();
