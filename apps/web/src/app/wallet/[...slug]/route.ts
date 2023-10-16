import { NextRequest, NextResponse } from 'next/server';
import listWallets from './actions/list-wallets';
import createLogger from "@/utils/logger";
import getWallet from './actions/get-wallet';
import { assert } from 'console';
import { AUTH_OPTIONS } from '@/utils/auth';
import { getServerSession } from 'next-auth';
const logger = createLogger("Wallet endpoint");

type firstLevelActions = "list" | "create"; //| "delete"
type secondLevelActions = "update" | "get" | "delete";
export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(AUTH_OPTIONS);
        const { action, id } = getAction(req);
        switch (action) {
            case "list":
                console.log("session: ", session);
                if(session?.user && session?.user?.email) 
                    return Response.json(await listWallets(session?.user?.email));
                else return Response.json([]);
            case "get":
                console.log("entro");
                assert(id !== undefined, "id is undefined");
                const wallet = await getWallet(id as string);
                console.log("wallet: ", wallet);
                return Response.json(wallet);
            default:
                console.log("default action: ", action);
                throw new Error("Invalid Wallet action for GET HTTP method");
        }
    } catch (error) {
        logger.error(error);
        return Response.error();
    }
}


/**
 * endpoints
 * /wallet/list
 * /wallet/create
 * /wallet/[name]/update
 * /wallet/[name]/get
 * /wallet/[name]/delete
 * @param 
 * @returns 
 */
const getAction = (req: NextRequest) => {
    const slugArray = req.nextUrl.pathname.split("/", 10).filter((slug) => slug !== "" && slug !== "wallet");

    let id: string | undefined = undefined;
    let action: any = slugArray[0] as firstLevelActions;
    if (!isFirstLevelAction(action)) {
        action = slugArray[1] as secondLevelActions;
        console.log("action2: ", action);
        if (isSecondLevelAction(action)) {
            id = slugArray[0];
        }
        else {
            throw new Error("Invalid Wallet action");
        }
    }
    return { action, id };
}

function isFirstLevelAction(input: unknown): input is firstLevelActions {
    return input === 'list' || input === 'create';
}

function isSecondLevelAction(input: unknown): input is secondLevelActions {
    return input === 'update' || input === 'get' || input === 'delete';
}
