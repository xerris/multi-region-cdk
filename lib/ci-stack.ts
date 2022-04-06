import { CodeCommitSourceAction, CodeBuildAction } from "aws-cdk-lib/aws-codepipeline-actions"
import { PolicyStatement } from "aws-cdk-lib/aws-iam"
import { ArnFormat, Stack, StackProps } from "aws-cdk-lib"
import { PipelineProject, LinuxBuildImage } from "aws-cdk-lib/aws-codebuild"
import { Artifact, Pipeline } from "aws-cdk-lib/aws-codepipeline"
import { Repository } from "aws-cdk-lib/aws-codecommit"
import { Construct } from "constructs"
import { lambdaApiStackName, lambdaFunctionName } from "../bin/lambda"

interface CIStackProps extends StackProps {
    repositoryName: string
}

export class CIStack extends Stack {
    constructor(scope: Construct, name: string, props: CIStackProps) {
        super(scope, name, props)

        const pipeline = new Pipeline(this, "Pipeline", {})

        const repo = Repository.fromRepositoryName(
            this,
            "WidgetsServiceRepository",
            props.repositoryName
        )
        const sourceOutput = new Artifact("SourceOutput")
        const sourceAction = new CodeCommitSourceAction({
            actionName: "CodeCommit",
            repository: repo,
            branch: "main",
            output: sourceOutput,
        })
        pipeline.addStage({
            stageName: "Source",
            actions: [sourceAction],
        })

        this.createBuildStage(pipeline, sourceOutput)
    }

    private createBuildStage(pipeline: Pipeline, sourceOutput: Artifact) {
        const project = new PipelineProject(this, `BuildProject`, {
            environment: {
                buildImage: LinuxBuildImage.STANDARD_3_0,
            },
        })

        const cdkDeployPolicy = this.createCDKDeploymentPolicy()
        const s3Policy = this.createS3Policy()
        const editOrCreateLambdaDependencies = this.createMicroservicePolicy()

        project.addToRolePolicy(cdkDeployPolicy)
        project.addToRolePolicy(s3Policy)
        project.addToRolePolicy(editOrCreateLambdaDependencies)

        const buildOutput = new Artifact(`BuildOutput`)
        const buildAction = new CodeBuildAction({
            actionName: `Build`,
            project,
            input: sourceOutput,
            outputs: [buildOutput],
        })

        pipeline.addStage({
            stageName: "build",
            actions: [buildAction],
        })

        return buildOutput
    }

    private createMicroservicePolicy() {
        const editOrCreateLambdaDependencies = new PolicyStatement()
        editOrCreateLambdaDependencies.addActions(
            "iam:GetRole",
            "iam:PassRole",
            "iam:CreateRole",
            "iam:AttachRolePolicy",
            "iam:PutRolePolicy",
            "apigateway:GET",
            "apigateway:DELETE",
            "apigateway:PUT",
            "apigateway:POST",
            "apigateway:PATCH",
            "s3:CreateBucket",
            "s3:PutBucketTagging"
        )
        editOrCreateLambdaDependencies.addResources("*")
        return editOrCreateLambdaDependencies
    }

