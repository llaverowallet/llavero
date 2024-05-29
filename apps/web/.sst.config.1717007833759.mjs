import { createRequire as topLevelCreateRequire } from 'module';const require = topLevelCreateRequire(import.meta.url);
var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// src/shared/utils/constants.ts
var LOG_GROUP_NAME = "CloudWalletLogs";

// sst.config.ts
import {
  Cognito,
  Config,
  NextjsSite,
  Script,
  Table,
  dependsOn
} from "sst/constructs";

// sst/cloudwatch-construct.ts
import * as logs from "aws-cdk-lib/aws-logs";
import { Construct } from "constructs";
import { RemovalPolicy } from "aws-cdk-lib";
var logGroup = void 0;
function createLogGroup(stack, id, props) {
  if (logGroup)
    return logGroup;
  logGroup = new LogGroupSST(stack, id, {
    name: createName(stack, props.name)
  });
  return logGroup;
}
__name(createLogGroup, "createLogGroup");
function createName(stack, name2) {
  return stack.stage != "prod" ? `${stack.stage}-${name2}` : name2;
}
__name(createName, "createName");
var LogGroupSST = class extends Construct {
  constructor(scope, id, props) {
    super(scope, `${id}sst`);
    this.id = `${id}sst`;
    this.logGroup = new logs.LogGroup(scope, id, {
      logGroupName: props.name,
      retention: logs.RetentionDays.FIVE_DAYS,
      // TODO config
      removalPolicy: RemovalPolicy.DESTROY
    });
    this.name = props.name;
  }
  static {
    __name(this, "LogGroupSST");
  }
  get logGroupArn() {
    return this.logGroup.logGroupArn;
  }
  getConstructMetadata() {
    return {
      type: "logs",
      data: {
        logGroupArn: this.logGroup.logGroupArn
      }
    };
  }
  getFunctionBinding() {
    return {
      clientPackage: "logs",
      variables: {
        keyArn: {
          type: "plain",
          value: this.logGroup.logGroupArn
        }
      },
      permissions: {
        "logs:*": [this.logGroup.logGroupArn]
      }
    };
  }
};

// sst/kms-construct.ts
import * as cdk from "aws-cdk-lib";
import * as kms from "aws-cdk-lib/aws-kms";
import { Construct as Construct2 } from "constructs";
var KMS = class extends Construct2 {
  constructor(scope, id, props) {
    super(scope, id);
    this.kms = new kms.Key(this, id, {
      keySpec: kms.KeySpec.ECC_SECG_P256K1,
      keyUsage: kms.KeyUsage.SIGN_VERIFY,
      removalPolicy: cdk.RemovalPolicy.RETAIN_ON_UPDATE_OR_DELETE,
      alias: props.alias,
      description: props.description,
      enableKeyRotation: false
    });
    this.keyId = this.kms.keyId;
    this.id = id;
  }
  static {
    __name(this, "KMS");
  }
  get keyArn() {
    return this.kms.keyArn;
  }
  getConstructMetadata() {
    return {
      type: "kms",
      data: {
        keyArn: this.kms.keyArn
      }
    };
  }
  getFunctionBinding() {
    return {
      clientPackage: "kms",
      variables: {
        keyArn: {
          type: "plain",
          value: this.kms.keyArn
        }
      },
      permissions: {
        "kms:*": [this.kms.keyArn]
      }
    };
  }
};

// sst/key-builder.ts
function createKeys(stack, numberOfKeys) {
  const keys2 = [];
  for (let index = 1; index <= numberOfKeys; index++) {
    keys2.push({ description: `description${index}` });
  }
  const keysResult = new Array();
  keys2.forEach((keyProps, index) => {
    const key = new KMS(stack, aliasName(stack, index), {
      alias: aliasName(stack, index),
      description: keyProps.description
    });
    keysResult.push(key);
  });
  return keysResult;
}
__name(createKeys, "createKeys");
function aliasName(stack, index) {
  return stack.stage != "prod" ? `LlaveroKey${stack.stage}${index}` : `LlaveroKey${index}`;
}
__name(aliasName, "aliasName");

// src/shared/utils/general.ts
function check(value, varName = "not Defined") {
  const retValue = value;
  if (retValue === void 0 || retValue === null || retValue === "") {
    throw new Error(`Required Value is missing. VarName:${varName}`);
  }
  return retValue;
}
__name(check, "check");

