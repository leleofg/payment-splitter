import {
  AttributeValue,
  BatchGetItemCommand,
  BatchWriteItemCommand,
  DeleteItemCommand,
  DynamoDBClient,
  GetItemCommand,
  PutItemCommand,
  QueryCommand,
  ScanCommand,
  UpdateItemCommand
} from "@aws-sdk/client-dynamodb";

import type {
  BatchGetItemCommandInput,
  BatchWriteItemCommandInput,
  DeleteItemCommandInput,
  GetItemCommandInput,
  PutItemCommandInput,
  QueryCommandInput,
  ScanCommandInput,
  UpdateItemCommandInput
} from "@aws-sdk/client-dynamodb";

import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";

interface QueryRequest {
  keyConditionExpression: string;
  expressionAttributeValues: ExpressionAttributeValueMap;
  filterExpression?: string;
  indexName?: string;
  limit?: number;
  scanIndexForward?: boolean;
}

export abstract class Repository<T> {
  protected dynamoDb: DynamoDBClient;

  private methodPrototype = (proto: object, item: any): any => (proto ? Object.setPrototypeOf(item, proto) : item);

  constructor(protected tableName: string) {
    this.dynamoDb = new DynamoDBClient();
  }

  async query(param: QueryRequest): Promise<T[]> {
    const params: QueryCommandInput = {
      TableName: this.tableName,
      KeyConditionExpression: param.keyConditionExpression,
      IndexName: param.indexName,
      ExpressionAttributeValues: param.expressionAttributeValues,
      Limit: param.limit || 1000,
      ScanIndexForward: param.scanIndexForward || false,
      FilterExpression: param.filterExpression
    };

    const response = await this.dynamoDb.send(new QueryCommand(params));

    return this.unmarshallMap<T>(response.Items);
  }

  async queryAll(queryParam: QueryParam): Promise<T[]> {
    const params = { ...queryParam, TableName: this.tableName };
    const response = await this.dynamoDb.send(new QueryCommand(params));
    const items = response.Items;

    if (response.LastEvaluatedKey) {
      params.ExclusiveStartKey = response.LastEvaluatedKey;
      const nextItems = await this.dynamoDb.send(new QueryCommand(params));

      if (items?.length && nextItems.Items?.length) {
        items.push(...nextItems.Items);
      }
    }

    return this.unmarshallMap<T>(items);
  }

  async findOne(key: Key, proto?: object): Promise<T | undefined> {
    const params: GetItemCommandInput = { TableName: this.tableName, Key: marshall({ ...key }) };

    const response = await this.dynamoDb.send(new GetItemCommand(params));

    if (!response.Item) {
      return undefined;
    }

    return this.methodPrototype(proto || {}, unmarshall(response.Item)) as T;
  }

  async findBatch(items: any): Promise<T[]> {
    const params: BatchGetItemCommandInput = { RequestItems: items };

    const response = await this.dynamoDb.send(new BatchGetItemCommand(params));

    if (!response.Responses) {
      return [];
    }

    return this.unmarshallMap<T>(response.Responses.Ticker);
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

  async saveInBatch(items: any): Promise<void> {
    const params: BatchWriteItemCommandInput = { RequestItems: items };

    await this.dynamoDb.send(new BatchWriteItemCommand(params));
  }

  async update(key: Key, updateParam: UpdateParam): Promise<void> {
    const params: UpdateItemCommandInput = { ...updateParam, TableName: this.tableName, Key: marshall(key) };
    await this.dynamoDb.send(new UpdateItemCommand(params));
  }

  async delete(key: Key) {
    const params: DeleteItemCommandInput = {
      TableName: this.tableName,
      ReturnValues: "ALL_OLD",
      Key: marshall({ ...key })
    };

    const response = await this.dynamoDb.send(new DeleteItemCommand(params));

    return response.Attributes as T;
  }

  async findOneCustom(key: Key, getParam?: GetParam): Promise<T | undefined> {
    const params: GetItemCommandInput = { Key: marshall({ ...key }), TableName: this.tableName, ...(getParam || {}) };

    const response = await this.dynamoDb.send(new GetItemCommand(params));

    if (!response.Item) {
      return undefined;
    }

    return unmarshall(response.Item) as T;
  }

  async scanAll(scanAllParam?: ScanParam): Promise<T[]> {
    const params: ScanCommandInput = {
      ...(scanAllParam || {}),
      TableName: this.tableName
    };
    const resultScan = await this.dynamoDb.send(new ScanCommand(params));
    const items = (resultScan.Items ?? []).map((item) =>
      unmarshall(item)
    ) as T[];
    if (resultScan.LastEvaluatedKey) {
      params.ExclusiveStartKey = marshall(resultScan.LastEvaluatedKey);
      items.push(...(await this.scanAll(params)));
    }
    return items;
  }

  unmarshallMap<T>(list: Record<string, AttributeValue>[] | undefined): T[] {
    if (!list) {
      return [];
    }
    return list.map((item) => unmarshall(item)) as T[];
  }
}

type ExpressionAttributeValueMap = Record<any, AttributeValue>;
type Key = { [key: string]: unknown };
export type InputFindDynamodb<T> = Omit<T, "TableName">;
export type GetParam = Omit<GetItemCommandInput & { prototype?: object }, "TableName" | "Key">;
export type QueryParam = InputFindDynamodb<QueryCommandInput>;
export type UpdateParam = Omit<UpdateItemCommandInput, "TableName" | "Key">;
export type ScanParam = InputFindDynamodb<ScanCommandInput>;
