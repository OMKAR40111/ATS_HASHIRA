import sqlite3
import threading
import json
import os
from typing import Optional, List, Dict, Any

DB_PATH = os.environ.get('ATS_DB', os.path.join(os.getcwd(), 'ats_submissions.db'))
_lock = threading.Lock()

def init_db():
    with _lock:
        conn = sqlite3.connect(DB_PATH)
        cur = conn.cursor()
        cur.execute('''
        CREATE TABLE IF NOT EXISTS submissions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            job_description TEXT,
            resume_id TEXT,
            resume_text TEXT,
            score_raw REAL,
            breakdown TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
        ''')
        conn.commit()
        conn.close()

def save_submission(job_description: str, resume_id: str, resume_text: str, score_raw: float, breakdown: Dict[str, Any]):
    with _lock:
        conn = sqlite3.connect(DB_PATH)
        cur = conn.cursor()
        cur.execute('INSERT INTO submissions (job_description, resume_id, resume_text, score_raw, breakdown) VALUES (?,?,?,?,?)',
                    (job_description, resume_id, resume_text, float(score_raw), json.dumps(breakdown)))
        conn.commit()
        conn.close()

def get_all_scores_for_job(job_description: Optional[str]=None) -> List[float]:
    with _lock:
        conn = sqlite3.connect(DB_PATH)
        cur = conn.cursor()
        if job_description:
            cur.execute('SELECT score_raw FROM submissions WHERE job_description = ?', (job_description,))
        else:
            cur.execute('SELECT score_raw FROM submissions')
        rows = cur.fetchall()
        conn.close()
        return [r[0] for r in rows]

def get_recent_submissions(limit: int = 50):
    with _lock:
        conn = sqlite3.connect(DB_PATH)
        cur = conn.cursor()
        cur.execute('SELECT id, job_description, resume_id, score_raw, breakdown, created_at FROM submissions ORDER BY created_at DESC LIMIT ?', (limit,))
        rows = cur.fetchall()
        conn.close()
        results = []
        for r in rows:
            results.append({
                'id': r[0], 'job_description': r[1], 'resume_id': r[2], 'score_raw': r[3], 'breakdown': json.loads(r[4]) if r[4] else None, 'created_at': r[5]
            })
        return results
