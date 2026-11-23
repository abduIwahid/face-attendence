import { NextResponse } from "next/server";

/** The ONE API response format (brain/API_SPEC.md). */
export function ok<T>(data: T, status = 200): NextResponse {
  return NextResponse.json({ ok: true, data }, { status });
}

export function fail(
  status: number,
  code: string,
  message: string,
): NextResponse {
  return NextResponse.json({ ok: false, error: { code, message } }, { status });
}

/** Best-effort client IP for rate-limit keys (Vercel sets x-forwarded-for). */
export function clientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0]?.trim() || "unknown";
  }
  return request.headers.get("x-real-ip") ?? "unknown";
}

/** Read a JSON body without throwing; null when the body is not valid JSON. */
export async function readJsonBody(request: Request): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    return null;
  }
}
