import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { name, email, message } = await req.json();

    if (!name || !email || !message) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    // 👉 Here you can send email via Nodemailer, Resend, or save to DB
    console.log("📩 New message:", { name, email, message });

    return NextResponse.json({ success: true, message: "Message received!" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
