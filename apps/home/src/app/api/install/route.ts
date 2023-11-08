import { NextRequest } from 'next/server';
import * as z from 'zod';


const InstallRequestDataSchema = z.object({
    cognitoUrlSuffix: z.string(),
    region: z.string(),
    email: z.string().email(),
    awsAccessKeyId: z.string(),
    awsSecretAccessKey: z.string(),
});

export async function POST(req: NextRequest) {
    try {
        console.log('entro');
        const body = await req.json();
        console.log('body: ', body);
        const { cognitoUrlSuffix, region, email, awsAccessKeyId, awsSecretAccessKey } =
            InstallRequestDataSchema.parse(body);
    
        return  Response.json({ message: 'Installation successful' });
    } catch (error) {
        return Response.error();
    }
}
