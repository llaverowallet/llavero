import * as cdk from 'aws-cdk-lib';
import * as kms from 'aws-cdk-lib/aws-kms';
import { Construct } from 'constructs';
import { SSTConstruct } from 'sst/constructs/Construct.js';
import { FunctionBindingProps } from 'sst/constructs/util/functionBinding.js';

export interface IKMSProps {
  alias?: string;
  description?: string;
}

export class KMS extends Construct implements SSTConstruct {
  private readonly kms: kms.Key;
  public readonly id: string;
  public readonly keyId: string;

  constructor(scope: Construct, id: string, props: IKMSProps) {
    super(scope, id);

    this.kms = new kms.Key(this, id, {
      keySpec: kms.KeySpec.ECC_SECG_P256K1,
      keyUsage: kms.KeyUsage.SIGN_VERIFY,
      removalPolicy: cdk.RemovalPolicy.RETAIN_ON_UPDATE_OR_DELETE,
      alias: props.alias,
      description: props.description,
      enableKeyRotation: false,
    });
    this.keyId = this.kms.keyId;
    this.id = id;
  }

  public get keyArn(): string {
    return this.kms.keyArn;
  }

  public getConstructMetadata() {
    return {
      type: 'kms' as const,
      data: {
        keyArn: this.kms.keyArn,
      },
    };
  }

  public getFunctionBinding(): FunctionBindingProps {
    return {
      clientPackage: 'kms',
      variables: {
        keyArn: {
          type: 'plain',
          value: this.kms.keyArn,
        },
      },
      permissions: {
        'kms:*': [this.kms.keyArn],
      },
    };
  }
}
