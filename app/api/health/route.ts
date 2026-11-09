import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const checkedAt = new Date().toISOString();
  const required = ["DATABASE_URL", "SESSION_SECRET", "NEXT_PUBLIC_APP_URL"];
  const missingConfiguration = required.filter((key) => !process.env[key]?.trim());

  let database: "ok" | "error" = "error";
  try {
    await db.$queryRaw`SELECT 1`;
    database = "ok";
  } catch (error) {
    console.error("Health check database probe failed", error);
  }

  const ready = missingConfiguration.length === 0 && database === "ok";
  return NextResponse.json({
    ok: ready,
    service: "mass-sms",
    status: ready ? "ready" : "not_ready",
    checkedAt,
    checks: {
      database,
      configuration: missingConfiguration.length === 0 ? "ok" : "missing",
    },
    missingConfiguration,
    integrations: {
      wesendConfigured: Boolean(process.env.WESEND_API_KEY),
      wireConfigured: Boolean(process.env.WIRE_API_KEY && process.env.WIRE_WEBHOOK_SECRET),
    },
  }, { status: ready ? 200 : 503 });
}
