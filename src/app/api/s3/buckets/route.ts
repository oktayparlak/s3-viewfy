import { NextRequest, NextResponse } from "next/server";
import { listBuckets } from "@/lib/s3";
import { resolveS3Config } from "@/lib/s3-config";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const config = resolveS3Config(body);

    if (!config) {
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
