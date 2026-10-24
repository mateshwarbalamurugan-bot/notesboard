# Notesboard — Frontend + Backend

This project keeps your supplied Vue landing page and adds a local Express backend. Notes are stored in `backend/data/notes.json`; the app also keeps a browser backup in `localStorage`.

## Requirements
- Node.js 18 or newer (the backend itself has no npm dependencies)
- Internet only if you want npm to download dependencies or use the optional Gemini endpoint

## Run it on Windows (VS Code)

### 1. Install frontend dependencies
Open a terminal in the project root (the folder containing the frontend `package.json`):

```powershell
npm install
```

### 2. Install backend dependencies
Open a **second terminal**:

```powershell
cd backend
npm start
```

Keep this backend terminal open. It should report `http://localhost:3000`.
You can check it by opening `http://localhost:3000/api/health` in your browser.

### 3. Start the frontend
In the first terminal, return to the project root if needed and run:

```powershell
npm run dev
```

Open the Vite URL shown in the terminal, usually `http://localhost:5173`.

## How persistence works
- The frontend reads notes from `GET /api/notes`.
- Edits are synced in a debounced batch through `PUT /api/notes/sync`.
- If this browser already had Notesboard notes and the backend has none, the frontend tries to migrate those local notes to the backend once.
- If the backend is offline, the browser backup remains available and the app displays a message.
- Keep `backend/data/notes.json` to keep your server-stored notes. Back it up before moving/deleting project folders.

## Optional Gemini endpoint
The included frontend's current **Generate note** and **Mind map** tools still run locally with simple rules; they do not require an AI API key. The backend also includes `POST /api/idea-coach` for later integration. To enable that endpoint:

1. Copy `backend/.env.example` to `backend/.env`.
2. Add your Gemini API key to `GEMINI_API_KEY` in `backend/.env`.
3. Restart the backend.

Do not share or commit `.env` or your API key.

## API routes
- `GET /api/health`
- `GET /api/notes?q=search-text`
- `POST /api/notes`
- `PUT /api/notes/:id`
- `PUT /api/notes/sync` — saves the complete current note list for this single-user local app
- `DELETE /api/notes/:id`
- `POST /api/idea-coach` — optional Gemini endpoint

## Build the frontend
```powershell
npm run build
```
