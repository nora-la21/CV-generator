# CV Generator

AI-powered CV tailoring tool for QArea and TestFort.

## Features
- Upload CVs in **PDF** or **DOCX** format
- Paste a **job description** → AI embeds required skills organically
- Write **direct instructions** → AI applies changes precisely
- Export in **QArea** or **TestFort** branded format
- Download as **DOCX** or **PDF**

## Setup

### 1. Add company logos
Place your logo files in:
- `server/assets/logos/qarea.png`
- `server/assets/logos/testfort.png`

Also copy them to:
- `client/public/logos/qarea.png`
- `client/public/logos/testfort.png`

### 2. Configure environment
```bash
cp .env.example .env
# Edit .env and add your ANTHROPIC_API_KEY
```

### 3. Install dependencies
```bash
# Server
cd server && npm install

# Client
cd ../client && npm install
```

### 4. Run
```bash
# Terminal 1 — backend
cd server && node index.js

# Terminal 2 — frontend
cd client && npm run dev
```

Open http://localhost:5173

## Optional: Calibri font for PDF
For best PDF rendering, add Calibri font files to `server/assets/fonts/`:
- `calibri.ttf`
- `calibrib.ttf` (bold)
- `calibrii.ttf` (italic)
- `calibriz.ttf` (bold italic)

Without them, Helvetica is used as fallback.
