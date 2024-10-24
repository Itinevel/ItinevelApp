import { NextResponse } from 'next/server';
import prisma from '@/app/_lib/db'; // Ensure your Prisma client is properly initialized here
import bcrypt from 'bcryptjs';


export async function GET(req: Request, { params }: { params: { userId: string } }) {
  const { userId } = params;

  try {
    // Fetch user profile based on the provided userId
    const user = await prisma.users.findUnique({
      where: {
        id: userId, // Assuming `id` is the field in your Prisma schema
      },
    });

    // Check if the user exists
    if (!user) {
      return NextResponse.json({ message: 'User not found', status: 'Invalid' }, { status: 404 });
    }

    // Respond with the user profile details
    return NextResponse.json({
      id: user.id,
      name: user.nom,
      email: user.email,
      roles: user.roles,
      emailConfirmed: user.emailConfirmed,
    }, { status: 200 });

  } catch (error) {
    console.error("Error fetching user profile:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: { userId: string } }) {
  const { oldPassword, password, name, surname, phone } = await req.json();
  const { userId } = params;

  try {
    // Find the user by ID
    const user = await prisma.users.findUnique({ where: { id: userId } });

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    // Validate old password
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return NextResponse.json({ message: 'Invalid old password' }, { status: 400 });
    }

    // Hash new password if provided
    let updatedPassword = user.password;
    if (password) {
      const salt = await bcrypt.genSalt(10);
      updatedPassword = await bcrypt.hash(password, salt);
    }

    // Update the user
    const updatedUser = await prisma.users.update({
      where: { id: userId },
      data: {
        nom: name,
        prenom: surname,
        em_number: phone,
        password: updatedPassword,
      },
    });

    return NextResponse.json(updatedUser, { status: 200 });
  } catch (error) {
    console.error('Error updating user:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
