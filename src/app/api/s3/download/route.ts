import { NextRequest, NextResponse } from "next/server";
import { getDownloadUrl } from "@/lib/s3";
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

    const { bucket, key } = body as {
      bucket: string;
      key: string;
    };

    if (!bucket || !key) {
      return NextResponse.json(
        { error: "Bucket and key are required" },
        { status: 400 }
      );
    }

    const url = await getDownloadUrl(config, bucket, key);
    return NextResponse.json({ url });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to generate download URL";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
