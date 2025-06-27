import { NextResponse } from "next/server";
import clientPromise from "../connection/mongodb";

export async function GET() {
  try {
    await clientPromise;
    return NextResponse.json({ status: "connected" });
  } catch (err) {
    return NextResponse.json({ status: "error", error: String(err) }, { status: 500 });
  }
}
