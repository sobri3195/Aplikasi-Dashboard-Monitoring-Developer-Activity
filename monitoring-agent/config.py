import os
from dotenv import load_dotenv

load_dotenv()

API_URL = os.getenv('API_URL', 'http://localhost:5000')
API_KEY = os.getenv('API_KEY', '')
DEVICE_ID = os.getenv('DEVICE_ID', '')
USER_EMAIL = os.getenv('USER_EMAIL', '')
HEARTBEAT_INTERVAL = int(os.getenv('HEARTBEAT_INTERVAL', '60'))
LOG_LEVEL = os.getenv('LOG_LEVEL', 'INFO')
MONITORED_PATHS = os.getenv('MONITORED_PATHS', '').split(',') if os.getenv('MONITORED_PATHS') else []
