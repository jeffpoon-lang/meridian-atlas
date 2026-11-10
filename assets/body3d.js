/* 經絡銅人 — 3D body, meridians and points.
   Builds a simplified mannequin from the same 2D silhouettes and limb nodes the
   2D atlas uses, then lifts every 2D point and route onto its surface:
   front/back views → front/back surface, side view → lateral surface,
   limb coordinates (u, k) → an angle around the limb so medial lines sit on the inside. */
(function () {
  "use strict";
  const MA3D = (window.MA3D = {});

  MA3D.supported = function () {
    try {
      if (!window.THREE || !THREE.OrbitControls) return false;
      const c = document.createElement("canvas");
      return !!(window.WebGLRenderingContext && (c.getContext("webgl") || c.getContext("experimental-webgl")));
    } catch (e) { return false; }
  };

  MA3D.create = function (core, host, cb) {
    const T = THREE;
    const { LIMBS, PATHS, P, M, MI, cr, sampleRoute, SIL } = core;
    const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
    const lerp = (a, b, t) => a + (b - a) * t;
    const spow = (v, e) => Math.sign(v) * Math.pow(Math.abs(v), e);
    const Y3 = y => 310 - y;
    const reduceMotion = (() => { try { return matchMedia("(prefers-reduced-motion: reduce)").matches; } catch (e) { return false; } })();

    /* ---------- dense outline sampling (same Catmull-Rom as the 2D figure) ---------- */
    function dense(Pts, closed, n) {
      const N = Pts.length, g = i => closed ? Pts[(i + N) % N] : Pts[Math.max(0, Math.min(N - 1, i))];
      const out = [], segs = closed ? N : N - 1;
      for (let i = 0; i < segs; i++) {
        const p0 = g(i - 1), p1 = g(i), p2 = g(i + 1), p3 = g(i + 2);
        const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6], c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
        for (let j = 0; j < n; j++) {
          const t = j / n, u = 1 - t;
          out.push([u * u * u * p1[0] + 3 * u * u * t * c1[0] + 3 * u * t * t * c2[0] + t * t * t * p2[0],
                    u * u * u * p1[1] + 3 * u * u * t * c1[1] + 3 * u * t * t * c2[1] + t * t * t * p2[1]]);
        }
      }
      return out;
    }
    function crossings(poly, y) {
      const xs = [];
      for (let i = 0; i < poly.length; i++) {
        const a = poly[i], b = poly[(i + 1) % poly.length];
        if ((a[1] - y) * (b[1] - y) <= 0 && a[1] !== b[1]) xs.push(a[0] + (y - a[1]) / (b[1] - a[1]) * (b[0] - a[0]));
      }
      return xs;
    }
    const tubeOutline = nodes => nodes.map(([x, y, w]) => [x - w, y]).concat(nodes.slice().reverse().map(([x, y, w]) => [x + w, y]));

    /* ---------- trunk (head + neck + torso) cross-section tables ---------- */
    const Y0 = 12, Y1 = 352;
    const front = [dense(SIL.HEAD_F, true, 24), [[134, 80], [166, 80], [170, 116], [130, 116]], dense(SIL.TORSO_F, true, 24)];
    const side = [dense(SIL.HEAD_S, true, 24), tubeOutline([[156, 74, 13], [154, 96, 13], [156, 118, 15]]), dense(SIL.TORSO_S, true, 24)];
    const A = [], ZF = [], ZB = [];
    for (let y = Y0; y <= Y1; y++) {
      let mx = -1, mn = 1e9, mxs = -1e9;
      front.forEach(p => crossings(p, y + 0.01).forEach(x => { mx = Math.max(mx, x); }));
      side.forEach(p => crossings(p, y + 0.01).forEach(x => { mn = Math.min(mn, x); mxs = Math.max(mxs, x); }));
      A.push(mx > 0 ? Math.max(0.5, mx - 150) : null);
      let zf = mn < 1e9 ? 150 - mn : null, zb = mxs > -1e9 ? 150 - mxs : null;
      if (zf !== null && y >= 46 && y <= 76) zf = Math.min(zf, 33.5); // nose is a separate mesh
      ZF.push(zf); ZB.push(zb);
    }
    function fill(arr) { // fill gaps by nearest value
      let last = null;
      for (let i = 0; i < arr.length; i++) { if (arr[i] === null) arr[i] = last; else last = arr[i]; }
      last = null;
      for (let i = arr.length - 1; i >= 0; i--) { if (arr[i] === null) arr[i] = last; else last = arr[i]; }
      return arr;
    }
    function smooth(arr, r) {
      return arr.map((_, i) => { let s = 0, n = 0; for (let j = -r; j <= r; j++) { const v = arr[i + j]; if (v !== undefined && v !== null) { s += v; n++; } } return s / n; });
    }
    fill(A); fill(ZF); fill(ZB);
    const AS = smooth(A, 2), ZFS = smooth(ZF, 2), ZBS = smooth(ZB, 2);
    const tab = (arr, y) => { const f = clamp(y - Y0, 0, arr.length - 1), i = Math.floor(f), t = f - i; return lerp(arr[i], arr[Math.min(arr.length - 1, i + 1)], t); };
    const tA = y => Math.max(0.5, tab(AS, y));
    const tZc = y => (tab(ZFS, y) + tab(ZBS, y)) / 2;
    const tB = y => Math.max(0.5, (tab(ZFS, y) - tab(ZBS, y)) / 2);
    const tP = y => y < 112 ? 2.0 : y < 140 ? lerp(2.0, 2.45, (y - 112) / 28) : 2.45;

    function trunkFB(x, y, back) {
      const a = tA(y), b = tB(y), p = tP(y), zc = tZc(y);
      const s = clamp((x - 150) / a, -0.985, 0.985);
      const zz = b * Math.pow(1 - Math.pow(Math.abs(s), p), 1 / p);
      const pos = new T.Vector3(x - 150, Y3(y), back ? zc - zz : zc + zz);
      return { pos, nrm: trunkNormal(pos, y) };
    }
    function trunkSide(xs, y) {
      const a = tA(y), b = tB(y), p = tP(y), zc = tZc(y);
      const z = 150 - xs, t = clamp((z - zc) / b, -0.985, 0.985);
      const X = a * Math.pow(1 - Math.pow(Math.abs(t), p), 1 / p);
      const pos = new T.Vector3(X, Y3(y), z);
      return { pos, nrm: trunkNormal(pos, y) };
    }
    function trunkMidline(xs, y) { // exact silhouette on the midline (GV over the face)
      const pos = new T.Vector3(0, Y3(y), 150 - xs);
      return { pos, nrm: trunkNormal(pos, y) };
    }
    function trunkTop(X, xs, ymax) { // first height (from the top) where (X, z) lies on the head
      const z = 150 - xs;
      for (let y = Y0; y < ymax; y += 0.25) {
        const a = tA(y), b = tB(y), p = tP(y), zc = tZc(y);
        if (Math.pow(Math.abs(X) / a, p) + Math.pow(Math.abs(z - zc) / b, p) <= 1) {
          const pos = new T.Vector3(X, Y3(y), z);
          return { pos, nrm: trunkNormal(pos, y) };
        }
      }
      return trunkSide(xs, ymax);
    }
    function trunkNormal(pos, y) {
      const a = tA(y), b = tB(y), zc = tZc(y);
      const n = new T.Vector3(pos.x / (a * a), 0, (pos.z - zc) / (b * b));
      if (y < 40) n.y = (40 - y) / 40 * 0.04; // tilt up near the crown
      return n.normalize();
    }

    /* ---------- limbs ---------- */
    function makeLimb(nodes2, zOf, bOf) {
      const n = nodes2.length, S = [];
      for (let u = 0; u <= n - 1 + 1e-6; u += 0.04) {
        const i = Math.min(n - 2, Math.floor(u)), f = u - i, a = nodes2[i], b = nodes2[i + 1];
        S.push({ u, x: lerp(a[0], b[0], f), y: lerp(a[1], b[1], f), w: lerp(a[2], b[2], f), z: zOf(u), b: bOf(u) });
      }
      S.forEach((s, i) => {
        const p = S[Math.max(0, i - 3)], q = S[Math.min(S.length - 1, i + 3)];
        let dx = q.x - p.x, dy = q.y - p.y; const l = Math.hypot(dx, dy) || 1; dx /= l; dy /= l;
        s.C = new T.Vector3(s.x - 150, Y3(s.y), s.z);
        s.L = new T.Vector3(dy, dx, 0).normalize(); // 2D normal (dy,-dx) with the y axis flipped; +k = outward
        if (s.L.x < 0) s.L.multiplyScalar(-1);
        s.D = new T.Vector3(0, 0, 1);
      });
      return { nodes2, S, n };
    }
    const nodeInterp = (vals) => u => { const i = Math.min(vals.length - 2, Math.floor(u)), f = u - i; return lerp(vals[i], vals[i + 1], f); };
    const LEG2 = LIMBS.front.L, LEGS2 = LIMBS.side.L, ARM2 = LIMBS.front.A;
    const LEG = makeLimb(LEG2, nodeInterp(LEGS2.map(n => 150 - n[0])), nodeInterp(LEGS2.map(n => n[2] * 0.98)));
    const ARM = makeLimb(ARM2, () => -2, nodeInterp(ARM2.map((n, i) => n[2] * [0.95, 0.95, 0.9, 0.85, 0.8, 0.42, 0.38, 0.38, 0.38][i])));
    const THUMB = makeLimb([[246, 346, 4.5], [253, 360, 4], [257, 372, 3], [259, 380, 1.2]], () => 3.5, nodeInterp([4.2, 3.8, 2.8, 1.1]));
    function limbAtU(L, u) {
      const f = clamp(u / 0.04, 0, L.S.length - 1), i = Math.floor(f), t = f - i, a = L.S[i], b = L.S[Math.min(L.S.length - 1, i + 1)];
      return { C: a.C.clone().lerp(b.C, t), L: a.L.clone().lerp(b.L, t).normalize(), D: a.D, w: lerp(a.w, b.w, t), b: lerp(a.b, b.b, t) };
    }
    function limbPoint(L, u, phiDeg) {
      const fr = limbAtU(L, u), ph = phiDeg * Math.PI / 180, c = Math.cos(ph), s = Math.sin(ph);
      const pos = fr.C.clone().addScaledVector(fr.D, fr.b * c).addScaledVector(fr.L, fr.w * s);
      const nrm = fr.D.clone().multiplyScalar(c / fr.b).addScaledVector(fr.L, s / fr.w).normalize();
      return { pos, nrm };
    }
    function proj2D(nodes, x, y) { // nearest (u, k) on a 2D limb centre line
      let best = null;
      for (let i = 0; i < nodes.length - 1; i++) {
        const a = nodes[i], b = nodes[i + 1], dx = b[0] - a[0], dy = b[1] - a[1], l2 = dx * dx + dy * dy;
        const t = clamp(((x - a[0]) * dx + (y - a[1]) * dy) / l2, 0, 1);
        const px = a[0] + dx * t, py = a[1] + dy * t, l = Math.sqrt(l2);
        const off = ((x - px) * dy - (y - py) * dx) / l; // + along (dy,-dx)
        const d = Math.hypot(x - px, y - py), w = lerp(a[2], b[2], t);
        if (!best || d < best.d) best = { u: i + t, k: off / w, d };
      }
      return best;
    }

    /* ---------- feet (lofted along z, heel → toe) ---------- */
    const FZ = [-28, -24, -16, -6, 4, 10, 20, 34, 42, 47];
    const FTOP = [598, 590, 580, 572, 580, 590, 594, 597, 600, 604];
    const FBOT = [607, 609, 610, 610, 610, 610, 610, 610, 609, 606];
    const FA = [6, 7.5, 9, 10, 11, 11.5, 11.5, 10.5, 8, 4];
    const FP = 2.6;
    function footAt(z) {
      z = clamp(z, FZ[0], FZ[FZ.length - 1]);
      let i = 0; while (i < FZ.length - 2 && z > FZ[i + 1]) i++;
      const t = (z - FZ[i]) / (FZ[i + 1] - FZ[i]);
      const top = lerp(FTOP[i], FTOP[i + 1], t), bot = lerp(FBOT[i], FBOT[i + 1], t);
      return { Xc: lerp(25.5, 31, (z - FZ[0]) / (FZ[FZ.length - 1] - FZ[0])), a: lerp(FA[i], FA[i + 1], t), Yc: Y3((top + bot) / 2), h: (bot - top) / 2, z };
    }
    function footNormal(pos, f) { return new T.Vector3((pos.x - f.Xc) / (f.a * f.a), (pos.y - f.Yc) / (f.h * f.h), 0).normalize(); }
    function footFront(x, y) {
      const f = footAt(lerp(-4, 46, clamp((y - 574) / 36, 0, 1)));
      const X = x - 150, s = clamp((X - f.Xc) / f.a, -0.97, 0.97);
      const pos = new T.Vector3(X, f.Yc + f.h * Math.pow(1 - Math.pow(Math.abs(s), FP), 1 / FP), f.z);
      return { pos, nrm: footNormal(pos, f) };
    }
    function footBack(x, y) {
      const f = footAt(-24), pos = new T.Vector3(f.Xc + f.a * 0.6, Y3(clamp(y, 590, 606)), -26);
      return { pos, nrm: new T.Vector3(0.5, 0, -1).normalize() };
    }
    function footSide(xs, y) {
      const f = footAt(150 - xs), Y = Y3(y);
      if (y >= 608.5) { const pos = new T.Vector3(f.Xc - 0.15 * f.a, f.Yc - f.h, f.z); return { pos, nrm: new T.Vector3(0, -1, 0) }; }
      const t = clamp((Y - f.Yc) / f.h, -0.97, 0.97);
      const pos = new T.Vector3(f.Xc + f.a * Math.pow(1 - Math.pow(Math.abs(t), FP), 1 / FP), Y, f.z);
      return { pos, nrm: footNormal(pos, f) };
    }

    /* ---------- 2D → 3D mapping per view ---------- */
    function mapFB(x, y, back) {
      if (y >= 574) return back ? footBack(x, y) : footFront(x, y);
      if (x > 196 && y >= 128 && y <= 410) {
        const pr = proj2D(ARM2, x, y);
        if (Math.abs(pr.k) <= 1.35 && pr.u > 0.08) return limbPoint(ARM, pr.u, back ? 180 - clamp(pr.k, -1.1, 1.1) * 90 : clamp(pr.k, -1.1, 1.1) * 90);
      }
      if (y >= 330 && x - 150 > 6) {
        const pr = proj2D(LEG2, x, y);
        return limbPoint(LEG, pr.u, back ? 180 - clamp(pr.k, -1.1, 1.1) * 90 : clamp(pr.k, -1.1, 1.1) * 90);
      }
      return trunkFB(x, Math.min(y, Y1 - 2), back);
    }
    function mapSide(xs, y, mer) {
      if (mer === "GV" || mer === "CV") return trunkMidline(xs, y);
      if (y >= 574) return footSide(xs, y);
      if (y >= 345) { const pr = proj2D(LEGS2, xs, y); return limbPoint(LEG, pr.u, 90 + clamp(pr.k, -1.1, 1.1) * 90); }
      if (mer === "GB" && y < 32) return trunkTop(13, xs, 40);
      return trunkSide(xs, y);
    }
    function mapAt(view, at, mer) {
      if (typeof at[0] === "string") {
        const L = at[0] === "A" ? ARM : LEG, u = at[1], k = at[2];
        const phi = view === "front" ? k * 90 : view === "back" ? 180 - k * 90 : 90 + k * 90;
        return limbPoint(L, u, phi);
      }
      const [x, y] = at;
      return view === "side" ? mapSide(x, y, mer) : mapFB(x, y, view === "back");
    }
    const mirrorV = v => new T.Vector3(-v.x, v.y, v.z);

    /* ---------- scene ---------- */
    const scene = new T.Scene();
    const camera = new T.PerspectiveCamera(28, 1, 5, 6000);
    let renderer;
    try { renderer = new T.WebGLRenderer({ antialias: true, alpha: true }); }
    catch (e) { return null; }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setClearColor(0x000000, 0);
    host.appendChild(renderer.domElement);
    renderer.domElement.style.display = "block";
    renderer.domElement.setAttribute("aria-label", "3D 人體經絡模型 3D meridian model");
    const labelLayer = document.createElement("div");
    labelLayer.className = "lbl3d-layer";
    host.appendChild(labelLayer);

    const controls = new T.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true; controls.dampingFactor = 0.08; controls.rotateSpeed = 0.75;
    controls.zoomSpeed = 0.9; controls.minDistance = 70; controls.maxDistance = 2600; controls.screenSpacePanning = true;

    scene.add(new T.HemisphereLight(0xffffff, 0x6f8079, 0.6));
    const key = new T.DirectionalLight(0xffffff, 0.7); key.position.set(0.6, 0.8, 1); camera.add(key);
    const rim = new T.DirectionalLight(0xffffff, 0.25); rim.position.set(-1, 0.2, -0.6); camera.add(rim);
    scene.add(camera);

    const css = n => getComputedStyle(document.documentElement).getPropertyValue(n).trim() || "#888";
    const bodyMat = new T.MeshStandardMaterial({ color: css("--fig"), roughness: 0.8, metalness: 0.02, side: T.DoubleSide });
    const body = new T.Group(); scene.add(body);

    function loftMesh(rings, segs, capStart, capEnd) {
      const pos = [], idx = [];
      rings.forEach(r => r.forEach(v => pos.push(v.x, v.y, v.z)));
      for (let i = 0; i < rings.length - 1; i++) for (let j = 0; j < segs; j++) {
        const a = i * segs + j, b = i * segs + (j + 1) % segs, c = (i + 1) * segs + j, d = (i + 1) * segs + (j + 1) % segs;
        idx.push(a, c, b, b, c, d);
      }
      const addCap = (ri, flip) => {
        const r = rings[ri], c = new T.Vector3(); r.forEach(v => c.add(v)); c.multiplyScalar(1 / r.length);
        const ci = pos.length / 3; pos.push(c.x, c.y, c.z);
        for (let j = 0; j < segs; j++) { const a = ri * segs + j, b = ri * segs + (j + 1) % segs; flip ? idx.push(ci, b, a) : idx.push(ci, a, b); }
      };
      if (capStart) addCap(0, false);
      if (capEnd) addCap(rings.length - 1, true);
      const g = new T.BufferGeometry();
      g.setAttribute("position", new T.Float32BufferAttribute(pos, 3));
      g.setIndex(idx); g.computeVertexNormals();
      return g;
    }
    // trunk
    {
      const SEG = 64, rings = [];
      for (let y = Y0 + 1; y <= Y1; y += 1.5) {
        const a = tA(y), b = tB(y), p = tP(y), zc = tZc(y), r = [];
        for (let j = 0; j < SEG; j++) {
          const th = j / SEG * Math.PI * 2;
          r.push(new T.Vector3(a * spow(Math.cos(th), 2 / p), Y3(y), zc + b * spow(Math.sin(th), 2 / p)));
        }
        rings.push(r);
      }
      body.add(new T.Mesh(loftMesh(rings, SEG, true, true), bodyMat));
    }
    function limbMesh(L, mirror, capEnd) {
      const SEG = 28, rings = [];
      L.S.forEach(s => {
        const r = [];
        for (let j = 0; j < SEG; j++) {
          const th = j / SEG * Math.PI * 2, v = s.C.clone().addScaledVector(s.D, s.b * Math.cos(th)).addScaledVector(s.L, s.w * Math.sin(th));
          r.push(mirror ? mirrorV(v) : v);
        }
        rings.push(mirror ? r.reverse() : r);
      });
      return new T.Mesh(loftMesh(rings, SEG, true, capEnd), bodyMat);
    }
    function footMesh(mirror) {
      const SEG = 32, rings = [];
      for (let z = FZ[0]; z <= FZ[FZ.length - 1] + 1e-6; z += 1) {
        const f = footAt(z), r = [];
        for (let j = 0; j < SEG; j++) {
          const th = j / SEG * Math.PI * 2, v = new T.Vector3(f.Xc + f.a * spow(Math.cos(th), 2 / FP), f.Yc + f.h * spow(Math.sin(th), 2 / FP), z);
          r.push(mirror ? mirrorV(v) : v);
        }
        rings.push(mirror ? r : r.reverse());
      }
      return new T.Mesh(loftMesh(rings, SEG, true, true), bodyMat);
    }
    [false, true].forEach(m => {
      body.add(limbMesh(LEG, m, false)); body.add(limbMesh(ARM, m, true)); body.add(limbMesh(THUMB, m, true)); body.add(footMesh(m));
      const ear = new T.Mesh(new T.SphereGeometry(1, 16, 12), bodyMat);
      ear.scale.set(3.2, 10, 6.5); ear.position.set(m ? -32.5 : 32.5, Y3(56), -8); body.add(ear);
    });
    const nose = new T.Mesh(new T.SphereGeometry(1, 16, 12), bodyMat);
    nose.scale.set(4.5, 8.5, 6); nose.position.set(0, Y3(59), 34.5); body.add(nose);

    /* ---------- points ---------- */
    const isMid = id => !!MI[id].mid;
    const P3 = []; // {p, side:+1/-1, pos, nrm, mesh, hit}
    const ptGeo = new T.SphereGeometry(1, 12, 9);
    const hitGeo = new T.SphereGeometry(1, 6, 5);
    const hitMat = new T.MeshBasicMaterial(); hitMat.visible = false;
    const ptGroup = new T.Group(); scene.add(ptGroup);
    const hitGroup = new T.Group(); scene.add(hitGroup);
    const merMats = {};
    M.forEach(m => {
      merMats[m.id] = {
        pt: new T.MeshBasicMaterial({ color: css("--m-" + m.id), transparent: true, opacity: 1 }),
        ln: new T.MeshBasicMaterial({ color: css("--m-" + m.id), transparent: true, opacity: 0.85 }),
        thick: new T.MeshBasicMaterial({ color: css("--m-" + m.id) })
      };
    });
    P.forEach(p => {
      const r = mapAt(p.v, p.at, p.m);
      const sides = isMid(p.m) ? [1] : [1, -1];
      sides.forEach(sd => {
        const pos = sd > 0 ? r.pos.clone() : mirrorV(r.pos), nrm = sd > 0 ? r.nrm.clone() : mirrorV(r.nrm);
        pos.addScaledVector(nrm, 1.0);
        const mesh = new T.Mesh(ptGeo, merMats[p.m].pt); mesh.position.copy(pos); ptGroup.add(mesh);
        const hit = new T.Mesh(hitGeo, hitMat); hit.position.copy(pos); hit.scale.setScalar(5); hit.userData.pt = p.c; hitGroup.add(hit);
        P3.push({ p, side: sd, pos, nrm, mesh, hit });
      });
    });

    /* ---------- meridian routes ---------- */
    const RECIPE = {
      LU: [["front", 0]], LI: [["back", 0], ["front", 0]], ST: [["front", 0], ["front", 1]], SP: [["front", 0]], HT: [["front", 0]],
      SI: [["back", 0], ["side", 0, 9]], BL: [["front", 0], ["back", 0], ["back", 1], ["back", 2]], KI: [["side", 0], ["front", 0]],
      PC: [["front", 0]], TE: [["back", 0], ["side", 0, 8]], GB: [["side", 0]], LR: [["front", 0]], CV: [["front", 0]], GV: [["back", 0], ["side", 0, 16]]
    };
    const lineGroup = new T.Group(); scene.add(lineGroup);
    const MER3 = {}; // id → {thin:[], thick:[], hit:[], curves:[]}
    function routeSamples(view, seg, from, mer) {
      const pts2 = seg.slice(from || 0).map(q => resolve2(view, q));
      const dense2 = sampleRoute(pts2);
      const out = []; let last = null;
      dense2.forEach(([x, y]) => {
        if (last && Math.hypot(x - last[0], y - last[1]) < 2.5) return;
        last = [x, y];
        const r = mapAt(view, [x, y], mer);
        out.push(r.pos.clone().addScaledVector(r.nrm, 0.6));
      });
      const l = dense2[dense2.length - 1], r = mapAt(view, [l[0], l[1]], mer);
      out.push(r.pos.clone().addScaledVector(r.nrm, 0.6));
      return out;
    }
    const resolve2 = core.resolve;
    function tube(pts, radius) {
      const curve = new T.CatmullRomCurve3(pts, false, "centripetal");
      const g = new T.TubeGeometry(curve, Math.max(8, Math.round(pts.length * 1.6)), radius, 6, false);
      return { g, curve };
    }
    M.forEach(m => {
      const recipe = RECIPE[m.id], chains = [];
      recipe.forEach(([view, si, from]) => {
        const seg = (PATHS[m.id][view] || [])[si]; if (!seg) return;
        const pts = routeSamples(view, seg, from, m.id);
        const prev = chains[chains.length - 1];
        if (prev && prev[prev.length - 1].distanceTo(pts[0]) < 70) prev.push(...pts); else chains.push(pts);
      });
      const rec = { thin: [], thick: [], hit: [], curves: [] };
      const sides = isMid(m.id) ? [1] : [1, -1];
      sides.forEach(sd => chains.forEach(ch => {
        const pts = sd > 0 ? ch : ch.map(mirrorV);
        if (pts.length < 2) return;
        const a = tube(pts, 0.75), b = tube(pts, 1.3), h = tube(pts, 4.5);
        const thin = new T.Mesh(a.g, merMats[m.id].ln), thick = new T.Mesh(b.g, merMats[m.id].thick), hit = new T.Mesh(h.g, hitMat);
        thick.visible = false; hit.userData.mer = m.id;
        lineGroup.add(thin); lineGroup.add(thick); hitGroup.add(hit);
        rec.thin.push(thin); rec.thick.push(thick); rec.hit.push(hit); rec.curves.push(a.curve);
      }));
      MER3[m.id] = rec;
    });

    /* flow particles along the selected meridian */
    const flowMat = new T.MeshBasicMaterial({ color: 0xffffff });
    const flowGeo = new T.SphereGeometry(1.15, 8, 6);
    let flow = [];
    function setFlow(id) {
      flow.forEach(f => scene.remove(f.mesh)); flow = [];
      if (!id || reduceMotion) return;
      MER3[id].curves.forEach(c => {
        const len = c.getLength(), n = Math.max(2, Math.round(len / 45));
        for (let i = 0; i < n; i++) { const mesh = new T.Mesh(flowGeo, flowMat); scene.add(mesh); flow.push({ mesh, c, off: i / n, len }); }
      });
    }

    /* halo for the current point */
    const haloMat = new T.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.35, depthWrite: false });
    const halo = new T.Mesh(new T.SphereGeometry(1, 16, 12), haloMat); halo.visible = false; scene.add(halo);

    /* ---------- state & styling ---------- */
    let st = { sel: null, pt: null };
    let labels = [];
    function applyState() {
      const sel = st.sel, cur = st.pt;
      M.forEach(m => {
        const on = m.id === sel, r = MER3[m.id];
        merMats[m.id].ln.opacity = !sel ? 0.85 : on ? 1 : 0.18;
        merMats[m.id].ln.depthWrite = !sel || on;
        merMats[m.id].pt.opacity = !sel || on ? 1 : 0.4;
        r.thin.forEach(x => x.visible = !on); r.thick.forEach(x => x.visible = on);
      });
      P3.forEach(q => {
        const vis = cb.inSet(q.p);
        q.mesh.visible = vis; q.hit.visible = vis;
        const on = q.p.m === sel, isCur = q.p.c === cur;
        q.mesh.scale.setScalar(isCur ? 3.3 : on ? 2.4 : sel ? 1.45 : 1.85);
      });
      const curQ = P3.filter(q => q.p.c === cur);
      halo.visible = curQ.length > 0;
      if (curQ.length) { halo.userData.list = curQ; }
      setFlow(sel);
      buildLabels();
      occlusionDirty = true;
    }
    function buildLabels() {
      labelLayer.textContent = ""; labels = [];
      if (!st.sel && !st.pt) return;
      P3.forEach(q => {
        const isCur = q.p.c === st.pt;
        if (!(isCur || (q.p.m === st.sel && cb.inSet(q.p)))) return;
        const el = document.createElement("div");
        el.className = "lbl3d" + (isCur ? " cur" : "");
        el.textContent = isCur ? cb.ptName(q.p) + "  " + q.p.c : q.p.c;
        el.style.setProperty("--c", "var(--m-" + q.p.m + ")");
        labelLayer.appendChild(el);
        labels.push({ q, el, occluded: false, isCur });
      });
    }

    /* ---------- camera ---------- */
    let W = 1, H = 1;
    function fitDist(halfH, halfW) {
      const t = Math.tan(camera.fov * Math.PI / 360);
      return Math.max(halfH / t, halfW / (t * camera.aspect)) * 1.08;
    }
    const VIEWS = { front: [0, 0, 1], back: [0, 0, -1], side: [1, 0, 0], right: [-1, 0, 0] };
    let anim = null;
    function flyTo(target, dir, dist, ms) {
      const fromT = controls.target.clone(), fromP = camera.position.clone();
      const toP = target.clone().addScaledVector(dir.clone().normalize(), dist);
      if (reduceMotion || ms === 0) { controls.target.copy(target); camera.position.copy(toP); controls.update(); occlusionDirty = true; return; }
      anim = { t0: performance.now(), ms: ms || 650, fromT, fromP, toT: target.clone(), toP };
    }
    function curDir() { return camera.position.clone().sub(controls.target).normalize(); }
    function view(name) {
      const d = VIEWS[name] || VIEWS.front;
      flyTo(new T.Vector3(0, 0, 0), new T.Vector3(d[0], 0.06, d[2]), fitDist(318, 135));
    }
    function region(name) {
      const d = curDir(); d.y = 0; if (d.lengthSq() < 0.01) d.set(0, 0, 1); d.normalize();
      if (name === "full") return flyTo(new T.Vector3(0, 0, 0), d.setY(0.06), fitDist(318, 135));
      if (name === "head") return flyTo(new T.Vector3(0, Y3(58), 0), d.setY(0.08), fitDist(62, 52));
      if (name === "trunk") return flyTo(new T.Vector3(0, Y3(230), 0), d.setY(0.05), fitDist(140, 105));
      if (name === "leg") return flyTo(new T.Vector3(0, Y3(465), 0), d.setY(0.05), fitDist(158, 70));
      if (name === "arm") {
        const sx = camera.position.x - controls.target.x >= 0 ? 1 : -1;
        return flyTo(new T.Vector3(85 * sx, Y3(270), 0), new T.Vector3(0.55 * sx, 0.05, 1), fitDist(150, 70));
      }
    }
    function focusPoint(code) {
      const list = P3.filter(q => q.p.c === code); if (!list.length) return;
      const cd = curDir();
      list.sort((a, b) => b.nrm.dot(cd) - a.nrm.dot(cd));
      const q = list[0];
      const dir = q.nrm.clone(); dir.y = dir.y * 0.6 + 0.08;
      flyTo(q.pos.clone(), dir, fitDist(85, 62));
    }
    function zoomBy(f) {
      const off = camera.position.clone().sub(controls.target);
      const len = clamp(off.length() * f, controls.minDistance, controls.maxDistance);
      flyTo(controls.target.clone(), off.normalize(), len, 260);
    }

    /* ---------- picking ---------- */
    const ray = new T.Raycaster(), ndc = new T.Vector2();
    let down = null;
    renderer.domElement.addEventListener("pointerdown", e => { down = { x: e.clientX, y: e.clientY, t: performance.now() }; });
    renderer.domElement.addEventListener("pointerup", e => {
      if (!down) return;
      const moved = Math.hypot(e.clientX - down.x, e.clientY - down.y); down = null;
      if (moved > 6) return;
      const r = renderer.domElement.getBoundingClientRect();
      ndc.set((e.clientX - r.left) / r.width * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
      ray.setFromCamera(ndc, camera);
      const hits = ray.intersectObjects([body, hitGroup], true);
      for (const h of hits) {
        const o = h.object;
        if (o.userData.pt) { if (o.visible) { cb.onPoint(o.userData.pt); return; } continue; }
        if (o.userData.mer) { cb.onMer(o.userData.mer); return; }
        // body hit: allow a point or line just beside the surface within 3 units
        const next = hits.find(x => (x.object.userData.pt && x.object.visible) || x.object.userData.mer);
        if (next && next.distance - h.distance < 3) { next.object.userData.pt ? cb.onPoint(next.object.userData.pt) : cb.onMer(next.object.userData.mer); }
        return;
      }
    });

    /* ---------- labels: projection + occlusion ---------- */
    let occlusionDirty = true, lastOcc = 0;
    const tmp = new T.Vector3(), camDir = new T.Vector3();
    function updateLabels(now) {
      if (!labels.length) return;
      const doOcc = occlusionDirty && now - lastOcc > 140;
      if (doOcc) { lastOcc = now; occlusionDirty = false; }
      labels.forEach(L => {
        const q = L.q;
        camDir.copy(camera.position).sub(q.pos);
        const facing = q.nrm.dot(camDir) > 0;
        if (doOcc) {
          if (!facing) L.occluded = true;
          else {
            const dist = camDir.length();
            ray.set(camera.position, camDir.clone().multiplyScalar(-1 / dist));
            ray.far = dist - 1.5;
            L.occluded = ray.intersectObject(body, true).length > 0;
            ray.far = Infinity;
          }
        }
        tmp.copy(q.pos).project(camera);
        const vis = facing && !L.occluded && tmp.z < 1 && Math.abs(tmp.x) < 1.05 && Math.abs(tmp.y) < 1.05;
        L.el.style.display = vis ? "" : "none";
        if (vis) L.el.style.transform = `translate(${((tmp.x + 1) / 2 * W).toFixed(1)}px, ${((1 - tmp.y) / 2 * H).toFixed(1)}px)`;
      });
      // hide crowded plain labels (keep the current one)
      const shown = labels.filter(L => L.el.style.display !== "none");
      const placed = [];
      shown.sort((a, b) => (b.isCur ? 1 : 0) - (a.isCur ? 1 : 0)).forEach(L => {
        const m = /translate\(([-\d.]+)px, ([-\d.]+)px\)/.exec(L.el.style.transform); if (!m) return;
        const x = +m[1], y = +m[2];
        if (!L.isCur && placed.some(([px, py]) => Math.abs(px - x) < 30 && Math.abs(py - y) < 12)) { L.el.style.display = "none"; return; }
        placed.push([x, y]);
      });
    }
    controls.addEventListener("change", () => { occlusionDirty = true; });

    /* ---------- loop ---------- */
    function resize() {
      const r = host.getBoundingClientRect(); W = Math.max(1, r.width); H = Math.max(1, r.height);
      renderer.setSize(W, H, false); renderer.domElement.style.width = W + "px"; renderer.domElement.style.height = H + "px";
      camera.aspect = W / H; camera.updateProjectionMatrix(); occlusionDirty = true;
    }
    try { new ResizeObserver(resize).observe(host); } catch (e) { window.addEventListener("resize", resize); }
    resize();
    camera.position.set(0, 20, fitDist(318, 135)); controls.target.set(0, 0, 0); controls.update();

    const ease = t => 1 - Math.pow(1 - t, 3);
    function frame(now) {
      requestAnimationFrame(frame);
      if (!cb.isActive() || !W) return;
      if (anim) {
        const u = clamp((now - anim.t0) / anim.ms, 0, 1), e = ease(u);
        controls.target.lerpVectors(anim.fromT, anim.toT, e);
        camera.position.lerpVectors(anim.fromP, anim.toP, e);
        if (u >= 1) anim = null;
        occlusionDirty = true;
      }
      controls.update();
      if (flow.length) {
        const t = now / 1000;
        flow.forEach(f => { const s = ((t * 38 / f.len) + f.off) % 1; f.mesh.position.copy(f.c.getPointAt(s)); });
      }
      if (halo.visible && halo.userData.list) {
        const k = reduceMotion ? 0.5 : (now % 1400) / 1400;
        halo.scale.setScalar(3.3 + k * 6); haloMat.opacity = 0.45 * (1 - k);
        const cd = curDir(), list = halo.userData.list.slice().sort((a, b) => b.nrm.dot(cd) - a.nrm.dot(cd));
        halo.position.copy(list[0].pos); haloMat.color.set(css("--m-" + list[0].p.m));
      }
      renderer.render(scene, camera);
      updateLabels(now);
    }
    requestAnimationFrame(frame);

    function refreshColors() {
      bodyMat.color.set(css("--fig"));
      M.forEach(m => { const c = css("--m-" + m.id); merMats[m.id].pt.color.set(c); merMats[m.id].ln.color.set(c); merMats[m.id].thick.color.set(c); });
      flowMat.color.set(css("--flow"));
    }
    try { matchMedia("(prefers-color-scheme: dark)").addEventListener("change", refreshColors); } catch (e) {}
    try { new MutationObserver(refreshColors).observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] }); } catch (e) {}

    applyState();
    return {
      update(s) { st = { sel: s.sel, pt: s.pt }; applyState(); },
      relabel() { buildLabels(); occlusionDirty = true; },
      view, region, focusPoint, zoomBy, resize,
      reset() { view("front"); }
    };
  };
})();
