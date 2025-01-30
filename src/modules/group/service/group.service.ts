import { randomUUID } from "crypto";
import { PaymentSplitterRepository } from "@src/repository/payment-splitter-repository";
import { PaymentSplitter } from "@src/repository/collection/payment-splitter";
import { EmailService } from "@src/services/email/email-service";
import { createInterface } from "readline";
import { UploadFileService } from "@src/services/upload-file/upload-file-service";

export class GroupService {
  constructor(
    private readonly paymentSplitterRepository = new PaymentSplitterRepository(),
    private readonly emailService = new EmailService(),
    private readonly uploadFileService = new UploadFileService()
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

  public async addMemberGroup(groupId: string, memberName: string, memberEmail: string): Promise<void> {
    const expenseId = randomUUID();
    
    await this.paymentSplitterRepository.save({
      pk: `GROUP#${groupId}`,
      sk: `MEMBER#${expenseId}`,
      memberName,
      memberEmail,
      balance: 0
    });
  }

  public async addExpenseGroup(groupId: string, expenseName: string, amount: number, payerId: string, splitWithIds?: string[]): Promise<void> {
    const expenseId = randomUUID();
    const members = await this.getMembersFromGroup(groupId);
    if (!members.length) throw new Error("Group has no members");

    const memberPayer = members.filter(member => member.sk.split("#")[1] === payerId);
    if (!memberPayer.length) throw new Error("Payer not found in this group");

    if (splitWithIds?.length) {
      splitWithIds.forEach(memberId => {
        const memberGroup = members.filter(member => member.sk.split("#")[1] === memberId);
        if (!memberGroup.length) throw new Error("Member not found in this group");
      });
    }

    const splitAmount = splitWithIds?.length 
      ? this.splitExpense(amount, splitWithIds.length)
      : this.splitExpense(amount, members.length);

    const updateBalance = (memberId: string, balance: number) => {
      return this.paymentSplitterRepository.update(
        { pk: `GROUP#${groupId}`, sk: `MEMBER#${memberId}` },
        {
          UpdateExpression: "ADD balance :balance",
          ExpressionAttributeValues: {
            ":balance": { N: `${balance.toString()}` }
          }
        }
      );
    };

    const updatePromises = members.map((member, i) => {
      const memberId = member.sk.split("#")[1];
      const balance = memberId === payerId ? -amount : -splitAmount[i];
      return updateBalance(memberId, balance);
    });

    await Promise.all(updatePromises);

    const emailPromises = members.map(member => {
      if (member.memberEmail) {
        const obj = { groupId, expenseId, expenseName, amount, payerId, splitWithIds };
        return this.emailService.send("New expense in group", JSON.stringify(obj), member.memberEmail);
      }
    });

    await Promise.all([
      ...emailPromises,
      this.paymentSplitterRepository.save({
        pk: `GROUP#${groupId}`,
        sk: `EXPENSE#${expenseId}`,
        expenseName,
        amount,
        payerId,
        splitWithIds: splitWithIds ?? []
      })
    ]);
  }

  public async getBalancesGroup(groupId: string): Promise<PaymentSplitter[]> {
    return this.getMembersFromGroup(groupId);
  }

  public async settleDebts(groupId: string, payerId: string, payeeId: string, amount: number) {
    const settlementId = randomUUID();
    const members = await this.getMembersFromGroup(groupId);
    if (!members.length) throw new Error("Group has no members");

    const memberPayer = members.filter(member => member.sk.split("#")[1] === payerId);
    const memberPayee = members.filter(member => member.sk.split("#")[1] === payeeId);
    
    if (!memberPayer.length) throw new Error("Payer member not found");
    if (!memberPayee.length) throw new Error("Payee member not found");
    if (memberPayer[0].balance < amount) throw new Error("Payer don't have money");

    const emailPromises = members
      .filter(member => member.memberEmail)
      .map(member => {
        const obj = { groupId, payerId, payeeId, amount };
        return this.emailService.send("New settle debt in group", JSON.stringify(obj), member.memberEmail);
      });

    const updateBalancePromises = [
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
    ];

    await Promise.all([...emailPromises, ...updateBalancePromises]);
  }

  public async getMembersFromGroup(groupId: string): Promise<PaymentSplitter[]> {
    const expressionAttributeValues = {
      ":pk": `GROUP#${groupId}`,
      ":sk": 'MEMBER'
    };

    const members = await this.paymentSplitterRepository.query({
      keyConditionExpression: 'pk = :pk AND begins_with(sk, :sk)',
      expressionAttributeValues
    });

    return members;
  }

  public async proccessExpenseFile(file: NodeJS.ReadableStream, filename: string) {
    const chunks: Buffer[] = [];
    const rl = createInterface({
      input: file,
      output: process.stdout,
      terminal: false,
    });

    let isFirstLine = true;

    rl.on("line", async (line: string) => {
      if (isFirstLine) {
        isFirstLine = false;
        return;
      }

      const [groupId, payerId, expenseName, amount] = line.split(",");
      await this.addExpenseGroup(groupId, expenseName, Number(amount), payerId);
    });

    file.on("data", (data) => {
      chunks.push(data);
    });

    return new Promise<void>((resolve, reject) => {
      file.on("end", async () => {
        try {
          const fileBuffer = Buffer.concat(chunks);
          await this.uploadFileService.upload(process.env.BUCKET_NAME, filename, fileBuffer);
          resolve();
        } catch (err) {
          console.error(`Error: ${err}`);
          reject(err);
        }
      });

      file.on("error", reject);
    });
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