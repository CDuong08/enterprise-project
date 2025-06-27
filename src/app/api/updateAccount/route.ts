import { NextRequest, NextResponse } from "next/server";
import clientPromise from "../connection/mongodb";

export async function PUT(req: NextRequest) {
  try {
    const { currentEmail, newEmail, newPassword } = await req.json();

    const client = await clientPromise;
    const db = client.db("SleepTracker");
    const users = db.collection("Users");

    const result = await users.updateOne(
      { email: currentEmail },
      { $set: { email: newEmail, password: newPassword } }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ success: false, message: "User not found." }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Update failed:", err);
    return NextResponse.json({ success: false, message: "Update failed." }, { status: 500 });
  }
}
