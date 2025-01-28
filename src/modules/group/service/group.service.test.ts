import { Publisher } from "../../../services/publisher/publisher";
import { randomUUID } from "crypto";
import { GroupService } from "./group.service";

jest.mock("crypto", () => ({
  randomUUID: jest.fn(),
}));

describe("GroupService", () => {
  let publisherMock: jest.Mocked<Publisher>;
  let groupService: GroupService;

  beforeEach(() => {
    publisherMock = { 
      publish: jest.fn().mockResolvedValue(undefined) 
    } as jest.Mocked<Publisher>;

    groupService = new GroupService(publisherMock);

    (randomUUID as jest.Mock).mockReturnValue("uuid");
  });

  it("should generate a uuid, publish the message and return the id from group", async () => {
    const name = "new-name";
    const expectedMessage = { id: "uuid", name };

    const result = await groupService.execute(name);

    expect(randomUUID).toHaveBeenCalled();
    expect(publisherMock.publish).toHaveBeenCalledWith(JSON.stringify(expectedMessage));
    expect(result).toBe("uuid");
  });
});
