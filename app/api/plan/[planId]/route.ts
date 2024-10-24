import { NextResponse } from 'next/server';
import prisma from '@/app/_lib/db';
import Itinerary from '@/app/_lib/mongodb'; // Mongoose model for Itinerary
import connectMongoDB from '@/app/_lib/mongo'; 

export async function PUT(req: Request, { params }: { params: { planId: string } }) {
  await connectMongoDB();
  try {
    console.log("Request Parameters:", params); // Log the entire params object
    const { planId } = params; // Extract planId from params
    console.log("Plan ID from params:", planId); // Log extracted planId
    
    const numericPlanId = Number(planId); // Convert to number
    console.log("Numeric Plan ID:", numericPlanId); // Log converted numeric ID

    if (isNaN(numericPlanId)) {
      console.error('Invalid Plan ID. Plan ID must be a valid number.');
      return NextResponse.json({ message: 'Plan ID must be a valid number' }, { status: 400 });
    }
    const body = await req.json();

    console.log('Received PUT request body:', body);
    const { plan, itineraries } = body;
    console.log('Received itineraries data:', JSON.stringify(itineraries, null, 2));

    // Convert planId to a number
    
    console.log(planId);
    // If planId is not a valid number, return an error
    console.log("noooooo",planId);
    // Update or create itineraries
    let itineraryIds: string[] = [];

    for (const itineraryData of itineraries) {
      if (typeof itineraryData === 'string') {
        itineraryIds.push(itineraryData);
      } else if (typeof itineraryData === 'object' && itineraryData._id) {
        console.log('Saving itinerary:', itineraryData._id || 'New Itinerary');
        
        await Itinerary.findByIdAndUpdate(itineraryData._id, itineraryData);
        itineraryIds.push(itineraryData._id.toString());
      } else if (typeof itineraryData === 'object') {
        const newItinerary = new Itinerary(itineraryData);
        const savedItinerary = await newItinerary.save();
        itineraryIds.push(savedItinerary._id.toString());
      } else {
        throw new Error("Invalid itinerary data: Expected an object or string.");
      }
    }

    // Update the plan in PostgreSQL using Prisma
    const updatedPlan = await prisma.plan.update({
      where: { id: Number(planId) }, // Use the numeric version of the planId
      data: {
        name: plan.name,
        description: plan.description,
        itineraries: itineraryIds, // Updated itinerary IDs
        imageUrls: plan.imageUrls, // Updated image URLs
        selectedCountries: plan.selectedCountries, // Updated selected countries
        totalPrice: plan.totalPrice, // Updated total price
        totalCost: plan.totalCost, // Updated total cost
        sell: plan.sell, // Updated sell status
      },
    });

    return NextResponse.json({ message: 'Plan updated successfully', updatedPlan }, { status: 200 });

  } catch (error) {
    console.error('Error updating plan:', error);
    return NextResponse.json({ message: 'Failed to update plan', error: (error as Error).message }, { status: 500 });
  }
}

// GET method for fetching the plan with its itineraries
 export async function GET(req: Request, { params }: { params: { planId: string } }) {
  await connectMongoDB(); // Ensure MongoDB is connected

  try {
      const { planId } = params;

      // Fetch the plan from PostgreSQL
      const plan = await prisma.plan.findUnique({
          where: {
              id: parseInt(planId),
          },
      });

      if (!plan) {
          return NextResponse.json({ message: 'Plan not found' }, { status: 404 });
      }

      // Fetch the itineraries from MongoDB based on the itinerary IDs stored in the plan
      const itineraryDetails = await Promise.all(
          plan.itineraries.map((itineraryId: string) => 
              Itinerary.findById(itineraryId).catch(() => null) // Catch any errors and return null for failed lookups
          )
      );

      // Filter out null (failed) itineraries
      const validItineraries = itineraryDetails.filter(itinerary => itinerary !== null);

      return NextResponse.json({
          plan,
          itineraries: validItineraries,
      });
  } catch (error) {
      console.error('Error retrieving plan and itineraries:', error);
      return NextResponse.json({ message: 'Failed to retrieve plan and itineraries' }, { status: 500 });
  }
}

