import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from "aws-lambda";
import { ResponseGateway } from "../../../common/responseGateway";
import { makeViewBalancesGroupFactory } from "../factories/view-balances-group-factory";

export const handler = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> => {
  try {
    const { groupId } = event.pathParameters;
    // zod

    const factory = makeViewBalancesGroupFactory();
    const balances = await factory.getBalancesGroup(groupId);

    return ResponseGateway.ok(balances).build();
  } catch (error) {
    console.log(error);
    return ResponseGateway.internalServerError(error).build();
  }
};
