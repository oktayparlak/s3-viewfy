import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import crypto from "crypto";

/**
 * POST /api/auth/login
 * Validates username/password against env vars and sets a session cookie.
 */
export async function POST(request: NextRequest) {
  const authUsername = process.env.AUTH_USERNAME;
  const authPassword = process.env.AUTH_PASSWORD;

  // If auth is not configured, deny login endpoint
  if (!authUsername || !authPassword) {
    return NextResponse.json(
      { error: "Authentication is not configured" },
      { status: 400 }
    );
  }

  const body = await request.json();
  const { username, password } = body as {
    username: string;
    password: string;
  };

  if (!username || !password) {
    return NextResponse.json(
      { error: "Username and password are required" },
      { status: 400 }
    );
  }

  // Validate credentials
  if (username !== authUsername || password !== authPassword) {
    return NextResponse.json(
      { error: "Invalid username or password" },
      { status: 401 }
    );
  }

  // Generate a session token
  const sessionToken = crypto.randomBytes(32).toString("hex");

  // Set HTTP-only cookie
  const cookieStore = await cookies();
  cookieStore.set("s3viewfy_session", sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24, // 24 hours
    path: "/",
  });

  // Store token in a simple in-memory approach via env
  // We use a global variable to track valid sessions
  if (!global.__s3viewfy_sessions) {
    global.__s3viewfy_sessions = new Set<string>();
  }
  global.__s3viewfy_sessions.add(sessionToken);

  return NextResponse.json({ success: true });
}
