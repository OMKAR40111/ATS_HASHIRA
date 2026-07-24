ATS Bot — Resume evaluator (FastAPI + Telegram)

Quick overview
- Backend: FastAPI (`ats_bot/backend/main.py`) exposes `/evaluate` and `/courses` endpoints.
- Bot: `ats_bot/telegram_bot.py` — a minimal Telegram bot that uploads resumes and JD to the backend.

Setup
1. Create a Python venv and install dependencies:
```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1  # or use activate script for cmd
pip install -r ats_bot/backend/requirements.txt
```

2. Set environment variables:
- `OPENAI_API_KEY` (optional, for richer suggestions)
- `TELEGRAM_TOKEN` (if you want to run the Telegram bot)
- `BACKEND_URL` (for the bot; default http://localhost:8000)

Run backend
```powershell
uvicorn ats_bot.backend.main:app --reload --port 8000
```

Run Telegram bot (optional)
```powershell
python ats_bot/telegram_bot.py
```

Frontend (optional)
1. Install frontend dependencies and run dev server:
```powershell
cd ats_bot\frontend
npm install
npm run dev
```

If you want the frontend to call a backend on a different host, set `VITE_BACKEND_URL` in an `.env` file in `ats_bot/frontend`:
```
VITE_BACKEND_URL=http://localhost:8000
```

Model file (optional)
If you train a regression model (see `training/train_simple.py`) save the `model.joblib` into the backend working directory or set the environment variable `MODEL_FILE` to its path. The backend will load it automatically and include regression scores in results.

Admin model upload
You can upload a trained `model.joblib` at runtime via the admin endpoint:

```
curl -X POST http://localhost:8000/admin/upload_model -F "file=@model.joblib"
```

The backend will save the file as `model.joblib` in its working directory and attempt to load it.


Usage
- Use the `/evaluate` endpoint to POST a job_description and multiple resume files (form-data), or send JSON with resumes as text.
