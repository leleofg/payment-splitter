import {
  AttributeValue,
  DynamoDBClient,
  PutItemCommand,
  QueryCommand,
  UpdateItemCommand
} from "@aws-sdk/client-dynamodb";

import type {
  PutItemCommandInput,
  QueryCommandInput,
  UpdateItemCommandInput
} from "@aws-sdk/client-dynamodb";

import { convertToAttr, marshall, unmarshall } from "@aws-sdk/util-dynamodb";

interface QueryRequest {
  keyConditionExpression: string;
  expressionAttributeValues: Object;
  filterExpression?: string;
  indexName?: string;
  limit?: number;
  scanIndexForward?: boolean;
}

export abstract class Repository<T> {
  protected dynamoDb: DynamoDBClient;

  constructor(protected tableName: string) {
    this.dynamoDb = new DynamoDBClient();
  }

  async query(param: QueryRequest): Promise<T[]> {
    const expressionAttributeValues = Object.fromEntries(
      Object.entries(param.expressionAttributeValues).map(([key, value]) => [key, convertToAttr(value)])
    );

    const params: QueryCommandInput = {
      TableName: this.tableName,
      KeyConditionExpression: param.keyConditionExpression,
      IndexName: param.indexName,
      ExpressionAttributeValues: expressionAttributeValues,
      Limit: param.limit || 1000,
      ScanIndexForward: param.scanIndexForward || false,
      FilterExpression: param.filterExpression
    };

    const response = await this.dynamoDb.send(new QueryCommand(params));

    return this.unmarshallMap<T>(response.Items);
  }

  async save(item: T): Promise<T> {
    const params: PutItemCommandInput = {
      TableName: this.tableName,
      Item: marshall({ ...item }, { removeUndefinedValues: true }),
      ReturnValues: "ALL_OLD"
    };

    const response = await this.dynamoDb.send(new PutItemCommand(params));

    return response.Attributes as T;
  }

  async update(key: Key, updateParam: UpdateParam): Promise<void> {
    const params: UpdateItemCommandInput = { ...updateParam, TableName: this.tableName, Key: marshall(key) };
    await this.dynamoDb.send(new UpdateItemCommand(params));
  }

  unmarshallMap<T>(list: Record<string, AttributeValue>[] | undefined): T[] {
    if (!list) {
      return [];
    }
    return list.map((item) => unmarshall(item)) as T[];
  }
}

type Key = { [key: string]: unknown };
export type UpdateParam = Omit<UpdateItemCommandInput, "TableName" | "Key">;
