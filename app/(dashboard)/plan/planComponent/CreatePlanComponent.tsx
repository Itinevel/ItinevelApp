"use client";

import React, { useState, useEffect } from 'react';
import CreateItineraryPage from './CreateItineraryComponent.tsx';
import { GoogleMapComponentProps, ItineraryData, Plan, InitialPlan } from '@/interfaces/Itinerary';
import GoogleMapComponent from '@/components/GoogleMapComponent';
import { TripLocation } from '@/interfaces/Itinerary';
import { FaArrowLeft, FaArrowRight, FaPlus } from 'react-icons/fa';
import { FaPlusCircle } from 'react-icons/fa';
import { countriesData } from './../../../../data/countries'; // Adjust the path as necessary
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from '@/config/firebaseConfig'; 
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface Props {
  initialPlan?: InitialPlan;
}

const CreatePlan = ({ initialPlan }: any) => {
  const { data: session, status } = useSession()
  const [isSelling, setIsSelling] = useState(false); // Track selling state
  const [sellConfirmationOpen, setSellConfirmationOpen] = useState(false); // Track confirmation modal state
  const [imageUrls, setImageUrls] = useState<string[]>([]); // For handling uploaded images
  const [totalPrice, setTotalPrice] = useState<number | ''>('');
  // Update the type of days to string[]
  const [days, setDays] = useState<string[]>(() => {
    if (initialPlan && initialPlan.itineraries) {
      // If initialPlan has itineraries, map keys to increment day numbers
      return Object.keys(initialPlan.itineraries).map((day) => (parseInt(day, 10) + 1).toString());
    } else {
      // For a new plan, start with Day 1
      return ['1'];
    }
  });

   // Strings instead of numbers
  const [selectedDay, setSelectedDay] = useState<number>(1);
  const [startDayIndex, setStartDayIndex] = useState<number>(0); // To control the view of days
  const daysToShow = 10; // Number of days to display at once
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [price, setPrice] = useState<number | ''>('');
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocations, setSelectedLocations] = useState<GoogleMapComponentProps["selectedLocations"]>([]);
  const [planId, setPlanId] = useState<number | null>(
    initialPlan && initialPlan.plan.id ? parseInt(initialPlan.plan.id, 10) : null
  );
  const [plan, setPlan] = useState<Plan>(
    initialPlan ? initialPlan.plan : {
      name: '',
      description: '',
      totalDays: 1,
      itineraries: {
        1: {
          title: "Initial Trip",
          itineraryId: 1,
          description: "Initial day of the trip",
          locations: [],
          allTransports: []
        }
      }
    }
  );
  const [userPlans, setUserPlans] = useState<Plan[]>([]);
  const isLoggedIn = status === 'authenticated';
  const userRoles = session?.user?.roles || [];
  const isSeller = userRoles.includes('SELLER');
  const userId = session?.user?.id;
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [totalDays, setTotalDays] = useState(() => initialPlan ? Object.keys(initialPlan.itineraries).length : 1);

  useEffect(() => {
    if (status === 'loading') {
      // Wait for the session status to be fully loaded before making any decision
      return;
    }

    if (!isLoggedIn) {
      // If user is not logged in, redirect to login page
      router.push('/login');
      return;
    }

    if (!isSeller) {
      // If user is not a seller, redirect to the market page
      router.push('/market');
      return;
    }


    const fetchUserPlans = async () => {
      try {
        const response = await fetch(`/api/user/${session.user.id}/plans`);
        if (!response.ok) {
          console.log("No plan found, creating a new plan");
        }

        const data = await response.json();
        if (data.plans) {
        setUserPlans(data.plans);
        router.push(`/plan/${data.plans[0].id}`);
        } else {
        setUserPlans([]);
        }
        console.log('Plans fetched', data.plans);

      
      } catch (error) {
        console.error('Error fetching user plans:', error);
      } finally {
        setLoading(false);
      }
    };

    
    fetchUserPlans();
    
  }, [isLoggedIn, isSeller, userId, router, status]);

  useEffect(() => {
    const savedPlan = sessionStorage.getItem('plan-itineraries');
    
    if (savedPlan) {
      try {
        const parsedPlan = JSON.parse(savedPlan);
        
        if (parsedPlan?.itineraries) {
          setPlan(parsedPlan);
          setTotalDays(parsedPlan.totalDays || Object.keys(parsedPlan.itineraries).length);
          const initialDay = Number(Object.keys(parsedPlan.itineraries)[0]);
          setSelectedDay(initialDay);
          
          const locationsForInitialDay = parsedPlan.itineraries[initialDay]?.locations || [];
          setSelectedLocations(locationsForInitialDay.map((loc: TripLocation) => ({
            geometry: { coordinates: loc.details.coordinates || { lat: 0, lng: 0 } },
            description: loc.details.value
          })));
          
          setTitle(parsedPlan.name || '');
          setDescription(parsedPlan.description || '');
          setTotalPrice(parsedPlan.totalPrice || 0);
      
        }
      } catch (error) {
        console.error("Error parsing saved plan:", error);
        sessionStorage.removeItem('plan-itineraries');
      }
    } else {
      setSelectedDay(1);
    }
  }, []); // Ensure this only runs once

  useEffect(() => {
    if (userPlans.length > 0) {
      // Redirect to edit page if user has already created plans
      router.push(`/plan/${userPlans[0].id}`);
    }
  }, [userPlans, router]);

  // Ensure session storage is updated only after each state update is complete
