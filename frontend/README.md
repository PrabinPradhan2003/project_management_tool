FullName :-> Mula Prabin Pradhan
gmail:-> prabinpradhan1008@gmail.com
phone:-> 8144783119



# Project Management Frontend

React + Vite + Material‑UI frontend for the Project Management Tool.

## Quick start
1) `cd frontend`
2) `npm install`
3) `npm run dev` (or `npm start`)

The frontend proxies API requests to http://localhost:4000 by default (see `package.json` "proxy").

## Notes
- Stores JWT in localStorage under `pm_token` and user info under `pm_user`.
- Endpoints used: `/api/auth`, `/api/projects`, `/api/tasks`, `/api/users`, `/api/ai`.
- If you need a custom API URL in production, use a Vite env variable (e.g., `VITE_API_URL`) and make sure the app reads it.
 - Text-to-speech: Use the Voice settings tester on the AI User Stories page to pick a working voice. Your choice is saved in `pm_tts_voiceName` and used by the Listen button.

## Scripts
- `npm run dev` — start Vite dev server
- `npm run build` — create production build
- `npm run preview` — preview production build locally
