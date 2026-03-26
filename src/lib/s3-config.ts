import type { S3Config } from "./s3";

/**
 * Resolves S3 config from environment variables.
 * Returns null if env vars are not fully configured.
 * This runs SERVER-SIDE only — credentials never leave the server.
 */
export function getEnvS3Config(): S3Config | null {
  const endpoint = process.env.S3_ENDPOINT;
  const accessKeyId = process.env.S3_ACCESS_KEY_ID;
  const secretAccessKey = process.env.S3_SECRET_ACCESS_KEY;
  const region = process.env.S3_REGION;

  if (!endpoint || !accessKeyId || !secretAccessKey || !region) {
    return null;
  }

  return {
    endpoint,
    accessKeyId,
    secretAccessKey,
    region,
    forcePathStyle: process.env.S3_FORCE_PATH_STYLE !== "false",
  };
}

/**
 * Resolves S3 config from a request body or falls back to env vars.
 * When useEnvConfig is true in the body, env vars are used instead.
 * Credentials from the client are accepted only when env vars are NOT configured.
 */
export function resolveS3Config(body: {
  config?: S3Config;
  useEnvConfig?: boolean;
}): S3Config | null {
  // If client requests env config, use env vars
  if (body.useEnvConfig) {
    return getEnvS3Config();
  }

  // Otherwise, use client-provided config (manual connection mode)
  if (body.config?.endpoint && body.config?.accessKeyId && body.config?.secretAccessKey) {
    return body.config;
  }

  return null;
}