useEffect(() => {
  if (plan) {
    // Save the entire updated plan to session storage after any change to the plan
    try {
      sessionStorage.setItem('plan-itineraries', JSON.stringify(plan));
      console.log("Updated plan saved to session storage:", plan);
    } catch (error) {
      console.error("Error saving plan to session storage:", error);
    }
  }
}, [plan]); // Run this effect every time `plan` changes

 // Empty dependency array ensures this runs only once on component mount
 useEffect(() => {
  if (plan.itineraries && plan.itineraries[selectedDay] && plan.itineraries[selectedDay].locations) {
    const currentLocations = plan.itineraries[selectedDay].locations.map((loc: TripLocation) => ({
      geometry: { 
        coordinates: loc.details.coordinates || { lat: 0, lng: 0 } // Provide default coordinates
      },
      description: loc.details.value || '', // Ensure description is a string
    }));

    if (currentLocations.length > 0) {
      // If there's at least one location, set it as a marker
      setSelectedLocations(currentLocations);
    }

    if (currentLocations.length >= 2) {
      // When two or more locations are added, update directions
      setSelectedLocations(currentLocations);
    }
  }
}, [plan.itineraries, selectedDay]); // Ensure dependencies include the required state

useEffect(() => {
  if (plan.sell) {
    setIsSelling(true); // Set to true if the plan is already on market
  }
}, [plan.sell]);

useEffect(() => {
  if (initialPlan) {
    
    console.log('Parsed plan before convert to number', initialPlan);
    
    // Access the id from initialPlan.plan
    const planIdParsed = initialPlan.plan.id ;
    setPlanId(planIdParsed);
    console.log('Parsed planId:', planIdParsed);
    
    console.log('Initial Plan Itineraries:', initialPlan.itineraries);

    // Set days based on the itineraries
    setDays(initialPlan.itineraries.map((_: unknown, index: number) => (index + 1).toString()));


    setSelectedDay(Number(Object.keys(initialPlan.itineraries)[0]));

  }
}, [initialPlan]);


