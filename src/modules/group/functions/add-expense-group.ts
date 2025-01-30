import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from "aws-lambda";
import { ResponseGateway } from "../../../common/responseGateway";
import { GroupService } from "../service/group.service";

const groupService = new GroupService();

export const handler = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> => {
  try {
    const { groupId, expenseName, amount, payerId, splitWithIds } = JSON.parse(event.body!);

    await groupService.addExpenseGroup(groupId, expenseName, amount, payerId, splitWithIds);

    return ResponseGateway.ok().build();
  } catch (error) {
    return ResponseGateway.internalServerError({ message: (error as Error).message }).build();
  }
};
