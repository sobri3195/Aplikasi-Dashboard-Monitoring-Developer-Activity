#!/usr/bin/env python3
"""
Access Detection & Protection Agent
Monitors git operations (clone, pull, push) and detects unauthorized access
"""

import os
import sys
import json
import time
import hashlib
import platform
import requests
import subprocess
from pathlib import Path
from datetime import datetime
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler


class GitOperationMonitor:
    """Monitor git operations in real-time"""
    
    def __init__(self, api_url, api_token, repo_path, repo_id):
        self.api_url = api_url.rstrip('/')
        self.api_token = api_token
        self.repo_path = Path(repo_path).resolve()
        self.repo_id = repo_id
        self.headers = {
            'Content-Type': 'application/json',
            'Authorization': f'Bearer {api_token}'
        }
        self.metadata_file = self.repo_path / '.repo-metadata.json'
        self.metadata = self.load_metadata()
    
    def load_metadata(self):
        """Load repository metadata"""
        if self.metadata_file.exists():
            with open(self.metadata_file, 'r') as f:
                return json.load(f)
        else:
            # Create initial metadata
            metadata = {
                'repository_id': self.repo_id,
                'original_location': str(self.repo_path),
                'created_at': datetime.now().isoformat(),
                'device_fingerprint': self.get_device_fingerprint()
            }
            self.save_metadata(metadata)
            return metadata
    
    def save_metadata(self, metadata):
        """Save repository metadata"""
        with open(self.metadata_file, 'w') as f:
            json.dump(metadata, f, indent=2)
        
        # Add to .gitignore
        gitignore_path = self.repo_path / '.gitignore'
        if gitignore_path.exists():
            with open(gitignore_path, 'r') as f:
                content = f.read()
            if '.repo-metadata.json' not in content:
                with open(gitignore_path, 'a') as f:
                    f.write('\n.repo-metadata.json\n')
    
    def get_device_fingerprint(self):
        """Generate device fingerprint"""
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
            return hashlib.sha256(fingerprint_string.encode()).hexdigest()
        except Exception as e:
            print(f"Error generating fingerprint: {e}")
            return None
    
    def monitor_git_operation(self, operation_type, details=None):
        """Monitor and report git operation to backend"""
        try:
            print(f"\n🔍 Monitoring {operation_type.upper()} operation...")
            
            payload = {
                'repositoryId': self.repo_id,
                'repositoryPath': str(self.repo_path),
                'operationType': operation_type,
                'metadata': {
                    'originalLocation': self.metadata.get('original_location'),
                    'currentLocation': str(self.repo_path),
                    'deviceFingerprint': self.get_device_fingerprint(),
                    'timestamp': datetime.now().isoformat(),
                    **(details or {})
                }
            }
            
            response = requests.post(
                f'{self.api_url}/api/access-detection/monitor-operation',
                headers=self.headers,
                json=payload,
                timeout=10
            )
            
            if response.status_code == 200:
                result = response.json()
                if result.get('authorized'):
                    print(f"✅ {operation_type.upper()} operation authorized")
                    return True
                else:
                    print(f"❌ {operation_type.upper()} operation BLOCKED")
                    print(f"   Reason: {result.get('message')}")
                    if result.get('encrypted'):
                        print(f"   🔒 Repository has been encrypted")
                    if result.get('blocked'):
                        print(f"   🚫 Access has been blocked")
                    return False
            elif response.status_code == 403:
                result = response.json()
                print(f"❌ Unauthorized access detected!")
                print(f"   {result.get('message')}")
                if result.get('encrypted'):
                    self.show_encryption_alert()
                return False
            else:
                print(f"⚠️  Server returned status: {response.status_code}")
                return False
        
        except requests.exceptions.RequestException as e:
            print(f"⚠️  Network error: {e}")
            print("   Continuing in offline mode (monitoring only)")
            return True
        except Exception as e:
            print(f"⚠️  Error monitoring operation: {e}")
            return True
    
    def check_unauthorized_movement(self):
        """Check if repository has been moved to unauthorized location"""
        try:
            print(f"\n🔍 Checking for unauthorized movement...")
            
            payload = {
                'repositoryId': self.repo_id,
                'repositoryPath': str(self.repo_path),
                'metadata': {
                    'originalLocation': self.metadata.get('original_location'),
                    'currentLocation': str(self.repo_path),
                    'deviceFingerprint': self.get_device_fingerprint()
                }
            }
            
            response = requests.post(
                f'{self.api_url}/api/access-detection/check-movement',
                headers=self.headers,
                json=payload,
                timeout=10
            )
            
            if response.status_code == 200:
                result = response.json()
                if result.get('detected') and not result.get('authorized'):
                    print(f"⚠️  UNAUTHORIZED MOVEMENT DETECTED!")
                    print(f"   Reason: {result.get('reason')}")
                    print(f"   Action: {result.get('action')}")
                    self.show_encryption_alert()
                    return False
                else:
                    print(f"✅ Location authorized")
                    return True
            else:
                print(f"⚠️  Check returned status: {response.status_code}")
                return False
        
        except Exception as e:
            print(f"⚠️  Error checking movement: {e}")
            return True
    
    def show_encryption_alert(self):
        """Show encryption alert to user"""
        print("\n" + "=" * 70)
        print("🚨 SECURITY ALERT: REPOSITORY ENCRYPTED")
        print("=" * 70)
        print("\n⚠️  This repository has been encrypted due to unauthorized access.")
        print("\n📋 Possible reasons:")
        print("   • Repository copied to unauthorized device")
        print("   • Repository moved to untrusted location")
        print("   • Device not approved by administrator")
        print("\n💬 Action required:")
        print("   • Contact your administrator to restore access")
        print("   • Use repository only from approved devices and locations")
        print("\n" + "=" * 70 + "\n")
    
    def install_git_hooks(self):
        """Install git hooks to monitor operations"""
        hooks_dir = self.repo_path / '.git' / 'hooks'
        
        if not hooks_dir.exists():
            print("⚠️  Not a git repository")
            return False
        
        # Pre-push hook
        pre_push_hook = hooks_dir / 'pre-push'
        pre_push_content = f'''#!/bin/bash
# Auto-generated by Access Detection Agent

echo "🔍 Verifying device access before push..."

python3 "{Path(__file__).resolve()}" --check-access --repo-id "{self.repo_id}" --repo-path "{self.repo_path}"

if [ $? -ne 0 ]; then
    echo "❌ Push blocked: Unauthorized access detected"
    exit 1
fi

echo "✅ Device authorized, proceeding with push..."
'''
        
        with open(pre_push_hook, 'w') as f:
            f.write(pre_push_content)
        
        # Make hook executable
        os.chmod(pre_push_hook, 0o755)
        
        # Post-merge hook (for pull)
        post_merge_hook = hooks_dir / 'post-merge'
        post_merge_content = f'''#!/bin/bash
# Auto-generated by Access Detection Agent

python3 "{Path(__file__).resolve()}" --monitor-operation pull --repo-id "{self.repo_id}" --repo-path "{self.repo_path}"
'''
        
        with open(post_merge_hook, 'w') as f:
            f.write(post_merge_content)
        
        os.chmod(post_merge_hook, 0o755)
        
        print("✅ Git hooks installed successfully")
        return True


