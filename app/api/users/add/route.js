import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export async function POST(req) {
  try {
    await dbConnect();
    
    const { name, mobile, email, password, user_type, status } = await req.json();
    
    if (!name || !mobile || !email || !password || !status) {
      return NextResponse.json({ message: "All fields are required" }, { status: 400 });
    }

    // Validate user_type
    const validUserTypes = ["admin", "user"];
    const finalUserType = validUserTypes.includes(user_type) ? user_type : "user";

    // ✅ Check only for duplicate email, NOT mobile
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ message: "Email already exists" }, { status: 400 });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = new User({
      name,
      mobile, // ✅ Allow duplicate mobile numbers
      email,
      password: hashedPassword,
      user_type: finalUserType,
      status, // Include status field
    });

    await newUser.save();

    return NextResponse.json({ message: "User created successfully" }, { status: 201 });

  } catch (error) {
    console.error("❌ Error in /api/users/add:", error);
    return NextResponse.json({ message: "Internal Server Error", error: error.message }, { status: 500 });
  }
}