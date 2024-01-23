import { AwsKmsSigner } from '@dennisdang/ethers-aws-kms-signer';
import { assert, ethers, Provider, TypedDataEncoder } from 'ethers';

export async function signTypedDataFunc(
  _domain: ethers.TypedDataDomain,
  _types: Record<string, ethers.TypedDataField[]>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  _value: Record<string, any>,
  _provider: Provider,
  _awsKmsSigner: AwsKmsSigner,
): Promise<string> {
  // Populate any ENS names
  const populated = await TypedDataEncoder.resolveNames(
    _domain,
    _types,
    _value,
    async (name: string) => {
      // @TODO: this should use resolveName; addresses don't
      //        need a provider

      assert(
        _provider != null,
        'cannot resolve ENS names without a provider',
        'UNSUPPORTED_OPERATION',
        {
          operation: 'resolveName',
          info: { name },
        },
      );

      const address = await _provider.resolveName(name);
      assert(address != null, 'unconfigured ENS name', 'UNCONFIGURED_NAME', {
        value: name,
      });

      return address;
    },
  );

  return _awsKmsSigner._signDigest(
    TypedDataEncoder.hash(populated.domain, _types, populated.value),
  );
}
