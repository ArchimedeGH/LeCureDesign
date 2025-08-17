# LeCureDesign — Scandinavian Kitchen Planner

![Build macOS DMG — final](https://github.com/ArchimedeGH/LeCureDesign/actions/workflows/release-final.yml/badge.svg)

App desktop (Electron + Next.js) per progettare cucine in stile scandinavo con:
- **Modeler** 2D/annotazioni
- **Viewer 3D** statico (PBR-lite) → `/viewer.html`
- **Export PDF** (MVP)
- Componentistica **Blum** e finiture **rovere oliato**

---

## Come ottenere l’installer per macOS (DMG)

1. Vai alla tab **Actions** del repository.
2. Apri il workflow **Build macOS DMG — final**.
3. Clicca **Run workflow** (branch `main`) **oppure** fai un commit su `main` (es. modifica questo README).
4. A fine run:
   - Scarica il DMG da **Artifacts**: `LeCureDesign-macOS-dmg`, oppure
   - Vai su **Releases** (se previsto dal workflow) e scarica l’asset DMG.

> Requisiti del workflow: GitHub Actions abilitato con **Allow all actions** e **Read & write permissions** (Settings → Actions).

---

## Avvio locale (sviluppo)

**Prerequisiti**
- Node.js **v20**
- macOS (per build DMG)

**Installazione**
```bash
npm install --no-audit --no-fund --legacy-peer-deps
