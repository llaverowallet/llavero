import NextAuth, { AuthOptions } from "next-auth";
import { AUTH_OPTIONS } from "@/utils/auth";


const handler = NextAuth(AUTH_OPTIONS);
export { handler as GET, handler as POST }
