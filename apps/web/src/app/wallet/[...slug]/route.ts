import { NextRequest, NextResponse } from 'next/server';
import listWallets from '../actions/list-wallets';
import createLogger from "@/utils/logger";
import getWallet from '../actions/get-wallet';
import { assert } from 'console';
import { AUTH_OPTIONS } from '@/utils/auth';
import { getServerSession,  } from 'next-auth';
import personalSign from '../actions/personalSign';
const logger = createLogger("Wallet endpoint");


type firstLevelActions = "list" | "get";
type secondLevelActions = "update" | "get" | "delete" | "personalSign" | "ethSendTransaction" | "ethSignTransaction";
export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(AUTH_OPTIONS);
        const { action, addr } = getAction(req);
        switch (action) {
            case "list":
                console.log("session: ", session);
                if(session?.user && session?.user?.email) 
                    return Response.json(await listWallets(session?.user?.email));
                else return Response.json([]);
            case "get":
                console.log("entro");
                assert(addr !== undefined, "address is undefined");
                if(!session?.user?.email) return NextResponse.json({ message: 'Not authorized' }, { status: 401 });                
                const wallet = await getWallet(addr as string, session?.user?.email);
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

export async function POST(req: NextRequest) {  
    try {
        const session = await getServerSession(AUTH_OPTIONS);
        if(!session || !session?.user?.email) return NextResponse.json({ message: 'Not authorized' }, { status: 401 });
        const { action, addr } = getAction(req);
        let transaction: any;
        switch (action as string) {
            case "personalSign":
                const { message } = await req.json();
                return Response.json(await personalSign(session?.user?.email, addr as string, message));
            case "ethSendTransaction":
                transaction  = (await req.json()).transaction;
                return Response.json(await personalSign(session?.user?.email, addr as string, transaction));
            case "ethSignTransaction":
                transaction  = (await req.json()).transaction;
                return Response.json(await personalSign(session?.user?.email, addr as string, transaction));
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
 * /wallet/[addr]/update
 * /wallet/[addr]/get
 * /wallet/[addr]/delete
 * /wallet/[addr]/personalSign
 * /wallet/[addr]/ethSendTransaction
 * /wallet/[addr]/ethSignTransaction
 * @param 
 * @returns 
 */
const getAction = (req: NextRequest) => {
    const slugArray = req.nextUrl.pathname.split("/", 10).filter((slug) => slug !== "" && slug !== "wallet");

    let addr: string | undefined = undefined;
    let action: any = slugArray[0] as firstLevelActions;
    if (!isFirstLevelAction(action)) {
        action = slugArray[1] as secondLevelActions;
        console.log("action2: ", action);
        if (isSecondLevelAction(action)) {
            addr = slugArray[0];
        }
        else {
            throw new Error("Invalid Wallet action");
        }
    }
    return { action,  addr };
}

function isFirstLevelAction(input: unknown): input is firstLevelActions {
    return input === 'list' || input === 'create';
}

function isSecondLevelAction(input: unknown): input is secondLevelActions {
    return input === 'update' || input === 'get' || input === 'delete';
}
