# Payment Splitter

This project uses AWS Lambda, API Gateway and DynamoDB.

Everything managed through the serverless framework in version 3.

Resources(Table, SNS Topic and SQS Queue) were created using Cloudformation.

It use resend to send e-mails, so, you need to create .env file and set the RESEND_API_KEY

## Usage

### Deployment

Before running, the code below, you need to set the AWS credentials.

```
$ serverless deploy
```

## Postman Collection


## Known limitations

- Request validation, ex: Zod
- Automated deployment, ex: with Github Actions
