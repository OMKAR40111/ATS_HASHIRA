import os
import time
import requests
import io
import json

BACKEND = os.environ.get('BACKEND_URL', 'http://localhost:8000')
TOKEN = os.environ.get('TELEGRAM_TOKEN')

if not TOKEN:
    print('Set TELEGRAM_TOKEN environment variable and restart the bot')
    raise SystemExit(1)

API = f'https://api.telegram.org/bot{TOKEN}'
API_FILE = f'https://api.telegram.org/file/bot{TOKEN}'

# Attempt to remove any webhook so polling via getUpdates works (prevents 409 Conflict)
try:
    resp = requests.post(f'{API}/deleteWebhook', timeout=10)
    print('deleteWebhook', resp.status_code, resp.text)
except Exception as e:
    print('deleteWebhook error:', e)

# In-memory stores per chat
uploads = {}            # chat_id -> list of (filename, bytes)
last_results = {}       # chat_id -> last evaluation JSON
recent_file_ids = {}    # chat_id -> {file_id: timestamp}
job_descriptions = {}   # chat_id -> (name, bytes)
recent_message_ids = {} # chat_id -> {message_id: timestamp}


def get_updates(offset=None, timeout=30):
    params = {'timeout': timeout}
    if offset:
        params['offset'] = offset
    r = requests.get(f'{API}/getUpdates', params=params, timeout=timeout+10)
    r.raise_for_status()
    return r.json().get('result', [])


def send_message(chat_id, text):
    data = {'chat_id': chat_id, 'text': text}
    return requests.post(f'{API}/sendMessage', data=data)


def send_document(chat_id, filename, file_bytes, caption=None):
    files = {'document': (filename, io.BytesIO(file_bytes))}
    data = {'chat_id': chat_id}
    if caption:
        data['caption'] = caption
    return requests.post(f'{API}/sendDocument', data=data, files=files)


def download_file(file_path):
    url = f"{API_FILE}/{file_path}"
    r = requests.get(url)
    r.raise_for_status()
    return r.content


