# Firebase Setup Guide for BusTrackSV-G2

This guide will help you connect Firebase to your BusTrack project.

## Prerequisites

- Node.js installed
- Firebase CLI installed (already done: `npm install -g firebase-tools`)
- A Firebase account (create one at https://console.firebase.google.com/)

## Step 1: Login to Firebase

```bash
firebase login
```

This will open a browser window for you to authenticate with your Google account.

## Step 2: Initialize Firebase Project

### Option A: Initialize Hosting (for deploying frontend)

```bash
firebase init hosting
```

When prompted:
- **Select "Use an existing project"** (or create a new one)
- **Public directory:** `frontend/web/build`
- **Configure as single-page app:** Yes
- **Set up automatic builds:** No (unless you want CI/CD)

### Option B: Initialize Multiple Services

```bash
firebase init
```

Select:
- ✅ Hosting
- ✅ Firestore
- ✅ Realtime Database (optional)
- ✅ Storage (optional)

## Step 3: Get Your Firebase Configuration

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Click the gear icon ⚙️ > **Project Settings**
4. Scroll down to **"Your apps"** section
5. Click on the web app icon `</>` or add a new web app
6. Copy the `firebaseConfig` object

## Step 4: Configure Environment Variables

1. Copy the example environment file:
   ```bash
   cd frontend/web
   copy .env.example .env
   ```

2. Open `frontend/web/.env` and fill in your Firebase credentials:
   ```
   VITE_FIREBASE_API_KEY=your-api-key
   VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   VITE_FIREBASE_DATABASE_URL=https://your-project-default-rtdb.firebaseio.com
   VITE_FIREBASE_PROJECT_ID=your-project-id
   VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
   VITE_FIREBASE_APP_ID=1:123456789012:web:abcdef123456
   ```

3. Update `.firebaserc` with your project ID:
   ```json
   {
     "projects": {
       "default": "your-project-id"
     }
   }
   ```

## Step 5: Use Firebase in Your Code

### Import Firebase in your React components:

```typescript
import { auth, db, storage, realtimeDb } from '@/config/firebase';
```

### Example: Authentication

```typescript
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/config/firebase';

// Sign in
const login = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    console.error('Login error:', error);
  }
};
```

### Example: Firestore Database

```typescript
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/config/firebase';

// Get all buses
const getBuses = async () => {
  const busesCollection = collection(db, 'buses');
  const busesSnapshot = await getDocs(busesCollection);
  return busesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// Add a bus
const addBus = async (busData: any) => {
  const busesCollection = collection(db, 'buses');
  await addDoc(busesCollection, busData);
};
```

### Example: Realtime Database

```typescript
import { ref, onValue, set, update } from 'firebase/database';
import { realtimeDb } from '@/config/firebase';

// Listen to bus location updates
const listenToBusLocation = (busId: string, callback: (location: any) => void) => {
  const busRef = ref(realtimeDb, `buses/${busId}/location`);
  onValue(busRef, (snapshot) => {
    callback(snapshot.val());
  });
};
```

## Step 6: Deploy to Firebase Hosting

1. Build your frontend:
   ```bash
   cd frontend/web
   npm run build
   ```

2. Deploy to Firebase:
   ```bash
   cd ../..
   firebase deploy --only hosting
   ```

## Step 7: Deploy Firestore Rules (if using Firestore)

```bash
firebase deploy --only firestore:rules
```

## Step 8: Deploy Realtime Database Rules (if using Realtime Database)

```bash
firebase deploy --only database
```

## Security Rules

⚠️ **Important:** The default rules in `firestore.rules` and `database.rules.json` require authentication. Update them according to your security needs before deploying to production.

## Troubleshooting

### Error: "Firebase: No Firebase App '[DEFAULT]' has been created"
- Make sure you've initialized Firebase in your code: `import './config/firebase';`
- Check that your environment variables are set correctly

### Error: "Permission denied"
- Check your Firestore/Database security rules
- Make sure the user is authenticated

### Error: "Api key not valid"
- Double-check your `.env` file has the correct values
- Make sure the `.env` file is in `frontend/web/` directory
- Restart your dev server after changing `.env`

## Next Steps

- [ ] Set up Firebase Authentication
- [ ] Configure Firestore security rules
- [ ] Set up Firebase Storage for images
- [ ] Configure Firebase Cloud Functions (if needed)
- [ ] Set up CI/CD for automatic deployments

## Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firebase Hosting](https://firebase.google.com/docs/hosting)
- [Firestore Documentation](https://firebase.google.com/docs/firestore)
- [Firebase Authentication](https://firebase.google.com/docs/auth)
