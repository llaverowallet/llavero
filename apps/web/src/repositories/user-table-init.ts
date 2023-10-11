import { UserRepository } from "./user-repository";

function delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}


export interface ICloudWalletInitParams {
    tableName: string,
    keys: [{ keyArn: string }]
}


export async function main(event: { params: ICloudWalletInitParams } ) {
    await UserRepository.updateTable(event.params.tableName);
    const userRepo = new UserRepository(event.params.tableName);
    let user = await userRepo.getUser("ranu"); //TODO user hardcoded
    let newUser;
    if (!user) { //TODO: get user info from the installation process
        console.log("Creating new user");
        newUser = await userRepo.createUser({ username: "ranu", mail: "pepe@ranu.com", name: "Ranu" });
        console.log("New user created: ", newUser.username);
    }
    user = user || newUser;
    if(!user) throw new Error("User not found");
    await userRepo.createKeys(event.params.keys, user.username);
}