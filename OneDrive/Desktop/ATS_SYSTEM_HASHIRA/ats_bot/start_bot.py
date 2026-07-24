"""Start script for the lightweight Telegram bot.

Usage:
  python start_bot.py <TELEGRAM_TOKEN>
Or set the TELEGRAM_TOKEN environment variable and run without args.

This script will set the env var (if provided) and call telegram_bot.main()
so the bot runs in the same process.
"""
import os
import sys

def main():
    if len(sys.argv) > 1:
        os.environ['TELEGRAM_TOKEN'] = sys.argv[1]

    token = os.environ.get('TELEGRAM_TOKEN')
    if not token:
        print('Usage: python start_bot.py <TELEGRAM_TOKEN>')
        print('Or set TELEGRAM_TOKEN in the environment and run without args.')
        sys.exit(1)

    # Import and run the existing telegram bot
    try:
        import telegram_bot
    except Exception as e:
        print('Failed to import telegram_bot:', e)
        sys.exit(2)

    telegram_bot.main()

if __name__ == '__main__':
    main()
