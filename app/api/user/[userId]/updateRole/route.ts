import { NextResponse } from 'next/server';
import prisma from '@/app/_lib/db'; // Adjust the Prisma client import path

export async function POST(req: Request, { params }: { params: { userId: string } }) {
  const { userId } = params;
  const { roles } = await req.json(); // Parse request body

  try {
    // Ensure roles are provided
    if (!roles || !Array.isArray(roles)) {
      return NextResponse.json({ error: 'Roles are required and must be an array' }, { status: 400 });
    }

    // Fetch the current user's roles from the database
    const user = await prisma.users.findUnique({
      where: { id: userId },
      select: { roles: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Merge new roles with existing roles, ensuring no duplicates
    const updatedRoles = Array.from(new Set([...user.roles, ...roles]));

    // Update the user's roles in the database
    const updatedUser = await prisma.users.update({
      where: { id: userId },
      data: {
        roles: {
          set: updatedRoles, // Update roles by setting the new array
        },
      },
    });

    return NextResponse.json({
      message: 'User roles updated successfully',
      user: updatedUser,
    }, { status: 200 });

  } catch (error) {
    console.error('Error updating roles:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
