// network-repository.ts

import { Entity, Table } from 'dynamodb-onetable';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import UserSchema from './user-schema';
import createLogger from '@/shared/utils/logger';

const logger = createLogger('network-repository');

export interface Chain {
  chainId: number;
  name: string;
  logo: string;
  rgb: string;
  rpc: string;
  namespace: string;
  symbol: string;
  explorer: string;
  isTestnet: boolean;
}

export type Network = Entity<typeof UserSchema.models.Network>;
export type User = Entity<typeof UserSchema.models.User>;

export class NetworkRepository {
  private readonly table: Table;
  private readonly networkModel;
  private readonly userModel;

  constructor(tableName?: string) {
    try {
      tableName = tableName || process.env.USER_TABLE_NAME;

      if (!tableName) {
        throw new Error(
          'Table name not provided. Not on the constructor, not in the environment USER_TABLE_NAME',
        );
      }

      const client = new DynamoDBClient({});
      this.table = new Table({ client, name: tableName, schema: UserSchema, partial: true });
      this.networkModel = this.table.getModel('Network');
      this.userModel = this.table.getModel('User');
    } catch (error) {
      logger.error(error, 'Error in NetworkRepository constructor');
      throw error;
    }
  }

  async getNetworks(userId: string): Promise<Network[]> {
    try {
      const networks = await this.networkModel.find({ userId });
      return networks;
    } catch (error) {
      logger.error(error, 'Error in NetworkRepository getNetworks');
      throw error;
    }
  }

  async addNetwork(userId: string, chain: Chain): Promise<Network> {
    try {
      const network = await this.networkModel.create({
        userId,
        ...chain,
      });
      return network;
    } catch (error) {
      logger.error(error, 'Error in NetworkRepository addNetwork');
      throw error;
    }
  }

  async updateNetwork(userId: string, chain: Chain): Promise<Network> {
    try {
      const network = await this.networkModel.update({
        userId,
        chainId: chain.chainId,
        name: chain.name,
        logo: chain.logo,
        rgb: chain.rgb,
        rpc: chain.rpc,
        namespace: chain.namespace,
        symbol: chain.symbol,
        explorer: chain.explorer,
        isTestnet: chain.isTestnet,
      });
      return network;
    } catch (error) {
      logger.error(error, 'Error in NetworkRepository updateNetwork');
      throw error;
    }
  }

  async deleteNetwork(userId: string, chainId: number): Promise<void> {
    try {
      await this.networkModel.remove({ userId, chainId });
    } catch (error) {
      logger.error(error, 'Error in NetworkRepository deleteNetwork');
      throw error;
    }
  }

  async init(): Promise<void> {
    const initialNetworks: Chain[] = [
      {
        chainId: 1,
        name: 'Ethereum',
        logo: '/chain-logos/eip155-1.png',
        rgb: '99, 125, 234',
        rpc: 'https://eth.llamarpc.com',
        namespace: 'eip155',
        symbol: 'ETH',
        explorer: 'https://etherscan.io',
        isTestnet: false,
      },
      {
        chainId: 43114,
        name: 'Avalanche C-Chain',
        logo: '/chain-logos/eip155-43113.png',
        rgb: '232, 65, 66',
        rpc: 'https://api.avax.network/ext/bc/C/rpc',
        namespace: 'eip155',
        symbol: 'AVAX',
        explorer: 'https://cchain.explorer.avax.network',
        isTestnet: false,
      },
      {
        chainId: 137,
        name: 'Polygon',
        logo: '/chain-logos/eip155-137.png',
        rgb: '130, 71, 229',
        rpc: 'https://polygon-rpc.com/',
        namespace: 'eip155',
        symbol: 'MATIC',
        explorer: 'https://polygonscan.com',
        isTestnet: false,
      },
      {
        chainId: 10,
        name: 'Optimism',
        logo: '/chain-logos/eip155-10.png',
        rgb: '235, 0, 25',
        rpc: 'https://mainnet.optimism.io',
        namespace: 'eip155',
        symbol: 'ETH',
        explorer: 'https://optimistic.etherscan.io',
        isTestnet: false,
      },
      {
        chainId: 324,
        name: 'zkSync Era',
        logo: '/chain-logos/eip155-324.svg',
        rgb: '242, 242, 242',
        rpc: 'https://mainnet.era.zksync.io',
        namespace: 'eip155',
        symbol: 'ETH',
        explorer: 'https://zkscan.io',
        isTestnet: false,
      },
      {
        chainId: 1313161554,
        name: 'Aurora Mainnet',
        logo: '/chain-logos/eip155-324.svg',
        rgb: '242, 242, 242',
        rpc: 'https://mainnet.aurora.dev',
        namespace: 'eip155',
        symbol: 'ETH',
        explorer: 'https://aurora.dev',
        isTestnet: false,
      },
      {
        chainId: 5,
        name: 'Ethereum Goerli',
        logo: '/chain-logos/eip155-1.png',
        rgb: '99, 125, 234',
        rpc: 'https://eth-goerli.public.blastapi.io',
        namespace: 'eip155',
        symbol: 'ETH',
        explorer: 'https://goerli.etherscan.io',
        isTestnet: true,
      },
      {
        chainId: 11155111,
        name: 'Sepolia Eth',
        logo: '/chain-logos/eip155-43113.png',
        rgb: '232, 65, 66',
        rpc: 'https://ethereum-sepolia-rpc.publicnode.com',
        namespace: 'eip155',
        symbol: 'ETH',
        explorer: 'https://sepolia.etherscan.io',
        isTestnet: true,
      },
      {
        chainId: 43113,
        name: 'Avalanche Fuji',
        logo: '/chain-logos/eip155-43113.png',
        rgb: '232, 65, 66',
        rpc: 'https://api.avax-test.network/ext/bc/C/rpc',
        namespace: 'eip155',
        symbol: 'AVAX',
        explorer: 'https://cchain.explorer.avax-test.network',
        isTestnet: true,
      },
      {
        chainId: 420,
        name: 'Optimism Goerli',
        logo: '/chain-logos/eip155-10.png',
        rgb: '235, 0, 25',
        rpc: 'https://goerli.optimism.io',
        namespace: 'eip155',
        symbol: 'ETH',
        explorer: 'https://goerli.optimistic.etherscan.io',
        isTestnet: true,
      },
      {
        chainId: 280,
        name: 'zkSync Era Testnet',
        logo: '/chain-logos/eip155-324.svg',
        rgb: '242, 242, 242',
        rpc: 'https://rinkeby-api.zksync.io',
        namespace: 'eip155',
        symbol: 'ETH',
        explorer: 'https://rinkeby-explorer.zksync.io',
        isTestnet: true,
      },
    ];

    try {
      const users = await this.userModel.scan();
      for (const user of users) {
        const networks = await this.getNetworks(user.userId);
        //delete each network
        for (const network of networks) {
          await this.deleteNetwork(user.userId, Number(network.chainId));
        }
        if (!networks || networks.length === 0) {
          for (const network of initialNetworks) {
            await this.addNetwork(user.userId, network);
          }
          continue;
        }
      }
      logger.log('Networks initialized for all users');
    } catch (error) {
      logger.error(error, 'Error in NetworkRepository init');
      throw error;
    }
  }
}
