import { NextResponse } from "next/server";
import { cookies } from "next/headers";

/**
 * GET /api/auth/status
 * Returns whether auth is enabled and whether the user is currently authenticated.
 */
export async function GET() {
  const authUsername = process.env.AUTH_USERNAME;
  const authPassword = process.env.AUTH_PASSWORD;

  const authEnabled = !!(authUsername && authPassword);

  if (!authEnabled) {
    return NextResponse.json({
      authEnabled: false,
      authenticated: true, // No auth needed
    });
  }

  // Check session cookie
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("s3viewfy_session")?.value;

  const authenticated =
    !!sessionToken &&
    !!global.__s3viewfy_sessions &&
    global.__s3viewfy_sessions.has(sessionToken);

  return NextResponse.json({
    authEnabled: true,
    authenticated,
  });
}