useEffect(() => {
  const savedPlan = sessionStorage.getItem('plan-itineraries');
  
  if (savedPlan) {
    try {
      const parsedPlan = JSON.parse(savedPlan);
      
      // Ensure parsedPlan has itineraries before using it
      if (parsedPlan?.itineraries) {
        setPlan(parsedPlan);
        
        const initialDay = Number(Object.keys(parsedPlan.itineraries)[0]);
        setSelectedDay(initialDay);

        setSelectedLocations(
          (parsedPlan.itineraries[initialDay]?.locations || [])
            .map((loc: TripLocation) => ({
              lat: loc.details.coordinates?.lat || 0,
              lng: loc.details.coordinates?.lng || 0,
              description: loc.details.value
            }))
            .filter((loc: { lat: number; lng: number }) => loc.lat !== 0 && loc.lng !== 0) || []
        );

        setTitle(parsedPlan.name);
        setDescription(parsedPlan.description);
        setTotalPrice(parsedPlan.totalCost);
      } else {
        console.error("No itineraries found in the saved plan");
      }
    } catch (error) {
      console.error("Error parsing saved plan:", error);
      // Optionally, clear sessionStorage or handle the invalid data
      sessionStorage.removeItem('plan-itineraries');
    }
  } else {
    console.log('No saved plan found in sessionStorage');
    setSelectedDay(1);
  }
}, []);

  useEffect(() => {
    if (initialPlan) {
      const dayKeys = initialPlan.itineraries;
      console.log(dayKeys);
      
      setDays(Object.keys(initialPlan.itineraries));
      setSelectedDay(Number(dayKeys[0] || 1));
      // Set other related states based on initialPlan
    } else {
      // Setup for creating new plan
      setDays(['1']);  // Ensure 'Day 1' is always available when creating a new plan
      setSelectedDay(1);
      setPlan({
        name: '',
        description: '',
        totalDays: 1,
        itineraries: {
          1: {
            title: "Initial Trip",
            itineraryId: 1,
            description: "Initial day of the trip",
            locations: [],
            allTransports: []
          }
        },
        sell: false,
        totalPrice: 0,
        cost: 0,
      });
    }
  }, [initialPlan]);

  
  if (loading || status === 'loading') {
    return <div>Loading...</div>; // Show loading state while the session and user data is being fetched
  }
  

const handleSellPlan = () => {
    setSellConfirmationOpen(true);
  };

  const handleConfirmSell = () => {
    setIsSelling(true);
    setSellConfirmationOpen(false);
    sessionStorage.setItem('sellStatus', 'true');
    handleSavePlan();
    // Store 'sell' status in session storage
    // Set to true when confirmed
  
    console.log('Plan will be marked as sold when saved');
  };
  

  const handleCancelSell = () => {
    setSellConfirmationOpen(false);
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
        const newFiles = Array.from(files);
        let uploadedImageUrl = '';

        for (const file of newFiles) {
            const storageRef = ref(storage, `images/${file.name}`);
            // Upload to Firebase
            await uploadBytes(storageRef, file);
            // Get the download URL after upload
            uploadedImageUrl = await getDownloadURL(storageRef);
        }

        // Save the image URL inside the plan.images[] array
        setPlan(prevPlan => {
            const updatedImages = [...(prevPlan.imageUrls || []), uploadedImageUrl]; // Add the new image to the existing array
            const updatedPlan = {
                ...prevPlan,
                imageUrls: updatedImages // Update the imageUrls array inside the plan
            };

            // Save the updated plan to session storage
            sessionStorage.setItem('plan-itineraries', JSON.stringify(updatedPlan));

            return updatedPlan; // Update the state with the new plan
        });

        // Set the imageUrl to display in the modal immediately
        setImageUrl(uploadedImageUrl);
    }
};

