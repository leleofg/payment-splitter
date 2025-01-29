import { randomUUID } from "crypto";
import { PaymentSplitterRepository } from "@src/repository/payment-splitter-repository";
import { convertToAttr } from "@aws-sdk/util-dynamodb";
import { PaymentSplitter } from "@src/repository/collection/payment-splitter";

export class GroupService {
  constructor(
    private paymentSplitterRepository = new PaymentSplitterRepository()
  ) {}

  public async createGroup(name: string): Promise<string> {
    const groupId = randomUUID();

    await this.paymentSplitterRepository.save({
      pk: `GROUP#${groupId}`,
      sk: `GROUP`,
      groupName: name
    });

    return groupId;
  }

  public async addMemberGroup(groupId: string, memberName: string): Promise<void> {
    const expenseId = randomUUID();
    
    await this.paymentSplitterRepository.save({
      pk: `GROUP#${groupId}`,
      sk: `MEMBER#${expenseId}`,
      memberName,
      balance: 0
    });
  }

  public async addExpenseGroup(groupId: string, expenseName: string, amount: number, payerId: string, splitWithIds?: string[]): Promise<void> {
    // falta receber o splitWithIds
    const expenseId = randomUUID();
    
    if (!splitWithIds?.length) {
      const members = await this.getMembersFromGroup(groupId);
      const memberIds = members.map(member => member.sk.split("#")[1]);
      const splitAmount = this.splitExpense(amount, memberIds.length);

      console.log({memberIds});
      console.log({splitAmount});
    
      const updatePromises = memberIds.map((memberId, i) => {
        if (memberId === payerId) {
          this.paymentSplitterRepository.update(
            { pk: `GROUP#${groupId}`, sk: `MEMBER#${memberId}` },
            {
              UpdateExpression: "ADD balance :balance",
              ExpressionAttributeValues: {
                ":balance": { N: `-${amount.toString()}` }
              }
            }
          )
        } else {
          this.paymentSplitterRepository.update(
            { pk: `GROUP#${groupId}`, sk: `MEMBER#${memberId}` },
            {
              UpdateExpression: "ADD balance :balance",
              ExpressionAttributeValues: {
                ":balance": { N: `-${splitAmount[i].toString()}` }
              }
            }
          )
        }
      });
    
      await Promise.all(updatePromises);
    }

    await this.paymentSplitterRepository.save({
      pk: `GROUP#${groupId}`,
      sk: `EXPENSE#${expenseId}`,
      expenseName,
      amount,
      payerId,
      splitWithIds: splitWithIds ?? []
    });
  }

  public async getBalancesGroup(groupId: string): Promise<PaymentSplitter[]> {
    return this.getMembersFromGroup(groupId);
  }

  public async settleDebts(groupId: string, payerId: string, payeeId: string, amount: number) {
    const settlementId = randomUUID();

    await Promise.all([
      this.paymentSplitterRepository.update(
        { pk: `GROUP#${groupId}`, sk: `MEMBER#${payerId}` },
        {
          UpdateExpression: "ADD balance :balance",
          ExpressionAttributeValues: {
            ":balance": { N: `-${amount.toString()}` }
          }
        }
      ),
      this.paymentSplitterRepository.update(
        { pk: `GROUP#${groupId}`, sk: `MEMBER#${payeeId}` },
        {
          UpdateExpression: "ADD balance :balance",
          ExpressionAttributeValues: {
            ":balance": { N: `+${amount.toString()}` }
          }
        }
      ),
      this.paymentSplitterRepository.save({
        pk: `GROUP#${groupId}`,
        sk: `SETTLEMENT#${settlementId}`,
        payerId,
        settledWithId: payeeId,
        settlementAmount: amount
      })
    ]);
  }

  private async getMembersFromGroup(groupId: string): Promise<PaymentSplitter[]> {
    const expressionAttributeValues = {
      ":pk": convertToAttr(`GROUP#${groupId}`),
      ":sk": convertToAttr(`MEMBER#`)
    };

    const members = await this.paymentSplitterRepository.query({
      keyConditionExpression: 'pk = :pk AND begins_with(sk, :sk)',
      expressionAttributeValues
    });

    return members;
  }

  private splitExpense(totalAmount: number, numberOfPeople: number) {
    const baseAmount = Math.floor(totalAmount / numberOfPeople);
    const remainder = totalAmount - baseAmount * numberOfPeople;
  
    const splits = Array(numberOfPeople).fill(baseAmount);
  
    for (let i = 0; i < remainder; i++) {
      splits[i] += 1;
    }
  
    return splits;
  }
}