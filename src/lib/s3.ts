import {
  S3Client,
  ListBucketsCommand,
  ListObjectsV2Command,
  DeleteObjectCommand,
  PutObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export interface S3Config {
  endpoint: string;
  accessKeyId: string;
  secretAccessKey: string;
  region: string;
  forcePathStyle?: boolean;
}

export interface S3ObjectItem {
  key: string;
  size: number;
  lastModified: string;
  isFolder: boolean;
  etag?: string;
}

export interface S3BucketItem {
  name: string;
  creationDate?: string;
}

export function createS3Client(config: S3Config): S3Client {
  return new S3Client({
    endpoint: config.endpoint,
    region: config.region || "us-east-1",
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    },
    forcePathStyle: config.forcePathStyle ?? true,
  });
}

export async function listBuckets(config: S3Config): Promise<S3BucketItem[]> {
  const client = createS3Client(config);
  const command = new ListBucketsCommand({});
  const response = await client.send(command);

  return (
    response.Buckets?.map((bucket) => ({
      name: bucket.Name || "",
      creationDate: bucket.CreationDate?.toISOString(),
    })) || []
  );
}

export async function listObjects(
  config: S3Config,
  bucket: string,
  prefix: string = "",
  continuationToken?: string
): Promise<{
  objects: S3ObjectItem[];
  prefixes: string[];
  isTruncated: boolean;
  nextContinuationToken?: string;
}> {
  const client = createS3Client(config);
  const command = new ListObjectsV2Command({
    Bucket: bucket,
    Prefix: prefix,
    Delimiter: "/",
    MaxKeys: 100,
    ContinuationToken: continuationToken,
  });
  const response = await client.send(command);

  const objects: S3ObjectItem[] =
    response.Contents?.filter((obj) => obj.Key !== prefix).map((obj) => ({
      key: obj.Key || "",
      size: obj.Size || 0,
      lastModified: obj.LastModified?.toISOString() || "",
      isFolder: false,
      etag: obj.ETag,
    })) || [];

  const prefixes =
    response.CommonPrefixes?.map((p) => p.Prefix || "").filter(Boolean) || [];

  // Add folder items for prefixes
  const folderItems: S3ObjectItem[] = prefixes.map((p) => ({
    key: p,
    size: 0,
    lastModified: "",
    isFolder: true,
  }));

  return {
    objects: [...folderItems, ...objects],
    prefixes,
    isTruncated: response.IsTruncated || false,
    nextContinuationToken: response.NextContinuationToken,
  };
}

export async function getDownloadUrl(
  config: S3Config,
  bucket: string,
  key: string
): Promise<string> {
  const client = createS3Client(config);
  const command = new GetObjectCommand({
    Bucket: bucket,
    Key: key,
  });
  return getSignedUrl(client, command, { expiresIn: 3600 });
}

export async function deleteObject(
  config: S3Config,
  bucket: string,
  key: string
): Promise<void> {
  const client = createS3Client(config);
  const command = new DeleteObjectCommand({
    Bucket: bucket,
    Key: key,
  });
  await client.send(command);
}

export async function uploadObject(
  config: S3Config,
  bucket: string,
  key: string,
  body: Buffer | Uint8Array,
  contentType?: string
): Promise<void> {
  const client = createS3Client(config);
  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    Body: body,
    ContentType: contentType,
  });
  await client.send(command);
}
