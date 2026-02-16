# Signup Issues - Troubleshooting & Solutions

## Common Signup Errors & Fixes

### 1. "Email is already registered"
**Cause**: User account already exists with this email.

**Solutions**:
- Use a different email address
- Click "Sign in" if you already have an account
- Use password reset if you forgot your password

**Firebase Fix**: Check Firebase Console → Authentication → Users to verify email is registered.

---

### 2. "Password is too weak"
**Cause**: Password doesn't meet minimum requirements.

**Requirements**:
- Minimum 6 characters
- Mix of letters and numbers recommended

**Solution**: Create a stronger password (e.g., "Trading123" instead of "123456")

**Firebase Setting**: Update in Firebase Console → Project Settings → Password Policy if needed.

---

### 3. "Firebase connection error"
**Cause**: Firebase initialization failed or network issues.

**Solutions**:
1. Check internet connection
2. Verify `lib/firebase.ts` has correct config
3. Check Firebase Console project status (not suspended)
4. Clear browser cache and retry
5. Check browser console (F12) for JavaScript errors

**Firebase Fix**:
```typescript
// Verify firebase.ts has current config
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  // ... other fields
}
```

---

### 4. "Missing required fields"
**Cause**: Form validation failed before submission.

**Required Fields**:
- First Name
- Last Name
- Username
- Email (valid format)
- Password (6+ characters)
- Phone Number
- Country
- Currency

**Solution**: Fill all fields before clicking "Create account". Error messages show which field is missing.

---

### 5. "User profile creation failed"
**Cause**: Successfully created Firebase auth but failed to create profile in Firestore.

**Causes**:
- Firestore database not created
- Firestore security rules too restrictive
- Database quota exceeded

**Solutions**:
1. **Create Firestore Database**:
   - Firebase Console → Firestore Database → Create database
   - Start in Production mode
   - Choose nearest region

2. **Fix Security Rules**:
   - Firebase Console → Firestore → Rules
   - Paste the rules from FIREBASE_SETUP.md
   - Publish rules

3. **Check Firestore Quota**:
   - Firebase Console → Quotas
   - Verify you haven't exceeded limits

---

### 6. "Invalid email address"
**Cause**: Email format is incorrect.

**Valid Format**: `user@example.com`

**Invalid Examples**:
- user@example (missing .com)
- user name@example.com (space in email)
- user@example..com (double dot)

**Solution**: Enter email in correct format (e.g., john.doe@gmail.com)

---

## Signup Flow Improvements (Already Implemented)

### Better Error Messages
The signup now shows specific error messages:
- Firebase errors are caught and translated
- Email conflict errors suggest sign-in
- Password strength feedback
- Network errors are clearly identified

### Helpful Tips Section
Signup form includes tips:
- Username should be unique and memorable
- Password requirements
- Phone number for account recovery

### Automatic Field Defaults
If user doesn't select country/currency:
- Default Country: "United States"
- Default Currency: "USD - US Dollar"

---

## Testing Signup Flow

### Step 1: Test Valid Signup
```
Email: testuser@example.com
Password: TestPass123
First Name: John
Last Name: Doe
Username: johndoe
Phone: +1234567890
Country: United States
Currency: USD - US Dollar
```

**Expected**: Account created, redirected to dashboard

### Step 2: Test Duplicate Email
Signup with same email again
**Expected**: Error message: "This email is already registered"

### Step 3: Test Weak Password
```
Password: 123
```

**Expected**: Error: "Password must be at least 6 characters"

### Step 4: Test Invalid Email
```
Email: notanemail
```

**Expected**: Error: "Email is invalid"

---

## User Onboarding After Signup

### 1. Welcome Page
After successful signup:
- User redirected to dashboard
- OnboardingModal appears if `onboardingCompleted` is false
- Shows welcome message with next steps

### 2. Onboarding Modal
Collects:
- Street address (required for KYC)

Explains:
- Why address is needed (compliance)
- How to use the platform
- Where to find help

### 3. First Login Experience
1. User completes onboarding
2. Dashboard shows:
   - Welcome message
   - Quick start tips
   - How to make a deposit
   - KYC verification link

### 4. Real-Time Feedback
Dashboard immediately shows:
- Account balance: $0
- Available features
- Profile completion status
- KYC status

---

## User Profile Initialization

When a user signs up, the following profile is created:

```javascript
{
  uid: "firebase_user_id",
  firstName: "John",
  lastName: "Doe",
  username: "johndoe",
  email: "john@example.com",
  phone: "+1234567890",
  currency: "USD - US Dollar",
  country: "United States",
  address: null, // Collected during onboarding
  balance: 0,
  profitBalance: 0,
  kycDocuments: [],
  kycStatus: "not-started",
  displayName: "John Doe",
  onboardingCompleted: false,
  createdAt: Timestamp.now()
}
```

**Note**: Address is `null` by default, not `undefined`, so optional fields work correctly.

---

## Database Structure After Signup

New user creates these Firestore entries:

### /users/{uid}
Main user profile document with all account info

### /users/{uid}/transactions
Empty collection (populated when user makes trades)

### KYC Status
- Initially: "not-started"
- User can upload docs from KYC section
- Admin reviews and approves/rejects

---

## Admin Dashboard Access

Admins (specific emails) get:
- Extra admin panel in top-right
- Admin features: User management, KYC review, deposits, etc.

**Admin Emails**:
- ultimatestckstrade@gmail.com
- empiredigitalsworldwide@gmail.com

Update in `lib/auth-service.ts` line 66 if needed:
```typescript
const isAdmin = user.email === "your-admin-email@gmail.com"
```

---

## Getting Help

### Check These First
1. Browser console (F12) for error messages
2. Firebase Console for service status
3. This guide for your specific error

### Contact Support
Include in message:
- Exact error message
- What you were trying to do
- Browser type and version
- Steps to reproduce

---

## Summary of Fixes Made

1. **Removed undefined address**: Profile no longer sets `address: undefined`, letting optional field work correctly
2. **Better error handling**: Specific error messages for common Firebase errors
3. **Added validation tips**: Users see requirements before submitting
4. **Improved UX**: Success messages, loading states, and clear feedback
5. **Firebase setup docs**: Complete guide to configure Firebase properly

Users can now sign up smoothly, get clear feedback on any issues, and proceed directly to the onboarding flow.
