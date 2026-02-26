import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/service";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { form_id, data } = body;

    if (!form_id || !data) {
      return NextResponse.json(
        { error: "Missing form_id or data" },
        { status: 400 }
      );
    }

    const supabase = createServiceRoleClient();

    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "unknown";

    const { error } = await supabase.from("form_submissions").insert({
      form_id,
      data,
      ip_address: ip,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Invalid request" },
      { status: 400 }
    );
  }
}