const handleSaveTitleDescription = () => {
  // Ensure the imageUrl is properly added to the imageUrls array in the plan
  const updatedImageUrls = imageUrl ? [imageUrl] : []; // Single image as a URL

  // Create an updated plan object
  const updatedPlan = {
    ...plan,
    name: title, // Update the plan name
    description: description, // Update the plan description
    imageUrls: updatedImageUrls, // Save the single image URL
    selectedCountries: selectedCountries, // Save selected countries
    totalPrice: Object.values(plan.itineraries).reduce((sum, itinerary) => sum + (itinerary.totalCost || 0), 0), // Calculate totalPrice
    totalCost: totalPrice !== '' ? Number(totalPrice) : 0,
  };

  // Update the plan in state
  setPlan(updatedPlan);

  // Save the updated plan to session storage
  sessionStorage.setItem('plan-itineraries', JSON.stringify(updatedPlan));

  // Log the save operation for debugging purposes
  console.log('Updated Plan Saved to Session Storage:', updatedPlan);

  // Close the modal after saving
  setEditModalOpen(false);
};

  const createNewItineraryStructure = (day: number): ItineraryData => ({
    title: `Trip Day ${day}`,
    itineraryId: day,
    description: `Description for Day ${day}`,
    locations: [],
    allTransports: []
  });

  const handleSelectDay = (day: string) => {
    const dayNumber = Number(day);

    // Retrieve the saved itinerary from sessionStorage if it exists
    const savedItinerary = sessionStorage.getItem(`itinerary-${dayNumber}`);

    if (savedItinerary) {
        const parsedItinerary = JSON.parse(savedItinerary);
        console.log(`Loaded itinerary for day ${dayNumber} from sessionStorage:`, parsedItinerary);

        // Update locations for the selected day
        setSelectedLocations(
            parsedItinerary.locations?.map((loc: TripLocation) => ({
                geometry: {
                    coordinates: {
                        lat: loc.details.coordinates?.lat || 0,
                        lng: loc.details.coordinates?.lng || 0,
                    }
                },
                description: loc.details.value || '',
            })) || []
        );
    } else {
        // Fallback: Load from the initial plan if sessionStorage doesn't have data
        const selectedLocationsForDay = plan.itineraries[dayNumber]?.locations?.map((loc: TripLocation) => ({
            geometry: {
                coordinates: {
                    lat: loc.details.coordinates?.lat || 0,
                    lng: loc.details.coordinates?.lng || 0,
                }
            },
            description: loc.details.value || '',
        })) || [];

        setSelectedLocations(selectedLocationsForDay);
    }

    // Finally, update the selected day
    setSelectedDay(dayNumber);
};


const addDay = () => {
  const newDayNumber = days.length > 0 
    ? Math.max(...days.map(day => Number(day))) + 1 
    : 1;

  // Add the new day
  setDays(prevDays => [...prevDays, newDayNumber.toString()]);

  setPlan(prevPlan => {
    const newItineraries = {
      ...prevPlan.itineraries,
      [newDayNumber]: createNewItineraryStructure(newDayNumber)
    };

    const updatedTotalDays = Object.keys(newItineraries).length;

    const updatedPlan = {
      ...prevPlan,
      itineraries: newItineraries,
      totalDays: updatedTotalDays,  // Update totalDays dynamically
    };

    // Save updated plan to session storage
    sessionStorage.setItem('plan-itineraries', JSON.stringify(updatedPlan));
    console.log('Updated Total Days:', updatedTotalDays);

    return updatedPlan;
  });

  setSelectedDay(newDayNumber);
};







const handleItineraryUpdate = (day: number, newItinerary: ItineraryData) => {
  console.log("Updating Itinerary for Day:", day, "with Data:", newItinerary);

  // Calculate total cost for the updated itinerary
  const calculatedTotalCost = calculateTotalCost(newItinerary);

  setPlan(prevPlan => {
    // Merge new data with the previous itinerary to avoid overwriting other days
    const updatedItineraries = {
      ...prevPlan.itineraries,
      [day]: {
        ...newItinerary,
        itineraryId: newItinerary.itineraryId || day, // Ensure the itineraryId is set
        totalCost: calculatedTotalCost, // Update the total cost for the day
      }
    };

    // Calculate the total price for the entire plan
    const totalPlanPrice = Object.values(updatedItineraries).reduce(
      (sum, itinerary) => sum + (itinerary.totalCost || 0),
      0
    );

    return {
      ...prevPlan,
      itineraries: updatedItineraries, // Ensure all days' itineraries are preserved
      totalPrice: totalPlanPrice // Update total price for the entire plan
    };
  });
};

  

