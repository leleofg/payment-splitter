import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from "aws-lambda";
import { ResponseGateway } from "../../../common/responseGateway";
import { GroupService } from "../service/group.service";
import { settleDebtGroupRequest } from "./requests/settle-debt-group-request";

const groupService = new GroupService();

export const handler = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> => {
  try {
    const { groupId, payerId, payeeId, amount } = settleDebtGroupRequest.parse(JSON.parse(event.body));

    await groupService.settleDebts(groupId, payerId, payeeId, amount);

    return ResponseGateway.ok().build();
  } catch (error) {
    return ResponseGateway.internalServerError({ message: (error as Error).message }).build();
  }
};
