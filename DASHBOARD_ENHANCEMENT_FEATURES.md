# Dashboard Enhancement Features

This document describes the additional dashboard features implemented for the DevMonitor system.

## Features Overview

### 1. Developer Activity Statistics (Statistik Aktivitas Developer)

**Purpose**: Provide comprehensive analytics of developer activities with multiple visualization options.

**Features**:
- Activity graphs by time periods (hourly, daily, weekly, monthly)
- Activity breakdown by repository
- Activity breakdown by device
- Activity breakdown by type (commits, pushes, pulls, etc.)
- Hourly activity distribution heatmap
- Performance metrics including commit statistics
- Top repositories and active devices
- Activity type distribution

**API Endpoints**:
- `GET /api/developer-stats/activity-stats` - Get activity statistics with grouping options
- `GET /api/developer-stats/performance-metrics` - Get developer performance metrics
- `GET /api/developer-stats/repository-stats` - Get repository-specific activity stats
- `GET /api/developer-stats/device-stats` - Get device-specific activity stats
- `GET /api/developer-stats/heatmap` - Get activity heatmap data

**Frontend Route**: `/developer-stats`

**Access**: All authenticated users

### 2. Security Logs & Device Sync Status (Log Keamanan dan Status Sinkronisasi)

**Purpose**: Monitor security events and track device synchronization status across all devices.

**Features**:
- Comprehensive security event logging
- Real-time device synchronization status
- Security events timeline visualization
- Filtering by severity (INFO, WARNING, CRITICAL)
- Filtering by log type (AUTH_FAILURE, UNAUTHORIZED_ACCESS, DEVICE_CHANGE, etc.)
- Sync health report showing devices with errors
- Last sync time tracking

**API Endpoints**:
- `GET /api/security-logs` - Get security logs with pagination and filters
- `POST /api/security-logs` - Create a new security log entry
- `GET /api/security-logs/stats` - Get security log statistics
- `GET /api/security-logs/sync-status` - Get all device sync statuses
- `GET /api/security-logs/sync-status/:deviceId` - Get specific device sync status
- `PUT /api/security-logs/sync-status/:deviceId` - Update device sync status
- `GET /api/security-logs/sync-health` - Get sync health report

**Frontend Route**: `/security-logs`

**Access**: Admin only

### 3. Behavioral Analytics (Analisis Perilaku)

**Purpose**: Detect and analyze anomalous behavior patterns to identify potential security threats.

**Features**:
- Automatic behavioral pattern learning
- Real-time anomaly detection
- Pattern types tracked:
  - Access time patterns
  - Git command frequency
  - Repository access patterns
  - Location patterns
  - Device usage patterns
- Anomaly types detected:
  - Unusual time access
  - High frequency activities
  - Unusual location access
  - Unusual repository access
  - Unusual device usage
  - Unusual command patterns
  - Potential data exfiltration
- Anomaly review workflow (confirm or mark as false positive)
- High-risk user identification
- Anomaly timeline and statistics
- Behavioral profile management

**API Endpoints**:
- `GET /api/behavioral-analytics/anomalies` - Get detected anomalies with filters
- `GET /api/behavioral-analytics/anomalies/stats` - Get anomaly statistics
- `GET /api/behavioral-analytics/anomalies/dashboard` - Get anomaly dashboard data
- `PUT /api/behavioral-analytics/anomalies/:id/review` - Review an anomaly
- `GET /api/behavioral-analytics/profile/:userId` - Get user behavioral profile
- `POST /api/behavioral-analytics/profile/:userId/build` - Build/rebuild user profile
- `POST /api/behavioral-analytics/analyze/:activityId` - Analyze specific activity

**Frontend Route**: `/behavioral-analytics`

**Access**: Admin only (viewing), All users (own profile)

### 4. Device Verification Management (Opsi Verifikasi Ulang Device)

**Purpose**: Allow administrators to manage device verification and force re-verification when needed.

**Features**:
- Admin-initiated device re-verification requests
- Pending verification requests management
- Approve/reject verification requests workflow
- Force immediate device re-verification
- Bulk device re-verification operations
- Device verification history tracking
- Automatic security logging of verification actions
- Device status management (PENDING, APPROVED, REJECTED, SUSPENDED)

**API Endpoints**:
- `POST /api/device-verification/request` - Request device re-verification
- `GET /api/device-verification/pending` - Get pending verification requests
- `PUT /api/device-verification/:id/approve` - Approve verification request
- `PUT /api/device-verification/:id/reject` - Reject verification request
- `PUT /api/device-verification/force/:deviceId` - Force device re-verification
- `GET /api/device-verification/history/:deviceId` - Get device verification history
- `POST /api/device-verification/bulk-reverify` - Bulk re-verify devices

