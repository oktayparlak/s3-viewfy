import { NextResponse } from "next/server";

/**
 * Returns S3 configuration from environment variables.
 * If env vars are set, the client can auto-connect without manual input.
 */
export async function GET() {
  const endpoint = process.env.S3_ENDPOINT;
  const accessKeyId = process.env.S3_ACCESS_KEY_ID;
  const secretAccessKey = process.env.S3_SECRET_ACCESS_KEY;
  const region = process.env.S3_REGION;
  const bucket = process.env.S3_BUCKET || "";
  const forcePathStyle = process.env.S3_FORCE_PATH_STYLE !== "false";

  if (!endpoint || !accessKeyId || !secretAccessKey || !region) {
    return NextResponse.json({ configured: false });
  }

  return NextResponse.json({
    configured: true,
    config: {
      endpoint,
      accessKeyId,
      secretAccessKey,
      region,
      forcePathStyle,
      defaultBucket: bucket,
    },
  });
}
