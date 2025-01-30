import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from "aws-lambda";
import { ResponseGateway } from "../../../common/responseGateway";
import { GroupService } from "../service/group.service";
import Busboy from "busboy";
import { randomUUID } from "crypto";

const groupService = new GroupService();

export const handler = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> => {
  try {
    const busboy = Busboy({ headers: event.headers });

    const promise = new Promise<APIGatewayProxyResultV2>((resolve, reject) => {
      busboy.on("file", (fieldname, file, fileInfo) => {
        const { filename } = fileInfo || {};

        groupService.proccessExpenseFile(file, `${filename}-${randomUUID()}`)
          .then(() => {
            resolve({
              statusCode: 200,
              body: JSON.stringify({ message: `File: '${filename}' sent to S3.` }),
            });
          })
          .catch((err) => {
            reject({
              statusCode: 500,
              body: JSON.stringify({
                message: "Error",
                error: err,
              }),
            });
          });
      });

      busboy.on("error", (err) => {
        reject({
          statusCode: 500,
          body: JSON.stringify({
            message: "Error",
            error: err,
          }),
        });
      });

      busboy.end(Buffer.from(event.body, "base64"));
    });

    return await promise;
  } catch (error) {
    return ResponseGateway.internalServerError({ message: (error as Error).message }).build();
  }
};
