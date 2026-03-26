import { NextRequest, NextResponse } from "next/server";
import { listObjects, type S3Config } from "@/lib/s3";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { config, bucket, prefix, continuationToken } = body as {
      config: S3Config;
      bucket: string;
      prefix?: string;
      continuationToken?: string;
    };

    if (!config?.endpoint || !config?.accessKeyId || !config?.secretAccessKey) {
      return NextResponse.json(
        { error: "Missing required S3 configuration" },
        { status: 400 }
      );
    }

    if (!bucket) {
      return NextResponse.json(
        { error: "Bucket name is required" },
        { status: 400 }
      );
    }

    const result = await listObjects(
      config,
      bucket,
      prefix || "",
      continuationToken
    );
    return NextResponse.json(result);
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to list objects";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
