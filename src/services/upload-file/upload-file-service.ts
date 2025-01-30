import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { UploadFile } from "./upload-file";

export class UploadFileService implements UploadFile {
  constructor(
    private readonly s3Client = new S3Client({ region: "us-east-1" })
  ) {}

  async upload(bucketName: string, filename: string, fileBuffer: Buffer, contentType = 'text/csv'): Promise<void> {
    const params = {
        Bucket: bucketName,
        Key: `uploads/${filename}`,
        Body: fileBuffer,
        ContentType: contentType
      };
    
      const command = new PutObjectCommand(params);
      await this.s3Client.send(command);
  }
}
