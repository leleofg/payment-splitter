import { randomUUID } from "crypto";
import { Publisher } from "../../../services/publisher/publisher";

export class GroupService {
  constructor(
    private readonly publisher: Publisher
  ) {}

  public async execute(name: string): Promise<string> {
    const message = { id: randomUUID(), name };

    await this.publisher.publish(JSON.stringify(message));

    return message.id;
  }
}