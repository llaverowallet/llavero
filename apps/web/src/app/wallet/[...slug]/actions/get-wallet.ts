import createLogger from "@/utils/logger";
const logger = createLogger("GetWallet");
import { UserRepository } from "@/repositories/user-repository";
import { assert } from "console";
import { JsonRpcProvider } from "ethers";
import * as  kmsClient from "@aws-sdk/client-kms";
import { AwsKmsSigner } from "@dennisdang/ethers-aws-kms-signer";
import { getKeyId } from "@/utils/crypto";
import { WalletInfo } from "../../wallet-models";

export default async function getWallet(name: string) : Promise<WalletInfo> {
    try {
        assert(name);
        const userRepo = new UserRepository();
        const user = await userRepo.getUser("ranu"); //TODO user hardcoded
        const keyDb = await userRepo.getKey(name, "", user);
        const provider = new JsonRpcProvider("https://sepolia.infura.io/v3/8a30a48106eb413bb29d9ff89d0b99a6"); //TODO get from an endpoint
        const keyClient = new kmsClient.KMSClient();
        assert(keyDb && keyDb.keyArn);
        console.log("keyDb.keyArn: ", keyDb?.keyArn);
        const signer = new AwsKmsSigner(getKeyId(keyDb?.keyArn as string), keyClient, provider);
        const addr = await signer.getAddress();
        const balance = await provider.getBalance(addr);
        return { address: addr, balance, name: keyDb?.name ?? "", description: keyDb?.description };
    }
    catch (error) {
        logger.error(error, "Error in get Wallet");
        throw new AggregateError([new Error("Error in get Wallet"), error]);
    }

}