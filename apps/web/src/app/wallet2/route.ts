import { use } from "react";
import { UserRepository } from "../../../repositories/user-repository";
import createLogger from "@/utils/logger";
const logger = createLogger("wallet2");

export async function GET(request: Request) {
    try{
        
        const userRepo = new UserRepository();
        const user = await userRepo.getUser("ranu");
        const keys = await userRepo.getKeys("",user);
        return Response.json({ ok: true, user, keys });
    } 
    catch(error) 
    {
        logger.error(error, "Error in GET Wallet");
        return Response.json({ msj: "wallet2", error });
    }
}


