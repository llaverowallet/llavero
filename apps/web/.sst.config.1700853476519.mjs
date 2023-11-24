import { createRequire as topLevelCreateRequire } from 'module';const require = topLevelCreateRequire(import.meta.url);
var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// src/shared/utils/constants.ts
var LOG_GROUP_NAME = "CloudWalletLogs";

// sst.config.ts
import { Cognito, Config, NextjsSite, Script, Table } from "sst/constructs";

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
function createName(stack, name) {
  return stack.stage != "prod" ? stack.stage + "-" + name : name;
}
__name(createName, "createName");
var LogGroupSST = class extends Construct {
  constructor(scope, id, props) {
    super(scope, id + "sst");
    this.id = id + "sst";
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
      description: props.description
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
function createKeys(stack) {
  const keys2 = [{ description: "description1" }, { description: "description2" }, { description: "description3" }];
  const keysResult = new Array();
  keys2.forEach((keyProps, index) => {
    const key = new KMS(stack, aliasName(stack, index), {
      alias: aliasName(stack, index),
      description: "description"
    });
    keysResult.push(key);
  });
  return keysResult;
}
__name(createKeys, "createKeys");
function aliasName(stack, index) {
  return stack.stage != "prod" ? "CloudKey" + stack.stage + index : "CloudKey" + index;
}
__name(aliasName, "aliasName");

// src/shared/utils/general.ts
function check(value) {
  if (value === void 0 || value === null || value === "") {
    throw new Error("Required Value");
  }
  return value;
}
__name(check, "check");

// sst.config.ts
import { Duration, RemovalPolicy as RemovalPolicy3 } from "aws-cdk-lib";
import { AccountRecovery, Mfa, OAuthScope } from "aws-cdk-lib/aws-cognito";
import { Effect, PolicyStatement } from "aws-cdk-lib/aws-iam";
import crypto from "crypto";
import { getParameterPath } from "sst/constructs/util/functionBinding.js";
process.setMaxListeners(Infinity);
var localhostUrl = "http://localhost:3000";
var installationConfig = {
  email: check(process.env.EMAIL),
  phoneNumber: process.env.PHONE_NUMBER,
  region: check(process.env.REGION),
  cognitoURLSuffix: process.env.COGNITO_URL_SUFFIX ?? ""
};
var sst_config_default = {
  config(_input) {
    return {
      name: "web",
      region: installationConfig.region
    };
  }
};
var userTable;
var logGroup2;
var keys;
var auth;
var site;
var SITE_URL;
function llaveroStack({
  stack,
  app
}) {
  keys = createKeys(stack);
  logGroup2 = createLogGroup(stack, LOG_GROUP_NAME + "ID", {
    name: LOG_GROUP_NAME
  });
  userTable = new Table(stack, "UserData", {
    cdk: {
      table: {
        removalPolicy: RemovalPolicy3.DESTROY
        //TODO think this could be SNAPSHOT
      }
    },
    fields: {
      pk: "string",
      sk: "string"
    },
    primaryIndex: {
      partitionKey: "pk",
      sortKey: "sk"
    }
  });
  auth = new Cognito(stack, "LlaveroPool", {
    login: ["email", "username", "preferredUsername", "phone"],
    cdk: {
      userPool: {
        selfSignUpEnabled: false,
        signInAliases: {
          email: true
        },
        accountRecovery: AccountRecovery.EMAIL_ONLY,
        removalPolicy: RemovalPolicy3.DESTROY,
        mfa: Mfa.OPTIONAL,
        mfaSecondFactor: {
          otp: true,
          sms: true
        },
        standardAttributes: {
          email: {
            required: true,
            mutable: true
          },
          phoneNumber: {
            required: true,
            mutable: true
          }
        },
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
          userPassword: true
        },
        oAuth: {
          callbackUrls: [localhostUrl + "/api/auth/callback/cognito"],
          scopes: [OAuthScope.EMAIL, OAuthScope.OPENID]
          //["openid", "profile", "email", "phone", "aws.cognito.signin.user.admin"],
        }
      }
    }
  });
  auth.cdk.userPool.addDomain("LlaveroDomain", {
    cognitoDomain: {
      domainPrefix: "llavero-" + installationConfig.cognitoURLSuffix + app.stage
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
      REGION: installationConfig.region
    }
  });
  const arnParameter = `arn:aws:ssm:${app.region}:${app.account}:parameter${getParameterPath(SITE_URL, "value")}`;
  site.attachPermissions([new PolicyStatement({
    actions: ["ssm:GetParameter"],
    effect: Effect.ALLOW,
    resources: [arnParameter]
  }), new PolicyStatement({
    actions: ["cognito-idp:UpdateUserPoolClient"],
    effect: Effect.ALLOW,
    resources: [auth.userPoolArn]
  })]);
  stack.addOutputs({
    SiteUrl: site.url,
    UserPoolId: auth.userPoolId,
    UserPoolClientId: auth.userPoolClientId,
    CognitoPoolId: auth.cognitoIdentityPoolId ?? "empty",
    cognitoUserPoolArn: auth.userPoolArn
  });
}
__name(llaveroStack, "llaveroStack");
function initLlavero({
  stack,
  app
}) {
  const arnParameter = `arn:aws:ssm:${app.region}:${app.account}:parameter${getParameterPath(SITE_URL, "value")}`;
  const basePath = process.cwd() + "/";
  const script = new Script(stack, "AfterDeploy", {
    onCreate: basePath + "src/repositories/user-table-init.main",
    params: {
      tableName: userTable.tableName,
      keys: keys.map((k) => ({
        keyArn: k.keyArn
      })),
      cognitoPoolId: auth.userPoolId,
      UserPoolClientId: auth.userPoolClientId,
      config: installationConfig,
      arnSiteParameter: getParameterPath(SITE_URL, "value"),
      siteUrl: site.url ?? localhostUrl
    }
  });
  script.bind([userTable, logGroup2, auth, SITE_URL, ...keys]);
  script.attachPermissions([new PolicyStatement({
    actions: ["dynamodb:*"],
    effect: Effect.ALLOW,
    resources: [userTable.tableArn]
  }), new PolicyStatement({
    actions: ["cognito-idp:*"],
    effect: Effect.ALLOW,
    resources: [auth.userPoolArn]
  }), new PolicyStatement({
    actions: ["ssm:PutParameter"],
    effect: Effect.ALLOW,
    resources: [arnParameter]
  })]);
}
__name(initLlavero, "initLlavero");
function randomString(length, justChars = false) {
  let chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  if (!justChars)
    chars = chars + "ABCDEFGHIJKLMNOPQRSTUVWXYZ!@#$%^&*()_+~`|}{[]:;?><,./-=";
  const charsLength = chars.length;
  let password = "";
  for (let i = 0; i < length; i++) {
    const randomIndex = crypto.randomInt(0, charsLength);
    password += chars[randomIndex];
  }
  return password;
}
__name(randomString, "randomString");
export {
  sst_config_default as default,
  initLlavero,
  llaveroStack
};
