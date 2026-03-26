import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import crypto from "crypto";

/**
 * In-memory rate limiter: tracks login attempts per IP.
 * Max 3 attempts per 60 seconds.
 */
const loginAttempts = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_MAX = 3;
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute

function checkRateLimit(ip: string): { allowed: boolean; retryAfter?: number } {
  const now = Date.now();
  const entry = loginAttempts.get(ip);

  if (!entry || now > entry.resetAt) {
    loginAttempts.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return { allowed: true };
  }

  if (entry.count >= RATE_LIMIT_MAX) {
    const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
    return { allowed: false, retryAfter };
  }

  entry.count++;
  return { allowed: true };
}

/**
 * POST /api/auth/login
 * Validates username/password against env vars and sets a session cookie.
 * Rate limited: 3 attempts per minute per IP.
 */
export async function POST(request: NextRequest) {
  // Rate limiting
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";

  const rateCheck = checkRateLimit(ip);
  if (!rateCheck.allowed) {
    return NextResponse.json(
      {
        error: `Too many login attempts. Try again in ${rateCheck.retryAfter} seconds.`,
      },
      {
        status: 429,
        headers: { "Retry-After": String(rateCheck.retryAfter) },
      }
    );
  }

  const authUsername = process.env.AUTH_USERNAME;
  const authPassword = process.env.AUTH_PASSWORD;

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

  if (username !== authUsername || password !== authPassword) {
    return NextResponse.json(
      { error: "Invalid username or password" },
      { status: 401 }
    );
  }

  // Success — reset rate limit counter for this IP
  loginAttempts.delete(ip);

  const sessionToken = crypto.randomBytes(32).toString("hex");

  const cookieStore = await cookies();
  cookieStore.set("s3viewfy_session", sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24,
    path: "/",
  });

  if (!global.__s3viewfy_sessions) {
    global.__s3viewfy_sessions = new Set<string>();
  }
  global.__s3viewfy_sessions.add(sessionToken);

  return NextResponse.json({ success: true });
}
