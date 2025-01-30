export interface Email {
  send(subject: string, message: string, toEmail: string): Promise<void>;
}
