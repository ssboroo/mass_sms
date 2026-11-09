import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    ok: true,
    service: "mass-sms",
    integrations: {
      wesendConfigured: Boolean(process.env.WESEND_API_KEY),
      wireConfigured: Boolean(process.env.WIRE_API_KEY),
      databaseConfigured: Boolean(process.env.DATABASE_URL)
    }
  });
}
