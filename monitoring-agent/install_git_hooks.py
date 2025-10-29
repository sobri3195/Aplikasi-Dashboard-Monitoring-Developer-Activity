#!/usr/bin/env python3
"""
Git Hooks Installer
Installs git hooks to verify device on clone and monitor repository access
"""

import os
import sys
import stat
from pathlib import Path

# Git hook templates
POST_CLONE_HOOK = '''#!/bin/bash
# Post-clone hook - Verify device registration

echo "🔍 Verifying device registration..."

# Get configuration from environment or .env file
if [ -f ".env" ]; then
    source .env
fi

API_URL="${API_URL:-http://localhost:5000}"
API_TOKEN="${API_TOKEN}"
REPO_ID="${REPO_ID}"

# Check if monitoring agent is available
if [ ! -f "monitoring-agent/copy_detection_monitor.py" ]; then
    echo "⚠️  Warning: Monitoring agent not found"
    exit 0
fi

# Run device verification
python3 monitoring-agent/copy_detection_monitor.py \\
    --api-url "$API_URL" \\
    --token "$API_TOKEN" \\
    --repo-id "$REPO_ID" \\
    --repo-path "."

if [ $? -ne 0 ]; then
    echo "❌ Device verification failed!"
    echo "   Please register your device before accessing this repository."
    echo "   Run: python3 monitoring-agent/repo_protection_agent.py register"
    exit 1
fi

echo "✅ Device verified successfully"
exit 0
'''

POST_CHECKOUT_HOOK = '''#!/bin/bash
# Post-checkout hook - Verify device and repository location

# This hook runs after git checkout and after git clone completes
# Arguments: $1 = previous HEAD, $2 = new HEAD, $3 = flag (1 = branch checkout, 0 = file checkout)

# Only run on branch checkouts or after clone
if [ "$3" = "0" ]; then
    exit 0
fi

echo "🔍 Verifying device and repository access..."

# Get configuration from environment or .env file
if [ -f ".env" ]; then
    source .env
fi

API_URL="${API_URL:-http://localhost:5000}"
API_TOKEN="${API_TOKEN}"
REPO_ID="${REPO_ID}"

# Check if monitoring agent is available
if [ ! -f "monitoring-agent/copy_detection_monitor.py" ]; then
    echo "⚠️  Warning: Monitoring agent not found"
    echo "   Repository protection may not be active."
    echo ""
    echo "   Please run: ./setup_repo_protection.sh"
    exit 0
fi

# If this is a new clone (no previous HEAD), perform initial device verification
if [ "$1" = "0000000000000000000000000000000000000000" ]; then
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "🔐 DEVICE VERIFICATION REQUIRED"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "This repository requires device registration before access."
    echo "Checking your device registration status..."
    echo ""
    
    # Run device verification
    python3 monitoring-agent/repo_protection_agent.py verify \\
        --api-url "$API_URL" \\
        --token "$API_TOKEN" \\
        --repo-id "$REPO_ID" \\
        --repo-path "."
    
    VERIFY_STATUS=$?
    
    if [ $VERIFY_STATUS -ne 0 ]; then
        echo ""
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        echo "❌ DEVICE NOT REGISTERED OR NOT APPROVED"
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        echo ""
        echo "⚠️  This repository is protected with device verification."
        echo "    Your device is not registered or not approved yet."
        echo ""
        echo "📋 What you need to do:"
        echo ""
        echo "   1. Run the setup script:"
        echo "      ./setup_repo_protection.sh"
        echo ""
        echo "   2. Or manually register your device:"
        echo "      python3 monitoring-agent/repo_protection_agent.py register \\\\"
        echo "        --device-name \\"My Laptop\\" \\\\"
        echo "        --api-url \\"$API_URL\\" \\\\"
        echo "        --token \\"$API_TOKEN\\""
        echo ""
        echo "   3. Wait for administrator approval"
        echo ""
        echo "   4. Check status:"
        echo "      python3 monitoring-agent/repo_protection_agent.py verify \\\\"
        echo "        --repo-id \\"$REPO_ID\\" --repo-path \\".\\""
        echo ""
        echo "📖 Documentation:"
        echo "   - DEVICE_VERIFICATION_ON_CLONE.md"
        echo "   - VALIDASI_DEVICE_DEVELOPER.md (Indonesian)"
        echo ""
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        echo ""
        exit 1
    fi
    
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "✅ DEVICE VERIFIED SUCCESSFULLY"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "   Your device is registered and approved."
    echo "   You can now work with this repository."
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
fi

# Check if repository was moved/copied (for all checkouts)
python3 monitoring-agent/copy_detection_monitor.py \\
    --api-url "$API_URL" \\
    --token "$API_TOKEN" \\
    --repo-id "$REPO_ID" \\
    --repo-path "."

if [ $? -ne 0 ]; then
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "⚠️  REPOSITORY LOCATION VERIFICATION FAILED"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "This repository may have been copied to an unauthorized location."
    echo "Please use the repository from its original location."
    echo ""
    echo "Contact your administrator if you need assistance."
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    exit 1
fi

exit 0
'''

