import { S3Client } from "@aws-sdk/client-s3";

export default new S3Client({
  region: process.env.WHITEBOARD_AWS_REGION,
  credentials: {
    accessKeyId: process.env.WHITEBOARD_AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.WHITEBOARD_AWS_SECRET_ACCESS_KEY!,
  },
});
