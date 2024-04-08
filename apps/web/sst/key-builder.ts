import { KMS } from './kms-construct';
import { Stack } from 'sst/constructs';

export interface IKeyProps {
  description: string;
}

export default function createKeys(stack: Stack, numberOfKeys: number) {
  const keys: IKeyProps[] = [];
  for (let index = 1; index <= numberOfKeys; index++) {
    keys.push({ description: `description${index}` });
  }
  const keysResult = new Array<KMS>();
  // Create the KMS keys
  keys.forEach((keyProps: IKeyProps, index) => {
    const key = new KMS(stack, aliasName(stack, index), {
      alias: aliasName(stack, index),
      description: keyProps.description,
    });
    keysResult.push(key);
  });

  return keysResult;
}

function aliasName(stack: Stack, index: number) {
  return stack.stage != 'prod' ? `LlaveroKey${stack.stage}${index}` : `LlaveroKey${index}`;
}

/* Investigate:
https://github.com/aws/aws-cdk/issues/15257
https://www.benoitpaul.com/blog/aws/kms-multiregion/
To create a multi-region KMS key, you can use the following construct
import * as cdk from 'aws-cdk-lib';
import * as cr from 'aws-cdk-lib/aws-custom-resources';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as kms from 'aws-cdk-lib/aws-kms';
import { Construct } from 'constructs';

class MultiRegionKey extends kms.Key {
  constructor(scope: Construct, id: string, props: MultiRegionKey.Props) {
    super(scope, id, {
      enableKeyRotation: props.enableKeyRotation,
      pendingWindow: cdk.Duration.days(props.pendingWindowInDays),
      policy: props.keyPolicy,
      description: props.description,
      removalPolicy: cdk.RemovalPolicy.RETAIN, // Assuming retention for the sake of simplicity, adjust as necessary
    });

    if (cdk.Stack.of(scope).region !== props.replicaRegion) {
      const cfnKey = this.node.defaultChild as kms.CfnKey;
      cfnKey.multiRegion = true;

      const alias = `${id}Alias`;
      const replicaKey = new kms.CfnAlias(this, alias, {
        aliasName: alias,
        targetKeyId: cfnKey.ref,
      });

      const customResource = new cr.AwsCustomResource(this, 'ReplicaKeyProvider', {
        onCreate: {
          service: 'KMS',
          action: 'replicateKey',
          parameters: {
            KeyId: cfnKey.keyId,
            ReplicaRegion: props.replicaRegion,
          },
          physicalResourceId: cr.PhysicalResourceId.of(props.replicaRegion),
        },
        policy: cr.AwsCustomResourcePolicy.fromStatements([
          new iam.PolicyStatement({
            actions: ['kms:ReplicateKey'],
            resources: [cfnKey.keyArn],
          }),
          new iam.PolicyStatement({
            actions: ['kms:CreateKey'],
            resources: ['*'],
          }),
          new iam.PolicyStatement({
            actions: ['kms:ScheduleKeyDeletion'],
            resources: [replicaKey.attrAliasArn],
          }),
        ]),
      });

      const replicaKeyAliasProvider = new cr.AwsCustomResource(this, 'ReplicaKeyAliasProvider', {
        onUpdate: {
          service: 'KMS',
          action: 'createAlias',
          parameters: {
            TargetKeyId: replicaKey.ref,
            AliasName: alias,
          },
          physicalResourceId: cr.PhysicalResourceId.of(alias),
        },
        policy: cr.AwsCustomResourcePolicy.fromStatements([
          new iam.PolicyStatement({
            actions: ['kms:CreateAlias'],
            resources: [replicaKey.attrAliasArn, cfnKey.keyArn],
          }),
          new iam.PolicyStatement({
            actions: ['kms:DeleteAlias'],
            resources: [
              replicaKey.attrAliasArn,
              kms.Alias.fromAliasName(this, 'PrimaryKeyAlias', alias).aliasArn,
            ],
          }),
        ]),
      });

      replicaKeyAliasProvider.node.addDependency(customResource);
    } else {
      new kms.Alias(this, props.alias, {
        aliasName: `alias/${props.alias}`,
        targetKey: this,
      });
    }
  }
}

namespace MultiRegionKey {
  export interface Props {
    alias: string;
    description: string;
    replicaRegion: string;
    pendingWindowInDays?: number;
    enableKeyRotation?: boolean;
    keyPolicy?: iam.PolicyDocument;
  }
}

// Usage Example
const stack = new cdk.Stack();
new MultiRegionKey(stack, 'MultiRegionKey', {
  alias: 'my-multi-region-key',
  description: 'a multi-region kms key',
  replicaRegion: 'eu-west-1',
  pendingWindowInDays: 7,
  enableKeyRotation: true,
});
**/
