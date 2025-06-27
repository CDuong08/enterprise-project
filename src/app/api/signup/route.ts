import { NextRequest, NextResponse } from "next/server";
import clientPromise from "../connection/mongodb"; 

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    const client = await clientPromise;
    const db = client.db("SleepTracker");
    const users = db.collection("Users");

    const existing = await users.findOne({ email });
    if (existing) {
      return NextResponse.json({ success: false, message: "User already exists" }, { status: 400 });
    }

    const defaultSleep = {
      Monday: 0, Tuesday: 0, Wednesday: 0, Thursday: 0, Friday: 0, Saturday: 0, Sunday: 0
    };

    const defaultGoals = {
      Monday: 8, Tuesday: 8, Wednesday: 8, Thursday: 8, Friday: 8, Saturday: 8, Sunday: 8
    };

    await users.insertOne({
      email,
      password,
      sleep: defaultSleep,
      goals: defaultGoals
    });

    return NextResponse.json({ success: true });

  } catch (err) {
    console.error("Signup error:", err);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
