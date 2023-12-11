import * as sdk from 'aws-sdk';
import { contextBridge } from 'electron';
import { DescribeStackEventsCommand, CloudFormationClient, DescribeStacksCommand } from '@aws-sdk/client-cloudformation';
import { Bootstrapper } from 'aws-cdk/lib/api/bootstrap';
import { SdkProvider } from 'aws-cdk/lib/api/aws-auth';
import path from 'path';
import * as cfDeployments from 'aws-cdk/lib/api/cloudformation-deployments';
import * as cdk from 'aws-cdk-lib';
import * as cxapi from '@aws-cdk/cx-api';
import { CodedeployStack } from './code-deploy';

const nodeModulesPath = path.join(process.cwd(), 'node_modules');
console.log(nodeModulesPath);

//initial region
const REGION = process.env.AWS_DEFAULT_REGION || 'us-east-1';
sdk.config.update({ region: REGION });


//setCredentials
export interface EnvVars {
  AWS_ACCESS_KEY_ID: string;
  AWS_SECRET_ACCESS_KEY: string;
  AWS_ACCOUNT_ID?: string;
  IDENTITY?: string;
  SDK_VERSION?: string;
  AWsUserId?: string;
  KEYS_NUMBER?: number;
  REGION: string;
  EMAIL: string;
}
const setCredentials = async (accessKeyId: string, secretAccessKey: string) => {
  if (!accessKeyId || !secretAccessKey) {
    throw new Error('Access Key ID and Secret Access Key are required');
  }
  return new Promise((resolve, reject) => {
    const envVars: EnvVars = {
      AWS_ACCESS_KEY_ID: accessKeyId,
      AWS_SECRET_ACCESS_KEY: secretAccessKey,
      EMAIL: '',
      REGION: REGION,
    }
    //process.env['AWS_ACCESS_KEY_ID'] = accessKeyId;
    //process.env['AWS_SECRET_ACCESS_KEY'] = secretAccessKey;
    sdk.config.update({ accessKeyId, secretAccessKey });
    const stsClient = new sdk.STS();
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    stsClient.getCallerIdentity((err: unknown, data: any) => {
      if (err) {
        console.log('err: ', err);
        reject(err);
      } else {
        console.log('data: ', data);
        envVars.AWS_ACCOUNT_ID = process.env.CDK_DEFAULT_ACCOUNT = data.Account;
        const identityArn = data.Arn.split(':');
        envVars.IDENTITY = identityArn.pop();
        envVars.AWsUserId = data.UserId;
        resolve(envVars);
      }
    });
  });
};
contextBridge.exposeInMainWorld('setCredentials', (accessKeyId: string, secretAccessKey: string) => setCredentials(accessKeyId, secretAccessKey));

//getAllRegions
async function getAllRegions() {
  return ['us-east-1', 'us-east-2', 'us-west-1', 'us-west-2', 'eu-west-1', 'eu-west-2', 'eu-west-3', 'eu-central-1', 'eu-north-1', 'ap-east-1', 'ap-south-1', 'ap-northeast-1', 'ap-northeast-2', 'ap-southeast-1', 'ap-southeast-2', 'ca-central-1', 'cn-north-1', 'cn-northwest-1', 'me-south-1', 'sa-east-1'];
}
contextBridge.exposeInMainWorld('getAllRegions', () => getAllRegions());

//SetRegion
function setRegion(region: string) {
  sdk.config.update({ region });
  process.env.AWS_DEFAULT_REGION = process.env.CDK_DEFAULT_REGION = region;
}
contextBridge.exposeInMainWorld('setRegion', (region: string) => setRegion(region));

//getStackEvents
interface StackEvent {
  StackId: string;
  EventId: string;
  StackName: string;
  LogicalResourceId?: string;
  PhysicalResourceId: string;
  ResourceType: string;
  Timestamp: Date;
  ResourceStatus: string;
  ResourceStatusReason?: string;
  ResourceProperties?: string;
}
async function getStackEvents(stackName: string, callback: (event: StackEvent) => void) {
  const cloudFormationClient = new CloudFormationClient({});
  const command = new DescribeStackEventsCommand({ StackName: stackName });
  const response = await cloudFormationClient.send(command);

  const stackEvents = response.StackEvents ?? [];

  stackEvents.forEach((event) => {
    callback(event as StackEvent);
  });
}
contextBridge.exposeInMainWorld('getStackEvents', (stackName: string, callback: (event: StackEvent) => void) => getStackEvents(stackName, callback));

//getStackInfo
async function getStackInfo(stackName: string) {
  const cloudFormationClient = new CloudFormationClient({});
  const command = new DescribeStacksCommand({ StackName: stackName });
  const response = await cloudFormationClient.send(command);

  const stack = response.Stacks?.[0];
  if (!stack) {
    throw new Error(`Stack ${stackName} not found`);
  }

  return {
    stackId: stack.StackId,
    stackName: stack.StackName,
    stackStatus: stack.StackStatus,
    creationTime: stack.CreationTime,
    description: stack.Description,
    parameters: stack.Parameters,
    outputs: stack.Outputs,
    tags: stack.Tags,
  };
}
contextBridge.exposeInMainWorld('getStackInfo', (stackName: string) => getStackInfo(stackName));

