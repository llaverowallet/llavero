// erc20-repository.ts

import { Entity, Table } from 'dynamodb-onetable';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import UserSchema from './user-schema';
import createLogger from '@/shared/utils/logger';

const logger = createLogger('erc20-repository');

export interface ERC20Token {
  chainId: number;
  namespace?: string;
  contractAddress: string;
  symbol: string;
  explorer?: string;
  name: string;
  logo?: string;
}

export type ERC20 = Entity<typeof UserSchema.models.ERC20>;
export type User = Entity<typeof UserSchema.models.User>;

export class ERC20Repository {
  private readonly table: Table;
  private readonly erc20Model;
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
      this.erc20Model = this.table.getModel('ERC20');
      this.userModel = this.table.getModel('User');
    } catch (error) {
      logger.error(error, 'Error in ERC20Repository constructor');
      throw error;
    }
  }

  async getERC20Tokens(userId: string): Promise<ERC20[]> {
    try {
      const tokens = await this.erc20Model.find({ userId });
      return tokens;
    } catch (error) {
      logger.error(error, 'Error in ERC20Repository getERC20Tokens');
      throw error;
    }
  }

  async addERC20Token(userId: string, token: ERC20Token): Promise<ERC20> {
    try {
      const newToken = await this.erc20Model.create({
        userId,
        ...token,
      });
      return newToken;
    } catch (error) {
      logger.error(error, 'Error in ERC20Repository addERC20Token');
      throw error;
    }
  }

  async updateERC20Token(userId: string, token: ERC20Token): Promise<ERC20> {
    try {
      const updatedToken = await this.erc20Model.update({
        userId,
        chainId: token.chainId,
        contractAddress: token.contractAddress,
        namespace: token.namespace,
        symbol: token.symbol,
        explorer: token.explorer,
        name: token.name,
        logo: token.logo,
      });
      return updatedToken;
    } catch (error) {
      logger.error(error, 'Error in ERC20Repository updateERC20Token');
      throw error;
    }
  }

  async deleteERC20Token(userId: string, chainId: number, contractAddress: string): Promise<void> {
    try {
      await this.erc20Model.remove({ userId, chainId, contractAddress });
    } catch (error) {
      logger.error(error, 'Error in ERC20Repository deleteERC20Token');
      throw error;
    }
  }

  async getERC20Token(
    userId: string,
    chainId: number,
    contractAddress: string,
  ): Promise<ERC20 | null> {
    try {
      const token = await this.erc20Model.get({ userId, chainId, contractAddress });
      return token || null;
    } catch (error) {
      logger.error(error, 'Error in ERC20Repository getERC20Token');
      throw error;
    }
  }

  async initializeDefaultTokens(userId: string): Promise<void> {
    const defaultTokens: ERC20Token[] = [
      {
        chainId: 1,
        namespace: 'eip155',
        contractAddress: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
        symbol: 'USDC',
        explorer: 'https://etherscan.io/token/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
        name: 'USD Coin',
        logo: '/token-logos/usdc.png',
      },
      {
        chainId: 1,
        namespace: 'eip155',
        contractAddress: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
        symbol: 'USDT',
        explorer: 'https://etherscan.io/token/0xdAC17F958D2ee523a2206206994597C13D831ec7',
        name: 'Tether USD',
        logo: '/token-logos/usdt.png',
      },
      // Add more default tokens as needed
    ];

    try {
      for (const token of defaultTokens) {
        await this.addERC20Token(userId, token);
      }
      logger.log(`Default ERC20 tokens initialized for user ${userId}`);
    } catch (error) {
      logger.error(error, `Error initializing default ERC20 tokens for user ${userId}`);
      throw error;
    }
  }
}
