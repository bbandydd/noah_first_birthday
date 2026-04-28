# Noah First Birthday WebAR

This project creates a two-layer party layout in WebAR for iPhone:

- Layer 1 (lower eye-level): 12 photos around the user.
- Layer 2 (slightly higher): 4 videos around the user.
- Includes interactions (tap cards, play/pause videos, relocate layout).
- Includes 3-second countdown reveal after placement.

## Quick Start

1. Host this folder on HTTPS (Netlify, Vercel, GitHub Pages, or your own HTTPS server).
2. Open the URL on iPhone Safari.
3. Allow camera permission.
4. Move slowly to detect the floor.
5. Tap the ground once to place the full layout around you.

## GitHub Pages Quick Deploy

This project is already configured with `gh-pages`.

### One-time setup

1. Create an empty GitHub repository.
2. In this project folder, connect your remote:

```bash
git remote add origin https://github.com/<your-account>/<your-repo>.git
```

3. Commit and push main branch:

```bash
git add .
git commit -m "Initial AR party project"
git push -u origin main
```

### Deploy

```bash
npm run deploy
```

Optional preview command (prepare deployment commit without pushing):

```bash
npm run deploy:dry-run
```

After first deploy, open your repository settings and ensure Pages is using `gh-pages` branch (root).

Your published URL will be:

```text
https://<your-account>.github.io/<your-repo>/
```

## Change Photos and Videos

Edit `src/config.js`:

- `photos`: set each `src` to your image path.
- `videos`: set each `src` to your mp4 path.
- `layerOne` and `layerTwo`: tune height/radius/size.
- `intro.countdownSeconds`: change reveal countdown time.

### Example local asset paths

- Photos: `assets/photos/photo01.jpg` ... `assets/photos/photo12.jpg`
- Videos: `assets/videos/video01.mp4` ... `assets/videos/video04.mp4`

Current template uses:

- 12 placeholders for photos (safe default preview)
- 4 sample remote videos (so the experience works immediately)

## iPhone Video Notes

- Safari is strict about autoplay.
- Videos are muted by default in `src/config.js` for reliability.
- Set `muted: false` per video if you want audio, then play via a tap action.

## Controls

- Re-place Layout: remove current placement, tap ground again.
- Play All Videos / Pause All Videos: global video control.
- Tap any photo card: pop + frame flash.
- Tap any video card: toggle play/pause + frame flash.

## Important

This project uses the 8th Wall engine binary script and preload chunk `slam` for world tracking.
