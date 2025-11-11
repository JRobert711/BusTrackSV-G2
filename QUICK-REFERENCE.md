# 🚀 Quick Reference - Firebase Database Backup

## File Locations in Backup

### Configuration Files (Root Level)
```
database-backup/config/
├── .firebaserc                    # Project ID configuration
├── firebase.json                  # Firebase services config
├── firestore.rules                # Firestore security rules
├── firestore.indexes.json         # Firestore indexes
└── database.rules.json            # Realtime DB rules
```

### Backend Files
```
database-backup/backend/
├── config/
│   └── firebase-admin.js          # Firebase Admin SDK init
├── scripts/
│   └── seed-firebase.js           # Data seeding script
└── .env.example                   # Backend env template
```

### Frontend Files
```
database-backup/frontend/
├── config/
│   └── firebase.ts                # Firebase Client SDK init
└── .env.example                   # Frontend env template
```

### Documentation
```
database-backup/docs/
├── FIREBASE-SETUP.md              # Frontend setup guide
├── FIREBASE-INTEGRATION.md        # Backend setup guide
├── CONNECT-FIREBASE.md            # Spanish connection guide
└── INTEGRATION-README.md          # Project integration info
```

## 📝 Quick Copy Commands

### Copy All to New Branch
```bash
# From project root
cd your-new-branch

# Copy config files
cp database-backup/config/.firebaserc .
cp database-backup/config/firebase.json .
cp database-backup/config/firestore.rules .
cp database-backup/config/firestore.indexes.json .
cp database-backup/config/database.rules.json .

# Copy backend files
cp database-backup/backend/config/firebase-admin.js backend/src/config/
cp database-backup/backend/scripts/seed-firebase.js backend/scripts/
cp database-backup/backend/.env.example backend/.env.example

# Copy frontend files
cp database-backup/frontend/config/firebase.ts frontend/web/src/config/
cp database-backup/frontend/.env.example frontend/web/.env.example
```

### PowerShell (Windows)
```powershell
# Copy config files
copy database-backup\config\.firebaserc .
copy database-backup\config\firebase.json .
copy database-backup\config\firestore.rules .
copy database-backup\config\firestore.indexes.json .
copy database-backup\config\database.rules.json .

# Copy backend files
copy database-backup\backend\config\firebase-admin.js backend\src\config\
copy database-backup\backend\scripts\seed-firebase.js backend\scripts\
copy database-backup\backend\.env.example backend\.env.example

# Copy frontend files
copy database-backup\frontend\config\firebase.ts frontend\web\src\config\
copy database-backup\frontend\.env.example frontend\web\.env.example
```

## 🔑 Environment Variables Needed

### Backend (.env)
```env
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
FIREBASE_DATABASE_URL=https://your-project-default-rtdb.firebaseio.com
```

### Frontend (.env)
```env
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_DATABASE_URL=https://your-project-default-rtdb.firebaseio.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abc123
```

## 🎯 Integration Checklist

- [ ] Copy all configuration files to project root
- [ ] Copy backend files to backend folders
- [ ] Copy frontend files to frontend folders
- [ ] Create Firebase project (or use existing)
- [ ] Update `.firebaserc` with your project ID
- [ ] Get service account credentials from Firebase Console
- [ ] Fill in `backend/.env` with Firebase Admin credentials
- [ ] Get web app config from Firebase Console
- [ ] Fill in `frontend/web/.env` with Firebase Client credentials
- [ ] Enable Authentication in Firebase Console
- [ ] Enable Firestore in Firebase Console
- [ ] Enable Realtime Database in Firebase Console (optional)
- [ ] Test backend: `npm run dev` → should show "✅ Firebase Admin SDK initialized"
- [ ] Test frontend: `npm run dev` → no Firebase errors in console
- [ ] Deploy rules: `firebase deploy --only firestore:rules,database`
- [ ] Seed data: `cd backend && npm run seed`

## 🔥 Where to Get Firebase Credentials

### Backend (Service Account)
1. Firebase Console → ⚙️ Project Settings → Service Accounts
2. Click "Generate new private key"
3. Download JSON file
4. Extract: `project_id`, `private_key`, `client_email`
5. Get database URL from Realtime Database page

### Frontend (Web App Config)
1. Firebase Console → ⚙️ Project Settings → General
2. Scroll to "Your apps" section
3. Click Web app icon `</>` (or add new app)
4. Copy the `firebaseConfig` object values
5. Prefix each with `VITE_` in `.env`

## 📚 Documentation Guide

- **New to Firebase?** → Read `docs/FIREBASE-SETUP.md`
- **Backend setup?** → Read `docs/FIREBASE-INTEGRATION.md`
- **Spanish guide?** → Read `docs/CONNECT-FIREBASE.md`
- **Project overview?** → Read `docs/INTEGRATION-README.md`
- **Full backup info?** → Read `README.md`

## 🛠️ Troubleshooting

### "Firebase Admin credentials not found"
→ Check `backend/.env` exists and has all variables

### "Invalid private key"
→ Ensure private key includes `-----BEGIN` and `-----END`
→ Make sure newlines are properly formatted

### "Permission denied" on Firestore
→ Check Firestore rules (temporarily allow all for testing)
→ Verify service account has proper permissions

### Frontend can't find Firebase modules
→ Run `npm install firebase` in frontend
→ Restart dev server after `.env` changes

## 💡 Tips

- **Don't commit `.env` files** to version control
- **Test with development rules** first, tighten for production
- **Rotate service account keys** every 90 days
- **Use separate Firebase projects** for dev/staging/production
- **Enable Firebase security rules** testing in console

## 📞 Support

Check the documentation files in `docs/` folder for detailed guides and troubleshooting steps.
