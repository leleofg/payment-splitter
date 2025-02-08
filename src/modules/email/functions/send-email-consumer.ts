import { EmailService } from "@src/services/email/email-service";
import { SQSHandler } from "aws-lambda";

interface EmailMessage {
    subject: string;
    eventType: string;
    emails: string[];
    message: any;
}

const emailService = new EmailService();

export const run: SQSHandler = async (event) => {
  for (const record of event.Records) {
    try {
      const body = JSON.parse(record.body);
      const { subject, eventType, emails, message }: EmailMessage = JSON.parse(body.Message);

      if (eventType === "SEND_EMAIL") {
        const emailPromises = emails.map(email => {
            return emailService.send(subject, message, email);
        });

        await Promise.allSettled([...emailPromises]);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  }
};
