import requests
import logging
from typing import Dict, Optional


class APIClient:
    def __init__(self, api_url: str, api_key: str, device_id: Optional[str] = None):
        self.api_url = api_url.rstrip('/')
        self.api_key = api_key
        self.device_id = device_id
        self.logger = logging.getLogger(__name__)
        self.session = requests.Session()
        self.session.headers.update({
            'X-API-Key': api_key,
            'Content-Type': 'application/json'
        })

    def register_device(self, device_info: Dict) -> Dict:
        try:
            response = self.session.post(
                f'{self.api_url}/api/devices/register',
                json=device_info
            )
            response.raise_for_status()
            data = response.json()
            self.logger.info("Device registered successfully")
            return data
        except requests.exceptions.RequestException as e:
            self.logger.error(f"Failed to register device: {str(e)}")
            raise

    def check_device_authorization(self) -> bool:
        if not self.device_id:
            return False

        try:
            response = self.session.get(
                f'{self.api_url}/api/devices/{self.device_id}'
            )
            response.raise_for_status()
            data = response.json()
            return data.get('data', {}).get('isAuthorized', False)
        except requests.exceptions.RequestException as e:
            self.logger.error(f"Failed to check authorization: {str(e)}")
            return False

    def log_activity(self, activity_data: Dict) -> Dict:
        if not self.device_id:
            raise ValueError("Device not registered")

        activity_data['deviceId'] = self.device_id

        try:
            response = self.session.post(
                f'{self.api_url}/api/activities',
                json=activity_data
            )
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            self.logger.error(f"Failed to log activity: {str(e)}")
            raise

    def send_heartbeat(self) -> bool:
        if not self.device_id:
            return False

        try:
            response = self.session.post(
                f'{self.api_url}/api/devices/{self.device_id}/heartbeat'
            )
            response.raise_for_status()
            return True
        except requests.exceptions.RequestException as e:
            self.logger.error(f"Failed to send heartbeat: {str(e)}")
            return False

    def get_device_info(self) -> Optional[Dict]:
        if not self.device_id:
            return None

        try:
            response = self.session.get(
                f'{self.api_url}/api/devices/{self.device_id}'
            )
            response.raise_for_status()
            return response.json().get('data')
        except requests.exceptions.RequestException as e:
            self.logger.error(f"Failed to get device info: {str(e)}")
            return None
