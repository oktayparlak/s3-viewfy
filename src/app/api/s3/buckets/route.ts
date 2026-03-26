import { NextRequest, NextResponse } from "next/server";
import { listBuckets, type S3Config } from "@/lib/s3";

export async function POST(request: NextRequest) {
  try {
    const config: S3Config = await request.json();

    if (!config.endpoint || !config.accessKeyId || !config.secretAccessKey) {
      return NextResponse.json(
        { error: "Missing required S3 configuration" },
        { status: 400 }
      );
    }

    const buckets = await listBuckets(config);
    return NextResponse.json({ buckets });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to list buckets";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
