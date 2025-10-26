# Developer Activity Monitoring Agent

Python-based monitoring agent that runs on developer machines to track git activities and ensure device authorization.

## Features

- 🔍 Git operation monitoring (clone, pull, push, commit)
- 🔐 Device fingerprinting and registration
- 🔒 Automatic encryption for unauthorized access
- 💓 Heartbeat mechanism
- 📊 Real-time activity logging
- 🚨 Security violation detection

## Installation

### Requirements

- Python 3.8+
- Git

### Setup

```bash
cd monitoring-agent

# Create virtual environment
python -m venv venv

# Activate virtual environment
source venv/bin/activate  # Linux/Mac
# or
venv\Scripts\activate  # Windows

# Install dependencies
pip install -r requirements.txt

# Copy environment file
cp .env.example .env

# Edit .env with your configuration
nano .env
```

## Configuration

Edit `.env` file:

```env
API_URL=http://your-server:5000
API_KEY=your-api-secret-key
HEARTBEAT_INTERVAL=60
LOG_LEVEL=INFO
MONITORED_PATHS=/path/to/projects
```

## Usage

### 1. Register Device

```bash
python agent.py register --email developer@company.com --device-name "My Laptop"
```

This will:
- Generate device fingerprint
- Register device with the server
- Save configuration locally
- Wait for admin approval

### 2. Check Device Status

```bash
python agent.py status
```

### 3. Start Monitoring

```bash
python agent.py monitor
```

This will:
- Monitor git operations in specified paths
- Send heartbeat signals
- Log activities to server
- Detect unauthorized access

## Running as Service

### Linux (systemd)

Create `/etc/systemd/system/devmonitor-agent.service`:

```ini
[Unit]
Description=Developer Monitoring Agent
After=network.target

[Service]
Type=simple
User=YOUR_USER
WorkingDirectory=/path/to/monitoring-agent
ExecStart=/path/to/monitoring-agent/venv/bin/python agent.py monitor
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

Enable and start:

```bash
sudo systemctl enable devmonitor-agent
sudo systemctl start devmonitor-agent
sudo systemctl status devmonitor-agent
```

### Windows (Task Scheduler)

1. Open Task Scheduler
2. Create Basic Task
3. Trigger: At system startup
4. Action: Start a program
5. Program: `C:\path\to\venv\Scripts\python.exe`
6. Arguments: `agent.py monitor`
7. Start in: `C:\path\to\monitoring-agent`

### macOS (launchd)

Create `~/Library/LaunchAgents/com.devmonitor.agent.plist`:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.devmonitor.agent</string>
    <key>ProgramArguments</key>
    <array>
        <string>/path/to/venv/bin/python</string>
        <string>/path/to/agent.py</string>
        <string>monitor</string>
    </array>
    <key>RunAtLoad</key>
    <true/>
    <key>KeepAlive</key>
    <true/>
</dict>
</plist>
```

Load:

```bash
launchctl load ~/Library/LaunchAgents/com.devmonitor.agent.plist
```

## How It Works

### Device Fingerprinting

The agent creates a unique fingerprint based on:
- MAC address
- Hostname
- CPU information
- Operating system details

### Activity Monitoring

Monitors:
- Git clone operations
- Git pull/push operations
- Git commits
- Repository copies
- Unauthorized access attempts

### Security Features

1. **Authorization Check**: Verifies device authorization before each operation
2. **Activity Logging**: All git operations are logged to server
3. **Automatic Encryption**: Encrypts repositories on unauthorized devices
4. **Real-time Alerts**: Sends alerts for suspicious activities

### Heartbeat Mechanism

The agent sends periodic heartbeat signals to:
- Confirm agent is running
- Update last seen timestamp
- Check authorization status

## Logs

Logs are written to:
- `agent.log` - File log
- Console output

Log levels: DEBUG, INFO, WARNING, ERROR, CRITICAL

## Troubleshooting

### Agent won't start

- Check Python version: `python --version`
- Verify virtual environment is activated
- Check API_URL and API_KEY in .env

### Device not authorized

- Contact your administrator
- Check device status: `python agent.py status`
- Wait for approval in dashboard

### Connection errors

- Verify API_URL is correct
- Check network connectivity
- Ensure backend server is running

## Security

- Device configuration stored in `~/.devmonitor/config`
- API key should be kept secure
- Never commit .env file to version control

## Uninstall

```bash
# Stop service (if running)
sudo systemctl stop devmonitor-agent
sudo systemctl disable devmonitor-agent

# Remove configuration
rm -rf ~/.devmonitor

# Remove agent files
cd .. && rm -rf monitoring-agent
```
