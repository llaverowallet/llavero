import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { StackProps, SecretValue } from 'aws-cdk-lib';
import { Project, BuildSpec, LinuxBuildImage } from 'aws-cdk-lib/aws-codebuild';
import {
  GitHubSourceAction,
  CodeBuildAction,
  GitHubTrigger,
} from 'aws-cdk-lib/aws-codepipeline-actions';
import { Pipeline, Artifact } from 'aws-cdk-lib/aws-codepipeline';

export class CodedeployStack extends cdk.Stack {
  constructor(
    scope: Construct,
    id: string,
    props?: StackProps,
    enviroment?: {
      region: string;
      account: string;
      email: string;
      numberOfKeys: number;
      awsAccessKeyId: string;
      awsSecretAccessKey: string;
    },
  ) {
    super(scope, id, props);

    // Define a new CodeBuild project
    const llaveroBuildProject = new Project(this, 'LlaveroBuildProject', {
      environment: {
        buildImage: LinuxBuildImage.STANDARD_7_0,
        environmentVariables: {
          EMAIL: {
            value: enviroment?.email,
          },
          NUMBER_OF_KEYS: {
            value: enviroment?.numberOfKeys.toString(),
          },
          REGION: { value: enviroment?.region },
          AWS_ACCESS_KEY_ID: { value: enviroment?.awsAccessKeyId }, //TODO improve for security. Use parameter store?
          AWS_SECRET_ACCESS_KEY: { value: enviroment?.awsSecretAccessKey },
        },
      },
      buildSpec: BuildSpec.fromObject({
        version: '0.2',
        phases: {
          install: {
            commands: ['yarn workspace web install'],
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
    const initPat = 'github_pat_11AAGVJEA';
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
          //PAT only for public repos. Theres is no way without a PAT to access public repos
          oauthToken: SecretValue.unsafePlainText(initPat + end),
          trigger: GitHubTrigger.NONE,
        }),
      ],
    });

    // Add a build stage
    pipeline.addStage({
      stageName: 'BuildAndDeployLlavero',
      actions: [
        new CodeBuildAction({
          actionName: 'CodeBuild',
          project: llaveroBuildProject,
          input: code,
        }),
      ],
    });
  }
}
const end =
  '0Xft3QKzqtb9A_vDCtqbUNnIzjjM867W0vlWRDaNGIfVoJ5lylh1o0MpNVHCHMQI21fzx4EFs';
