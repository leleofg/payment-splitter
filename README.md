# Payment Splitter

## Overview

- This project uses AWS Lambda, API Gateway V2, S3 and DynamoDB.
- Everything managed through the serverless framework v3.
- Resources(Table, SNS Topic, SQS Queue and S3) were created using Cloudformation.
- Resend to send e-mails. We use the EMAIL_QUEUE to send e-mails.
- S3 to storage files.
- Cloudwatch to observalibity.
- Zod to schema validation.
- Deploy with Github Actions.

## DynamoDB Single Table

I chose to use the single table pattern with DynamoDB. Because I already have experience with this pattern and it would be much easier to scale the application this way. This way I can have all the data in one place. And for what was requested, I didn't even need to use LSI and GSI indexes, which made it even simpler.

# Prerequisites

- Set BUCKET_NAME at .env file to send files to S3.
- Set RESEND_API_KEY at .env file to send e-mails.
- Set AWS_ACCOUNT_ID at .env file to use publisher service.
- Set AWS credentials and all envs at Github secrets.
- CSV format:
```
groupId,payerId,expenseName,amount
2cf10f77-e30a-47c7-9207-572666d0c164,82564656-f017-447d-a52e-520b8d0013cc,wine,32
5f6eba23-6234-40f2-a57d-f8dd57c1d81d,fe38a305-1242-4abd-ad23-802fb5eaa743,beers,16
```

## Deployment

Deploy with Github Actions, just deploy to branch main.

## Running

```
npm run start
```

## Testing

```
npm test
```

## Known limitations

- Create a DLQ to queue SEND_EMAIL_QUEUE