// Helper function to calculate total cost for the itinerary
const calculateTotalCost = (itinerary: ItineraryData): number => {
  const locationCost = itinerary.locations.reduce((total, location) => {
    const itemsTotal = location.details.items.reduce((sum, item) => sum + item.price, 0);
    return total + itemsTotal;
  }, 0);

  const transportCost = itinerary.allTransports.reduce((total, transport) => {
    const transportDetailsTotal = transport.details.reduce((sum, detail) => sum + detail.priceFrom, 0);
    return total + transportDetailsTotal;
  }, 0);

  return locationCost + transportCost;
};

  
  // Helper function to calculate the total price for an itinerary
  const calculateTotalPrice = (itineraries: Record<number, ItineraryData>): number => {
    return Object.values(itineraries).reduce((sum, itinerary) => {
      return sum + (itinerary.totalPrice || 0); // Ensure you're using the correct property
    }, 0);
  };
  
  

  // Assuming the `plan` object contains your plan details, including the `id` if it's being edited
  const handleSavePlan = async () => {
    if (isSelling) {
      console.error("Plan is already sold. Modifications are not allowed.");
      return;
    }
    // Retrieve the 'sell' status from session storage, or default to false if not set
    const sellStatus = sessionStorage.getItem('sellStatus') === 'true';
    const userId = session?.user?.id;

    if (!userId) {
      console.error('User ID is missing. Please log in.');
      return; // Exit if userId is not available
    }
    // Construct the payload to include 'sell' status
    const payload = {
      plan: {
        name: plan.name,
        description: plan.description,
        imageUrls: plan.imageUrls,
        selectedCountries: plan.selectedCountries,
        totalPrice: plan.totalPrice,
        totalCost: plan.cost, // Ensure this is correct (previously 'cost')
        sell: sellStatus,
        userId: userId, 
      },
      itineraries: Object.values(plan.itineraries),  // Ensure that itineraries are correctly formatted
    };
  
    const endpoint = plan.id
    ? `/api/plan/${plan.id}`
    : `/api/plan/create`;
    const method = plan.id ? 'PUT' : 'POST';

    console.log("PUT request to:", endpoint);
    console.log("Sending payload:", JSON.stringify(payload, null, 2));
  
    try {
      const response = await fetch(endpoint, {
        method: method,  // Dynamic method based on whether it is an update or create
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),  // Send the constructed payload
      });
  
      if (!response.ok) {
        throw new Error(`Failed to ${plan.id ? 'update' : 'create'} plan with ID: ${plan.id}`);
      }
  
      const responseData = await response.json();
      console.log(`${plan.id ? 'Updated' : 'New'} plan response:`, responseData);
  
      // Optionally, clear the sell status from session storage after saving
      sessionStorage.removeItem('sellStatus');
  
      // Perform any additional success handling
    } catch (error) {
      console.error("Error in saving plan:", error);
      // Handle error
    }
  };
  

  const handlePreviousDays = () => {
    if (startDayIndex > 0) {
      setStartDayIndex(startDayIndex - 1);
    }
  };

  const handleNextDays = () => {
    if (startDayIndex + daysToShow < days.length) {
      setStartDayIndex(startDayIndex + 1);
    }
  };
  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const value = e.target.value === '' ? '' : Number(e.target.value);
  setPrice(value);
};
const handleTotalPriceChange = (day: number, totalCost: number) => {
  console.log(`Received total cost for day ${day}:`, totalCost);

  setPlan(prevPlan => {
    // Update the total cost for the specific day
    const updatedItineraries = {
      ...prevPlan.itineraries,
      [day]: {
        ...prevPlan.itineraries[day],
        totalPrice: totalCost // Update the itinerary's total cost
      }
    };

    // Calculate the total price of the plan
    const totalPlanPrice = Object.values(updatedItineraries).reduce(
      (sum, itinerary) => sum + (itinerary.totalPrice || 0), 0
    );
    console.log(`Total plan price after updating day ${day}:`, totalPlanPrice);

    // Return the updated plan with recalculated total price
    return {
      ...prevPlan,
      itineraries: updatedItineraries,
      totalPrice: totalPlanPrice // Update the total price of the entire plan
    };
  });
};

