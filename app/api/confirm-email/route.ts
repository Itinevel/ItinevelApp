import prisma from "@/app/_lib/db"
import { NextResponse } from "next/server"

export async function POST(req:Request) {
    const body = await req.json()
    const { token} = body
    try{
        if(!token) {
            return NextResponse.json({message:"Token invalide", status:"Invalide"})
        }
        const user = await prisma.users.findFirst({
            where:{
                confirmationToken:token,
                tokenExpiry:{gte: new Date() }
            }
        })
        if(!user){
            return NextResponse.json({message:"User not found", status:"Invalide"})
        }

        await prisma.users.update({
            where:{
                id: user.id
            },
            data:{
                emailConfirmed:true
            }
        })
        return NextResponse.json({message:" User Updated Succesfully", status:"success"})

    }catch(error){
        console.log("Error :", error)
        return new NextResponse("Internale error", {status:500})
    }
 }