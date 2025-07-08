import connectDB from "@/lib/db";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { email, password } = await req.json();

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Email is invalid", errorType: "email" }, 
        { status: 400 }
      );
    }

    await connectDB();

    const existingUser = await User.findOne({ email });

    if (!existingUser) {
      return NextResponse.json(
        { error: "Email is incorrect or not registered", errorType: "email" }, 
        { status: 400 }
      );
    }

    const isPasswordCorrect = await bcrypt.compare(password, existingUser.password);

    if (!isPasswordCorrect) {
      return NextResponse.json(
        { error: "Password is incorrect", errorType: "password" }, 
        { status: 400 }
      );
    }

    // Create a JWT token
    const token = jwt.sign(
      { 
        userId: existingUser._id, 
        email: existingUser.email,
        name: existingUser.name 
      }, 
      process.env.JWT_SECRET, 
      { expiresIn: "1h" }
    );

    return NextResponse.json(
      { 
        message: "Login successful", 
        token,
        user: {
          name: existingUser.name,
          email: existingUser.email,
          userId: existingUser._id, 
          role : existingUser.user_type, 

        }
      }, 
      { status: 200 }
    );

  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Internal server error" }, 
      { status: 500 }
    );
  }
}