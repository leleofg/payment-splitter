import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from "aws-lambda";
import { ResponseGateway } from "../../../common/responseGateway";
import { GroupService } from "../service/group.service";
import { createGroupRequest } from "./requests/create-group-request";

const groupService = new GroupService();

export const handler = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> => {
  try {
    const { name } = createGroupRequest.parse(JSON.parse(event.body));

    const groupId = await groupService.createGroup(name);

    return ResponseGateway.ok({ id: groupId }).build();
  } catch (error) {
    return ResponseGateway.internalServerError(error).build();
  }
};
