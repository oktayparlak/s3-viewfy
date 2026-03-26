import { NextResponse } from "next/server";

/**
 * GET /api/s3/config
 * Returns ONLY whether env-based S3 config is available and the default bucket name.
 * NEVER exposes credentials, endpoints, or any sensitive information.
 */
export async function GET() {
  const endpoint = process.env.S3_ENDPOINT;
  const accessKeyId = process.env.S3_ACCESS_KEY_ID;
  const secretAccessKey = process.env.S3_SECRET_ACCESS_KEY;
  const region = process.env.S3_REGION;

  if (!endpoint || !accessKeyId || !secretAccessKey || !region) {
    return NextResponse.json({ configured: false });
  }

  return NextResponse.json({
    configured: true,
    defaultBucket: process.env.S3_BUCKET || "",
  });
}
