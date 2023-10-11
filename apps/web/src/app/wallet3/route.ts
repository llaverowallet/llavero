import * as  kmsClient from "@aws-sdk/client-kms";
import { AwsKmsSigner } from "@dennisdang/ethers-aws-kms-signer";
import { JsonRpcProvider, ethers } from "ethers";
import { Config } from "sst/node/config";
import { UserRepository } from "../../repositories/user-repository";

import createLogger from "@/utils/logger";
const logger = createLogger("wallet");

export async function GET(request: Request) {
    try {
        const message = "Hola CloudWallet";
        const keyClient = new kmsClient.KMSClient();
        const userRepo = new UserRepository();
        const keys = await userRepo.getKeys("ranu"); 
        const key = keys[2];      
        const provider = new JsonRpcProvider("https://sepolia.infura.io/v3/8a30a48106eb413bb29d9ff89d0b99a6"); //TODO get from an endpoint
        const signer = new AwsKmsSigner(getKeyId(key.keyArn), keyClient, provider);
        const addr = await signer.getAddress();
        const signed = await signer.signMessage(message);
        const verified = ethers.verifyMessage(message, signed);
        const balance = await provider.getBalance(addr);
        return Response.json({ address: addr, message, signed, verified, balance });
    }
    catch (error) {
        logger.error(error, "Error in GET Wallet");
        return Response.error();
    }
}

const getKeyId = (arn: string) => {
    const parts = arn.split('/');
    return parts[parts.length - 1];
}
