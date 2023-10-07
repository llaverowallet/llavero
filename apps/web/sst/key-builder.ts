import * as fs from 'fs';
import * as yaml from 'js-yaml';
import { KMS } from './kms-construct';
import { Stack } from 'sst/constructs';


export interface IKeyProps {
    description: string;
}

export default function createKeys(stack: Stack) {

    // Read the YAML file
    //const fileContents = fs.readFileSync('keys.yaml', 'utf8');
    //const keys = yaml.loadAll(fileContents) as IKeyProps[];
    const keys: IKeyProps[] = [ { description: "description1" }, { description: "description2"}, { description: "description3"}  ];
    const keysResult = new Array<KMS>();
    // Create the KMS keys
    keys.forEach((keyProps: IKeyProps, index) => {
        const key = new KMS(stack, aliasName(stack,index), {
            alias: aliasName(stack,index),
            description: "description",
        });
        keysResult.push(key);
    });

    return keysResult;
}

function aliasName(stack: Stack,index: number){
    return stack.stage != "prod" ? "CloudKey"+stack.stage + index : "CloudKey" + index;
} 
