# Recent Changes Summary

## Onboarding Simplification
- **Removed fields**: Phone number, country, and trading currency from onboarding modal
- **Kept field**: Only street address is collected during onboarding
- **Rationale**: Phone number and email are authenticated during signup; country and currency can be configured in settings if needed

## Deposit Process Changes
- **Removed**: Proof/screenshot upload requirement for deposits
- **New flow**: Users submit deposit requests without proof, requests go to admin for verification and approval
- **Approval**: Admin reviews requests and manually approves them, crediting user accounts upon approval
- **Updated messaging**: Users now see "Send Deposit Request" instead of "Submit Deposit"
- **Instructions updated**: Changed from "Upload a clear screenshot" to "Your deposit request will be reviewed by our team"

## Transaction History
- **Removed**: Sample transaction generation on first login
- **Current behavior**: Transaction history is only populated by real user activity (trades, approved deposits, withdrawals)
- **Real-time updates**: Transactions display in real-time as they occur and are approved

## Code Cleanup
- Removed unused imports (Upload icon, Timestamp, addTransaction)
- Removed unused state variables (screenshot file state)
- Removed unused functions (handleFileChange for file uploads)
- Simplified handleSubmit logic to not require file reading/conversion

## Files Modified
1. `/components/onboarding-modal.tsx` - Simplified to address-only
2. `/components/deposit-view.tsx` - Removed proof upload, simplified submission
3. `/app/dashboard/page.tsx` - Removed sample transaction generation

## Admin Dashboard Impact
- Admin deposit requests component will now receive deposit requests with empty `proofScreenshot` field
- Admins manually verify deposits based on transaction records and blockchain confirmation
- Admin approval workflow unchanged - still uses `approveDeposit` to credit user balance and update transaction status
