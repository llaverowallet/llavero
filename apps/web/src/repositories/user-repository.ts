import { Entity, Table } from 'dynamodb-onetable';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import UserSchema from './user-schema';

export type User = Entity<typeof UserSchema.models.User>;
export type Network = Entity<typeof UserSchema.models.Networks>;
export type KmsKey = Entity<typeof UserSchema.models.Keys>;
export type UserKeys = { user: User, keys: KmsKey[] };
export type UserNetworks = { user: User, networks: Network[] };
import createLogger from "@/utils/logger";
const logger = createLogger("user-repository");

export class UserRepository {
    private readonly userTable: Table;
    private readonly userModel;
    private readonly keysModel;
    private readonly networkModel;

    constructor(tableName?: string) {
        try {
            tableName = tableName || process.env.USER_TABLE_NAME;
            if (!tableName) {
                throw new Error("Table name not provided. Not on the constructor, not in the environment USER_TABLE_NAME");
            }
            const client = new DynamoDBClient({});
            this.userTable = new Table({ client, name: tableName, schema: UserSchema });
            this.userModel = this.userTable.getModel('User');
            this.keysModel = this.userTable.getModel('Keys');
            this.networkModel = this.userTable.getModel('Networks');
        } catch (error) {
            logger.error(error, "Error in UserRepository constructor");
            throw error;
        }
    }

    async getUser(username: string) {
        const user = await this.userModel.get({ username });
        return user;
    }

    async createUser(user: User) {
        try {
            const newUser = await this.userModel.create(user);
            return newUser;
        } catch (error) {
            logger.error(error, "Error in UserRepository createUser");
            throw error;
        }
    }

    async getKeys(username = "", user?: User) {
        try {
            if (!username && !user) throw new Error("Either username or user must be provided");
            const selectedUser = user || await this.getUser(username);
            const keys = await this.keysModel.find({ userId: selectedUser?.userId });
            return keys;
        } catch (error) {
            logger.error(error, "Error in UserRepository getKeys");
            throw error;
        }
    }

    async getKey(address: string, username = "", user?: User): Promise<KmsKey | undefined> {
        try {
            const keys = await this.getKeys(username, user);
            const selectedKey = keys.find(k => k.address === address);
            return selectedKey;
        } catch (error) {
            logger.error(error, "Error in UserRepository getKey");
            throw error;
        }
    }

    async createKeys(keys: KmsKey[], username?: string, user?: User) {
        try {
            if (!username && !user) throw new Error("Either username or user must be provided");
            const selectedUser = user || await this.getUser(username ?? "");
            if (!selectedUser) throw new Error("User not found");
            let promises = new Array<Promise<KmsKey>>();
            keys.forEach((key, idx) => {
                console.log("Creating key idx: ", idx);
                promises.push(this.keysModel.upsert({ keyArn: key.keyArn, username: username, name: "key" + idx, userId: selectedUser?.userId }));
                console.log("Creating key: ", key.keyArn);
            });
            await Promise.all(promises);
            console.log("Keys created");
        } catch (error) {
            logger.error(error, "Error in UserRepository createKeys");
            throw error;
        }
    }

    async updateKeys(keys: KmsKey[], username?: string, user?: User) {
        try {
            if (!username && !user) throw new Error("Either username or user must be provided");
            const selectedUser = user || await this.getUser(username ?? "");
            if (!selectedUser) throw new Error("User not found");
            let promises = new Array<Promise<KmsKey>>();
            keys.forEach((key, idx) => {
                console.log("Updating key idx: ", idx);
                promises.push(this.keysModel.upsert({ keyArn: key.keyArn, username: username, name: "key" + idx, userId: selectedUser?.userId }));
                console.log("Updating key: ", key.keyArn);
            });
            await Promise.all(promises);
            console.log("Keys updated");
        } catch (error) {
            logger.error(error, "Error in UserRepository updateKeys");
            throw error;
        }
    }


    static async updateTable(tableName = "UserData") {
        try {
            const client = new DynamoDBClient({});

            const userTable = new Table({ client, name: tableName });
            console.log("Updating table");
            const schema = userTable.getCurrentSchema();
            console.log("Current schema", schema);
            await userTable.saveSchema(UserSchema);
            await userTable.setSchema(UserSchema);

            console.log("Table updated");
        } catch (error) {
            logger.error(error, "Error in UserRepository updateTable");
            console.error(error, "Error in UserRepository updateTable");
            throw error;
        }
    }
}