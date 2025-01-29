export class PaymentSplitter {
  pk: string;
  sk: string;
  groupName?: string;
  memberName?: string;
  expenseName?: string;
  amount?: number;
  payerId?: string;
  splitWithIds?: string[];
  balance?: number;

  constructor(init?: Partial<PaymentSplitter>) {
    this.pk = init?.pk ?? "";
    this.sk = init?.sk ?? "";
  }
}
