# Live Polling System (Teacher/Student)

Figma reference: [`Intervue-Assigment--Poll-system--Copy`](https://www.figma.com/design/5CW5P2O5bIO9qbZPuyZuX7/Intervue-Assigment--Poll-system--Copy-?node-id=0-1&p=f&t=gRifZtLkWJELJDEI-0)

## Stack
- Frontend: React + Vite + Redux Toolkit + Socket.io client
- Backend: Express + Socket.io

## Prerequisites
- Node 18+

## Run locally
Open two terminals.

Backend:
```bash
cd backend
npm i
npm run dev
```

Frontend:
```bash
cd frontend
npm i
npm run dev
```
Vite will proxy `/api` to `http://localhost:4000`.

## Build
Frontend:
```bash
cd frontend
npm run build
```

## Deployment
Backend:
- Host on any Node provider (Render/Railway/EC2). Set `PORT` and allow CORS for the frontend origin.
- Start with `npm ci && npm start`.

Frontend:
- Deploy static `dist/` to Vercel/Netlify. Set env `VITE_BACKEND_URL` to your backend URL.

## Features
- Teacher: create polls with optional time limit, live results, close poll, remove students, view past polls
- Student: join with name, answer within 60s, see live results after submitting or closing
- Realtime via Socket.io, plus a small chat popup

