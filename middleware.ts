import NextAuth from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import authConfig from "./auth.config";
const { auth} =NextAuth(authConfig)
export default auth(async function middleware(req:NextRequest){
    return NextResponse.next()
})