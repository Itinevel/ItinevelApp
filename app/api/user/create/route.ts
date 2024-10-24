import prisma from "@/app/_lib/db"
import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import nodemailer from 'nodemailer';
import { v4 as uuidv4 } from 'uuid'; 
import dotenv from 'dotenv';

dotenv.config();

// Create reusable transporter object using the default SMTP transport
const transporter = nodemailer.createTransport({
  service: 'Gmail', // You can use other services like Outlook or custom SMTP
  auth: {
    user: process.env.EMAIL_USER, // Add this in your .env file
    pass: process.env.EMAIL_PASS, // Add this in your .env file
  },
});
const sendConfirmationEmail = async (email: string, token: string) => {
    const confirmationUrl = `http://localhost:3000/confirm-email?token=${token}`; // Adjust to your front-end domain
  
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Confirm your email address',
      html: `
        <h1>Email Confirmation</h1>
        <p>Thank you for registering! Please confirm your email by clicking the link below:</p>
        <a href="${confirmationUrl}">Confirm Email</a>
      `,
    };
  
    // Logging mail options for debugging
    //console.log("Sending email to:", email);
    //console.log("Confirmation URL:", confirmationUrl);
    
    try {
      // Send email and log success
      const info = await transporter.sendMail(mailOptions);
      //console.log("Email sent successfully:", info);
    } catch (error) {
      // Log the error if email fails to send
      console.error("Error sending email:", error);
    }
  };

export  async function POST(req:Request){
    const body = await req.json()
    const {email, password, nom, roles} = body
    try{
        if(!email ){
            return NextResponse.json({message:"Please enter an email address",status:"Invalid"})
        }
        if(!password){
            return NextResponse.json({message:"Please enter a password",status:"Invalid"})
        }
        if(!nom){
            return NextResponse.json({ message:"Please  enter a username", status:"Invalid"})
        }
        const existinguser = await prisma.users.findFirst({
            where:{email:email}
        })
        if( existinguser){
            return NextResponse.json({message:" Email already exists",status:"Invalid"})
        }
        // Generate confirmation token
        const confirmationToken = uuidv4();
        const tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);
        const hashedPassword = await bcrypt.hash(password, 10);
        const userole = roles.includes('SELLER') ? roles.push('SELLER') : roles
        const newUser = await prisma.users.create({
            data:{
                email,
                password:hashedPassword,
                nom,
                confirmationToken,
                tokenExpiry,
                emailConfirmed:false,
                roles:userole
            }
        })
        await sendConfirmationEmail(email, confirmationToken);
        return NextResponse.json({message:" User created successfully",status:'success'})

    }catch(error){
        console.log("Error :", error)
        return new NextResponse("Internal Server Error", {status:500})
    }
}