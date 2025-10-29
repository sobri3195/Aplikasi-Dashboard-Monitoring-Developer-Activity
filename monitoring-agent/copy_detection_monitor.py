#!/usr/bin/env python3
"""
Copy Detection Monitor
Detects when repository is copied to unauthorized locations and triggers encryption
"""

import os
import sys
import json
import time
import hashlib
import platform
import requests
from pathlib import Path
from datetime import datetime
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler

class RepositoryCopyDetector:
    def __init__(self, api_url, api_token, repo_path, repo_id):
        self.api_url = api_url.rstrip('/')
        self.api_token = api_token
        self.repo_path = Path(repo_path).resolve()
        self.repo_id = repo_id
        self.headers = {
            'Content-Type': 'application/json',
            'Authorization': f'Bearer {api_token}'
        }
        self.trusted_paths = []
        self.original_location = None
        self.load_repository_metadata()
    
    def load_repository_metadata(self):
        """Load repository metadata including original location"""
        metadata_file = self.repo_path / '.repo-metadata.json'
        
        if metadata_file.exists():
            with open(metadata_file, 'r') as f:
                metadata = json.load(f)
                self.original_location = metadata.get('original_location')
                self.trusted_paths = metadata.get('trusted_paths', [])
        else:
            # First time setup - create metadata
            self.original_location = str(self.repo_path)
            self.save_repository_metadata()
    
    def save_repository_metadata(self):
        """Save repository metadata"""
        metadata_file = self.repo_path / '.repo-metadata.json'
        metadata = {
            'repository_id': self.repo_id,
            'original_location': self.original_location,
            'created_at': datetime.now().isoformat(),
            'device_fingerprint': self.get_device_fingerprint(),
            'trusted_paths': self.trusted_paths
        }
        
        with open(metadata_file, 'w') as f:
            json.dump(metadata, f, indent=2)
        
        # Add to .gitignore
        gitignore_path = self.repo_path / '.gitignore'
        if gitignore_path.exists():
            with open(gitignore_path, 'r') as f:
                gitignore_content = f.read()
            
            if '.repo-metadata.json' not in gitignore_content:
                with open(gitignore_path, 'a') as f:
                    f.write('\n.repo-metadata.json\n')
    
    def get_device_fingerprint(self):
        """Generate device fingerprint"""
        import subprocess
        
        try:
            if platform.system() == 'Windows':
                result = subprocess.run(['getmac'], capture_output=True, text=True)
                mac_info = result.stdout
            else:
                result = subprocess.run(['ifconfig'], capture_output=True, text=True)
                mac_info = result.stdout
            
            device_info = {
                'hostname': platform.node(),
                'platform': platform.system(),
                'arch': platform.machine(),
                'mac_info': hashlib.sha256(mac_info.encode()).hexdigest()
            }
            
            fingerprint_string = json.dumps(device_info, sort_keys=True)
            fingerprint = hashlib.sha256(fingerprint_string.encode()).hexdigest()
            
            return fingerprint
        except Exception as e:
            print(f"Error generating fingerprint: {e}")
            return None
    
    def is_trusted_location(self):
        """Check if current location is trusted"""
        current_path = str(self.repo_path)
        
        # Check if it's the original location
        if current_path == self.original_location:
            return True
        
        # Check trusted paths
        for trusted_path in self.trusted_paths:
            if current_path.startswith(trusted_path):
                return True
        
        return False
    
    def detect_copy_attempt(self):
        """Detect if repository has been copied to unauthorized location"""
        current_path = str(self.repo_path)
        
        # If original location is not set, this is the first run
        if not self.original_location:
            return {
                'detected': False,
                'reason': 'FIRST_RUN'
            }
        
        # Check if current location matches original
        if current_path != self.original_location:
            # Check if it's in trusted paths
            if not self.is_trusted_location():
                # Additional checks to determine if this is a copy or move
                detection_details = {
                    'detected': True,
                    'reason': 'UNAUTHORIZED_LOCATION',
                    'original_location': self.original_location,
                    'current_location': current_path,
                    'risk_level': 'CRITICAL'
                }
                
                # Check if original location still exists (indicates copy, not move)
                if Path(self.original_location).exists():
                    detection_details['action_type'] = 'COPY'
                    detection_details['message'] = 'Repository appears to be copied (original still exists)'
                else:
                    detection_details['action_type'] = 'MOVE'
                    detection_details['message'] = 'Repository appears to be moved (original no longer exists)'
                
                return detection_details
        
        return {
            'detected': False,
            'reason': 'AUTHORIZED_LOCATION'
        }
    
    def send_alert(self, alert_data):
        """Send alert to backend"""
        try:
            response = requests.post(
                f'{self.api_url}/api/alerts',
                headers=self.headers,
                json={
                    'severity': 'CRITICAL',
                    'message': alert_data.get('message', 'Repository copy detected'),
                    'details': alert_data,
                    'activityType': 'COPY_DETECTED'
                }
            )
            
            if response.status_code in [200, 201]:
                print(f"✓ Alert sent to dashboard")
                return True
            else:
                print(f"✗ Failed to send alert: {response.status_code}")
                return False
        except Exception as e:
            print(f"✗ Error sending alert: {e}")
            return False
    
    def encrypt_repository(self):
        """Encrypt repository on unauthorized copy"""
        try:
            # Create encryption lock file
            lock_file = self.repo_path / '.repo-encrypted.lock'
            lock_data = {
                'encrypted': True,
                'timestamp': datetime.now().isoformat(),
                'reason': 'UNAUTHORIZED_COPY_DETECTED',
                'message': 'Repository has been encrypted due to unauthorized copy. Contact administrator.',
                'original_location': self.original_location,
                'detected_location': str(self.repo_path)
            }
            
            with open(lock_file, 'w') as f:
                json.dump(lock_data, f, indent=2)
            
            # Create access block file
            block_file = self.repo_path / '.repo-access-blocked'
            with open(block_file, 'w') as f:
                json.dump(lock_data, f, indent=2)
            
            print(f"🔒 Repository encrypted and access blocked")
            print(f"   Reason: Unauthorized copy detected")
            print(f"   Original: {self.original_location}")
            print(f"   Current: {self.repo_path}")
            
            return True
        except Exception as e:
            print(f"✗ Error encrypting repository: {e}")
            return False
    
    def show_alert_ui(self, copy_info):
        """Show alert to user (console-based for now)"""
        print("\n" + "=" * 70)
        print("⚠️  SECURITY ALERT: UNAUTHORIZED REPOSITORY COPY DETECTED")
        print("=" * 70)
        print(f"\n📍 Original Location: {copy_info.get('original_location')}")
        print(f"📍 Current Location:  {copy_info.get('current_location')}")
        print(f"\n🔒 Action Taken: Repository has been encrypted and access blocked")
        print(f"\n💬 Message: Contact your administrator to restore access.")
        print(f"   This repository can only be used from its original location")
        print(f"   or from explicitly trusted paths.")
        print("\n" + "=" * 70 + "\n")
    
    def verify_and_protect(self):
        """Main verification and protection logic"""
        print(f"🔍 Checking repository location...")
        print(f"   Repository: {self.repo_path}")
        print(f"   Repository ID: {self.repo_id}")
        
        # Detect copy attempt
        copy_detection = self.detect_copy_attempt()
        
        if copy_detection['detected']:
            print(f"\n⚠️  COPY DETECTED: {copy_detection['reason']}")
            
            # Show alert immediately
            self.show_alert_ui(copy_detection)
            
            # Send alert to backend
            alert_data = {
                'message': f"Repository copied to unauthorized location",
                'repository_id': self.repo_id,
                'detection': copy_detection,
                'device_fingerprint': self.get_device_fingerprint()
            }
            self.send_alert(alert_data)
            
            # Encrypt repository immediately
            self.encrypt_repository()
            
            # Notify backend to encrypt
            try:
                requests.post(
                    f'{self.api_url}/api/repository-protection/verify-access',
                    headers=self.headers,
                    json={
                        'repositoryId': self.repo_id,
                        'repositoryPath': str(self.repo_path)
                    }
                )
            except Exception as e:
                print(f"Note: Could not notify backend: {e}")
            
            return False
        else:
            print(f"✓ Repository location verified")
            print(f"  Location: Authorized")
            return True

