import { NextResponse } from "next/server";

import { listInterests, toggleInterest } from "@/lib/interests";
import { isTeamMember } from "@/lib/users";

const noStore = { "Cache-Control": "private, no-store" };

export async function GET() {
  return NextResponse.json(await listInterests(), { headers: noStore });
}

export async function POST(request: Request) {
  const body = (await request.json()) as {
    userName?: unknown;
    eventId?: unknown;
  };
  const userName = typeof body.userName === "string" ? body.userName : "";
  const eventId = typeof body.eventId === "string" ? body.eventId : "";
  if (!isTeamMember(userName) || !eventId) {
    return NextResponse.json(
      { error: "Invalid request" },
      { status: 400, headers: noStore },
    );
  }
  const result = await toggleInterest(userName, eventId);
  return NextResponse.json(result, { headers: noStore });
}
