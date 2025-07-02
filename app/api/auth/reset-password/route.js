import connectDB from "@/lib/db";
import User from "@/models/User";
import Otp from "@/models/Otp";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { email, otp, newPassword } = await req.json();

    if (!email || !otp || !newPassword) {
      return NextResponse.json(
        { error: "All fields are required." },
        { status: 400 }
      );
    }

    await connectDB();

    const otpRecord = await Otp.findOne({ email, otp });
    if (!otpRecord) {
      return NextResponse.json(
        { error: "Invalid OTP." },
        { status: 400 }
      );
    }

    if (otpRecord.expiresAt < new Date()) {
      return NextResponse.json(
        { error: "OTP has expired." },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await User.updateOne(
      { email },
      { $set: { password: hashedPassword } }
    );

    await Otp.deleteOne({ _id: otpRecord._id });

    return NextResponse.json(
      { message: "Password has been reset successfully." },
      { status: 200 }
    );

  } catch (error) {
    console.error("reset-password Error:", error);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}
