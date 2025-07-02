// app/api/auth/verify-otp/route.js

import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, mobile, otp } = body;

    if (!email && !mobile) {
      return NextResponse.json(
        { error: "Email or mobile is required" },
        { status: 400 }
      );
    }

    if (!otp || otp.length !== 6) {
      return NextResponse.json(
        { error: "Invalid OTP format" },
        { status: 400 }
      );
    }

    // 🚀 Here you would look up stored OTP in your DB or Redis
    // For now, we accept "123456" as valid
    if (otp !== "123456") {
      return NextResponse.json(
        { error: "Incorrect OTP" },
        { status: 400 }
      );
    }

    return NextResponse.json({ message: "OTP verified successfully" });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to verify OTP" },
      { status: 500 }
    );
  }
}
