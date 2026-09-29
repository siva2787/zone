# LearnTwin AI

An offline-first, AI-powered learning companion that models each student's mastery, retention, and knowledge gaps in real time, with an adaptive tutor, knowledge graph, and practice assessments.

## Run Locally

**Prerequisites:** Node.js

1. Install dependencies:
   `npm install`
2. Copy `.env.example` to `.env` and set your AI API key (`GEMINI_API_KEY`)
3. Run the app:
   `npm run dev`

## Build & Deploy

1. Build the frontend:
   `npm run build`
2. Start the server (serves the built frontend and the API from one process):
   `npm start`

The server reads `PORT` from the environment (defaults to `3000`), so it can be deployed as a single Node web service on platforms like Render or Railway.