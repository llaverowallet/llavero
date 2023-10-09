import { UserRepository } from "./user-repository";

export async function main(event: any) { 
    console.log("Initializing user table");
    await UserRepository.updateTable();
    const userRepo = new UserRepository();
    const user = await userRepo.getUser("ranu");
    if(!user){
        const newUser = await userRepo.createUser({username: "ranu", mail: "pepe@ranu.com", name: "Ranu"});
        console.log("New user created", newUser);
    }
}