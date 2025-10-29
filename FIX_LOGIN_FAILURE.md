# Fix: Login Failure Issue

## Problem
Users were unable to login through the web dashboard. The login endpoint was failing when attempting to create a LOGIN activity record in the database.

## Root Cause
The `Activity` model in the Prisma schema had `deviceId` as a required (non-nullable) field. When users logged in through the web dashboard (as opposed to through a monitored device), no `deviceId` was available, causing the activity logging to fail with a database constraint violation.

## Solution
Made the `deviceId` field optional in the Activity model to support both:
1. **Device-based activities**: Git operations (clone, push, pull, commit) that originate from a specific monitored device
2. **Web-based activities**: Login/logout actions performed through the web dashboard that don't have an associated device

### Changes Made

#### 1. Updated Prisma Schema (`backend/prisma/schema.prisma`)
```diff
model Activity {
  id          String         @id @default(uuid())
  userId      String
- deviceId    String
+ deviceId    String?
  activityType ActivityType
  ...
  
- device Device @relation(fields: [deviceId], references: [id], onDelete: Cascade)
+ device Device? @relation(fields: [deviceId], references: [id], onDelete: Cascade)
}
```

#### 2. Created Database Migration
- Migration: `20251029012753_make_activity_deviceid_optional`
- This migration alters the `activities` table to allow NULL values for `deviceId`

### Testing
All demo accounts were tested and confirmed working:
- ✅ admin@devmonitor.com
- ✅ developer@devmonitor.com  
- ✅ viewer@devmonitor.com
- ✅ john.doe@example.com
- ✅ jane.smith@example.com
- ✅ alex.johnson@example.com

### Impact
- No breaking changes to existing functionality
- Device-based activities continue to work as before with deviceId populated
- Web-based login/logout activities now work correctly with deviceId as null
- All activity queries handle both cases transparently

## Deployment
To deploy this fix:
1. Pull the latest changes from the `fix-login-failure` branch
2. Run the database migration:
   ```bash
   cd backend
   npx prisma migrate deploy
   ```
3. Restart the backend service
