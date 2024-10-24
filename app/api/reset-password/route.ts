import prisma from "@/app/_lib/db";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs"

export async function POST(req:Request){
    const body = await req.json()
    const {token,newPassword} = body;

     if (!token || !newPassword) {
    return NextResponse.json({message:"Token and new password are required",status:"Invalid"});

  }

  const user = await prisma.users.findFirst({
    where: {
      resetToken: token,
      resetTokenExpiry: {
        gte: new Date(), // Ensure the token hasn't expired
      },
    },
  });

  try {
  if (!user) {
    return NextResponse.json({message:"Invalid or expired reset token",status:"Invalid"});
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  // Update the user's password and clear the reset token and expiry
  await prisma.users.update({
    where: { id: user.id },
    data: {
      password: hashedPassword,
      resetToken: null,
      resetTokenExpiry: null,
    },
  });
  return NextResponse.json({message:"Invalid or expired reset token",status:"Invalid"});
} catch (err) {
    console.error("Error resetting password:", err);
    return NextResponse.json({message:"An error occurred while resetting your password",status:"Internal Server Error"});
  } 
}