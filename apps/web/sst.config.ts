import { SSTConfig } from "sst";
import { Config, Script, Table } from "sst/constructs";
import { NextjsSite } from "sst/constructs";
import createKeys from "./sst/key-builder";
import createLogGroup, { LogGroupSST } from "./sst/cloudwatch-construct";
import { LOG_GROUP_NAME } from "@/utils/constants";
//import "./repositories/user-table-init";
import { PolicyStatement, Effect } from "aws-cdk-lib/aws-iam";
import { KMS } from "./sst/kms-construct";


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
    app.stack(function CloudWallet({ stack }) {

      keys = createKeys(stack);
      logGroup = createLogGroup(stack, LOG_GROUP_NAME + "ID", { name: LOG_GROUP_NAME });
      const PARAM1 = new Config.Parameter(stack, 'KEY_1', {
        value: keys[0].keyArn,
      });

      userTable = new Table(stack, "UserData", {
        fields: {
         pk: "string",
         sk: "string",
        },
        primaryIndex: { partitionKey: "pk", sortKey: "sk" },
      });

      const site = new NextjsSite(stack, "CloudWallet", {
        bind: [PARAM1, logGroup, userTable, ...keys],
        environment: {
          DATA_TEST: "hola",
          "LOG_GROUP_NAME": logGroup.name,
          "USER_TABLE_NAME": userTable.tableName,
        }
      });

      stack.addOutputs({
        SiteUrl: site.url,
      });
    });

    app.stack(function UserTableInit({ stack }) {
      //TODO: delete this stack after a correct deploy. npx sst remove $STACK_NAME, and after it deploy again, to delete the resources in AWS
      const script = new Script(stack, "AfterDeploy", {
        onCreate: "src/repositories/user-table-init.main",
        params: {
          tableName: userTable.tableName,
          keys: keys.map(k => ({ keyArn: k.keyArn })),
        },
      });
      script.bind([userTable, logGroup]);
      script.attachPermissions([
        new PolicyStatement({
          actions: ["dynamodb:*"],
          effect: Effect.ALLOW,
          resources: [userTable.tableArn],
        }),
      ]);
    });
  },
} satisfies SSTConfig;

