import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from "aws-lambda";
import { ResponseGateway } from "../../../common/responseGateway";
import { makeAddMemberGroupFactory } from "../factories/add-member-group-factory";

export const handler = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> => {
  try {
    const { groupId, memberName, memberEmail } = JSON.parse(event.body!);
    // zod

    const factory = makeAddMemberGroupFactory();
    await factory.addMemberGroup(groupId, memberName, memberEmail);

    return ResponseGateway.ok().build();
  } catch (error) {
    return ResponseGateway.internalServerError(error).build();
  }
};
