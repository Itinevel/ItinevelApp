import { NextResponse } from 'next/server';
import prisma from '@/app/_lib/db'; // Adjust path to your Prisma client

export async function GET(req: Request, { params }: { params: { userId: string } }) {
  try {
    const { userId } = params;

    // Fetch plans from the database where userId matches (userId is expected to be a string)
    const plans = await prisma.plan.findMany({
      where: { userId: userId }, // Do not convert userId to a number, keep it as a string
    });

    // If no plans are found, return an empty response
    if (!plans || plans.length === 0) {
      return NextResponse.json([]);
    }

    // Return the fetched plans
    return NextResponse.json(plans, { status: 200 });
  } catch (error) {
    console.error('Error fetching plans:', error);
    return NextResponse.json({ message: 'Failed to fetch plans' }, { status: 500 });
  }
}
