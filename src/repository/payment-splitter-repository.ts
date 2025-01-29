import { Repository } from ".";
import { PaymentSplitter } from "./collection/payment-splitter";

export class PaymentSplitterRepository extends Repository<PaymentSplitter> {
  constructor() {
    super("PaymentSplitter");
  }
}