def handle_message(update):
    message = update.get('message') or update.get('edited_message')
    if not message:
        return
    chat = message.get('chat', {})
    chat_id = chat.get('id')

    # dedupe by message_id (short window)
    msg_id = message.get('message_id')
    now = time.time()
    recent_msgs = recent_message_ids.setdefault(chat_id, {})
    # purge old
    for k, ts in list(recent_msgs.items()):
        if now - ts > 15:
            recent_msgs.pop(k, None)
    if msg_id and msg_id in recent_msgs:
        return
    if msg_id:
        recent_msgs[msg_id] = now

    # Documents
    if 'document' in message:
        doc = message['document']
        file_id = doc.get('file_id')
        # dedupe file receipts
        recent_files = recent_file_ids.setdefault(chat_id, {})
        for k, ts in list(recent_files.items()):
            if now - ts > 10:
                recent_files.pop(k, None)
        if file_id in recent_files:
            return
        recent_files[file_id] = now

        # fetch file info and download
        r = requests.get(f'{API}/getFile', params={'file_id': file_id})
        if r.status_code != 200:
            send_message(chat_id, 'Failed to get file info')
            return
        fp = r.json().get('result', {}).get('file_path')
        if not fp:
            send_message(chat_id, 'No file path returned')
            return
        try:
            content = download_file(fp)
        except Exception as e:
            send_message(chat_id, 'Error downloading file: ' + str(e))
            return

        name = doc.get('file_name') or 'file'
        lname = (name or '').lower()
        if any(k in lname for k in ('job', 'jd', 'description')):
            job_descriptions[chat_id] = (name, content)
            send_message(chat_id, f"Got Job Description '{name}'. Upload candidate resumes (PDF/DOCX). When ready, send /evaluate to use this uploaded JD or /evaluate <job description> to paste JD text inline.")
        else:
            uploads.setdefault(chat_id, []).append((name, content))
            send_message(chat_id, f"Received resume '{name}'. Upload more resumes or run /evaluate when you're ready. You can also paste JD text with /evaluate <job description>.")
        return

    # Text
    text = message.get('text') or ''
    if not text:
        return

    if text.startswith('/start'):
        send_message(chat_id, 'Hello — send the Job Description file or paste the JD text, then upload resumes. Use /evaluate <job description> or /evaluate_uploaded to evaluate uploaded files. Use /help for options.')
        return

    if text.startswith('/help'):
        help_text = (
            'Commands:\n'
            '/start - get started\n'
            '/help - this message\n'
            '/evaluate <job description text> - evaluate uploaded resumes against provided JD text\n'
            '/evaluate_uploaded - evaluate using the uploaded Job Description file (if you uploaded one)\n'
            '/courses <candidate_id> - get courses for a candidate from last evaluation\n'
        )
        send_message(chat_id, help_text)
        return

    if text.startswith('/evaluate_uploaded'):
        jd_entry = job_descriptions.get(chat_id)
        if not jd_entry:
            send_message(chat_id, 'No uploaded Job Description found. Upload a JD file first or use /evaluate <job description text>.')
            return
        jd_name, jd_content = jd_entry
        # Try best-effort to extract text: if backend exposes /extract_text, else fallback to empty
        jd_text = ''
        try:
            # backend may not have this endpoint; ignore failures
            r = requests.post(f'{BACKEND}/extract_text', files={'file': (jd_name, io.BytesIO(jd_content))}, timeout=30)
            if r.status_code == 200:
                jd_text = r.text
        except Exception:
            jd_text = ''

        files = uploads.get(chat_id, [])
        if not files:
            send_message(chat_id, 'No resumes uploaded. Please upload candidate resumes as attachments.')
            return

        files_payload = []
        for fname, content in files:
            files_payload.append(('files', (fname, io.BytesIO(content))))
        data = {'job_description': jd_text}
        try:
            resp = requests.post(f'{BACKEND}/evaluate/form', data=data, files=files_payload, timeout=120)
            json_data = resp.json()
            last_results[chat_id] = {'job_description': jd_text, 'data': json_data}
            # send compact results
            msg = format_results_message(json_data)
            for chunk in [msg[i:i+3800] for i in range(0, len(msg), 3800)]:
                send_message(chat_id, chunk)
            # clear staged uploads after evaluation to avoid accidental reuse
            uploads.pop(chat_id, None)
        except Exception as e:
            send_message(chat_id, 'Error calling backend: ' + str(e))
        return

    if text.startswith('/evaluate'):
        parts = text.split(' ', 1)
        # If user didn't provide JD text, try using an uploaded JD file for this chat
        if len(parts) < 2 or not parts[1].strip():
            jd_entry = job_descriptions.get(chat_id)
            if jd_entry:
                jd_name, jd_content = jd_entry
                try:
                    r = requests.post(f'{BACKEND}/extract_text', files={'file': (jd_name, io.BytesIO(jd_content))}, timeout=30)
                    jd = r.text if r.status_code == 200 else ''
                except Exception:
                    jd = ''
                if not jd:
                    send_message(chat_id, 'Uploaded Job Description found but could not extract text. Please use /evaluate <job description> with JD text.')
                    return
            else:
                send_message(chat_id, 'Usage: /evaluate <job description>')
                return
        else:
            jd = parts[1].strip()
        files = uploads.get(chat_id, [])
        files_payload = []
        for fname, content in files:
            files_payload.append(('files', (fname, io.BytesIO(content))))
        data = {'job_description': jd}
        try:
            resp = requests.post(f'{BACKEND}/evaluate/form', data=data, files=files_payload, timeout=120)
            json_data = resp.json()
            last_results[chat_id] = {'job_description': jd, 'data': json_data}
            candidates = json_data.get('ranked_results', [])
            # delegate detailed per-candidate messages to backend notify_telegram
            for c in candidates:
                try:
                    requests.post(f'{BACKEND}/notify_telegram', json={'chat_id': chat_id, 'job_description': jd, 'candidate': c}, timeout=60)
                except Exception:
                    # fallback: send compact summary
                    cid = c.get('id')
                    score = c.get('score')
                    pct = c.get('percentile', '-')
                    send_message(chat_id, f"Candidate: {cid} — Score: {score} — Percentile: {pct}")
                time.sleep(0.3)

            msg = format_results_message(json_data)
            for chunk in [msg[i:i+3800] for i in range(0, len(msg), 3800)]:
                send_message(chat_id, chunk)
            # clear staged uploads after evaluation
            uploads.pop(chat_id, None)
        except Exception as e:
            send_message(chat_id, 'Error calling backend: ' + str(e))
        return

    if text.startswith('/courses'):
        parts = text.split(' ', 1)
        if len(parts) < 2 or not parts[1].strip():
            send_message(chat_id, 'Usage: /courses <candidate_id>')
            return
        cid = parts[1].strip()
        stored = last_results.get(chat_id)
        if not stored:
            send_message(chat_id, 'No evaluation found for this chat. Run /evaluate first.')
            return
        data = stored.get('data', {})
        candidates = data.get('ranked_results', [])
        cand = next((c for c in candidates if str(c.get('id')) == cid), None)
        if not cand:
            send_message(chat_id, f'Candidate id {cid} not found in last results.')
            return
        missing = cand.get('missing_skills', [])
        payload = {'job_description': stored.get('job_description', ''), 'missing_skills': missing}
        try:
            resp = requests.post(f'{BACKEND}/courses', json=payload, timeout=60)
            j = resp.json()
            if 'courses' in j:
                text = json.dumps(j['courses'], indent=2)
            elif 'courses_text' in j:
                text = j['courses_text']
            else:
                text = json.dumps(j, indent=2)
            for chunk in [text[i:i+3800] for i in range(0, len(text), 3800)]:
                send_message(chat_id, chunk)
        except Exception as e:
            send_message(chat_id, 'Error calling backend /courses: ' + str(e))
        return

    if text.startswith('/detail'):
        parts = text.split(' ', 1)
        if len(parts) < 2 or not parts[1].strip():
            send_message(chat_id, 'Usage: /detail <candidate_id>')
            return
        cid = parts[1].strip()
        stored = last_results.get(chat_id)
        if not stored:
            send_message(chat_id, 'No evaluation found for this chat. Run /evaluate first.')
            return
        data = stored.get('data', {})
        candidates = data.get('ranked_results', [])
        cand = next((c for c in candidates if str(c.get('id')) == cid), None)
        if not cand:
            send_message(chat_id, f'Candidate id {cid} not found in last results.')
            return
        # send brief text then request backend to send PDF via notify_telegram for full report
        send_message(chat_id, f"Details for candidate {cid}: Score {cand.get('score')} — Missing: {', '.join(cand.get('missing_skills',[])[:6])}")
        try:
            requests.post(f'{BACKEND}/notify_telegram', json={'chat_id': chat_id, 'job_description': stored.get('job_description',''), 'candidate': cand}, timeout=60)
        except Exception:
            pass
        return

    # default: reply helpfully to any other text
        # default: friendly guidance reply
        ack = (
            "Thanks — I got your message. To evaluate candidates: upload a Job Description file (or paste the JD text), then upload the resumes. "
            "When ready, run /evaluate (it will use the uploaded JD if present) or /evaluate <job description> to paste JD inline. "
            "Use /help for more commands."
        )
    send_message(chat_id, ack)


