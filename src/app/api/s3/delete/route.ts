import { NextRequest, NextResponse } from "next/server";
import { deleteObject, type S3Config } from "@/lib/s3";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { config, bucket, key } = body as {
      config: S3Config;
      bucket: string;
      key: string;
    };

    if (!config?.endpoint || !config?.accessKeyId || !config?.secretAccessKey) {
      return NextResponse.json(
        { error: "Missing required S3 configuration" },
        { status: 400 }
      );
    }

    if (!bucket || !key) {
      return NextResponse.json(
        { error: "Bucket and key are required" },
        { status: 400 }
      );
    }

    await deleteObject(config, bucket, key);
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to delete object";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
