import * as cdk from 'aws-cdk-lib';
import * as sdk from 'aws-sdk';
import * as cxapi from 'aws-cdk-lib/cx-api';
import { contextBridge } from 'electron';
import { STSClient, GetCallerIdentityCommand } from '@aws-sdk/client-sts';
import { EC2Client, DescribeRegionsCommand } from '@aws-sdk/client-ec2';
import { DescribeStackEventsCommand, CloudFormationClient, DescribeStacksCommand } from '@aws-sdk/client-cloudformation';
import { Bootstrapper } from 'aws-cdk/lib/api/bootstrap';
import { SdkProvider } from 'aws-cdk/lib/api/aws-auth';
import path from 'path';

const nodeModulesPath = path.join(process.cwd(), 'node_modules');
console.log(nodeModulesPath);

// import * as fs from 'fs';
// import * as path from 'path';
// import { rootPath } from 'electron-root-path';


// console.log('Preload execution started');
// // Get versions
// window.addEventListener('DOMContentLoaded', () => {
//   const app = document.getElementById('app');
//   const { env } = process;
//   const versions: Record<string, unknown> = {};

//   // ERWT Package version
//   versions['erwt'] = env['npm_package_version'];
//   versions['license'] = env['npm_package_license'];

//   // Process versions
//   for (const type of ['chrome', 'node', 'electron']) {
//     versions[type] = process.versions[type];
//   }

//   // NPM deps versions
//   for (const type of ['react']) {
//     const v = env['npm_package_dependencies_' + type];
//     if (v) versions[type] = v.replace('^', '+');
//   }

//   // NPM @dev deps versions
//   for (const type of ['webpack', 'typescript']) {
//     const v = env['npm_package_devDependencies_' + type];
//     if (v) versions[type] = v.replace('^', '+');
//   }

//   // Set versions to app data
//   app.setAttribute('data-versions', JSON.stringify(versions));
// });

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
}
const setCredentials = async (accessKeyId: string, secretAccessKey: string) => {
  if (!accessKeyId || !secretAccessKey) {
    throw new Error('Access Key ID and Secret Access Key are required');
  }

  const envVars: EnvVars = {
    AWS_ACCESS_KEY_ID: accessKeyId,
    AWS_SECRET_ACCESS_KEY: secretAccessKey.split('').map(() => "*").join('')
  }
  process.env['AWS_ACCESS_KEY_ID'] = accessKeyId;
  process.env['AWS_SECRET_ACCESS_KEY'] = secretAccessKey;


  const stsClient = new STSClient({});

  // Call the getCallerIdentity method
  const command = new GetCallerIdentityCommand({});
  const response = await stsClient.send(command);

  envVars.AWS_ACCOUNT_ID = process.env.CDK_DEFAULT_ACCOUNT = response.Account;
  const identityArn = response.Arn.split(':');
  envVars.IDENTITY = identityArn.pop();
  envVars.AWsUserId = response.UserId;
  return envVars;
};
contextBridge.exposeInMainWorld('setCredentials', (accessKeyId: string, secretAccessKey: string) => setCredentials(accessKeyId, secretAccessKey));

//getAllRegions
async function getAllRegions() {
  // Create an EC2 client
  const ec2Client = new EC2Client({});

  // Call the DescribeRegions method
  const command = new DescribeRegionsCommand({});
  const response = await ec2Client.send(command);

  // Extract the region names from the response
  const regionNames = response.Regions?.map((region) => region.RegionName) ?? [];
  return regionNames;
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
async function bootstrapCdk(account: string, region: string) {

  try {
    console.log(`Running bootstrapCdk for aws://${account}/${region}`);
    console.log('process.env.AWS_PROFILE: ', process.env.AWS_PROFILE);
    const sdkProvider = await SdkProvider.withAwsCliCompatibleDefaults({
      profile: process.env.AWS_PROFILE,
    });
    const template = nodeModulesPath + '/aws-cdk/lib/api/bootstrap/bootstrap-template.yaml';
    console.log('template: ', template);
    const bootstrapper = new Bootstrapper({ 'source': 'custom', templateFile: template });
    const result = await bootstrapper.bootstrapEnvironment({ name: 'llavero-bootstrap', account, region }, sdkProvider);
    console.log('bootstrapCdk result: ', result);
    return result;
  } catch (error) {
    console.log('bootstrapCdk error: ', error);
  }
}

contextBridge.exposeInMainWorld('bootstrapCdk', (account: string, region: string) => bootstrapCdk(account, region));