class RepositoryWatcher(FileSystemEventHandler):
    """Watch repository for suspicious activities"""
    
    def __init__(self, monitor):
        self.monitor = monitor
        self.last_check = time.time()
    
    def on_modified(self, event):
        # Check periodically (every 5 seconds)
        current_time = time.time()
        if current_time - self.last_check > 5:
            self.last_check = current_time
            
            # Check if .git directory was modified
            if '.git' in event.src_path:
                if not self.monitor.check_unauthorized_movement():
                    print("⚠️  Repository access blocked due to unauthorized movement")
                    sys.exit(1)


def main():
    """Main function"""
    import argparse
    
    parser = argparse.ArgumentParser(
        description='Access Detection & Protection Agent'
    )
    parser.add_argument(
        '--api-url',
        default=os.getenv('API_URL', 'http://localhost:5000'),
        help='API URL'
    )
    parser.add_argument(
        '--token',
        default=os.getenv('API_TOKEN'),
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
        '--install-hooks',
        action='store_true',
        help='Install git hooks for automatic monitoring'
    )
    parser.add_argument(
        '--check-access',
        action='store_true',
        help='Check access authorization'
    )
    parser.add_argument(
        '--monitor-operation',
        choices=['clone', 'pull', 'push', 'commit', 'checkout'],
        help='Monitor specific git operation'
    )
    parser.add_argument(
        '--watch',
        action='store_true',
        help='Enable continuous watching'
    )
    
    args = parser.parse_args()
    
    if not args.token:
        print("❌ API token required. Set API_TOKEN environment variable or use --token")
        sys.exit(1)
    
    print("=" * 70)
    print("🛡️  Access Detection & Protection Agent")
    print("=" * 70)
    
    monitor = GitOperationMonitor(
        args.api_url,
        args.token,
        args.repo_path,
        args.repo_id
    )
    
    # Install git hooks
    if args.install_hooks:
        print("\n📦 Installing git hooks...")
        if monitor.install_git_hooks():
            print("✅ Git hooks installed successfully")
        else:
            print("❌ Failed to install git hooks")
            sys.exit(1)
    
    # Check access
    if args.check_access:
        if not monitor.check_unauthorized_movement():
            sys.exit(1)
        sys.exit(0)
    
    # Monitor specific operation
    if args.monitor_operation:
        if not monitor.monitor_git_operation(args.monitor_operation):
            sys.exit(1)
        sys.exit(0)
    
    # Initial check
    print("\n🔍 Performing initial access check...")
    if not monitor.check_unauthorized_movement():
        print("\n❌ Repository access denied")
        sys.exit(1)
    
    print("\n✅ Repository access authorized")
    
    # Continuous watching
    if args.watch:
        print("\n👀 Starting continuous monitoring...")
        print("   Press Ctrl+C to stop\n")
        
        event_handler = RepositoryWatcher(monitor)
        observer = Observer()
        observer.schedule(event_handler, str(monitor.repo_path), recursive=True)
        observer.start()
        
        try:
            while True:
                time.sleep(1)
        except KeyboardInterrupt:
            observer.stop()
            print("\n\n✋ Monitoring stopped")
        
        observer.join()
    else:
        print("\n💡 Tip: Use --watch to enable continuous monitoring")
        print("💡 Tip: Use --install-hooks to automatically monitor git operations")


if __name__ == '__main__':
    main()