//bootstrapCdk
async function bootstrapCdk(vars: EnvVars) {
  try {
    console.log(`Running bootstrapCdk for aws://${vars.AWS_ACCOUNT_ID}/${vars.REGION}`);
    console.log('process.env.AWS_PROFILE: ', process.env.AWS_PROFILE);

    const credentials = new sdk.Credentials({ accessKeyId: vars.AWS_ACCESS_KEY_ID, secretAccessKey: vars.AWS_SECRET_ACCESS_KEY });
    const chain = new sdk.CredentialProviderChain([() => credentials]);
    const sdkProvider = new SdkProvider(chain, vars.REGION, {});
    const template = nodeModulesPath + '/aws-cdk/lib/api/bootstrap/bootstrap-template.yaml';
    console.log('template: ', template);
    const bootstrapper = new Bootstrapper({ 'source': 'custom', templateFile: template });
    const result = await bootstrapper.bootstrapEnvironment({ name: 'llavero-bootstrap', account: vars.AWS_ACCOUNT_ID, region: vars.REGION }, sdkProvider);
    console.log('bootstrapCdk result: ', result);
    return result;
  } catch (error) {
    console.log('bootstrapCdk error: ', error);
  }
  return false;
}

/* 
* This function synths the CDK app and returns the stack template
*/
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const getStackArtifact = (app: cdk.App, stack: any): cxapi.CloudArtifact | undefined => {
  try {
    const synthesized = app.synth();

    // Reload the synthesized artifact for stack using the cxapi from dependencies
    const assembly = new cxapi.CloudAssembly(synthesized.directory, { skipVersionCheck: true }); //TODO ver esto

    return cxapi.CloudFormationStackArtifact.fromManifest(
      assembly,
      stack.artifactId,
      synthesized.getStackArtifact(stack.artifactId).manifest
    );
  } catch (error) {
    console.log("getArtifact:" + error);
    throw error;
  }
};

/* 
* This function creates a basic CDK app that creates an S3 bucket
*/
async function createCdkStack(vars: EnvVars) {
  try {
    const app = new cdk.App();
    const stack = new CodedeployStack(app, 'CodedeployStack', {
      env: { account: vars.AWS_ACCOUNT_ID, region: vars.REGION }, },
      { region: vars.REGION, account: vars.AWS_ACCOUNT_ID, email: vars.EMAIL, numberOfKeys: 2, 
        awsAccessKeyId: vars.AWS_ACCESS_KEY_ID, awsSecretAccessKey: vars.AWS_SECRET_ACCESS_KEY, 
      }
    );
    const stackArtifact = getStackArtifact(app, stack);
    const credentials = new sdk.Credentials({ accessKeyId: vars.AWS_ACCESS_KEY_ID, secretAccessKey: vars.AWS_SECRET_ACCESS_KEY });
    const chain = new sdk.CredentialProviderChain([() => credentials]);
    const sdkProvider = new SdkProvider(chain, vars.REGION, {});
    const cloudFormation = new cfDeployments.CloudFormationDeployments({ sdkProvider });

    if (!stackArtifact) throw new Error('stackArtifact is null');

    await cloudFormation.deployStack({
      stack: stackArtifact as cxapi.CloudFormationStackArtifact,
      quiet: false,
    });
    process.env.AWS_ACCESS_KEY_ID = "dfdsfregrgrtgthtrhrththt";
    process.env.AWS_SECRET_ACCESS_KEY = "dfdsfregrgrtgthtrhrththt";
    vars.AWS_ACCESS_KEY_ID = "dfdsfregrgrtgthtrhrththt";
    vars.AWS_SECRET_ACCESS_KEY = "dfdsfregrgrtgthtrhrththt";
  }
  catch (e) {
    console.log(e);
    throw e;
  }
}

//installWallet
async function installWallet(envVars: EnvVars): Promise<boolean> {
  try {
    checkInputs(envVars);
    console.log('envVars bootstrapCdk: ', envVars);
    setCredentials(envVars.AWS_ACCESS_KEY_ID, envVars.AWS_SECRET_ACCESS_KEY);
    await bootstrapCdk(envVars);
    console.log('envVars createCdkStack: ', envVars);
    await createCdkStack(envVars);

    return true;
  } catch (error) {
    debugger;
    console.log('installWallet error: ', error);
    return false;
  }
}
contextBridge.exposeInMainWorld('installWallet', async (envVars: EnvVars): Promise<boolean> => await installWallet(envVars));

function openInBrowser(url: string) {
  require('electron').shell.openExternal(url);
}
contextBridge.exposeInMainWorld('openInBrowser', (url: string) => openInBrowser(url));


function checkInputs(envVars: { REGION: string; EMAIL: string; AWS_ACCESS_KEY_ID: string; AWS_SECRET_ACCESS_KEY: string; }) {
  if (!envVars.REGION) {
    throw new Error('REGION is required');
  }
  if (!envVars.EMAIL) {
    throw new Error('EMAIL is required');
  }
  if (!envVars.AWS_ACCESS_KEY_ID) {
    throw new Error('AWS_ACCESS_KEY_ID is required');
  }
  if (!envVars.AWS_SECRET_ACCESS_KEY) {
    throw new Error('AWS_SECRET_ACCESS_KEY is required');
  }
}
