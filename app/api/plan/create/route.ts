import { NextResponse } from 'next/server';
import prisma from '@/app/_lib/db'; // Adjust the path to your Prisma client
import Itinerary from '@/app/_lib/mongodb';
import connectMongoDB from '@/app/_lib/mongo'; // Mongoose model for Itinerary (adjust path)
import mongoose from 'mongoose'; // Assuming you're using Mongoose for MongoDB

export async function POST(req: Request) {
  await connectMongoDB(); 
  try {
    const body = await req.json(); // Parse the request body
    const { plan, itineraries } = body;
    const userId = plan.userId;

    // Check if userId exists
    if (!userId) {
      return NextResponse.json({ message: 'User ID is required to create a plan' }, { status: 400 });
    }

    let itineraryIds: string[] = [];

    // Save each itinerary in MongoDB and collect their IDs
    for (const itineraryData of itineraries) {
      const newItinerary = new Itinerary(itineraryData);
      const savedItinerary = await newItinerary.save(); // Save in MongoDB
      itineraryIds.push(savedItinerary._id.toString()); // Collect itinerary IDs
    }

    // Create the plan in PostgreSQL (Prisma)
    const newPlan = await prisma.plan.create({
      data: {
        name: plan.name,
        description: plan.description,
        totalDays: itineraryIds.length, // Total number of itineraries = total days
        itineraries: itineraryIds, // Reference itinerary IDs (from MongoDB)
        imageUrls: plan.imageUrls, // Array of image URLs
        selectedCountries: plan.selectedCountries, // Countries associated with the plan
        totalPrice: plan.totalPrice, // Total price of the plan
        totalCost: plan.totalCost, // Total cost of the plan
        sell: plan.sell, // Boolean flag indicating if the plan is for sale
        userId: userId, // The user who created the plan
      },
    });

    // Connect the newly created plan to the user
    await prisma.users.update({
      where: { id: userId },
      data: {
        plans: {
          connect: { id: newPlan.id }, // Connect the new plan to the user in PostgreSQL
        },
      },
    });

    // Return the response with the new plan
    return NextResponse.json({ message: 'Plan created successfully', newPlan }, { status: 201 });

  } catch (error) {
    console.error('Error creating plan:', (error as Error).message);
    return NextResponse.json({ message: 'Failed to create plan', error: (error as Error).message }, { status: 500 });
  }
}
