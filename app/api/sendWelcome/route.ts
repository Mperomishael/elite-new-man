import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { email, name } = await request.json();

    if (!email || !name) {
      return NextResponse.json(
        { success: false, message: "Missing email or name" },
        { status: 400 }
      );
    }

    // ✅ Replace with your actual Zoho details
    const ZOHO_API_URL = "https://mail.zoho.com/api/accounts/{903905349}/messages";
    const ZOHO_ACCESS_TOKEN = process.env.ZOHO_ACCESS_TOKEN; // store in .env file!

    // 📨 Construct the email payload
    const mailData = {
      fromAddress: "ustrader@ultimatestcktrader.online",
      toAddress: email,
      subject: "Welcome to USTrade 🎉",
      content: `
        Hi ${name},<br><br>
        Welcome to our platform! Your account has been successfully created.<br><br>
      All you need to do is make Deposits and start trading.  Best regards,<br>
        The Team
      `,
      mailFormat: "html",
    };

    // 🔗 Send mail using Zoho Mail API
    const response = await fetch(ZOHO_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Zoho-oauthtoken ${ZOHO_ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(mailData),
    });

    const data = await response.json();

    if (response.ok) {
      return NextResponse.json({
        success: true,
        message: "Welcome email sent successfully.",
        data,
      });
    } else {
      console.error("Zoho API error:", data);
      return NextResponse.json(
        { success: false, message: "Zoho Mail API returned an error.", data },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("sendWelcome error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to send email." },
      { status: 500 }
    );
  }
}
