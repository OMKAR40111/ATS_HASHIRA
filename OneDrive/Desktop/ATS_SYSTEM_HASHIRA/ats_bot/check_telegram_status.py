import requests
TOKEN = '8875234782:AAFcVeyqqrCbEUwInY_290xAbDnkjVdYFQA'
print('Using token:', TOKEN[:10] + '...')
try:
    r = requests.post(f'https://api.telegram.org/bot{TOKEN}/getWebhookInfo')
    print('getWebhookInfo:', r.status_code, r.text)
except Exception as e:
    print('getWebhookInfo error:', e)
try:
    r2 = requests.post(f'https://api.telegram.org/bot{TOKEN}/getMe')
    print('getMe:', r2.status_code, r2.text)
except Exception as e:
    print('getMe error:', e)
