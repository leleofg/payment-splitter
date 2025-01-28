import { APIGatewayProxyResult } from "aws-lambda";

export class ResponseGateway {
  public static OK = 200;
  public static BAD_REQUEST = 400;
  public static INTERNAL_SERVER_ERROR = 500;

  private httpCode: number;
  private body?: any = "";
  private url: string;

  constructor(httpCode?: number) {
    this.httpCode = httpCode || ResponseGateway.OK;
  }

  public build(): APIGatewayProxyResult {
    return {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      },
      statusCode: this.httpCode,
      body: this.body
    };
  }

  public buildRedirect(): APIGatewayProxyResult {
    return {
      headers: {
        Location: this.url
      },
      statusCode: this.httpCode,
      body: this.body
    };
  }

  public setBody(body: any): ResponseGateway {
    this.body = JSON.stringify(body);

    return this;
  }

  public setHttpCode(httpCode: number): ResponseGateway {
    this.httpCode = httpCode;

    return this;
  }

  public setLocation(url: string): ResponseGateway {
    this.url = url;

    return this;
  }

  public static ok(body?: any): ResponseGateway {
    const response = new this(ResponseGateway.OK);

    return response.setBody(body);
  }

  public static badRequest(body?: any): ResponseGateway {
    const response = new this(ResponseGateway.BAD_REQUEST);

    return response.setBody(body);
  }

  public static internalServerError(body?: any): ResponseGateway {
    const response = new this(ResponseGateway.INTERNAL_SERVER_ERROR);

    return response.setBody(body);
  }

  public static httpCode(httpCode: number): ResponseGateway {
    return new this(httpCode);
  }

  public static builder(): ResponseGateway {
    return new this();
  }
}
