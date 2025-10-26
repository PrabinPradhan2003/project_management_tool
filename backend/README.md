# Project Management Backend

Express + Mongoose API for the Project Management Tool (Intern Assignment) with centralized error handling and Groq AI integration.

## Requirements
- Node.js 18+
- MongoDB (local or Atlas)

## Quick start
1) Copy `.env.example` to `.env` and fill values (`MONGO_URI`, `JWT_SECRET`, `GROQ_API_KEY`).
2) `cd backend`
3) `npm install`
4) `npm run dev` (or `npm start`)

APIs are served under `/api`.

## Notes
- Uses Mongoose; requires `MONGO_URI` in `.env`.
- Global 404 and error middleware live in `src/middleware/error.js`.
- Groq integration (AI user stories) lives in `src/controllers/aiController.js` and routes under `/api/ai`.
- Validate your Groq key/models with `node test-groq.js`.

