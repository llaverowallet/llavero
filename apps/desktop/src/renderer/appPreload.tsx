import * as sdk from 'aws-sdk';
import { contextBridge, ipcRenderer } from 'electron';
import { STSClient, GetCallerIdentityCommand } from '@aws-sdk/client-sts';
import { EC2Client, DescribeRegionsCommand } from '@aws-sdk/client-ec2';
import { DescribeStackEventsCommand, CloudFormationClient, DescribeStacksCommand } from '@aws-sdk/client-cloudformation';
import { Bootstrapper } from 'aws-cdk/lib/api/bootstrap';
import { SdkProvider } from 'aws-cdk/lib/api/aws-auth';
import path from 'path';
import { executeCommand } from './runCommand';
import { hostname } from 'os';
import crypto from 'crypto';
import { env } from 'process';
// import { User } from 'aws-cdk-lib/aws-iam';
const fsExtra = require('fs-extra');  

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
  sdk.config.update({ accessKeyId, secretAccessKey });
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
    const sdkProvider = await SdkProvider.withAwsCliCompatibleDefaults({});
    const template = nodeModulesPath + '/aws-cdk/lib/api/bootstrap/bootstrap-template.yaml';
    console.log('template: ', template);
    const bootstrapper = new Bootstrapper({ 'source': 'custom', templateFile: template });
    const result = await bootstrapper.bootstrapEnvironment({ name: 'llavero-bootstrap', account, region }, sdkProvider);
    console.log('bootstrapCdk result: ', result);
    return result;
  } catch (error) {
    console.log('bootstrapCdk error: ', error);
  }
  return false;
}
contextBridge.exposeInMainWorld('bootstrapCdk', (account: string, region: string) => bootstrapCdk(account, region));

//installWallet
async function installWallet(email: string, region: string): Promise<string> {
  try {
    const suffix = getDeterministicRandomString();
    const envVars = {
      REGION: region,
      EMAIL: email,
      AWS_ACCESS_KEY_ID: process.env['AWS_ACCESS_KEY_ID'],
      AWS_SECRET_ACCESS_KEY: process.env['AWS_SECRET_ACCESS_KEY'],
      COGNITO_URL_SUFFIX: suffix,
      APP_PATH: await ipcRenderer.invoke('userDataPath'),
      APP_WALLET: ""
    };
    envVars.APP_WALLET = path.join(envVars.APP_PATH, '/wallet');
    checkInputs(envVars);
    
    const assetsWalletPath = path.join(process.resourcesPath, '/.wallet');
    console.log('assetsWalletPath: ', assetsWalletPath);
    console.log("envVars", envVars);
    await executeCommand("ls", ["-a"], assetsWalletPath, (data: unknown) => { console.log(data) });
    await executeCommand("ls", ["-a"], envVars.APP_PATH, (data: unknown) => { console.log(data) });
    fsExtra.copySync(assetsWalletPath, envVars.APP_WALLET);
    await executeCommand("npm", ["install"], envVars.APP_WALLET, (data: unknown) => { console.log(data) });
    let siteUrl = "";

    await executeCommand("npm", ["run", "deploy"],  envVars.APP_WALLET, (data: unknown) => {
      const log = data.toString();
      const start = log.indexOf("https://");
      const end = log.indexOf("cloudfront.net");
      const url = log.substring(start, end + "cloudfront.net".length);
      if (url.startsWith("https://") && url.endsWith("cloudfront.net")) {
        console.log("url: " + url);
        siteUrl = url;
      }
      console.log(data);
    }, envVars);
    return siteUrl;
  } catch (error) {
    debugger;
    console.log('installWallet error: ', error);
  }
}
contextBridge.exposeInMainWorld('installWallet', async (email: string, region: string): Promise<string> => await installWallet(email, region));

function openInBrowser(url: string) {
  require('electron').shell.openExternal(url);
}
contextBridge.exposeInMainWorld('openInBrowser', (url: string) => openInBrowser(url));


function getDeterministicRandomString(max = 5): string {
  // Use the machine's hostname as a seed
  const seedString = hostname();

  // Create a deterministic hash from the seed
  const hash = crypto.createHmac('sha256', seedString)
    .update('deterministicSalt')
    .digest('hex');

  return hash.substring(0, max).replace("0x", "");
}

function checkInputs(envVars: { REGION: string; EMAIL: string; AWS_ACCESS_KEY_ID: string; AWS_SECRET_ACCESS_KEY: string; COGNITO_URL_SUFFIX: string; }) {
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
  if (!envVars.COGNITO_URL_SUFFIX) {
    throw new Error('COGNITO_URL_SUFFIX is required');
  }
}
