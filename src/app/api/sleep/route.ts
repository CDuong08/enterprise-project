import { NextRequest, NextResponse } from "next/server";
import clientPromise from "../connection/mongodb";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    const client = await clientPromise;
    const db = client.db("SleepTracker");
    const users = db.collection("Users");

    const user = await users.findOne({ email });

    if (!user || !user.sleep || !user.goals) {
      return NextResponse.json({ success: false, message: "User or sleep data not found" });
    }

    const normalize = (obj: any) =>
      Object.fromEntries(Object.entries(obj).map(([k, v]) => [k, Number(v)]));

    const sleep = normalize(user.sleep);
    const goals = normalize(user.goals);

    return NextResponse.json({ success: true, sleep, goals });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, message: "Server error" });
  }
}
