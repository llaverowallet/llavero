
import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { StackProps, SecretValue } from 'aws-cdk-lib';
import { Project, BuildSpec, LinuxBuildImage } from 'aws-cdk-lib/aws-codebuild';
import { GitHubSourceAction, CodeBuildAction, GitHubTrigger } from 'aws-cdk-lib/aws-codepipeline-actions';
import { Pipeline, Artifact } from 'aws-cdk-lib/aws-codepipeline';

export class CodedeployStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: StackProps,
    enviroment?: { region: string, account: string, email: string, numberOfKeys: number, cognitoUrlSuffix: string, awsAccessKeyId: string, awsSecretAccessKey: string }
  ) {
    super(scope, id, props);

    // Define a new CodeBuild project
    const buildProject = new Project(this, 'LlaveroBuildProject', {
      environment: {
        buildImage: LinuxBuildImage.STANDARD_7_0,
        environmentVariables: {
          'EMAIL': {
            value: enviroment?.email
          },
          'NUMBER_OF_KEYS': {
            value: enviroment?.numberOfKeys.toString()
          },
          'COGNITO_URL_SUFFIX': {
            value: enviroment?.cognitoUrlSuffix
          },
          "REGION": { value: enviroment?.region },
          "AWS_ACCESS_KEY_ID": { value: enviroment?.awsAccessKeyId }, //TODO improve for security. Use parameter store? 
          "AWS_SECRET_ACCESS_KEY": { value: enviroment?.awsSecretAccessKey }
        }
      },
      buildSpec: BuildSpec.fromObject({
        version: '0.2',
        phases: {
          install: {
            commands: ['yarn install'],
          },
          build: {
            commands: ['yarn run deploy'],
          },
        },
      }),
    });

    // Define a new CodePipeline
    const pipeline = new Pipeline(this, 'LlaveroPipeline', {
      pipelineName: 'LlaveroPipeline',
      restartExecutionOnUpdate: true,
      crossAccountKeys: false,
    });

    const code = new Artifact('LlaveroCode');
    // Add a source stage
    pipeline.addStage({
      stageName: 'Source',
      actions: [
        new GitHubSourceAction({
          actionName: 'GitHub_Source',
          output: code,
          owner: 'elranu',
          repo: 'llavero',
          //Hardcoded PAT because is the only way I found to clone a public repo
          //The PAT only has access to public repo
          //TODO: Try to send the PAT as a parameter
          oauthToken: SecretValue.unsafePlainText("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"),
          trigger: GitHubTrigger.POLL,
        }),
      ],
    });

    // Add a build stage
    pipeline.addStage({
      stageName: 'BuildAndDeployLlavero',
      actions: [
        new CodeBuildAction({
          actionName: 'CodeBuild',
          project: buildProject,
          input: code
        }),
      ],
    });
  }
}