def format_results_message(data: dict) -> str:
    lines = []
    summary = data.get('summary')
    if summary:
        lines.append(f"Summary: {summary}\n")
    ranked = data.get('ranked_results', [])
    if not ranked:
        return '\n'.join(lines) + '\nNo candidates found.'
        lines.append('\nRanked candidates:')
        for idx, r in enumerate(ranked, start=1):
            cid = r.get('id')
            score = r.get('score')
            pct = r.get('percentile', 'N/A')
            lines.append(f"{idx}) {cid} — Score: {score} — Percentile: {pct}")
            ms = r.get('matched_skills') or []
            miss = r.get('missing_skills') or []
            if ms:
                lines.append(f"   Matched: {', '.join(ms[:6])}")
            if miss:
                lines.append(f"   Missing: {', '.join(miss[:6])}")
            sugg = r.get('resume_suggestions') or []
            if sugg:
                # show up to 3 short suggestions
                short_sugg = [str(s)[:140] for s in sugg[:3]]
                lines.append(f"   Suggestions: {', '.join(short_sugg)}")
            lines.append('')

        lines.append('Helpful commands:')
        lines.append(' - /detail <candidate_id>  — get full PDF report and detailed analysis for one candidate')
        lines.append(' - /courses <candidate_id> — recommended courses to fill missing skills')
        return '\n'.join(lines)


def main():
    print('Starting lightweight Telegram polling bot')
    offset = None
    while True:
        try:
            updates = get_updates(offset=offset, timeout=30)
            for u in updates:
                offset = u['update_id'] + 1
                try:
                    handle_message(u)
                except Exception as e:
                    print('Error handling update:', e)
        except Exception as e:
            print('Polling error:', e)
            time.sleep(3)


if __name__ == '__main__':
    main()
