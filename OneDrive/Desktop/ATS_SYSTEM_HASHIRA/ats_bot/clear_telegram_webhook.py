import os
import requests

TOKEN = os.environ.get('TELEGRAM_TOKEN')
if not TOKEN:
    print('No TELEGRAM_TOKEN in env')
else:
    r = requests.post(f'https://api.telegram.org/bot{TOKEN}/deleteWebhook')
    print('deleteWebhook', r.status_code, r.text)
    r2 = requests.post(f'https://api.telegram.org/bot{TOKEN}/getWebhookInfo')
    print('getWebhookInfo', r2.status_code, r2.text)
