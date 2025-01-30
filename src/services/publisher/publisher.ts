export interface IPublisher {
  publish(message: string): Promise<void>;
}
