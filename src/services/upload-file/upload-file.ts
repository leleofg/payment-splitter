export interface UploadFile {
  upload(bucketName: string, filename: string, fileBuffer: Buffer, contentType: string): Promise<void>;
}
