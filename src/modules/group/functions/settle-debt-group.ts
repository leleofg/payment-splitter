import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from "aws-lambda";
import { ResponseGateway } from "../../../common/responseGateway";
import { makeSettleDebtGroupFactory } from "../factories/settle-debt-group-factory";

export const handler = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> => {
  try {
    const { groupId, payerId, payeeId, amount } = JSON.parse(event.body!);
    // zod

    const factory = makeSettleDebtGroupFactory();
    await factory.settleDebts(groupId, payerId, payeeId, amount);

    return ResponseGateway.ok().build();
  } catch (error) {
    return ResponseGateway.internalServerError(error).build();
  }
};