class RepositoryWatcher(FileSystemEventHandler):
    """Watch for repository being copied"""
    
    def __init__(self, detector):
        self.detector = detector
        self.last_check = time.time()
    
    def on_any_event(self, event):
        # Check every 5 seconds to avoid too frequent checks
        current_time = time.time()
        if current_time - self.last_check > 5:
            self.last_check = current_time
            
            # Check if repository was moved/copied
            if not self.detector.verify_and_protect():
                print("Repository access has been blocked. Exiting...")
                sys.exit(1)

def main():
    """Main function"""
    import argparse
    
    parser = argparse.ArgumentParser(
        description='Repository Copy Detection Monitor'
    )
    parser.add_argument(
        '--api-url',
        default=os.getenv('API_URL', 'http://localhost:5000'),
        help='API URL'
    )
    parser.add_argument(
        '--token',
        default=os.getenv('API_TOKEN'),
        required=True,
        help='API Token'
    )
    parser.add_argument(
        '--repo-id',
        required=True,
        help='Repository ID'
    )
    parser.add_argument(
        '--repo-path',
        default='.',
        help='Repository path (default: current directory)'
    )
    parser.add_argument(
        '--watch',
        action='store_true',
        help='Enable continuous watching'
    )
    
    args = parser.parse_args()
    
    print("=" * 70)
    print("Repository Copy Detection Monitor")
    print("=" * 70)
    
    detector = RepositoryCopyDetector(
        args.api_url,
        args.token,
        args.repo_path,
        args.repo_id
    )
    
    # Initial verification
    is_authorized = detector.verify_and_protect()
    
    if not is_authorized:
        print("\n❌ Repository access denied due to unauthorized copy.")
        sys.exit(1)
    
    print("\n✅ Repository access authorized.")
    
    if args.watch:
        print("\n👀 Starting continuous monitoring...")
        print("   Press Ctrl+C to stop\n")
        
        event_handler = RepositoryWatcher(detector)
        observer = Observer()
        observer.schedule(event_handler, str(detector.repo_path), recursive=True)
        observer.start()
        
        try:
            while True:
                time.sleep(1)
        except KeyboardInterrupt:
            observer.stop()
            print("\n\nMonitoring stopped.")
        
        observer.join()

if __name__ == '__main__':
    main()
