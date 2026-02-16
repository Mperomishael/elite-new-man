# Firebase Setup Guide for UltimateStockTrade Dashboard

## Overview
This guide helps configure Firebase for the UltimateStockTrade application. Firebase provides authentication, real-time database (Firestore), and cloud storage.

## Current Firebase Project
- **Project ID**: ultimatestcktrader
- **Auth Domain**: ultimatestcktrader.firebaseapp.com
- **Database**: Cloud Firestore
- **Storage**: Firebase Cloud Storage

## Setup Steps

### 1. Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click "Create a new project"
3. Name it "UltimateStockTrade"
4. Enable Google Analytics (optional)
5. Click "Create project"

### 2. Enable Authentication
1. In Firebase Console, go to **Authentication** → **Sign-in method**
2. Enable **Email/Password** provider:
   - Click "Email/Password"
   - Toggle "Enable"
   - Save
3. Enable **Google** provider (optional):
   - Click "Google"
   - Toggle "Enable"
   - Select a support email
   - Save

### 3. Create Firestore Database
1. Go to **Firestore Database** → **Create database**
2. Choose region (closest to your users)
3. Start in **Production mode** (can be changed to test mode for development)
4. Click "Create"

### 4. Set Firestore Security Rules
Replace default rules with:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own profile
    match /users/{userId} {
      allow read, write: if request.auth.uid == userId;
    }
    
    // Transactions subcollection
    match /users/{userId}/transactions/{transactionId} {
      allow read, write: if request.auth.uid == userId;
    }
    
    // Admin-only collections
    match /depositRequests/{document=**} {
      allow read, write: if request.auth.token.email == 'ultimatestckstrade@gmail.com' 
                            || request.auth.token.email == 'empiredigitalsworldwide@gmail.com';
      allow create: if request.auth.uid != null;
    }
    
    match /withdrawalRequests/{document=**} {
      allow read, write: if request.auth.token.email == 'ultimatestckstrade@gmail.com'
                            || request.auth.token.email == 'empiredigitalsworldwide@gmail.com';
      allow create: if request.auth.uid != null;
    }
    
    match /kycDocuments/{document=**} {
      allow read: if request.auth.uid != null;
      allow write: if request.auth.token.email == 'ultimatestckstrade@gmail.com'
                      || request.auth.token.email == 'empiredigitalsworldwide@gmail.com';
    }
    
    // Support messages
    match /supportMessages/{document=**} {
      allow read, write: if request.auth.uid != null;
    }
    
    match /adminMessages/{document=**} {
      allow read, write: if request.auth.uid != null;
    }
  }
}
```

### 5. Get Your Firebase Config
1. In Firebase Console, go to **Project Settings**
2. Under "Your apps", click the web app (</> icon)
3. Copy the firebaseConfig object
4. Replace values in `lib/firebase.ts`

### 6. Enable Cloud Storage (Optional)
1. Go to **Storage**
2. Click "Get started"
3. Accept default rules
4. Click "Done"

## Environment Variables

If using environment variables (recommended for production):
```bash
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

Then update `lib/firebase.ts`:
```typescript
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}
```

## Firestore Collections Structure

### users
- **uid** (string): User ID
- **firstName** (string): First name
- **lastName** (string): Last name
- **username** (string): Unique username
- **email** (string): User email
- **phone** (string): Phone number
- **currency** (string): Preferred currency
- **country** (string): Country
- **address** (string, optional): Street address
- **balance** (number): Account balance
- **profitBalance** (number): Trading profits
- **kycStatus** (string): "not-started", "pending", "approved", "rejected"
- **onboardingCompleted** (boolean): Onboarding status
- **createdAt** (timestamp): Account creation date

### users/{uid}/transactions
- **id** (string): Transaction ID
- **type** (string): "buy", "sell", "deposit", "withdraw", "transfer"
- **amount** (number): Transaction amount
- **currency** (string): Currency code
- **status** (string): "pending", "completed", "failed", "rejected"
- **timestamp** (timestamp): Transaction time
- **description** (string): Transaction details
- **receiptUrl** (string, optional): Proof file
- **walletAddress** (string, optional): Wallet address

### depositRequests
- **id** (string): Request ID
- **transactionId** (string): Linked transaction ID
- **userId** (string): User ID
- **username** (string): Username
- **amount** (number): Deposit amount
- **currency** (string): Crypto type (BTC, USDT, XRP, BANK)
- **status** (string): "pending", "completed", "rejected"
- **proofScreenshot** (string): Base64 proof
- **requestedAt** (timestamp): Request time
- **processedAt** (timestamp, optional): Approval/rejection time
- **processedBy** (string, optional): Admin email

### kycDocuments
- **id** (string): Document ID
- **userId** (string): User ID
- **username** (string): Username
- **documentType** (string): "passport", "id", "license", "proof-of-address"
- **documentUrl** (string): Base64 document
- **status** (string): "pending", "approved", "rejected"
- **uploadedAt** (timestamp): Upload time
- **approvedBy** (string, optional): Admin email
- **approvedAt** (timestamp, optional): Approval time
- **rejectionReason** (string, optional): Rejection reason

### supportMessages
- **id** (string): Message ID
- **userId** (string): User ID
- **username** (string): Username
- **subject** (string): Message subject
- **message** (string): Message content
- **timestamp** (timestamp): Message time

## Troubleshooting

### Authentication Errors
- **Email already in use**: User exists with this email
- **Weak password**: Use at least 6 characters
- **Invalid email**: Check email format

### Database Errors
- **Permission denied**: Check Firestore rules
- **Network error**: Check internet connection and Firebase status

### Admin Access Issues
- Admin emails must be: `ultimatestckstrade@gmail.com` or `empiredigitalsworldwide@gmail.com`
- Update these in `lib/auth-service.ts` line 66 if needed

## Testing

### Test Sign Up
1. Navigate to `/auth/signup`
2. Fill in all required fields:
   - First name, last name, username
   - Email, password (min 6 chars)
   - Phone number
   - Country and currency
3. Click "Create account"
4. Check success message

### Test Admin Features
1. Sign in with admin email
2. You'll see admin panel with extra features
3. Check "Setup Controls" to verify admin access

## Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| Firebase not initializing | Check `lib/firebase.ts` config matches Firebase Console |
| Users can't create accounts | Enable Email/Password auth in Firebase Console |
| Permission errors on deposit/withdrawal | Verify Firestore rules include your test emails |
| Messages not syncing | Check browser console for JavaScript errors |

## Security Best Practices

1. Keep API keys secret (only use public keys in client code)
2. Never commit real keys to Git
3. Use environment variables for sensitive data
4. Enable 2FA on Firebase Console account
5. Regularly review Firestore security rules
6. Monitor Firebase usage in Console to detect abuse

## Monitoring

- **Firebase Console**: Check usage statistics and logs
- **Auth Dashboard**: Monitor sign-ups and active users
- **Firestore Usage**: Track reads, writes, and storage
- **Performance Insights**: Review app performance metrics
