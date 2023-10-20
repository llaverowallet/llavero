import createLogger from "@/utils/logger";
const logger = createLogger("ListWallets");
import { KmsKey, UserRepository } from "@/repositories/user-repository";
import { JsonRpcProvider } from "ethers";
import { AwsKmsSigner } from "@dennisdang/ethers-aws-kms-signer";
import * as  kmsClient from "@aws-sdk/client-kms";
import { getKeyId } from "@/utils/crypto";
import { WalletInfo } from "@/models/interfaces";



/**
 * If a key does not have address, it will be updated
 * think where to put this functionality of address update
 * @param username 
 * @returns 
 */
export default async function listWallets(username: string): Promise<WalletInfo[]> {
    try {
        const userRepo = new UserRepository();
        const user = await userRepo.getUser(username);
        if (!user) return [];
        const keys = await userRepo.getKeys("", user);
        const provider = new JsonRpcProvider("https://sepolia.infura.io/v3/8a30a48106eb413bb29d9ff89d0b99a6"); //TODO get from an endpoint
        const keysToUpdate = new Array<KmsKey>();
        const keysPromise = keys.map(async key => {
            const keyClient = new kmsClient.KMSClient();
            const signer = new AwsKmsSigner(getKeyId(key.keyArn), keyClient, provider);
            if (!key.address) {
                const addr = await signer.getAddress();
                key.address = addr;
                keysToUpdate.push(key);
            }
            const balance = await provider.getBalance(key.address);
            console.log("addr: ", key.address);
            return { address: key.address, balance, name: key.name, description: key.description };
        });
        const ethKeys = await Promise.all(keysPromise);
        if (keysToUpdate.length > 0) await userRepo.updateKeys(keysToUpdate, "", user);

        console.log("ethKeys: ", ethKeys);
        return ethKeys;
    }
    catch (error) {
        logger.error(error, "Error in list Wallet");
        throw new AggregateError([new Error("Error in list Wallet"), error]);
    }
}