import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from "aws-lambda";
import { ResponseGateway } from "../../../common/responseGateway";
import { GroupService } from "../service/group.service";
import { addMemberGroupRequest } from "./requests/add-member-group-request";

const groupService = new GroupService();

export const handler = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> => {
  try {
    const { groupId, memberName, memberEmail } = addMemberGroupRequest.parse(JSON.parse(event.body));

    await groupService.addMemberGroup(groupId, memberName, memberEmail);

    return ResponseGateway.ok().build();
  } catch (error) {
    return ResponseGateway.internalServerError(error).build();
  }
};
