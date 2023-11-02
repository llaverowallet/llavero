import { LOG_GROUP_NAME } from '@/shared/utils/constants';
import { SSTConfig } from 'sst';
import { Cognito, Config, NextjsSite, Script, Table, StackContext } from 'sst/constructs';
import createLogGroup, { LogGroupSST } from './sst/cloudwatch-construct';
import createKeys from './sst/key-builder';
import { check } from '@/shared/utils/general';
import { Duration, RemovalPolicy } from 'aws-cdk-lib';
import { AccountRecovery, Mfa, OAuthScope } from 'aws-cdk-lib/aws-cognito';
import { Effect, PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { KMS } from './sst/kms-construct';
import crypto from 'crypto';
import { getParameterPath } from 'sst/constructs/util/functionBinding.js';

process.setMaxListeners(Infinity);
const localhostUrl = 'http://localhost:3000';

const installationConfig = {
  email: check<string>(process.env.EMAIL),
  phoneNumber: process.env.PHONE_NUMBER,
  region: check<string>(process.env.REGION),
  cognitoURLSuffix: process.env.COGNITO_URL_SUFFIX ?? '',
};

export default {
  config(_input) {
    return {
      name: 'web',
      region: installationConfig.region,
    };
  },
  stacks(app) {
    app.stack(llaveroStack);
    app.stack(initLlavero);
  },
} satisfies SSTConfig;

let userTable: Table;
let logGroup: LogGroupSST;
let keys: Array<KMS>;
let auth: Cognito;
let site: NextjsSite;
let SITE_URL: Config.Parameter;

export function llaveroStack({ stack, app }: StackContext) {
  keys = createKeys(stack);
  logGroup = createLogGroup(stack, LOG_GROUP_NAME + 'ID', { name: LOG_GROUP_NAME });

  userTable = new Table(stack, 'UserData', {
    cdk: {
      table: {
        removalPolicy: RemovalPolicy.DESTROY, //TODO think this could be SNAPSHOT
      },
    },
    fields: {
      pk: 'string',
      sk: 'string',
    },
    primaryIndex: { partitionKey: 'pk', sortKey: 'sk' },
  });

  auth = new Cognito(stack, 'LlaveroPool', {
    login: ['email', 'username', 'preferredUsername', 'phone'],
    cdk: {
      userPool: {
        selfSignUpEnabled: false,
        signInAliases: { email: true },
        accountRecovery: AccountRecovery.EMAIL_ONLY,
        removalPolicy: RemovalPolicy.DESTROY,
        mfa: Mfa.OPTIONAL,
        mfaSecondFactor: { otp: true, sms: true },
        standardAttributes: {
          email: { required: true, mutable: true },
          phoneNumber: { required: true, mutable: true },
        },
        passwordPolicy: {
          minLength: 8,
          requireDigits: true,
          requireLowercase: true,
          requireSymbols: true,
          requireUppercase: true,
          tempPasswordValidity: Duration.days(3),
        },
      },
      userPoolClient: {
        generateSecret: true,
        authFlows: {
          userPassword: true,
        },
        oAuth: {
          callbackUrls: [localhostUrl + '/api/auth/callback/cognito'],
          scopes: [OAuthScope.EMAIL, OAuthScope.OPENID], //["openid", "profile", "email", "phone", "aws.cognito.signin.user.admin"],
        },
      },
    },
  });

  auth.cdk.userPool.addDomain('LlaveroDomain', {
    cognitoDomain: {
      domainPrefix: 'llavero-' + installationConfig.cognitoURLSuffix + app.stage, //TODO config input, should be saved or query
    },
  });

  SITE_URL = new Config.Parameter(stack, 'LLAVERO_URL', {
    value: 'emptyyyy',
  });

  site = new NextjsSite(stack, 'Llavero', {
    bind: [logGroup, userTable, auth, SITE_URL, ...keys],
    environment: {
      LOG_GROUP_NAME: logGroup.name,
      USER_TABLE_NAME: userTable.tableName,
      USER_POOL_ID: auth.userPoolId,
      USER_POOL_CLIENT_ID: auth.userPoolClientId,
      COGNITO_POOL_ID: auth.cognitoIdentityPoolId ?? 'empty',
      POOL_SECRET: auth.cdk.userPoolClient.userPoolClientSecret.toString() ?? 'empty',
      NEXTAUTH_SECRET: randomString(16), //TODO config input, should be saved or query
      SITEURL_PARAM_NAME: getParameterPath(SITE_URL, 'value'), //TODO horrible workaround. I should be able to set the variable on the env directly
      REGION: installationConfig.region,
    },
  });

  //TODO horrible workaround. this is beacuse I can't set enviroment variables of NextjsSite directly and because I cant get the site url before
  const arnParameter = `arn:aws:ssm:${app.region}:${app.account}:parameter${getParameterPath(
    SITE_URL,
    'value',
  )}`;
  site.attachPermissions([
    new PolicyStatement({
      actions: ['ssm:GetParameter'],
      effect: Effect.ALLOW,
      resources: [arnParameter],
    }),
    new PolicyStatement({
      actions: ['cognito-idp:UpdateUserPoolClient'],
      effect: Effect.ALLOW,
      resources: [auth.userPoolArn],
    }),
  ]);

  stack.addOutputs({
    SiteUrl: site.url,
    UserPoolId: auth.userPoolId,
    UserPoolClientId: auth.userPoolClientId,
    CognitoPoolId: auth.cognitoIdentityPoolId ?? 'empty',
    cognitoUserPoolArn: auth.userPoolArn,
  });
}

export function initLlavero({ stack, app }: StackContext) {
  const arnParameter = `arn:aws:ssm:${app.region}:${app.account}:parameter${getParameterPath(SITE_URL, "value")}`;
  const basePath = process.cwd() + "/";
  const script = new Script(stack, "AfterDeploy", {
    onCreate: basePath + "src/repositories/user-table-init.main",
    params: {
      tableName: userTable.tableName,
      keys: keys.map((k) => ({ keyArn: k.keyArn })),
      cognitoPoolId: auth.userPoolId,
      UserPoolClientId: auth.userPoolClientId,
      config: installationConfig,
      arnSiteParameter: getParameterPath(SITE_URL, 'value'),
      siteUrl: site.url ?? localhostUrl,
    },
  });
  script.bind([userTable, logGroup, auth, SITE_URL, ...keys]);
  script.attachPermissions([
    new PolicyStatement({
      actions: ['dynamodb:*'],
      effect: Effect.ALLOW,
      resources: [userTable.tableArn],
    }),
    new PolicyStatement({
      actions: ['cognito-idp:*'],
      effect: Effect.ALLOW,
      resources: [auth.userPoolArn],
    }),
    new PolicyStatement({
      actions: ['ssm:PutParameter'],
      effect: Effect.ALLOW,
      resources: [arnParameter],
    }),
  ]);
}

function randomString(length: number, justChars = false): string {
  let chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  if (!justChars) chars = chars + 'ABCDEFGHIJKLMNOPQRSTUVWXYZ!@#$%^&*()_+~`|}{[]:;?><,./-=';
  const charsLength = chars.length;
  let password = '';

  for (let i = 0; i < length; i++) {
    const randomIndex = crypto.randomInt(0, charsLength);
    password += chars[randomIndex];
  }

  return password;
}