PRE_COMMIT_HOOK = '''#!/bin/bash
# Pre-commit hook - Verify device and repository access

echo "🔍 Verifying repository access..."

# Get configuration from environment or .env file
if [ -f ".env" ]; then
    source .env
fi

# Verify device and repository
python3 monitoring-agent/repo_protection_agent.py verify \\
    --api-url "${API_URL:-http://localhost:5000}" \\
    --token "$API_TOKEN" \\
    --repo-id "$REPO_ID" \\
    --repo-path "."

if [ $? -ne 0 ]; then
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "❌ REPOSITORY ACCESS VERIFICATION FAILED"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "⚠️  Your device is not authorized to commit to this repository."
    echo ""
    echo "Possible reasons:"
    echo "  • Device not registered"
    echo "  • Device status is PENDING (waiting for approval)"
    echo "  • Device status is REJECTED or REVOKED"
    echo "  • Repository has been moved/copied"
    echo ""
    echo "📋 What to do:"
    echo "  1. Check device status with administrator"
    echo "  2. Ensure device is approved in the dashboard"
    echo "  3. Verify you are in the original repository location"
    echo ""
    echo "📖 See: DEVICE_VERIFICATION_ON_CLONE.md for help"
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    exit 1
fi

echo "✅ Device verified - commit allowed"
exit 0
'''

PRE_PUSH_HOOK = '''#!/bin/bash
# Pre-push hook - Verify device and repository integrity

echo "🔍 Verifying repository integrity before push..."

# Get configuration from environment or .env file
if [ -f ".env" ]; then
    source .env
fi

# Check repository location
echo "   → Checking repository location..."
python3 monitoring-agent/copy_detection_monitor.py \\
    --api-url "${API_URL:-http://localhost:5000}" \\
    --token "$API_TOKEN" \\
    --repo-id "$REPO_ID" \\
    --repo-path "."

if [ $? -ne 0 ]; then
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "❌ REPOSITORY INTEGRITY CHECK FAILED"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "⚠️  Cannot push from this location."
    echo ""
    echo "This repository may have been:"
    echo "  • Copied to an unauthorized location"
    echo "  • Moved without approval"
    echo "  • Accessed from an untrusted path"
    echo ""
    echo "📋 Solution:"
    echo "  1. Use repository from original location"
    echo "  2. Contact administrator to add trusted path"
    echo "  3. Do not copy repository to USB or external drives"
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    exit 1
fi

# Verify device access
echo "   → Verifying device authorization..."
python3 monitoring-agent/repo_protection_agent.py verify \\
    --api-url "${API_URL:-http://localhost:5000}" \\
    --token "$API_TOKEN" \\
    --repo-id "$REPO_ID" \\
    --repo-path "."

if [ $? -ne 0 ]; then
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "❌ DEVICE VERIFICATION FAILED"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "⚠️  Your device is not authorized to push."
    echo ""
    echo "Contact your administrator to verify device status."
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    exit 1
fi

echo "✅ All checks passed - push allowed"
exit 0
'''

def install_hook(repo_path, hook_name, hook_content):
    """Install a git hook"""
    hooks_dir = repo_path / '.git' / 'hooks'
    
    if not hooks_dir.exists():
        print(f"✗ Git hooks directory not found: {hooks_dir}")
        return False
    
    hook_file = hooks_dir / hook_name
    
    # Backup existing hook if it exists
    if hook_file.exists():
        backup_file = hooks_dir / f"{hook_name}.backup"
        print(f"  Backing up existing hook to {backup_file.name}")
        hook_file.rename(backup_file)
    
    # Write new hook
    with open(hook_file, 'w') as f:
        f.write(hook_content)
    
    # Make executable
    hook_file.chmod(hook_file.stat().st_mode | stat.S_IEXEC)
    
    print(f"✓ Installed: {hook_name}")
    return True

