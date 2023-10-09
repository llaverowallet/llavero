import { UserRepository } from "./user-repository";

function delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function main(event: { params: { tableName: string } }) {
    await UserRepository.updateTable(event.params.tableName);
    const userRepo = new UserRepository(event.params.tableName);
    const user = await userRepo.getUser("ranu");
    if (!user) {
        console.log("Creating new user");
        const newUser = await userRepo.createUser({ username: "ranu", mail: "pepe@ranu.com", name: "Ranu" });
        console.log("New user created: ", newUser.username);
    }
}