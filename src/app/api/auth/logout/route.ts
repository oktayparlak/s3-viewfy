import { NextResponse } from "next/server";
import { cookies } from "next/headers";

/**
 * POST /api/auth/logout
 * Clears the session cookie.
 */
export async function POST() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("s3viewfy_session")?.value;

  // Remove from active sessions
  if (sessionToken && global.__s3viewfy_sessions) {
    global.__s3viewfy_sessions.delete(sessionToken);
  }

  cookieStore.delete("s3viewfy_session");

  return NextResponse.json({ success: true });
}
