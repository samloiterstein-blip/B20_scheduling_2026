import { NextResponse } from "next/server";

import { sealInterests } from "@/lib/interests";

const noStore = { "Cache-Control": "private, no-store" };

export async function POST() {
  return NextResponse.json(await sealInterests(), { headers: noStore });
}
