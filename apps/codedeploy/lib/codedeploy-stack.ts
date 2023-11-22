import { Stack, StackProps, SecretValue } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { Pipeline, Artifact } from 'aws-cdk-lib/aws-codepipeline';
import { GitHubSourceAction, CodeBuildAction, GitHubTrigger } from 'aws-cdk-lib/aws-codepipeline-actions';
import { Project, BuildSpec, LinuxBuildImage } from 'aws-cdk-lib/aws-codebuild';


export class CodedeployStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // Define a new CodeBuild project
    const buildProject = new Project(this, 'LlaveroBuildProject', {
      environment: {
        buildImage: LinuxBuildImage.STANDARD_7_0,
        environmentVariables: {
          'EMAIL': {
            value: process.env.EMAIL
          },
          'NUMBER_OF_KEYS': {
            value: '5'
          },
          'COGNITO_URL_SUFFIX': {
            value:  process.env.COGNITO_URL_SUFFIX
          },
          "REGION": { value: process.env.REGION },
          "AWS_ACCESS_KEY_ID": { value: process.env.AWS_ACCESS_KEY_ID },
          "AWS_SECRET_ACCESS_KEY": { value: process.env.AWS_SECRET_ACCESS_KEY }
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
          oauthToken: SecretValue.unsafePlainText("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"),
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
          project: buildProject,
          input: code
        }),
      ],
    });
  }
}

// const app = new App();
// new MyCodeDeployStack(app, 'MyCodeDeployStack', {
//   // Define stack environment if necessary
//   // env: { account: '123456789012', region: 'us-west-2' }
// });
