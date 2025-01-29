import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from "aws-lambda";
import { ResponseGateway } from "../../../common/responseGateway";
import { makeAddExpenseGroupFactory } from "../factories/add-expense-group-factory";

export const handler = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> => {
  try {
    const { groupId, expenseName, amount, payerId } = JSON.parse(event.body!);
    // zod

    const factory = makeAddExpenseGroupFactory();
    await factory.addExpenseGroup(groupId, expenseName, amount, payerId);

    return ResponseGateway.ok().build();
  } catch (error) {
    console.log(error);
    return ResponseGateway.internalServerError(error).build();
  }
};
