import { EIP155_CHAINS, EIP155_MAINNET_CHAINS, EIP155_TEST_CHAINS } from './EIP155Data';

export const ALL_CHAINS = {
  ...EIP155_CHAINS,
};

export function getChainData(chainId?: string) {
  if (!chainId) return;
  const [namespace, reference] = chainId.toString().split(':');
  return Object.values(ALL_CHAINS).find(
    (chain) => chain.chainId.toString() == reference && chain.namespace === namespace,
  );
}

export const getMainnetChains = () => {
  const chains = [];
  for (let key in EIP155_MAINNET_CHAINS) {
    chains.push(EIP155_MAINNET_CHAINS[key]);
  }
  return chains;
};

export const getTestnetChains = () => {
  const chains = [];
  for (let key in EIP155_TEST_CHAINS) {
    chains.push(EIP155_TEST_CHAINS[key]);
  }
  return chains;
};

export const getChainByEip155Address = (eip155Address: string) => {
  return ALL_CHAINS[eip155Address];
};
