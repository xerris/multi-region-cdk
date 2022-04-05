#!/usr/bin/env node
import "source-map-support/register"
import cdk = require("aws-cdk-lib")
import { CDKExampleLambdaApiStack } from "../lib/lambda-api-stack"

export const lambdaApiStackName = "CDKExampleLambdaApiStack"
export const lambdaFunctionName = "CDKExampleWidgetStoreFunction"

const app = new cdk.App()

var regions = ["us-west-2", "us-east-2", "us-east-1"]

var environment = {
    dev: { awsAccountId: "370365354210" },
    stage: { awsAccountId: "370365354210" },
    prod: { awsAccountId: "370365354210" },
}

regions.forEach(function (value) {
    var regionalDeployment = new CDKExampleLambdaApiStack(
        app,
        lambdaApiStackName + `-region-` + value,
        {
            env: {
                region: value,
                account: environment.dev.awsAccountId,
            },
            functionName: lambdaFunctionName,
        }
    )
})
