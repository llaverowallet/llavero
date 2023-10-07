import * as  kmsclient from "@aws-sdk/client-kms";
import { AwsKmsSigner } from "@dennisdang/ethers-aws-kms-signer";
import { JsonRpcProvider, ethers } from "ethers";
import { Config } from "sst/node/config";
import logger from "@/utils/logger"

export async function GET(request: Request) {
    //https://docs.sst.dev/live-lambda-development
    try {
        logger.log("hola")
        const arnKey = Config.KEY_1;
        const message = "hola pepepe";

        //return Response.json({ key: key, keyId: getKeyId(key) });
        const keyClient = new kmsclient.KMSClient();

        const provider = new JsonRpcProvider("https://sepolia.infura.io/v3/8a30a48106eb413bb29d9ff89d0b99a6");

        console.log("arnKey :", arnKey);
        const keyId = getKeyId(arnKey);
        console.log("keyid :", keyId);
        logger.log("keyid :" + keyId);
        const signer = new AwsKmsSigner(keyId, keyClient, provider);
        const addr = await signer.getAddress();
        const signed = await signer.signMessage(message);
        const verified = ethers.verifyMessage(message, signed);
        const balance = await provider.getBalance(addr);
        logger.log("balance :" + balance);
        return Response.json({ address: addr, message, signed, verified, balance });
    }
    catch (error) {
        console.error("ErrorRRR :", error);
        return Response.json({ msj: "mm", error });
    }
}

const getKeyId = (arn: string) => {
    const parts = arn.split('/');
    return parts[parts.length - 1];
}
