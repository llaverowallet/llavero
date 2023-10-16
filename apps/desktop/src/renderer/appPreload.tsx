import * as cdk from 'aws-cdk-lib';
import * as sdk from 'aws-sdk';
import { contextBridge } from 'electron';
import { STSClient, GetCallerIdentityCommand } from '@aws-sdk/client-sts';
import { env } from 'process';


console.log('Preload execution started');
// Get versions
window.addEventListener('DOMContentLoaded', () => {
  const app = document.getElementById('app');
  const { env } = process;
  const versions: Record<string, unknown> = {};

  // ERWT Package version
  versions['erwt'] = env['npm_package_version'];
  versions['license'] = env['npm_package_license'];

  // Process versions
  for (const type of ['chrome', 'node', 'electron']) {
    versions[type] = process.versions[type];
  }

  // NPM deps versions
  for (const type of ['react']) {
    const v = env['npm_package_dependencies_' + type];
    if (v) versions[type] = v.replace('^', '+');
  }

  // NPM @dev deps versions
  for (const type of ['webpack', 'typescript']) {
    const v = env['npm_package_devDependencies_' + type];
    if (v) versions[type] = v.replace('^', '+');
  }

  // Set versions to app data
  app.setAttribute('data-versions', JSON.stringify(versions));
});


const REGION = process.env.AWS_DEFAULT_REGION || 'us-east-1';
sdk.config.update({ region: REGION });

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


  const stsClient = new STSClient({ region: 'us-east-1' });

  // Call the getCallerIdentity method
  const command = new GetCallerIdentityCommand( { });
  const response = await stsClient.send(command);

  envVars.AWS_ACCOUNT_ID = process.env.CDK_DEFAULT_ACCOUNT = response.Account;
  const identityArn = response.Arn.split(':');
  envVars.IDENTITY = identityArn.pop();
  envVars.AWsUserId = response.UserId;
  return envVars;
}

contextBridge.exposeInMainWorld('setCredentials', (accessKeyId: string, secretAccessKey: string) => setCredentials(accessKeyId, secretAccessKey))

