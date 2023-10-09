import { SSTConfig } from "sst";
import { Config, Script, Table } from "sst/constructs";
import { NextjsSite } from "sst/constructs";
import createKeys from "./sst/key-builder";
import createLogGroup from "./sst/cloudwatch-construct";
import { LOG_GROUP_NAME } from "@/utils/constants";
import "./repositories/user-table-init";
import { PolicyStatement, Effect } from "aws-cdk-lib/aws-iam";


export default {
  config(_input) {
    return {
      name: "web",
      region: "us-east-1",
    };
  },
  stacks(app,) {
    let userTable: any;
    app.stack(function CloudWallet({ stack }) {

      const keys = createKeys(stack);
      const logGroup = createLogGroup(stack, LOG_GROUP_NAME + "ID", { name: LOG_GROUP_NAME });
      const PARAM1 = new Config.Parameter(stack, 'KEY_1', {
        value: keys[0].keyArn,
      });

      userTable = new Table(stack, "UserData", {

        fields: {
          username: "string",
        },
        primaryIndex: { partitionKey: "username", sortKey: "" },
      });

      const site = new NextjsSite(stack, "CloudWallet", {
        bind: [PARAM1, logGroup, userTable, ...keys],
        environment: {
          DATA_TEST: "hola",
          "LOG_GROUP_NAME": logGroup.name,
        }
      });

      /*  
      site.attachPermissions([
         new iam.PolicyStatement({
           actions: ["kms:ListAliases"],
           effect: iam.Effect.ALLOW,
           resources: ["*"],
         })]); 
       */

      const script = new Script(stack, "AfterDeploy", {
        onCreate: "repositories/user-table-init.main",
        params: {
          tableName: userTable.tableName
        },
      });
      script.bind([userTable]);
      script.attachPermissions([
        new PolicyStatement({
          actions: ["dynamodb:UpdateTable"],
          effect: Effect.ALLOW,
          resources: [userTable.tableArn],
        }),
      ]);

      stack.addOutputs({
        SiteUrl: site.url,
      });

    });
    // {
    //   actions: ["dynamodb:UpdateTable"],
    //   resources: [userTable.tableArn],
    // }
    // app.stack(function UserTableCreate({ stack }) { 
    //   const la = new Script(stack, "AfterDeploy", {  
    //     onCreate: "repositories/user-table-init.main",
    //     params: {
    //       tableName: userTable.tableName
    //     },
    //   }); 
    //   la.bind([userTable]);
    //   la.attachPermissions([
    //     [userTable, "dynamodb:UpdateTable"],
    //   ]);
    // });
  },
} satisfies SSTConfig;

