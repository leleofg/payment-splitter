import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from "aws-lambda";
import { ResponseGateway } from "../../../common/responseGateway";
import { GroupService } from "../service/group.service";

const groupService = new GroupService();

export const handler = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> => {
  try {
    const { groupId } = event.pathParameters;

    const balances = await groupService.getBalancesGroup(groupId);

    return ResponseGateway.ok(balances).build();
  } catch (error) {
    console.log(error);
    return ResponseGateway.internalServerError(error).build();
  }
};
