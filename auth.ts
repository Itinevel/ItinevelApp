import NextAuth from "next-auth"
import prisma from "./app/_lib/db"
import authConfig from "./auth.config"
import { PrismaAdapter } from "@auth/prisma-adapter"
export const { handlers:{GET,POST},
       auth,
       signIn,
       signOut         
}= NextAuth({
  adapter: PrismaAdapter(prisma),
  ...authConfig
})