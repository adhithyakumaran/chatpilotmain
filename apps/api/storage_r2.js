/**
 * storage_r2.js — Cloudflare R2 Media Upload Module
 * UPDATED: Uses your specific Public R2 Domain
 */

require("dotenv").config();
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");

// 1. Setup the S3 Client
const r2 = new S3Client({
  region: "auto",
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

// 2. ✅ YOUR PUBLIC DOMAIN
const R2_PUBLIC_DOMAIN = "https://pub-649c75501c8b4e0f8b3e57d1b0642b11.r2.dev";

async function uploadMedia(userId, fileName, buffer, mimeType) {
  // Create a clean file path: media/userID/timestamp_filename
  const key = `media/${userId}/${Date.now()}_${fileName}`;

  // Upload to R2
  await r2.send(
    new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: key,
      Body: buffer,
      ContentType: mimeType,
    })
  );

  // Return the PUBLIC URL (Safe for WhatsApp & Browser)
  return `${R2_PUBLIC_DOMAIN}/${key}`;
}

module.exports = { uploadMedia };