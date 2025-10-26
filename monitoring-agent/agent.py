#!/usr/bin/env python3
import os
import sys
import time
import logging
import argparse
import threading
from pathlib import Path

import config
from device_fingerprint import DeviceFingerprint
from api_client import APIClient
from git_monitor import GitRepositoryMonitor
from encryption import RepositoryEncryption


logging.basicConfig(
    level=getattr(logging, config.LOG_LEVEL),
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('agent.log'),
        logging.StreamHandler(sys.stdout)
    ]
)

logger = logging.getLogger(__name__)


class MonitoringAgent:
    def __init__(self):
        self.config_file = Path.home() / '.devmonitor' / 'config'
        self.device_id = None
        self.api_client = None
        self.git_monitor = None
        self.is_authorized = False
        self.running = False

    def load_config(self):
        if self.config_file.exists():
            with open(self.config_file, 'r') as f:
                lines = f.readlines()
                for line in lines:
                    if line.startswith('DEVICE_ID='):
                        self.device_id = line.split('=')[1].strip()
                    elif line.startswith('API_KEY='):
                        api_key = line.split('=')[1].strip()
                        config.API_KEY = api_key
            logger.info("Configuration loaded")
            return True
        return False

    def save_config(self, device_id, api_key):
        self.config_file.parent.mkdir(parents=True, exist_ok=True)
        with open(self.config_file, 'w') as f:
            f.write(f"DEVICE_ID={device_id}\n")
            f.write(f"API_KEY={api_key}\n")
            f.write(f"API_URL={config.API_URL}\n")
        logger.info("Configuration saved")

    def register_device(self, email, device_name=None):
        device_info = DeviceFingerprint.get_device_info()

        if not device_name:
            device_name = device_info['hostname']

        device_info.update({
            'email': email,
            'deviceName': device_name
        })

        if not config.API_KEY:
            logger.error("API_KEY not set in environment")
            return False

        api_client = APIClient(config.API_URL, config.API_KEY)

        try:
            response = api_client.register_device(device_info)
            device_data = response.get('data', {})
            device_id = device_data.get('id')

            if device_id:
                self.save_config(device_id, config.API_KEY)
                logger.info(f"Device registered successfully with ID: {device_id}")
                logger.info("Waiting for admin approval...")
                return True
            else:
                logger.error("Failed to get device ID from response")
                return False
        except Exception as e:
            logger.error(f"Registration failed: {str(e)}")
            return False

    def initialize(self):
        if not self.load_config():
            logger.error("Device not registered. Please run: python agent.py register --email YOUR_EMAIL")
            return False

        if not config.API_KEY:
            logger.error("API_KEY not configured")
            return False

        self.api_client = APIClient(config.API_URL, config.API_KEY, self.device_id)
        self.git_monitor = GitRepositoryMonitor(self.api_client)

        return True

    def check_authorization(self):
        self.is_authorized = self.api_client.check_device_authorization()
        if not self.is_authorized:
            logger.warning("Device is not authorized. Activities will be logged but may trigger alerts.")
        return self.is_authorized

    def heartbeat_loop(self):
        while self.running:
            try:
                self.api_client.send_heartbeat()
                self.check_authorization()
            except Exception as e:
                logger.error(f"Heartbeat failed: {str(e)}")

            time.sleep(config.HEARTBEAT_INTERVAL)

    def start_monitoring(self):
        if not self.initialize():
            sys.exit(1)

        self.check_authorization()

        self.running = True

        heartbeat_thread = threading.Thread(target=self.heartbeat_loop, daemon=True)
        heartbeat_thread.start()

        logger.info("Monitoring agent started")
        logger.info(f"Device ID: {self.device_id}")
        logger.info(f"Authorization status: {self.is_authorized}")

        monitored_paths = config.MONITORED_PATHS or [str(Path.home())]

        try:
            self.git_monitor.start_monitoring(monitored_paths)
        except KeyboardInterrupt:
            logger.info("Shutting down...")
            self.running = False
        except Exception as e:
            logger.error(f"Monitoring error: {str(e)}")
            self.running = False

    def encrypt_unauthorized_repo(self, repo_path):
        logger.warning(f"Encrypting unauthorized repository: {repo_path}")

        encryption = RepositoryEncryption()
        encrypted_files = encryption.encrypt_repository(repo_path)

        logger.info(f"Encrypted {len(encrypted_files)} files in {repo_path}")

        self.api_client.log_activity({
            'activityType': 'UNAUTHORIZED_ACCESS',
            'repository': os.path.basename(repo_path),
            'details': {
                'encrypted': True,
                'files_encrypted': len(encrypted_files)
            }
        })

    def status(self):
        if not self.initialize():
            sys.exit(1)

        device_info = self.api_client.get_device_info()

        if device_info:
            print("\n=== Device Status ===")
            print(f"Device ID: {device_info.get('id')}")
            print(f"Device Name: {device_info.get('deviceName')}")
            print(f"Status: {device_info.get('status')}")
            print(f"Authorized: {device_info.get('isAuthorized')}")
            print(f"Last Seen: {device_info.get('lastSeen')}")
            print(f"User: {device_info.get('user', {}).get('email')}")
        else:
            print("Failed to get device status")


def main():
    parser = argparse.ArgumentParser(description='Developer Activity Monitoring Agent')
    subparsers = parser.add_subparsers(dest='command', help='Available commands')

    register_parser = subparsers.add_parser('register', help='Register this device')
    register_parser.add_argument('--email', required=True, help='Your email address')
    register_parser.add_argument('--device-name', help='Custom device name')

    monitor_parser = subparsers.add_parser('monitor', help='Start monitoring')

    status_parser = subparsers.add_parser('status', help='Check device status')

    args = parser.parse_args()

    agent = MonitoringAgent()

    if args.command == 'register':
        agent.register_device(args.email, args.device_name)
    elif args.command == 'monitor':
        agent.start_monitoring()
    elif args.command == 'status':
        agent.status()
    else:
        parser.print_help()


if __name__ == '__main__':
    main()
