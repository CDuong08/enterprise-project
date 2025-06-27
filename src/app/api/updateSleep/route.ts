import { NextRequest, NextResponse } from "next/server";
import clientPromise from "../connection/mongodb";

export async function PUT(req: NextRequest) {
  try {
    const { email, sleep, goals } = await req.json();
    const client = await clientPromise;
    const db = client.db("SleepTracker");
    const users = db.collection("Users");

    const result = await users.updateOne(
      { email },
      {
        $set: {
          sleep,
          goals,
        },
      }
    );

    return NextResponse.json({ success: true, result });
  } catch (err) {
    console.error("Error updating sleep:", err);
    return NextResponse.json({ success: false, message: "Update failed." }, { status: 500 });
  }
}
