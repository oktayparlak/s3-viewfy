import { NextRequest, NextResponse } from "next/server";
import { listObjects } from "@/lib/s3";
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

    const { bucket, prefix, continuationToken } = body as {
      bucket: string;
      prefix?: string;
      continuationToken?: string;
    };

    if (!bucket) {
      return NextResponse.json(
        { error: "Bucket name is required" },
        { status: 400 }
      );
    }

    const result = await listObjects(config, bucket, prefix || "", continuationToken);
    return NextResponse.json(result);
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to list objects";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
