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

    // ✅ Correct URL (no curly braces)
    const ZOHO_API_URL = "https://mail.zoho.com/api/accounts/903905349/messages";
    const ZOHO_ACCESS_TOKEN = process.env.ZOHO_ACCESS_TOKEN; // stored in .env.local

    if (!ZOHO_ACCESS_TOKEN) {
      return NextResponse.json(
        { success: false, message: "Missing ZOHO_ACCESS_TOKEN in environment." },
        { status: 500 }
      );
    }

    // 📨 Create FormData payload (Zoho Mail requires form submission)
    const formData = new FormData();
    formData.append("fromAddress", "ustrader@ultimatestcktrader.online");
    formData.append("toAddress", email);
    formData.append("subject", "Welcome to USTrade 🎉");
    formData.append(
      "content",
      `
      Hi ${name},<br><br>
      Welcome to <b>Ultimate Stock Trader</b>!<br><br>
      Your account has been successfully created.<br>
      You can now deposit funds and start trading.<br><br>
      Best regards,<br>
      The USTrade Team
      `
    );
    formData.append("mailFormat", "html");

    // 🔗 Send the email through Zoho Mail API
    const response = await fetch(ZOHO_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Zoho-oauthtoken ${ZOHO_ACCESS_TOKEN}`,
      },
      body: formData,
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