    private createCDKDeploymentPolicy() {
        const cdkDeployPolicy = new PolicyStatement()
        cdkDeployPolicy.addActions(
            "cloudformation:GetTemplate",
            "cloudformation:CreateChangeSet",
            "cloudformation:DescribeChangeSet",
            "cloudformation:ExecuteChangeSet",
            "cloudformation:DescribeStackEvents",
            "cloudformation:DeleteChangeSet",
            "cloudformation:DescribeStacks",
            "cloudformation:RegisterType",
            "cloudformation:CreateUploadBucket",
            "cloudformation:ListExports",
            "cloudformation:DescribeStackDriftDetectionStatus",
            "cloudformation:SetTypeDefaultVersion",
            "cloudformation:RegisterPublisher",
            "cloudformation:ActivateType",
            "cloudformation:ListTypes",
            "cloudformation:DeactivateType",
            "cloudformation:SetTypeConfiguration",
            "cloudformation:DeregisterType",
            "cloudformation:ListTypeRegistrations",
            "cloudformation:EstimateTemplateCost",
            "cloudformation:DescribeAccountLimits",
            "cloudformation:BatchDescribeTypeConfigurations",
            "cloudformation:CreateStackSet",
            "cloudformation:ListStacks",
            "cloudformation:DescribeType",
            "cloudformation:ListImports",
            "cloudformation:PublishType",
            "cloudformation:DescribePublisher",
            "cloudformation:DescribeTypeRegistration",
            "cloudformation:TestType",
            "cloudformation:ValidateTemplate",
            "cloudformation:ListTypeVersions",
            "s3:*Object",
            "s3:ListBucket",
            "s3:getBucketLocation",
            "lambda:UpdateFunctionCode",
            "lambda:GetFunction",
            "lambda:CreateFunction",
            "lambda:DeleteFunction",
            "lambda:GetFunctionConfiguration",
            "lambda:AddPermission",
            "lambda:RemovePermission",
            "ssm:GetParameter",
            "ssm:CancelCommand",
            "ssm:ListCommands",
            "ssm:DescribeMaintenanceWindowSchedule",
            "ssm:SendAutomationSignal",
            "ssm:DescribeInstancePatches",
            "ssm:CreateActivation",
            "ssm:CreateOpsItem",
            "ssm:GetMaintenanceWindowExecutionTaskInvocation",
            "ssm:DescribeAutomationExecutions",
            "ssm:DeleteActivation",
            "ssm:DescribeMaintenanceWindowExecutionTaskInvocations",
            "ssm:DescribeAutomationStepExecutions",
            "ssm:ListOpsMetadata",
            "ssm:UpdateInstanceInformation",
            "ssm:DescribeParameters",
            "ssm:ListResourceDataSync",
            "ssm:ListDocuments",
            "ssm:DescribeMaintenanceWindowsForTarget",
            "ssm:ListComplianceItems",
            "ssm:GetConnectionStatus",
            "ssm:GetMaintenanceWindowExecutionTask",
            "ssm:GetMaintenanceWindowExecution",
            "ssm:ListResourceComplianceSummaries",
            "ssm:ListOpsItemRelatedItems",
            "ssm:DescribeOpsItems",
            "ssm:DescribeMaintenanceWindows",
            "ssm:CancelMaintenanceWindowExecution",
            "ssm:DescribeAssociationExecutions",
            "ssm:ListCommandInvocations",
            "ssm:GetAutomationExecution",
            "ssm:DescribePatchGroups",
            "ssm:ListAssociationVersions",
            "ssm:PutConfigurePackageResult",
            "ssm:DescribePatchGroupState",
            "ssm:CreatePatchBaseline",
            "ssm:GetManifest",
            "ssm:DeleteInventory",
            "ssm:DescribeMaintenanceWindowExecutionTasks",
            "ssm:DescribeInstancePatchStates",
            "ssm:DescribeInstancePatchStatesForPatchGroup",
            "ssm:RegisterManagedInstance",
            "ssm:GetInventorySchema",
            "ssm:CreateMaintenanceWindow",
            "ssm:DescribeAssociationExecutionTargets",
            "ssm:DescribeInstanceProperties",
            "ssm:ListInventoryEntries",
            "ssm:ListOpsItemEvents",
            "ssm:GetDeployablePatchSnapshotForInstance",
            "ssm:DescribeSessions",
            "ssm:DescribePatchBaselines",
            "ssm:DescribeInventoryDeletions",
            "ssm:DescribePatchProperties",
            "ssm:GetInventory",
            "ssm:DescribeActivations",
            "ssm:StopAutomationExecution",
            "ssm:GetCommandInvocation",
            "ssm:CreateOpsMetadata",
            "ssm:ListComplianceSummaries",
            "ssm:PutInventory",
            "ssm:DescribeInstanceInformation",
            "ssm:ListAssociations",
            "ssm:DescribeAvailablePatches"
        )
        cdkDeployPolicy..addAllResources()
        return cdkDeployPolicy
    }

    private createS3Policy() {
        const s3Policy = new PolicyStatement()
        s3Policy.addActions("s3:*", "s3-object-lambda:*")
        s3Policy.addAllResources()
        return s3Policy
    }
}
