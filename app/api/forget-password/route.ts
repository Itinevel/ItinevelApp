import prisma from "@/app/_lib/db";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs"
import { v4 as uuidv4 } from 'uuid';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
    service: 'Gmail', // You can use other services like Outlook or custom SMTP
    auth: {
      user: process.env.EMAIL_USER, // Add this in your .env file
      pass: process.env.EMAIL_PASS, // Add this in your .env file
    },
  });

export const sendPasswordResetEmail = async (email: string, token: string) => {
    const resetLink = `http://localhost:3000/reset-password?token=${token}`; // Replace with your frontend URL
  
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Password Reset Request',
      html: `<p>You requested a password reset. Click the link below to reset your password:</p>
             <a href="${resetLink}">Reset Password</a>
             <p>If you did not request this, please ignore this email.</p>`,
    };
  
    try {
      // Reuse the same transporter object
      const info = await transporter.sendMail(mailOptions);
      console.log("Password reset email sent successfully:", info);
    } catch (error) {
      console.error("Error sending password reset email:", error);
    }
  };

export async function POST(req:Request){
    const body = await req.json()
    const {email} = body;

     if (!email) {
    return NextResponse.json({message:"Email is required",status:"Invalid"});

  }

  const user = await prisma.users.findFirst({
    where: { email },
  });

  try {
  if (!user) {
    return NextResponse.json({message:"User with this email does not exist",status:"Invalid"});
  }

    
    // Generate a password reset token and its expiry (1 hour)
    const resetToken = uuidv4();
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour expiry

  // Update the user's password and clear the reset token and expiry
  await prisma.users.update({
    where: { email },
    data: {
      resetToken,
      resetTokenExpiry,
    },
  });

  await sendPasswordResetEmail(email, resetToken);
  return NextResponse.json({message:"Password reset link sent. Check your email.",status:"valid"});
} catch (error) {
    console.error('Error generating password reset token:', error);
    return NextResponse.json({message:"Internal server error",status:"Internal Server Error"});
  } 
}