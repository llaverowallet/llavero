import { SSTConfig } from "sst";
import { Cognito, Config, Script, Table, NextjsSite } from "sst/constructs";
import createKeys from "./sst/key-builder";
import createLogGroup, { LogGroupSST } from "./sst/cloudwatch-construct";
import { LOG_GROUP_NAME } from "@/utils/constants";
//import "./repositories/user-table-init";
import { PolicyStatement, Effect } from "aws-cdk-lib/aws-iam";
import { KMS } from "./sst/kms-construct";
import { AccountRecovery, OAuthScope } from "aws-cdk-lib/aws-cognito";
import { RemovalPolicy } from "aws-cdk-lib";
import { check } from "@/utils/general";


const config = {
   username: check<string>(process.env.USERNAME),
    password: check<string>(process.env.PASSWORD)
}

export default {
  config(_input) {
    return {
      name: "web",
      region: "us-east-1",
    };
  },
  stacks(app,) {
    let userTable: Table;
    let logGroup: LogGroupSST;
    let keys: Array<KMS>;
    let auth: Cognito;
    app.stack(function Llavero({ stack }) {

      keys = createKeys(stack);
      logGroup = createLogGroup(stack, LOG_GROUP_NAME + "ID", { name: LOG_GROUP_NAME });
      // const PARAM1 = new Config.Parameter(stack, 'KEY_1', {
      //   value: "empty",
      // });

      userTable = new Table(stack, "UserData", {
        fields: {
          pk: "string",
          sk: "string",
        },
        primaryIndex: { partitionKey: "pk", sortKey: "sk" },
      });

      auth = new Cognito(stack, "LlaveroPool", {
        login: ["email", "username", "preferredUsername", "phone"],
        cdk: {
          userPool: {
            userPoolName: "LlaveroUserPool",
            selfSignUpEnabled: true,
            autoVerify: { email: true, phone: true },
            signInAliases: { email: true, phone: true },
            accountRecovery: AccountRecovery.PHONE_AND_EMAIL,
            removalPolicy: RemovalPolicy.DESTROY,
          },
          userPoolClient: {
            generateSecret: true,
            authFlows: {
              userPassword: true,
            },
            oAuth: {
              callbackUrls: ["http://localhost:3000/api/auth/callback/cognito"],
              scopes:  [OAuthScope.EMAIL, OAuthScope.OPENID, OAuthScope.PHONE]//["openid", "profile", "email", "phone", "aws.cognito.signin.user.admin"],
            }
          },
        }
      });

      auth.cdk.userPool.addDomain("LlaveroDomain", {
        cognitoDomain: {
          domainPrefix: "llavero", //TODO: get from config
        },
      });

      const site = new NextjsSite(stack, "Llavero", {
        bind: [logGroup, userTable, auth, ...keys],
        environment: {
          DATA_TEST: "hola",
          "LOG_GROUP_NAME": logGroup.name,
          "USER_TABLE_NAME": userTable.tableName,
          "USER_POOL_ID": auth.userPoolId,
          "USER_POOL_CLIENT_ID": auth.userPoolClientId,
          "COGNITO_POOL_ID": auth.cognitoIdentityPoolId ?? "empty",
          "POOL_SECRET": auth.cdk.userPoolClient.userPoolClientSecret.toString() ?? "empty",
          "NEXTAUTH_URL": "http://localhost:3000/api/auth", //TODO ponerlo en parameters y levantarlo  al inicio de next
        }
      });

      stack.addOutputs({
        SiteUrl: site.url,
        UserPoolId: auth.userPoolId,
        UserPoolClientId: auth.cognitoIdentityPoolId,
        CognitoPoolId: auth.cognitoIdentityPoolId ?? "empty",
      });
    });

    app.stack(function UserTableInit({ stack }) {
      //TODO: delete this stack after a correct deploy. npx sst remove $STACK_NAME, and after it deploy again, to delete the resources in AWS
      const script = new Script(stack, "AfterDeploy", {
        onCreate: "src/repositories/user-table-init.main",
        params: {
          tableName: userTable.tableName,
          keys: keys.map(k => ({ keyArn: k.keyArn })),
          cognitoPoolId: auth.userPoolId,
          config: config
        },
      });
      script.bind([userTable, logGroup, auth]);
      script.attachPermissions([
        new PolicyStatement({
          actions: ["dynamodb:*"],
          effect: Effect.ALLOW,
          resources: [userTable.tableArn],
        }),
        new PolicyStatement({
          actions: ["cognito-idp:*"],
          effect: Effect.ALLOW,
          resources: [auth.userPoolArn],
        }),
      ]);
    });
  },
} satisfies SSTConfig;
