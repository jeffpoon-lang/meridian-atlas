// Builds index.html (中文), en/index.html (English) and dist-artifact/index.html (Claude artifact page)
// from scripts/markup.html and the files in assets/. Run: node scripts/build.mjs
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = f => fs.readFileSync(path.join(root, f), "utf8");
const write = (f, s) => { fs.mkdirSync(path.dirname(path.join(root, f)), { recursive: true }); fs.writeFileSync(path.join(root, f), s); };

const SITE = "https://meridian-atlas-mauve.vercel.app";
const THREE = "https://cdn.jsdelivr.net/npm/three@0.147.0/build/three.min.js";
const ORBIT = "https://cdn.jsdelivr.net/npm/three@0.147.0/examples/js/controls/OrbitControls.js";
const FONTS = "https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&family=LXGW+WenKai+TC:wght@400;700&family=Noto+Sans+TC:wght@400;500;700&display=swap";
const markup = read("scripts/markup.html");
const v = Date.now().toString(36);

const LOCALES = {
  zh: {
    lang: "zh-Hant-HK", out: "index.html", base: "", url: SITE + "/", force: "",
    title: "經絡銅人｜3D 經絡穴位 中英對照",
    desc: "免費互動學習中醫經絡穴位：3D 人體模型、十四經 361 穴、主治、閃卡、測驗、子午流注。by 靈性IT仔 @jeffpoon.ai",
    og: SITE + "/api/og"
  },
  en: {
    lang: "en", out: "en/index.html", base: "../", url: SITE + "/en/", force: "en",
    title: "Meridian Atlas | 3D acupuncture points in English & Chinese",
    desc: "Free interactive study tool: 3D body, 14 meridians, all 361 WHO acupuncture points with traditional uses, flashcards, quiz and body clock. By @jeffpoon.ai",
    og: SITE + "/api/og?lang=en"
  }
};

function page(L) {
  return `<!doctype html>
<html lang="${L.lang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${L.title}</title>
<meta name="description" content="${L.desc}">
<meta property="og:type" content="website">
<meta property="og:url" content="${L.url}">
<meta property="og:site_name" content="經絡銅人 Meridian Atlas">
<meta property="og:title" content="${L.title}">
<meta property="og:description" content="${L.desc}">
<meta property="og:image" content="${L.og}">
<meta property="og:image:type" content="image/png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:image" content="${L.og}">
<link rel="alternate" hreflang="zh-Hant" href="${SITE}/">
<link rel="alternate" hreflang="en" href="${SITE}/en/">
<link rel="icon" type="image/png" href="/apple-touch-icon.png">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<meta name="theme-color" content="#1C6758">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="${FONTS}">
<style>:root{padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}body{margin:0}</style>
<link rel="stylesheet" href="${L.base}assets/app.css?v=${v}">
${L.force ? `<script>window.MA_FORCE_LANG="${L.force}";</script>\n` : ""}</head>
<body>
${markup}
<script src="${THREE}"></script>
<script src="${ORBIT}"></script>
<script src="${L.base}assets/uses.js?v=${v}"></script>
<script src="${L.base}assets/body3d.js?v=${v}"></script>
<script src="${L.base}assets/app.js?v=${v}"></script>
</body>
</html>
`;
}

for (const L of Object.values(LOCALES)) write(L.out, page(L));

// Claude artifact: page body only (the artifact host adds the document skeleton)
write("dist-artifact/index.html", `<title>經絡銅人</title>
<meta name="claude:viewport-fit-sides" content="cover">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="${FONTS}">
<link rel="stylesheet" href="assets/app.css">
${markup}
<script src="${THREE}"></script>
<script src="${ORBIT}"></script>
<script src="assets/uses.js"></script>
<script src="assets/body3d.js"></script>
<script src="assets/app.js"></script>
`);
console.log("built", Object.values(LOCALES).map(l => l.out).join(", "), "+ dist-artifact/index.html");
