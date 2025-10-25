import { NextResponse } from 'next/server';
import { getAuth } from 'firebase-admin/auth';

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const idToken = authHeader.split('Bearer ')[1];
    const decodedToken = await getAuth().verifyIdToken(idToken);
    const user = await getAuth().getUser(decodedToken.uid);

    // TODO: Add your Zoho email sending logic here
    // Example:
    // await sendZohoWelcomeEmail({
    //   name: user.displayName,
    //   email: user.email,
    // });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error sending welcome email:', error);
    return NextResponse.json({ error: 'Failed to send welcome email' }, { status: 500 });
  }
}