const handleCountryChange = (countryName: string) => {
  if (selectedCountries.includes(countryName)) {
    setSelectedCountries(selectedCountries.filter(country => country !== countryName));
  } else {
    setSelectedCountries([...selectedCountries, countryName]);
  }
};

const handleClearSelection = () => {
  setSelectedCountries([]);
};

const filteredCountries = countriesData.filter(country =>
  country.name.toLowerCase().includes(searchQuery.toLowerCase())
);


  return (
    <div className="lg:flex md:flex min-h-screen bg-gradient-to-r from-gray-100 to-blue-100" style={{ fontFamily: 'Amifer, sans-serif' }}>
      {/* Left Section - Day Parser */}
      <div className="w-full lg:w-[55%] md:w-[55%]  flex flex-col shadow-lg">
  <div className="pt-6 mr-1 ml-2 mb-4 mt-12 bg-gradient-to-r from-gray-100 to-blue-75 flex items-center gap-1 2xl:gap-4 ">
      <button
        onClick={handlePreviousDays}
        disabled={startDayIndex === 0}
        className={`p-2 rounded-full bg-blue-500 text-[8px] lg:text-sm text-white hover:bg-blue-600 ${startDayIndex === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <FaArrowLeft />
      </button>
    <div className="flex items-center  justify-between  w-full ">
      <div className="items-center space-x-1 2xl:space-x-2 grid grid-cols-10">
        {days.slice(startDayIndex, startDayIndex + daysToShow).map((day, index) => (
          <button
            key={index}
            onClick={() => {
              handleSelectDay(day);
              setSelectedLocations(
                plan.itineraries[Number(day)]?.locations?.map((loc: TripLocation) => ({
                  geometry: { 
                    coordinates: loc.details.coordinates && loc.details.coordinates.lat !== 0 && loc.details.coordinates.lng !== 0
                      ? loc.details.coordinates
                      : { lat: 0, lng: 0 }
                  },
                  description: loc.details.value || '',
                })) || []
              );
            }}
            className={`relative py-1 sm:py-2 lg:text-[14px] lg:px-4 rounded-full font-semibold text-[9px] px-1  transition-all transform hover:scale-105 shadow-md ${
              selectedDay === Number(day)
                ? 'bg-gradient-to-r from-blue-500 to-blue-300 text-white'
                : 'bg-white text-gray-800 hover:bg-gray-200'
            }`}
          >
            <span className='text-[9px] lg:text-[10px]  2xl:text-sm'>{`Day ${initialPlan ? Number(day) + 1 : Number(day)}`}</span>
            {selectedDay === Number(day) && (
              <div className="absolute top-0 right-2 w-2 h-2 sm:w-2 sm:h-2 bg-green-500 rounded-full animate-ping" />
            )}
          </button>
        ))}
      </div>
      <button
        onClick={handleNextDays}
        disabled={startDayIndex + daysToShow >= days.length}
        className={`p-2 ml-1 rounded-full bg-blue-500 text-[8px]  lg:text-sm text-white hover:bg-blue-600 ${startDayIndex + daysToShow >= days.length ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <FaArrowRight />
      </button>
    </div>

    <button
      onClick={addDay}
      className=" py-2 px-2 lg:text-[14px] text-[10px]  font-semibold rounded-full bg-green-500 text-white hover:bg-green-600 flex items-center space-x-1"
    >
      <FaPlus/>
      <span className='hidden lg:visible'>Day</span>
    </button>
  </div>

  <div className="flex mx-4 lg:mx-0 p-0 lg:p-4 h-[calc(100vh-170px)] overflow-y-auto scrollbar-thin scrollbar-thumb-rounded-full scrollbar-thumb-blue-500 scrollbar-track-gray-200">
    {days.map(day => (
      selectedDay === Number(day) && (
        <div key={day} className="rounded-lg lg:w-[calc(100vh)] w-screen  lg:mx-12 ">
          {initialPlan?.itineraries && initialPlan.itineraries[Number(day)] ? (
            <CreateItineraryPage
              selectedDay={Number(day)}
              data={initialPlan.itineraries[Number(day)]}
              onDataChange={(newData) => handleItineraryUpdate(Number(day), newData)}
              onTotalPriceChange={(totalCost) => handleTotalPriceChange(Number(day), totalCost)}
            />
          ) : (
            <CreateItineraryPage
              selectedDay={Number(day)}
              data={null}
              onDataChange={(newData) => handleItineraryUpdate(Number(day), newData)}
              onTotalPriceChange={(totalCost) => handleTotalPriceChange(Number(day), totalCost)}
            />
          )}
        </div>
      )
    ))}
  </div>
</div>
        {/* Right Section - Map Component */}
    <div className="w-full lg:h-full  h-1/4 lg:w-[45%]  flex items-center justify-center bg-gray-200 shadow-lg">
      <div className="w-full h-full  2xl:mt-[6vh] lg:mt-[9vh]">
        <GoogleMapComponent selectedLocations={selectedLocations} />
      </div>
    </div>

      {/* Save and Edit Global Details  and Sell  Buttons */}
      <div className="fixed w-full lg:w-[55%]  space-x-2 lg:space-x-0 md:w-[55%] bottom-0 left-0 p-2 bg-white border-t border-gray-300 flex justify-between">
      <button
        onClick={() => {
          console.log("Opening Modal with plan data:", plan);
          setTitle(plan.name || '');
          setDescription(plan.description || '');
          setImageUrl(plan.imageUrls?.[0] || null);
          setSelectedCountries(plan.selectedCountries || []);
          setPrice(plan.cost || '');
          setEditModalOpen(true);
        }}
        className="px-2 py-2 text-sm lg:text-lg font-semibold rounded-lg bg-blue-500 text-white hover:bg-blue-600"
      >
        Edit Global Details
      </button>

      <button
  onClick={handleSavePlan}
  disabled={isSelling} // Disable if the plan is sold
  className={`px-4 py-2 text-sm lg:text-lg font-semibold rounded-lg ${
    isSelling ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-500 text-white hover:bg-green-600'
  }`}
>
  Save Plan
</button>
{/* Sell Plan Button */}
<button
  onClick={handleSellPlan}
  disabled={isSelling} // Disable if already selling
  className={`px-4 py-2 text-sm lg:text-lg font-semibold rounded-lg ${
    isSelling ? 'bg-gray-400 cursor-not-allowed' : 'bg-purple-500 hover:bg-purple-600 text-white'
  }`}
>
  {isSelling ? 'On Market' : 'Sell Plan'}
</button>

      
    </div>
 {/* Confirmation Modal for Sell */}
 {sellConfirmationOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-[90%] max-w-md">
            <h2 className="text-xl font-semibold text-blue-500 text-center mb-4">Confirm Sell</h2>
            <p className="text-center text-black mb-6">Are you sure you want to list this plan for sale?</p>
            <div className="flex justify-between">
              <button
                onClick={handleCancelSell}
                className="px-4 py-2 bg-gray-300 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmSell}
                className="px-4 py-2 bg-red-500 text-white rounded-lg"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

{/* Modal for Editing Global Details */}
{editModalOpen && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50  ">
    <div className="bg-white p-6 h-[95vh] rounded-lg shadow-lg w-[90%] max-w-md overflow-y-auto">
      <h2 className="text-xl text-gray-700 text-center font-semibold mb-4">Edit Itinerary Details</h2>

      {/* Image Input */}
      <div className="mb-4">
        <label className="block mb-2 text-sm font-medium text-gray-700">Main Image</label>
        {imageUrl ? (
          <div className="relative">
            <img
              src={imageUrl} // Display the uploaded image
              alt="Uploaded Image"
              className="w-full h-40 object-cover rounded-xl shadow-md"
            />
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
              id="image-file-input"
            />
            <label
              htmlFor="image-file-input"
              className="flex items-center justify-center w-16 h-16 mb-2 border-4 border-transparent rounded-full shadow-lg cursor-pointer transition-all hover:shadow-xl hover:scale-105"
              style={{
                backgroundImage: 'linear-gradient(white, white), linear-gradient(to right, #9b59b6, #8e44ad)',
                backgroundOrigin: 'border-box',
                backgroundClip: 'padding-box, border-box',
              }}
            >
              <FaPlusCircle className="text-3xl text-purple-500" />
            </label>
            <span className="text-purple-500">Import Image</span>
          </div>
        )}
      </div>

      {/* Input for Title */}
      <label className="block mb-2 text-sm font-medium text-gray-700">Add Title</label>
      <input
        type="text"
        value={title} // Make sure this value is set
        onChange={(e) => setTitle(e.target.value)} // Correctly update the state
        className="w-full p-2 mb-4 text-sm border rounded-lg text-black"
        placeholder="Itinerary Title"
      />

      {/* Textarea for Description */}
      <label className="block mb-2 text-sm font-medium text-gray-700">Add Description</label>
      <textarea
        value={description} // Ensure the description is bound
        onChange={(e) => setDescription(e.target.value)} // Update the state
        className="w-full p-2 text-sm border rounded-lg text-black"
        rows={2}
        placeholder="Itinerary Description"
      />

      {/* Country Selector */}
      <div>
        <label className="block mb-2 text-sm font-medium text-gray-700">Select Country</label>
        <input
          type="text"
          placeholder="Search for a country..."
          className="w-full p-2 mb-4  text-sm border rounded-lg text-black"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <div className="h-40 lg:h-32 2xl:h-48 overflow-auto border p-2 rounded-lg bg-gray-50">
          {filteredCountries.map((country) => (
            <div key={country.code} className="flex text-sm items-center space-x-2 mb-2">
              <input
                type="checkbox"
                checked={selectedCountries.includes(country.name)}
                onChange={() => handleCountryChange(country.name)}
                className="form-checkbox h-5 w-5 text-blue-600 border-gray-300 rounded"
              />
              <label className="text-gray-700">{country.name}</label>
            </div>
          ))}
        </div>

        {/* Clear Selection Button */}
        <div className="mt-4 flex justify-between items-center">
          <button
            onClick={handleClearSelection}
            className="px-4 py-2 text-sm font-semibold rounded-lg bg-red-500 text-white hover:bg-red-600"
          >
            Clear Selection
          </button>
          <span className="text-sm text-gray-600">
            {selectedCountries.length} country(s) selected
          </span>
        </div>
      </div>

      {/* Price Input */}
      <div className="mb-4 mt-2">
        <label className="block mb-2 text-sm font-medium text-gray-700">Set Price ($)</label>
        <input
          type="number"
          value={totalPrice} // Ensure this value is set
          onChange={(e) => setTotalPrice(e.target.value === '' ? '' : Number(e.target.value))} // Update the state
          className="w-full p-2 border text-sm rounded-lg text-gray-700"
          placeholder="Enter Total Price"
        />
      </div>

      {/* Modal Buttons */}
      <div className="flex justify-end space-x-4">
        <button onClick={() => setEditModalOpen(false)} className="px-4 py-2 bg-gray-300 rounded-lg">
          Cancel
        </button>
        <button onClick={handleSaveTitleDescription} className="px-4 py-2 bg-blue-500 text-white rounded-lg">
          Save
        </button>
      </div>
    </div>
  </div>
)}


    </div>
  );
};

export default CreatePlan;