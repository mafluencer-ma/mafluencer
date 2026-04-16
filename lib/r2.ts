import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const R2_ACCOUNT_ID     = process.env.R2_ACCOUNT_ID!;
const R2_ACCESS_KEY_ID  = process.env.R2_ACCESS_KEY_ID!;
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY!;
const R2_BUCKET_NAME    = process.env.R2_BUCKET_NAME!;
const R2_PUBLIC_URL     = process.env.R2_PUBLIC_URL!;

export const r2 = new S3Client({
  region: "auto",
  endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId:     R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
  },
});

/**
 * Generate a presigned PUT URL for direct client uploads.
 * Expires in 5 minutes.
 */
export async function getPresignedUploadUrl(
  key: string,
  contentType: string,
  expiresIn = 300
): Promise<string> {
  const command = new PutObjectCommand({
    Bucket:      R2_BUCKET_NAME,
    Key:         key,
    ContentType: contentType,
  });
  return getSignedUrl(r2, command, { expiresIn });
}

/**
 * Upload a Buffer/Uint8Array directly from the server.
 */
export async function uploadToR2(
  key: string,
  body: Buffer | Uint8Array,
  contentType: string
): Promise<string> {
  await r2.send(
    new PutObjectCommand({
      Bucket:      R2_BUCKET_NAME,
      Key:         key,
      Body:        body,
      ContentType: contentType,
    })
  );
  return getPublicUrl(key);
}

/**
 * Delete a file from R2 by its key.
 */
export async function deleteFromR2(key: string): Promise<void> {
  await r2.send(
    new DeleteObjectCommand({ Bucket: R2_BUCKET_NAME, Key: key })
  );
}

/**
 * Build the public URL for a given key.
 */
export function getPublicUrl(key: string): string {
  return `${R2_PUBLIC_URL}/${key}`;
}

/**
 * Build a unique storage key for a file.
 * e.g. videos/userId/timestamp-filename.mp4
 */
export function buildKey(
  folder: string,
  userId: string,
  fileName: string
): string {
  const ext  = fileName.split(".").pop() ?? "bin";
  const safe = fileName.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 80);
  return `${folder}/${userId}/${Date.now()}-${safe}.${ext}`;
}
