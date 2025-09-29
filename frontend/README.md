# Live Polling Frontend

## Scripts
- dev: `npm run dev`
- build: `npm run build`
- preview: `npm run preview`

## Env
- `VITE_BACKEND_URL` (default `http://localhost:4000`)

## Run locally
```bash
cd frontend
npm i
npm run dev
```
Vite dev server proxies `/api` to `http://localhost:4000`.

## Build & Serve
```bash
npm run build
npm run preview
```

## Deployment
- Static hosting (Vercel/Netlify). Set env `VITE_BACKEND_URL` to your backend URL.
- Or serve via any static server. Ensure backend CORS allows frontend origin.
