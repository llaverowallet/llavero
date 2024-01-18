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
