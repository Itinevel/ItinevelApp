import { NextResponse } from 'next/server';
import prisma from '@/app/_lib/db'; // Adjust to your Prisma client setup

// Function to ensure the query is properly cast to string[]
const castToStringArray = (param: string | string[] | undefined): string[] => {
  if (Array.isArray(param)) {
    return param.map(String); // Ensure all elements are cast to strings
  }
  return param ? [String(param)] : [];
};

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  
  try {
    // Extract query parameters with default values
    const sortOption = searchParams.get('sortOption') || 'name';
    const isAscending = searchParams.get('isAscending') || 'true';
    const searchQuery = searchParams.get('searchQuery') || '';
    const budgetRange = searchParams.getAll('budgetRange') || ['0', '1000000'];
    const daysRange = searchParams.getAll('daysRange') || ['1', '30'];
    const selectedCountries = searchParams.getAll('selectedCountries') || [];
    const selectedAccommodations = searchParams.getAll('selectedAccommodations') || [];
    const selectedSeasons = searchParams.getAll('selectedSeasons') || [];
    const sell = searchParams.get('sell') || 'true';

    // Parse numeric values from budgetRange and daysRange
    const budgetRangeParsed: number[] = budgetRange.map(Number);
    const daysRangeParsed: number[] = daysRange.map(Number);

    // Cast array parameters to string arrays
    const selectedCountriesParsed: string[] = castToStringArray(selectedCountries);
    const selectedAccommodationsParsed: string[] = castToStringArray(selectedAccommodations);
    const selectedSeasonsParsed: string[] = castToStringArray(selectedSeasons);

    // Build filter conditions for Prisma query
    const filterConditions: any = {};

    // Apply sell filter
    if (sell) {
      filterConditions.sell = sell === 'true'; // Convert the 'sell' string to a boolean
    }

    // Search query filtering
    if (searchQuery) {
      filterConditions.OR = [
        { name: { contains: searchQuery, mode: 'insensitive' } },
        { description: { contains: searchQuery, mode: 'insensitive' } }
      ];
    }

    // Budget range filtering
    if (budgetRangeParsed.length === 2) {
      filterConditions.totalPrice = {
        gte: budgetRangeParsed[0],
        lte: budgetRangeParsed[1],
      };
    }

    // Days range filtering
    if (daysRangeParsed.length === 2) {
      filterConditions.totalDays = {
        gte: daysRangeParsed[0],
        lte: daysRangeParsed[1],
      };
    }

    // Country filtering (if provided)
    if (selectedCountriesParsed.length > 0) {
      filterConditions.selectedCountries = { hasSome: selectedCountriesParsed };
    }

    // Accommodation filtering (optional field in Plan model)
    if (selectedAccommodationsParsed.length > 0) {
      filterConditions.accommodation = { hasSome: selectedAccommodationsParsed };
    }

    // Season filtering (optional field in Plan model)
    if (selectedSeasonsParsed.length > 0) {
      filterConditions.season = { hasSome: selectedSeasonsParsed };
    }

    // Determine sorting order
    const sortCondition: any = {};
    sortCondition[sortOption] = isAscending === 'true' ? 'asc' : 'desc';

    // Fetch plans from the database with filtering and sorting
    const plans = await prisma.plan.findMany({
      where: filterConditions,
      orderBy: sortCondition,
    });

    // Return plans as JSON
    return NextResponse.json(plans, { status: 200 });
    
  } catch (error: unknown) {
    console.error('Error fetching plans:', error);
    return new NextResponse('Failed to fetch plans', { status: 500 });
  }
}