// sst.config.ts
import { Duration, RemovalPolicy as RemovalPolicy3 } from "aws-cdk-lib";
import { AccountRecovery, AdvancedSecurityMode, Mfa, OAuthScope } from "aws-cdk-lib/aws-cognito";
import { Effect, PolicyStatement } from "aws-cdk-lib/aws-iam";
import crypto from "crypto";
import { getParameterPath } from "sst/constructs/util/functionBinding.js";
import { TableEncryption } from "aws-cdk-lib/aws-dynamodb";
import { customRandom } from "nanoid";
import seedrandom from "seedrandom";
process.setMaxListeners(Infinity);
var localhostUrl = "http://localhost:3000";
var installationConfig = {
  email: check(process.env.EMAIL, "EMAIL"),
  phoneNumber: process.env.PHONE_NUMBER,
  region: check(process.env.REGION, "REGION"),
  suffix: getDeterministicRandomString(
    check(process.env.EMAIL, "EMAIL") + check(process.env.REGION, "REGION")
  ),
  numberOfKeys: process.env.NUMBER_OF_KEYS ? parseInt(process.env.NUMBER_OF_KEYS, 10) : 1
};
var name = `llavero${installationConfig.suffix}`;
var sst_config_default = {
  // eslint-disable-next-line no-unused-vars
  config(_input) {
    return {
      name,
      region: installationConfig.region
    };
  },
  stacks(app) {
    app.stack(llaveroStack);
    app.stack(initLlavero);
  }
};
var userTable;
var logGroup2;
var keys;
var auth;
var site;
var SITE_URL;
function llaveroStack({ stack, app }) {
  keys = createKeys(stack, installationConfig.numberOfKeys);
  logGroup2 = createLogGroup(stack, `${LOG_GROUP_NAME}ID`, { name: LOG_GROUP_NAME });
  userTable = new Table(stack, "UserData", {
    cdk: {
      table: {
        removalPolicy: RemovalPolicy3.DESTROY,
        //TODO think this could be SNAPSHOT
        encryption: TableEncryption.AWS_MANAGED
      }
    },
    fields: {
      pk: "string",
      sk: "string"
    },
    primaryIndex: { partitionKey: "pk", sortKey: "sk" }
  });
  auth = new Cognito(stack, "LlaveroPool", {
    login: ["email", "username", "preferredUsername", "phone"],
    cdk: {
      userPool: {
        selfSignUpEnabled: false,
        signInAliases: { email: true },
        accountRecovery: AccountRecovery.EMAIL_ONLY,
        advancedSecurityMode: AdvancedSecurityMode.ENFORCED,
        removalPolicy: RemovalPolicy3.DESTROY,
        mfa: Mfa.OPTIONAL,
        mfaSecondFactor: { otp: true, sms: true },
        standardAttributes: {
          email: { required: true, mutable: true },
          phoneNumber: { required: true, mutable: true }
        },
        enableSmsRole: true,
        snsRegion: installationConfig.region,
        passwordPolicy: {
          minLength: 8,
          requireDigits: true,
          requireLowercase: true,
          requireSymbols: true,
          requireUppercase: true,
          tempPasswordValidity: Duration.days(3)
        }
      },
      userPoolClient: {
        generateSecret: true,
        authFlows: {
          userPassword: true,
          userSrp: true
        },
        oAuth: {
          callbackUrls: [`${localhostUrl}/api/auth/callback/cognito`],
          logoutUrls: [`${localhostUrl}/api/auth/signout`],
          scopes: [
            OAuthScope.EMAIL,
            OAuthScope.OPENID,
            OAuthScope.custom("aws.cognito.signin.user.admin"),
            OAuthScope.PROFILE
          ],
          //["openid", "profile", "email", "phone", "aws.cognito.signin.user.admin"],
          flows: {
            authorizationCodeGrant: true,
            implicitCodeGrant: true
          }
        }
      }
    }
  });
  auth.cdk.userPool.addDomain("LlaveroDomain", {
    cognitoDomain: {
      domainPrefix: name + app.stage
      //TODO config input, should be saved or query
    }
  });
  SITE_URL = new Config.Parameter(stack, "LLAVERO_URL", {
    value: "emptyyyy"
  });
  site = new NextjsSite(stack, "Llavero", {
    bind: [logGroup2, userTable, auth, SITE_URL, ...keys],
    environment: {
      LOG_GROUP_NAME: logGroup2.name,
      USER_TABLE_NAME: userTable.tableName,
      USER_POOL_ID: auth.userPoolId,
      USER_POOL_CLIENT_ID: auth.userPoolClientId,
      COGNITO_POOL_ID: auth.cognitoIdentityPoolId ?? "empty",
      POOL_SECRET: auth.cdk.userPoolClient.userPoolClientSecret.toString() ?? "empty",
      NEXTAUTH_SECRET: randomString(16),
      //TODO config input, should be saved or query
      SITEURL_PARAM_NAME: getParameterPath(SITE_URL, "value"),
      //TODO horrible workaround. I should be able to set the variable on the env directly
      REGION: installationConfig.region,
      NEXT_PUBLIC_REGION: installationConfig.region,
      NEXT_PUBLIC_USER_POOL_CLIENT_ID: auth.userPoolClientId,
      NEXT_PUBLIC_USER_POOL_ID: auth.userPoolId,
      NEXT_PUBLIC_COGNITO_POOL_ID: auth.cognitoIdentityPoolId ?? "empty"
    }
  });
  const arnParameter = `arn:aws:ssm:${app.region}:${app.account}:parameter${getParameterPath(
    SITE_URL,
    "value"
  )}`;
  site.attachPermissions([
    new PolicyStatement({
      actions: ["ssm:GetParameter"],
      effect: Effect.ALLOW,
      resources: [arnParameter]
    }),
    new PolicyStatement({
      actions: ["cognito-idp:UpdateUserPoolClient"],
      effect: Effect.ALLOW,
      resources: [auth.userPoolArn]
    }),
    new PolicyStatement({
      actions: [
        "sns:CreateSMSSandboxPhoneNumber",
        "sns:VerifySMSSandboxPhoneNumber",
        "sns:ListSMSSandboxPhoneNumbers",
        "sns:DeleteSMSSandboxPhoneNumber"
      ],
      effect: Effect.ALLOW,
      resources: ["*"]
    })
  ]);
  stack.addOutputs({
    finished: "true"
  });
}
__name(llaveroStack, "llaveroStack");
function initLlavero({ stack, app }) {
  const arnParameter = `arn:aws:ssm:${app.region}:${app.account}:parameter${getParameterPath(
    SITE_URL,
    "value"
  )}`;
  const basePath = `${process.cwd()}/`;
  dependsOn(llaveroStack);
  const script = new Script(stack, "AfterDeploy", {
    onCreate: `${basePath}src/repositories/user-table-init.main`,
    onUpdate: `${basePath}src/repositories/user-table-init.main`,
    params: {
      tableName: userTable.tableName,
      keys: keys.map((k) => ({ keyArn: k.keyArn })),
      cognitoPoolId: auth.userPoolId,
      UserPoolClientId: auth.userPoolClientId,
      config: installationConfig,
      arnSiteParameter: getParameterPath(SITE_URL, "value"),
      siteUrl: site.url ?? localhostUrl
    }
  });
  script.bind([userTable, logGroup2, auth, SITE_URL, ...keys]);
  script.attachPermissions([
    new PolicyStatement({
      actions: ["dynamodb:*"],
      effect: Effect.ALLOW,
      resources: [userTable.tableArn]
    }),
    new PolicyStatement({
      actions: ["cognito-idp:*"],
      effect: Effect.ALLOW,
      resources: [auth.userPoolArn]
    }),
    new PolicyStatement({
      actions: ["ssm:PutParameter"],
      effect: Effect.ALLOW,
      resources: [arnParameter]
    })
  ]);
}
__name(initLlavero, "initLlavero");
function randomString(length, justChars = false) {
  let chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  if (!justChars)
    chars = `${chars}ABCDEFGHIJKLMNOPQRSTUVWXYZ!@#$%^&*()_+~\`|}{[]:;?><,./-=`;
  const charsLength = chars.length;
  let password = "";
  for (let i = 0; i < length; i++) {
    const randomIndex = crypto.randomInt(0, charsLength);
    password += chars[randomIndex];
  }
  return password;
}
__name(randomString, "randomString");
function getDeterministicRandomString(seed, max = 5) {
  const rng = seedrandom(seed);
  const nanoid = customRandom("abcdefghijklmnopqrstuvwxyz0123456789", max, (size) => {
    return new Uint8Array(size).map(() => 256 * rng());
  });
  return nanoid();
}
__name(getDeterministicRandomString, "getDeterministicRandomString");
export {
  sst_config_default as default,
  initLlavero,
  llaveroStack
};
