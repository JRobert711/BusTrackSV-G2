# Firebase Setup Instructions

## 🔥 Firebase Configuration

The backend requires Firebase Admin SDK credentials to run. You have two options:

### Option 1: Local Development (Recommended for beginners)

1. **Get your Firebase Service Account:**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Select your project
   - Click the gear icon ⚙️ → Project Settings
   - Go to "Service Accounts" tab
   - Click "Generate new private key"
   - Save the JSON file

2. **Place the file:**
   ```bash
   # Save the downloaded JSON file as:
   backend/src/config/firebase-adminsdk.json
   ```

3. **Update your .env file:**
   ```env
   GOOGLE_APPLICATION_CREDENTIALS=./src/config/firebase-adminsdk.json
   ```

### Option 2: Production/Deployment (Base64 encoding)

1. **Encode your service account JSON:**
   
   **Linux/Mac:**
   ```bash
   base64 -w 0 path/to/serviceAccount.json
   ```
   
   **Windows PowerShell:**
   ```powershell
   [Convert]::ToBase64String([IO.File]::ReadAllBytes("path\to\serviceAccount.json"))
   ```

2. **Update your .env file:**
   ```env
   FIREBASE_SERVICE_ACCOUNT_BASE64=<paste-the-long-base64-string-here>
   ```

## 🧪 Testing Without Firebase (Optional)

If you want to test the backend structure without Firebase first, you can:

1. Comment out the Firebase initialization in `src/server.js` temporarily:
   ```javascript
   // const { db, admin } = require('./config/db');
   ```

2. The server will start without Firebase, but routes that need database access won't work.

## ✅ Verification

Once configured correctly, you should see:
```
✓ Firebase credentials loaded from FIREBASE_SERVICE_ACCOUNT_BASE64
✓ Firebase Admin SDK initialized successfully
```

## ⚠️ Security Notes

- **NEVER** commit `firebase-adminsdk.json` or `.env` to version control
- Both are already in `.gitignore`
- For production, use environment variables or secure secret management
- Rotate credentials if accidentally exposed
