import createLogger from "@/utils/logger";
const logger = createLogger("ListWallets");
import { UserRepository } from "@/repositories/user-repository";
import { JsonRpcProvider } from "ethers";
import { AwsKmsSigner } from "@dennisdang/ethers-aws-kms-signer";
import * as  kmsClient from "@aws-sdk/client-kms";
import { getKeyId } from "@/utils/crypto";
import { WalletInfo } from "@/models/interfaces";


export default async function listWallets(username: string) : Promise<WalletInfo[]> {
    try {
        const userRepo = new UserRepository();
        const user = await userRepo.getUser(username);
        if(!user) return []; 
        const keys = await userRepo.getKeys("", user);
        const provider = new JsonRpcProvider("https://sepolia.infura.io/v3/8a30a48106eb413bb29d9ff89d0b99a6"); //TODO get from an endpoint
        const keysPromise = keys.map(async key => { 
            const keyClient = new kmsClient.KMSClient();
            const signer = new AwsKmsSigner(getKeyId(key.keyArn), keyClient, provider);
            const addr = await signer.getAddress();
            const balance = await provider.getBalance(addr);
            console.log("addr: ", addr);
            console.log("balance: ", balance);
            return { address: addr, balance, name: key.name, description: key.description };
        });
        const ethKeys = await Promise.all(keysPromise);
        console.log("ethKeys: ", ethKeys);
        return ethKeys;
    }
    catch (error) {
        logger.error(error, "Error in list Wallet");
        throw new AggregateError([new Error("Error in list Wallet"), error]);
    }
}