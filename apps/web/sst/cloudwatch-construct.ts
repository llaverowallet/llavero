import * as logs from "aws-cdk-lib/aws-logs";
import { Construct } from "constructs";
import { SSTConstruct } from "sst/constructs/Construct.js";
import { FunctionBindingProps } from "sst/constructs/util/functionBinding.js";
import { Stack } from 'sst/constructs';
import { RemovalPolicy } from "aws-cdk-lib";

let logGroup:LogGroupSST | undefined = undefined;


export default function createLogGroup(stack: Stack, id: string, props: ILogGroupProps) { 
    if(logGroup) return logGroup;

    
    logGroup = new LogGroupSST(stack, id, {
        name: createName(stack,props.name),
    });
    return logGroup;
}

function createName(stack: Stack, name:string){
    return stack.stage != "prod" ? stack.stage + "-" + name : name;
} 

export interface ILogGroupProps {
    name: string;
}

export class LogGroupSST extends Construct implements SSTConstruct {
    private readonly logGroup: logs.LogGroup;
    public readonly id: string;
    public readonly name: string;

    constructor(scope: Construct, id: string, props: ILogGroupProps) {
        super(scope, id + "sst");
        this.id = id + "sst";
        this.logGroup = new logs.LogGroup(scope, id, {
            logGroupName: props.name,
            retention: logs.RetentionDays.FIVE_DAYS, // TODO config
            removalPolicy: RemovalPolicy.DESTROY, 
          });
        this.name = props.name;
    }

    public get logGroupArn(): string {
        return this.logGroup.logGroupArn;
    }

    public getConstructMetadata() {
        return {
            type: "logs" as const,
            data: {
                logGroupArn: this.logGroup.logGroupArn,
            },
        };
    }

    public getFunctionBinding(): FunctionBindingProps {
        return {
            clientPackage: "logs",
            variables: {
                keyArn: {
                    type: "plain",
                    value: this.logGroup.logGroupArn
                },
            },
            permissions: {
                "logs:*": [this.logGroup.logGroupArn],
            },
        };
    }
}

