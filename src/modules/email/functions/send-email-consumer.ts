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
  console.log("Event:", event);

  for (const record of event.Records) {
    try {
      const { subject, eventType, emails, message }: EmailMessage = JSON.parse(record.body);

      console.log({ subject, eventType, emails, message });

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
