import prisma from "@/app/_lib/db";
import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"

export async function POST(req:Request){
    const body = await req.json()
    const {email, password} = body

    if (!email || !password) {
        return NextResponse.json({ message: 'Please provide both email and password', status: 'Invalid' })
    }

    try {
    const user = await prisma.users.findUnique({
        where: { email },
      });
    
      if (!user) {
        return NextResponse.json({ message: 'User not found', status: 'Invalid' })
      }
      if (!user.emailConfirmed) {
        return NextResponse.json({ message: 'Email not confirmed', status: 'Invalid' })
      }

      const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
        return NextResponse.json({ message: 'Invalid password', status: 'Invalid' })
    }

    return NextResponse.json({
        id: user.id,
        email: user.email,
        roles: user.roles,  // Add roles if you need them in the frontend
        nom: user.nom,      // Include additional user info if needed
        prenom: user.prenom,
      }, { status: 200 });
    }
          catch (error) {
        console.error('Error during login:', error);
        return NextResponse.json({ message: 'Internal Server Error', status: 'Invalid' })
}}
