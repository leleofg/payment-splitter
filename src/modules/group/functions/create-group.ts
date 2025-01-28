import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from "aws-lambda";
import { ResponseGateway } from "../../../common/responseGateway";
import { makeCreateGroupFactory } from "../factories/create-group-factory";

export const handler = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> => {
  try {
    const { name } = JSON.parse(event.body!);
    // zod

    const factory = makeCreateGroupFactory();
    const groupId = await factory.execute(name);

    return ResponseGateway.ok({
      id: groupId,
      status: "PROCESSING"
    }).build();
  } catch (error) {
    return ResponseGateway.internalServerError(error).build();
  }
};
