# Multi Region Lambda with API Gateway

-   Deploy across multiple regions (us-west-2, us-east-2, us-east-1)
-   Create a Lambda function that can be invoked using API Gateway
-   Create a CI using CodePipeline that deploys the Lambda+ApiGateway resources using `cdk deploy`

# How do I start using it?

-   Create your code repository and check this blueprint in (manual step)
-   Ensure your git repo is integrated into CodeBuild (manual step)
-   Bootstrap your cdk for all three regions
    `cdk bootstrap aws://ACCOUNT-NUMBER-1/REGION-1 aws://ACCOUNT-NUMBER-2/REGION-2 ...`
-   Test your deployment using cdk
    ` cdk deploy -a "npx ts-node bin/lambda.ts" --all`
-   Run Code Pipeline automation
    `cdk deploy`
