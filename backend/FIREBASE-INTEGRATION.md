# Firebase Admin SDK Integration Guide

This guide explains how to set up and use Firebase Admin SDK in the BusTrack backend.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Getting Firebase Service Account Credentials](#getting-firebase-service-account-credentials)
3. [Environment Setup](#environment-setup)
4. [Running Seed Scripts](#running-seed-scripts)
5. [Security Best Practices](#security-best-practices)
6. [How to Revoke/Rotate Credentials](#how-to-revokerotate-credentials)
7. [Troubleshooting](#troubleshooting)

## Prerequisites

- Firebase project created at [Firebase Console](https://console.firebase.google.com/)
- Node.js installed (v16 or higher)
- Firebase Admin SDK installed (`npm install firebase-admin`)

## Getting Firebase Service Account Credentials

### Step 1: Open Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project (or create a new one)

### Step 2: Generate Service Account Key

1. Click the gear icon ⚙️ next to "Project Overview"
2. Select **"Project Settings"**
3. Go to the **"Service Accounts"** tab
4. Click **"Generate New Private Key"**
5. A dialog will appear - click **"Generate Key"**
6. A JSON file will be downloaded (e.g., `your-project-firebase-adminsdk-xxxxx.json`)

### Step 3: Extract Credentials from JSON

Open the downloaded JSON file. It should look like this:

```json
{
  "type": "service_account",
  "project_id": "your-project-id",
  "private_key_id": "...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com",
  "client_id": "...",
  "auth_uri": "...",
  "token_uri": "...",
  "auth_provider_x509_cert_url": "...",
  "client_x509_cert_url": "..."
}
```

You'll need these values:
- `project_id` → `FIREBASE_PROJECT_ID`
- `private_key` → `FIREBASE_PRIVATE_KEY`
- `client_email` → `FIREBASE_CLIENT_EMAIL`

## Environment Setup

### Step 1: Create `.env` File

1. Copy the example file:
   ```bash
   cd backend
   cp .env.example .env
   ```

2. Open `backend/.env` and fill in your Firebase credentials:

```env
# Node Environment
NODE_ENV=development
PORT=5000

# JWT Configuration
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRES_IN=24h

# CORS Configuration
CORS_ORIGIN=*

# Firebase Admin SDK Configuration
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour-Private-Key-Here\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
FIREBASE_DATABASE_URL=https://your-project-default-rtdb.firebaseio.com
```

### Step 2: Format Private Key

The `FIREBASE_PRIVATE_KEY` must be properly formatted. You have two options:

**Option A: Use actual newlines (recommended for development)**
```env
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...
...
-----END PRIVATE KEY-----"
```

**Option B: Use escaped newlines (better for CI/CD)**
```env
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...\n...\n-----END PRIVATE KEY-----\n"
```

The code automatically handles `\n` conversion, so Option B is safer for most deployment scenarios.

### Step 3: Enable Firebase Services

Make sure these services are enabled in your Firebase project:

1. **Firebase Authentication**
   - Go to Firebase Console > Authentication
   - Click "Get Started"
   - Enable "Email/Password" sign-in method

2. **Cloud Firestore**
   - Go to Firebase Console > Firestore Database
   - Click "Create Database"
   - Choose "Start in production mode" (we'll set up rules later)
   - Select a location close to your users

3. **Realtime Database** (optional, for location tracking)
   - Go to Firebase Console > Realtime Database
   - Click "Create Database"
   - Choose a location
   - Start in "locked mode" (we'll set up rules later)

## Running Seed Scripts

The seed script migrates mock data to Firebase. It's safe to run multiple times (it checks for existing data).

### Seed Everything

```bash
cd backend
npm run seed
```

This will:
- Create users in Firebase Authentication
- Create user documents in Firestore
- Create bus documents in Firestore
- Set initial locations in Realtime Database

### Seed Only Users

```bash
npm run seed:users
```

### Seed Only Buses

```bash
npm run seed:buses
```

### Verify Seeded Data

1. **Check Firestore**: Firebase Console > Firestore Database
   - You should see `buses` and `users` collections

2. **Check Authentication**: Firebase Console > Authentication
   - You should see two users: `admin@bustrack.com` and `operador@bustrack.com`

3. **Check Realtime Database**: Firebase Console > Realtime Database
   - You should see a `buses` node with location data

## Security Best Practices

### 1. Never Commit Credentials

- ✅ `.env` is in `.gitignore`
- ✅ `serviceAccount.json` is in `.gitignore`
- ❌ Never commit these files to version control

### 2. Use Environment Variables in Production

For production deployments (Heroku, AWS, etc.), set environment variables through your platform's dashboard:

```bash
# Example: Heroku
heroku config:set FIREBASE_PROJECT_ID=your-project-id
heroku config:set FIREBASE_PRIVATE_KEY="..."
heroku config:set FIREBASE_CLIENT_EMAIL=...
```

### 3. Restrict Service Account Permissions

By default, service accounts have broad permissions. For better security:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to IAM & Admin > Service Accounts
3. Find your Firebase service account
4. Edit permissions and limit to only what's needed:
   - Cloud Datastore User (for Firestore)
   - Firebase Realtime Database Admin (for Realtime DB)
   - Firebase Authentication Admin (for Auth)

### 4. Rotate Keys Periodically

Rotate your service account keys every 90 days (see [How to Revoke/Rotate Credentials](#how-to-revokerotate-credentials)).

### 5. Use Firestore Security Rules

Update `firestore.rules` with production-ready rules before deploying:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Buses: Authenticated users can read, only admins can write
    match /buses/{busId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
                    get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Users: Users can only read/write their own data
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth.uid == userId;
    }
  }
}
```

Deploy rules:
```bash
firebase deploy --only firestore:rules
```

## How to Revoke/Rotate Credentials

### Step 1: Generate New Key

1. Go to Firebase Console > Project Settings > Service Accounts
2. Click "Generate New Private Key"
3. Download the new JSON file

### Step 2: Update Environment Variables

Update your `.env` file with the new credentials from the new JSON file.

### Step 3: Delete Old Key (Optional but Recommended)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to IAM & Admin > Service Accounts
3. Click on your Firebase service account
4. Go to "Keys" tab
5. Delete the old key (identified by creation date)

### Step 4: Test

Restart your backend server and verify it connects successfully:

```bash
cd backend
npm run dev
```

You should see: `✅ Firebase Admin SDK initialized successfully`

## Troubleshooting

### Error: "Firebase Admin credentials not found"

**Solution**: Check that your `.env` file exists and contains all required Firebase variables.

### Error: "Error initializing Firebase Admin SDK: Invalid private key"

**Solution**: 
- Make sure the private key includes `-----BEGIN PRIVATE KEY-----` and `-----END PRIVATE KEY-----`
- If using escaped newlines (`\n`), ensure they're properly escaped
- Try copying the private key directly from the JSON file

### Error: "Permission denied" when accessing Firestore

**Solution**:
- Check Firestore security rules
- Verify service account has proper permissions
- Ensure Firestore is enabled in Firebase Console

### Error: "Database URL not found"

**Solution**: 
- Go to Firebase Console > Realtime Database
- Copy the database URL
- Add it to `.env` as `FIREBASE_DATABASE_URL`

### Seed Script Errors

If seed script fails:

1. Check that Firebase Admin is initialized correctly
2. Verify Firestore and Authentication are enabled
3. Check console output for specific error messages
4. Ensure you have proper permissions (service account should have admin access)

### Backend Falls Back to Mock Data

This is expected behavior! If Firebase is not configured, the backend gracefully falls back to mock data for development.

To verify Firebase is working:
- Check server logs for "✅ Firebase Admin SDK initialized successfully"
- Look for Firestore queries in logs when accessing `/api/v1/buses`

## Additional Resources

- [Firebase Admin SDK Documentation](https://firebase.google.com/docs/admin/setup)
- [Firestore Documentation](https://firebase.google.com/docs/firestore)
- [Firebase Authentication](https://firebase.google.com/docs/auth)
- [Realtime Database Documentation](https://firebase.google.com/docs/database)

## Need Help?

If you encounter issues not covered here:

1. Check the [Firebase Setup Guide](../FIREBASE-SETUP.md) for frontend configuration
2. Review Firebase Console for service status
3. Check backend server logs for detailed error messages
4. Verify all environment variables are set correctly
