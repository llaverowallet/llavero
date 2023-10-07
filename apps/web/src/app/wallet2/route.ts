import { KMSClient, ListAliasesCommand } from '@aws-sdk/client-kms';

export async function GET(request: Request) {
    try{
        const client = new KMSClient({ region: 'us-east-1' });

        const command = new ListAliasesCommand({});
        const response = await client.send(command);

        const aliases = response.Aliases?.filter(alias => alias.AliasName?.startsWith('alias/ALIASMY_KEY_1'));
        return Response.json({ aliases });
    } 
    catch(error) 
    {
        console.error("Wallet2 Error :", error);
        return Response.json({ msj: "wallet2", error });
    }
}


