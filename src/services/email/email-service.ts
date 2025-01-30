import { Resend } from "resend";
import { Email } from "./email";

export class EmailService implements Email {
  constructor(
    private readonly emailClient = new Resend(process.env.RESEND_API_KEY)
  ) {}

  async send(subject: string, message: string, toEmail: string): Promise<void> {
    await this.emailClient.emails.send({
      from: "mail@geratudo.com.br",
      to: [toEmail],
      subject,
      text: message
    });
  }
}
