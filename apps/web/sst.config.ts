import { SSTConfig } from "sst";
import { Config } from "sst/constructs";
import { NextjsSite } from "sst/constructs";
import createKeys from "./sst/key-builder";
import createLogGroup from "./sst/cloudwatch-construct";
import { LOG_GROUP_NAME } from "@/utils/constants";
//import * as iam from "aws-cdk-lib/aws-iam";


export default {
  config(_input) {
    return {
      name: "web",
      region: "us-east-1",
    };
  },
  stacks(app,) {
    app.stack(function CloudWallet({ stack }) {
      
      const keys = createKeys(stack);
      const logGroup = createLogGroup(stack, LOG_GROUP_NAME+"ID", { name: LOG_GROUP_NAME });
      const PARAM1 = new Config.Parameter(stack, 'KEY_1', {
        value: keys[0].keyArn,
      });

      const site = new NextjsSite(stack, "CloudWallet", {
        bind: [PARAM1,logGroup,...keys],
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

      stack.addOutputs({
        SiteUrl: site.url,
      });
    });
  },
} satisfies SSTConfig;

