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
  settlementAmount?: number;
  settledWithId?: string;

  constructor(init?: Partial<PaymentSplitter>) {
    this.pk = init?.pk ?? "";
    this.sk = init?.sk ?? "";
  }
}
