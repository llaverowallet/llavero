import { check } from "@/utils/general";
import { UserRepository } from "./user-repository";
import { CognitoIdentityProviderClient, AdminGetUserCommand, AdminCreateUserCommand, UserType } from "@aws-sdk/client-cognito-identity-provider";
import { config } from "process";


function delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}


export interface ICloudWalletInitParams {
    tableName: string,
    keys: [{ keyArn: string }]
    cognitoPoolId: string,
    config: any
}


export async function main(event: { params: ICloudWalletInitParams }) {
    await UserRepository.updateTable(event.params.tableName);
    const userRepo = new UserRepository(event.params.tableName);
    const cognitoUsername = await createUser(event.params.cognitoPoolId,
        event.params.config.username,
        event.params.config.password,
        event.params.config.phone);
    console.log("Cognito user created: ", cognitoUsername);
    let user = await userRepo.getUser("ranu"); //TODO user hardcoded
    let newUser;
    if (!user) {
        console.log("Creating new user");
        newUser = await userRepo.createUser({ username: "ranu", mail: "pepe@ranu.com", name: "Ranu" });
        console.log("New user created: ", newUser.username);
    }
    user = user || newUser;
    if (!user) throw new Error("User not found");
    await userRepo.createKeys(event.params.keys, user.username);
}

async function createUser(cognitoPoolId: string, username: string, password: string, phone: string): Promise<UserType | undefined> {
    const client = new CognitoIdentityProviderClient({ region: "us-east-1" });
    const cognitoUsername = await getUser(cognitoPoolId, client, username);
    console.log("User response: ", cognitoUsername);
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
