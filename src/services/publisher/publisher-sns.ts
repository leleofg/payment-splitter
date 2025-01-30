import { SNSClient, PublishCommandInput, PublishCommand } from "@aws-sdk/client-sns";
import { IPublisher } from "./publisher";

export class Publisher implements IPublisher {
  private topicArn: string;

  constructor(
    topic: string,
    private readonly snsClient = new SNSClient(),
  ) {
    this.topicArn = `arn:aws:sns:${process.env.AWS_ACCOUNT_REGION}:${process.env.AWS_ACCOUNT_ID}:${topic}`;
  }

  async publish(message: string): Promise<void> {
    const params: PublishCommandInput = {
      Message: message,
      TopicArn: this.topicArn
    };

    await this.snsClient.send(new PublishCommand(params));
  }
}
