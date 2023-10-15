import { updateUserPoolClientCallbackUrl } from "@/utils/aws";
import { UserRepository } from "./user-repository";
import { CognitoIdentityProviderClient, AdminGetUserCommand, AdminCreateUserCommand, UserType } from "@aws-sdk/client-cognito-identity-provider";
import { SSMClient, PutParameterCommand } from '@aws-sdk/client-ssm';


function delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}


export interface ICloudWalletInitParams {
    tableName: string,
    keys: [{ keyArn: string }]
    cognitoPoolId: string,
    UserPoolClientId: string,
    config: any
    arnSiteParameter: string,
    siteUrl: string
}


export async function main(event: { params: ICloudWalletInitParams }) {
    await UserRepository.updateTable(event.params.tableName);
    const userRepo = new UserRepository(event.params.tableName);
    await updateParameterStoreValue(event.params.arnSiteParameter, event.params.siteUrl);
    if(event.params.siteUrl.indexOf("localhost") <= -1)
        await updateUserPoolClientCallbackUrl(event.params.UserPoolClientId ?? "empty", event.params.cognitoPoolId ?? "empty", event.params.siteUrl + "/api/auth/callback/cognito");
    const cognitoUser = await createUser(event.params.cognitoPoolId,
        event.params.config.username,
        "Llavero1234!", 
        event.params.config.phoneNumber);
    if(!cognitoUser) throw new Error("Cognito user not created");
    const email = cognitoUser?.Attributes?.find(x=> x.Name === "email")?.Value as string;
    let user = await userRepo.getUser(email);
    let newUser;
    if (!user) {
        console.log("Creating new user");
        newUser = await userRepo.createUser({ username: email, mail: email, name: email });
        console.log("New user created: ", newUser.username);
    }
    user = user || newUser;
    if (!user) throw new Error("User not found");
    console.log("User: ", user); //todo remove
    console.log("Creating keys", event.params.keys); //todo remove
    await userRepo.createKeys(event.params.keys, user.username);
}

async function createUser(cognitoPoolId: string, username: string, password: string, phone: string): Promise<UserType | undefined> {
    const client = new CognitoIdentityProviderClient({ region: "us-east-1" });
    const cognitoUsername = await getUser(cognitoPoolId, client, username);
    if (cognitoUsername) return cognitoUsername;
    const command = new AdminCreateUserCommand({
        UserPoolId: cognitoPoolId,
        Username: username,
        TemporaryPassword: password,
        UserAttributes: [
            {
                Name: "email",
                Value: username
            },
            {
                Name: "phone_number",
                Value: phone
                ,
            },
            // {
            //     Name: "email_verified",
            //     Value: "true"
            // },
            // {
            //     Name: "phone_number_verified",
            //     Value: "true"
            // }
        ]
    });

    const response = await client.send(command);
    return response.User;
}

async function getUser(cognitoPoolId: string, client: CognitoIdentityProviderClient, username: string) {
    try {
        const getUser = new AdminGetUserCommand({
            UserPoolId: cognitoPoolId,
            Username: username
        });
        const userResponse = await client.send(getUser);
        return userResponse;
    } catch (error) {
        return null;
    }
}

const ssmClient = new SSMClient({ region: 'us-east-1' }); // Replace REGION with your AWS region

async function updateParameterStoreValue(name: string, value: string): Promise<void> {
    const command = new PutParameterCommand({
    Name: name,
    Value: value,
    Overwrite: true,
    Type: 'String',
  });

  try {
    await ssmClient.send(command);
    console.log(`Successfully updated parameter ${name}`);
  } catch (error) {
    console.error(`Error updating parameter ${name}: ${error}`);
    throw error;
  }
}