def install_all_hooks(repo_path):
    """Install all protection hooks"""
    repo_path = Path(repo_path).resolve()
    
    print(f"\nInstalling repository protection hooks...")
    print(f"Repository: {repo_path}\n")
    
    hooks = [
        ('post-checkout', POST_CHECKOUT_HOOK),
        ('pre-commit', PRE_COMMIT_HOOK),
        ('pre-push', PRE_PUSH_HOOK)
    ]
    
    success_count = 0
    for hook_name, hook_content in hooks:
        if install_hook(repo_path, hook_name, hook_content):
            success_count += 1
    
    print(f"\n✓ Installed {success_count}/{len(hooks)} hooks successfully")
    
    # Create setup instructions
    setup_file = repo_path / '.repo-setup-instructions.md'
    setup_instructions = f"""# Repository Protection Setup

This repository is protected with device verification and copy detection.

## Initial Setup

1. Register your device:
   ```bash
   export API_URL="http://localhost:5000"
   export API_TOKEN="your-token-here"
   export REPO_ID="{repo_path.name}"
   
   python3 monitoring-agent/repo_protection_agent.py register --device-name "My Device"
   ```

2. Wait for admin approval of your device

3. Verify access:
   ```bash
   python3 monitoring-agent/copy_detection_monitor.py \\
       --api-url "$API_URL" \\
       --token "$API_TOKEN" \\
       --repo-id "$REPO_ID"
   ```

## Environment Variables

Create a `.env` file in the repository root:

```env
API_URL=http://localhost:5000
API_TOKEN=your-jwt-token
REPO_ID={repo_path.name}
```

## Security Features

- ✅ Device verification on clone
- ✅ Location verification on checkout
- ✅ Copy detection with automatic encryption
- ✅ Access verification on commit/push
- ✅ Real-time alerts for suspicious activity

## Important Notes

- Do NOT copy this repository to USB drives or external devices
- Do NOT move the repository to a different location
- If you need to work from a different location, contact your administrator
- Unauthorized copying will trigger automatic encryption

## Troubleshooting

If you see "Repository access verification failed":
1. Check that your device is registered and approved
2. Verify you're working from the original repository location
3. Contact your administrator if issues persist
"""
    
    with open(setup_file, 'w') as f:
        f.write(setup_instructions)
    
    print(f"\n📄 Setup instructions written to: .repo-setup-instructions.md")
    
    return True

def uninstall_hooks(repo_path):
    """Uninstall protection hooks"""
    repo_path = Path(repo_path).resolve()
    hooks_dir = repo_path / '.git' / 'hooks'
    
    if not hooks_dir.exists():
        print(f"✗ Git hooks directory not found")
        return False
    
    print(f"\nUninstalling repository protection hooks...")
    
    hooks = ['post-checkout', 'pre-commit', 'pre-push']
    
    for hook_name in hooks:
        hook_file = hooks_dir / hook_name
        backup_file = hooks_dir / f"{hook_name}.backup"
        
        if hook_file.exists():
            hook_file.unlink()
            print(f"✓ Removed: {hook_name}")
            
            # Restore backup if exists
            if backup_file.exists():
                backup_file.rename(hook_file)
                print(f"  Restored backup")
    
    print("\n✓ Hooks uninstalled")
    return True

def main():
    """Main function"""
    import argparse
    
    parser = argparse.ArgumentParser(
        description='Install Git Hooks for Repository Protection'
    )
    parser.add_argument(
        'action',
        choices=['install', 'uninstall'],
        help='Action to perform'
    )
    parser.add_argument(
        '--repo-path',
        default='.',
        help='Repository path (default: current directory)'
    )
    
    args = parser.parse_args()
    
    repo_path = Path(args.repo_path).resolve()
    
    # Check if it's a git repository
    if not (repo_path / '.git').exists():
        print(f"✗ Not a git repository: {repo_path}")
        sys.exit(1)
    
    if args.action == 'install':
        success = install_all_hooks(repo_path)
        sys.exit(0 if success else 1)
    elif args.action == 'uninstall':
        success = uninstall_hooks(repo_path)
        sys.exit(0 if success else 1)

if __name__ == '__main__':
    main()
