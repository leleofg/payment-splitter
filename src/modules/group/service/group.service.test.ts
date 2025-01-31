import { GroupService } from './group.service';
import { PaymentSplitterRepository } from '@src/repository/payment-splitter-repository';
import { PublisherService } from '@src/services/publisher/publisher-service';
import { UploadFileService } from '@src/services/upload-file/upload-file-service';
import { randomUUID } from "crypto";

jest.mock('@src/repository/payment-splitter-repository');
jest.mock('@src/services/publisher/publisher-service');
jest.mock('@src/services/upload-file/upload-file-service');
jest.mock('crypto');

describe('GroupService', () => {
  let groupService: GroupService;
  let paymentSplitterRepository: jest.Mocked<PaymentSplitterRepository>;
  let uploadFileService: jest.Mocked<UploadFileService>;
  let publisherService: jest.Mocked<PublisherService>;

  beforeEach(() => {
    paymentSplitterRepository = new PaymentSplitterRepository() as jest.Mocked<PaymentSplitterRepository>;
    uploadFileService = new UploadFileService() as jest.Mocked<UploadFileService>;
    publisherService = new PublisherService("GROUP_TOPIC") as jest.Mocked<PublisherService>;
    groupService = new GroupService(paymentSplitterRepository, uploadFileService, publisherService);
  });

  it('should create a new group and return the groupId', async () => {
    const groupId = '123e4567-e89b-12d3-a456-426614174000';
    (randomUUID as jest.Mock).mockReturnValue(groupId);

    const result = await groupService.createGroup('Test Group');

    expect(result).toBe(groupId);
    expect(randomUUID).toHaveBeenCalledTimes(1);
    expect(paymentSplitterRepository.save).toHaveBeenCalledTimes(1);
    expect(paymentSplitterRepository.save).toHaveBeenCalledWith({
      pk: `GROUP#${groupId}`,
      sk: 'GROUP',
      groupName: 'Test Group',
    });
  });

  it('should add a new member to the group', async () => {
    const groupId = '123e4567-e89b-12d3-a456-426614174000';
    const expenseId = '123e4567-e89b-12d3-a456-426614174001';

    (randomUUID as jest.Mock).mockReturnValue(expenseId);

    await groupService.addMemberGroup(groupId, 'John Doe', 'john.doe@example.com');

    expect(randomUUID).toHaveBeenCalledTimes(1);
    expect(paymentSplitterRepository.save).toHaveBeenCalledTimes(1);
    expect(paymentSplitterRepository.save).toHaveBeenCalledWith({
      pk: `GROUP#${groupId}`,
      sk: `MEMBER#${expenseId}`,
      memberName: 'John Doe',
      memberEmail: 'john.doe@example.com',
      balance: 0,
    });
  });

  it('should return members of a group', async () => {
    const groupId = '123e4567-e89b-12d3-a456-426614174000';

    const members = [
      { pk: "GROUP", sk: 'MEMBER#1', memberEmail: 'member1@example.com', memberName: 'John Doe', balance: 0 },
      { pk: "GROUP", sk: 'MEMBER#2', memberEmail: 'member2@example.com', memberName: 'Jane Doe', balance: 0 },
    ];

    jest.spyOn(paymentSplitterRepository, 'query').mockResolvedValue(members);

    const result = await groupService.getMembersFromGroup(groupId);

    expect(paymentSplitterRepository.query).toHaveBeenCalledTimes(1);
    expect(paymentSplitterRepository.query).toHaveBeenCalledWith({
      keyConditionExpression: 'pk = :pk AND begins_with(sk, :sk)',
      expressionAttributeValues: {
        ":pk": `GROUP#${groupId}`,
        ":sk": 'MEMBER',
      },
    });

    expect(result).toEqual(members);
  });

  it('should settle debts', async () => {
    const groupId = 'group-123';
    const payerId = 'payer-123';
    const payeeId = 'payee-123';
    const amount = 100;

    const settlementId = 'settlement-123';
    (randomUUID as jest.Mock).mockReturnValue(settlementId);

    const members = [
      { pk: 'GROUP', sk: 'MEMBER#payer-123', memberEmail: 'member1@example.com' },
      { pk: 'GROUP', sk: 'MEMBER#payee-123', memberEmail: 'member2@example.com' },
    ];
    jest.spyOn(groupService, 'getMembersFromGroup').mockResolvedValue(members);

    const updateMock = jest.fn().mockResolvedValue(true);
    const saveMock = jest.fn().mockResolvedValue(true);
    paymentSplitterRepository.update = updateMock;
    paymentSplitterRepository.save = saveMock;

    await groupService.settleDebts(groupId, payerId, payeeId, amount);

    expect(groupService.getMembersFromGroup).toHaveBeenCalledWith(groupId);
    expect(updateMock).toHaveBeenCalledTimes(2);
    expect(updateMock).toHaveBeenCalledWith(
      { pk: `GROUP#${groupId}`, sk: `MEMBER#${payerId}` },
      {
        UpdateExpression: "ADD balance :balance",
        ExpressionAttributeValues: { ":balance": { N: `-${amount.toString()}` } }
      }
    );
    expect(updateMock).toHaveBeenCalledWith(
      { pk: `GROUP#${groupId}`, sk: `MEMBER#${payeeId}` },
      {
        UpdateExpression: "ADD balance :balance",
        ExpressionAttributeValues: { ":balance": { N: `+${amount.toString()}` } }
      }
    );
    expect(saveMock).toHaveBeenCalledWith({
      pk: `GROUP#${groupId}`,
      sk: `SETTLEMENT#${settlementId}`,
      payerId,
      settledWithId: payeeId,
      settlementAmount: amount,
    });
  });
});
