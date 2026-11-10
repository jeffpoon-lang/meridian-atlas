# 經絡銅人 Meridian Atlas

Interactive 3D acupuncture meridian atlas for learning TCM point names in Chinese and English.
中醫經絡穴位互動學習工具：3D 人體、十四經、WHO 標準 361 穴、中英對照、主治、閃卡、測驗、子午流注。

- 中文版：https://meridian-atlas-mauve.vercel.app/
- English：https://meridian-atlas-mauve.vercel.app/en/
- By 靈性IT仔 · Instagram [@jeffpoon.ai](https://www.instagram.com/jeffpoon.ai/) · [Buy me a coffee](https://buymeacoffee.com/sitequirrel)

## Structure

| Path | What it is |
| --- | --- |
| `index.html`, `en/index.html` | Built pages (Chinese default / English default). Do not edit by hand. |
| `scripts/markup.html` | Page body markup shared by both pages |
| `scripts/build.mjs` | Builds the two pages and `dist-artifact/` from the markup |
| `assets/app.js` | Data (14 meridians, 361 points, routes), 2D figure, UI, search, flashcards, quiz, body clock |
| `assets/body3d.js` | Three.js 3D body: builds the mannequin from the 2D silhouettes and lifts points and routes onto it |
| `assets/uses.js` | Traditional uses (主治) for all 361 points, Chinese + English. Source: `data/uses-*.tsv` |
| `assets/app.css` | Styles (light + dark) |
| `api/og.js` | Vercel Edge function for the link preview image (`/api/og`, `/api/og?lang=en`) |
| `brand/` | Logo files |

## Edit and deploy

1. Edit `scripts/markup.html` or anything in `assets/`.
2. Run `node scripts/build.mjs`.
3. Commit and push to `main`. Vercel deploys automatically.

Three.js 0.147.0 and OrbitControls load from jsDelivr. If WebGL is unavailable, the page falls back to the 2D front / back / side figure.

## Notes

Meridian routes and the 3D body are schematic, for study only. Codes and names follow the WHO Standard Acupuncture Point Locations (2008). Uses are brief summaries of traditional indications, not medical advice.
