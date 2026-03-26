import { NextRequest, NextResponse } from "next/server";
import { uploadObject } from "@/lib/s3";
import { resolveS3Config } from "@/lib/s3-config";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const configStr = formData.get("config") as string | null;
    const useEnvConfig = formData.get("useEnvConfig") === "true";
    const bucket = formData.get("bucket") as string | null;
    const prefix = formData.get("prefix") as string | null;

    if (!file) {
      return NextResponse.json({ error: "File is required" }, { status: 400 });
    }

    if (!bucket) {
      return NextResponse.json(
        { error: "Bucket name is required" },
        { status: 400 }
      );
    }

    const config = resolveS3Config({
      config: configStr ? JSON.parse(configStr) : undefined,
      useEnvConfig,
    });

    if (!config) {
      return NextResponse.json(
        { error: "S3 configuration is required" },
        { status: 400 }
      );
    }

    const key = (prefix || "") + file.name;
    const buffer = Buffer.from(await file.arrayBuffer());

    await uploadObject(config, bucket, key, buffer, file.type);
    return NextResponse.json({ success: true, key });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to upload file";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