**Frontend Route**: `/device-verification`

**Access**: Admin only

## Database Schema Changes

### New Models

1. **DeviceSyncStatus**
   - Tracks synchronization status for each device
   - Fields: deviceId, lastSyncAt, syncStatus, syncErrors

2. **SecurityLog**
   - Stores security-related events
   - Fields: logType, severity, userId, deviceId, ipAddress, message, details

3. **BehavioralPattern**
   - Stores learned behavioral patterns for users
   - Fields: userId, deviceId, patternType, normalBehavior, threshold

4. **AnomalyDetection**
   - Records detected anomalies
   - Fields: userId, deviceId, activityId, anomalyType, anomalyScore, description, isReviewed

5. **DeviceVerificationRequest**
   - Manages device verification workflow
   - Fields: deviceId, requestedBy, reason, status, reviewedBy, reviewedAt

### New Enums

- **SyncStatus**: SYNCED, SYNCING, ERROR, OUTDATED
- **SecurityLogType**: AUTH_FAILURE, UNAUTHORIZED_ACCESS, DEVICE_CHANGE, IP_CHANGE, SUSPICIOUS_ACTIVITY, POLICY_VIOLATION, DATA_EXPORT, CONFIG_CHANGE
- **PatternType**: ACCESS_TIME, GIT_COMMAND_FREQUENCY, REPOSITORY_ACCESS, LOCATION_PATTERN, DEVICE_USAGE
- **AnomalyType**: UNUSUAL_TIME, HIGH_FREQUENCY, UNUSUAL_LOCATION, UNUSUAL_REPOSITORY, UNUSUAL_DEVICE, UNUSUAL_COMMAND_PATTERN, DATA_EXFILTRATION
- **VerificationRequestStatus**: PENDING, APPROVED, REJECTED, EXPIRED

## Installation & Setup

1. **Update database schema**:
   ```bash
   cd backend
   npm run prisma:generate
   npm run migrate
   ```

2. **Install dependencies** (if not already installed):
   ```bash
   # Backend
   cd backend
   npm install

   # Frontend
   cd dashboard
   npm install
   ```

3. **Start services**:
   ```bash
   # Backend
   cd backend
   npm run dev

   # Frontend
   cd dashboard
   npm start
   ```

## Usage Guide

### Developer Activity Statistics

1. Navigate to **Developer Stats** in the sidebar
2. Select time range (24h, 7d, 30d, 90d)
3. Choose grouping option (Time, Repository, Device, Type)
4. View comprehensive statistics and charts

### Security Logs & Sync Status

1. Navigate to **Security Logs** (Admin only)
2. Filter logs by severity or type
3. Monitor device synchronization status
4. View security events timeline

### Behavioral Analytics

1. Navigate to **Behavioral Analytics** (Admin only)
2. Review detected anomalies
3. Filter by type, status, or time range
4. Confirm anomalies or mark as false positives
5. View high-risk users and patterns

### Device Verification Management

1. Navigate to **Device Verification** (Admin only)
2. Review pending verification requests
3. Approve or reject requests
4. Force device re-verification when needed
5. View device verification history

## API Authentication

All endpoints require authentication using JWT tokens:

```javascript
headers: {
  'Authorization': 'Bearer <jwt_token>'
}
```

Admin-only endpoints also require the user to have the `ADMIN` role.

## Behavioral Analytics Algorithm

The behavioral analytics system works by:

1. **Learning Phase**: Building behavioral profiles by analyzing historical user activity
2. **Pattern Storage**: Storing normal patterns for each user/device combination
3. **Real-time Analysis**: Comparing new activities against learned patterns
4. **Anomaly Scoring**: Calculating deviation scores (0.0 - 1.0)
5. **Threshold Detection**: Flagging activities exceeding threshold (default: 0.8)
6. **Review Process**: Allowing admins to confirm or mark as false positives

## Security Considerations

- All sensitive operations are logged to security logs
- Device verification requires admin approval
- Anomaly detection helps identify potential security threats early
- Behavioral patterns are user-specific and continuously updated
- All API endpoints are protected with authentication and authorization

## Future Enhancements

Potential improvements for future versions:

1. Machine learning-based anomaly detection
2. Real-time push notifications for critical anomalies
3. Automated response actions for detected threats
4. Integration with external SIEM systems
5. Advanced correlation between security events
6. Customizable anomaly thresholds per user/role
7. Anomaly trend predictions
8. Automated device sync monitoring and alerts

## Support

For issues or questions, please refer to the main project documentation or contact the development team.
