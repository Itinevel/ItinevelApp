"use client";

import React, { useState, useEffect } from "react";
import ImagesComponent from "@/components/ImagesComponent";
import ImageGalleryPopup from "@/components/gallery-popup";
import { getDownloadURL, ref } from "firebase/storage";
import { storage } from "@/config/firebaseConfig"; // Firebase storage configuration
import {
  FaGlobe,
  FaDollarSign,
  FaCoffee,
  FaUtensils,
  FaTree,
  FaHotel,
  FaClock,
  FaPercent,
  FaInfoCircle,
  FaImages,
  FaBookmark,
  FaShoppingCart,
  FaBuilding,
  FaRunning,
  FaStar,
  FaStarHalfAlt,
  FaExclamationTriangle,
  FaThumbsDown,
  FaThumbsUp,
  FaClipboardCheck,
  FaCar,
  FaTrain,
  FaPlane,
  FaBicycle,
  FaBus,
  FaCarSide,
  FaQuestion,
  FaShip,
  FaSubway,
  FaTaxi,
  FaWalking,
  FaArrowLeft,
  FaArrowRight,
} from "react-icons/fa";
import {
  FaBed,
  FaLandmark,
  FaTheaterMasks,
  FaShoppingBag,
  FaHiking,
  FaHeartbeat,
  FaCalendarAlt,
  FaPrayingHands,
  FaBook,
  FaGavel,
  FaBriefcase,
  FaFutbol,
  FaTractor,
} from "react-icons/fa";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { FcGlobe } from "react-icons/fc";
import axios from "axios";
import { Plan, ItineraryData, TripLocation } from "@/interfaces/Itinerary";

interface GlobalPlanPageProps {
  planId: string;
}

const GlobalPlanPage: React.FC<GlobalPlanPageProps> = ({ planId }) => {
  const [itineraries, setItineraries] = useState<ItineraryData[]>([]);
  const [selectedDay, setSelectedDay] = useState<number>(0);
  const [isGalleryOpen, setGalleryOpen] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [plan, setPlan] = useState<Plan | null>(null);
  const [images, setImages] = useState<string[]>([]);
  const [noteCounts, setNoteCounts] = useState({
    "To Avoid": 0,
    Warning: 0,
    Profit: 0,
    "Don't Forget": 0,
  });
  const [totalCost, setTotalCost] = useState(0);
  const [subtypeCounts, setSubtypeCounts] = useState<{ [key: string]: number }>(
    {}
  );
  const [transportModes, setTransportModes] = useState<string[]>([]);
  const [dayWiseCostData, setDayWiseCostData] = useState<{ day: string; cost: number }[]>([]);
  const [pieChartData, setPieChartData] = useState<{ name: string; value: number }[]>([]);
  const [totalDays, setTotalDays] = useState(0);  // To store total number of days
  const [isMobile, setIsMobile] = useState(false);
  
  const [currentPage, setCurrentPage] = useState(0);
  
  const dynamicCards = Object.keys(subtypeCounts); // The rest of the cards are dynamic

 // Adjust based on actual breakpoint for mobile
const cardsPerPage = isMobile ? 4 : 8; // Mobile: 4 cards per page, Large screen: 8 cards per page
const totalDynamicCards = dynamicCards.length;

// Total pages calculation
const totalPages = isMobile
  ? Math.ceil((totalDynamicCards + 2) / 4) // Mobile: first page has 2 fixed + 2 dynamic, subsequent pages have 4 dynamic cards
  : Math.ceil((totalDynamicCards - 6) / 8) + 1; // Large screen: first page has 2 fixed + 6 dynamic, subsequent pages have 8 dynamic cards

// Handle navigation between pages
const handleNextPage = () => {
  if (currentPage < totalPages - 1) {
    setCurrentPage(currentPage + 1);
  }
};

const handlePreviousPage = () => {
  if (currentPage > 0) {
    setCurrentPage(currentPage - 1);
  }
};

// Slice dynamic cards for current page
let dynamicCardsPage;
if (currentPage === 0) {
  // First page (includes fixed cards + dynamic)
  dynamicCardsPage = isMobile
    ? dynamicCards.slice(0, 2) // Mobile: 2 dynamic cards
    : dynamicCards.slice(0, 6); // Large screen: 6 dynamic cards
} else {
  // Subsequent pages (only dynamic cards)
  const startIdx = isMobile
    ? (currentPage - 1) * 4 + 2 // For mobile: Skip first 2 dynamic cards on page 1, then slice
    : (currentPage - 1) * 8 + 6; // For large screens: Skip first 6 dynamic cards on page 1, then slice

  const endIdx = isMobile
    ? startIdx + 4 // For mobile: 4 dynamic cards per subsequent page
    : startIdx + 8; // For large screens: 8 dynamic cards per subsequent page

  dynamicCardsPage = dynamicCards.slice(startIdx, endIdx);
}

useEffect(() => {
  const handleResize = () => {
    setIsMobile(window.innerWidth <= 768); // Adjust based on actual breakpoint for mobile
  };

  // Set initial value
  handleResize();

  // Update on resize
  window.addEventListener('resize', handleResize);
  return () => window.removeEventListener('resize', handleResize);
}, []);

  useEffect(() => {
    const fetchPlan = async () => {
      try {
        // Fetch the plan data from the backend
        const response = await axios.get(`/api/plan/${planId}`);
        const { plan, itineraries } = response.data;
  
        // Log the plan and itineraries
        console.log("Full Plan Data:", plan);
        console.log("Itineraries Data:", itineraries);
  
        // Store the plan and itineraries in the state
        setPlan(plan);
        setItineraries(itineraries);
        setTotalDays(itineraries.length);
        // Initialize variables for price calculation
        let totalTransportPrice = 0;
        let accommodationPrice = 0;
        let mealsPrice = 0;
        let activitiesPrice = 0;
        let othersPrice = 0;
        let totalLocationPrice = 0; 
        let totalCost = 0;
        const dayWiseCosts: { day: string; cost: number }[] = [];
  
        // Iterate over itineraries (days)
        itineraries.forEach((itinerary: ItineraryData, index: number) => {
          let dayTotalCost = 0;
  
          // Calculate total cost for locations in the itinerary
          if (Array.isArray(itinerary.locations)) {
            itinerary.locations.forEach((location: TripLocation) => {
              if (Array.isArray(location.details.items)) {
                location.details.items.forEach((item) => {
                  dayTotalCost += item.price;  // Add to the day's total cost
                  totalLocationPrice += item.price;  // Add to the overall total location cost
          
                  // Price categorization based on subtype
                  switch (location.type?.toLowerCase()) {
                    case 'accommodation':
                      accommodationPrice += item.price;
                      break;
                    case 'food & beverage':
                      mealsPrice += item.price;
                      break;
                    case 'activities':
                    case 'adventure & outdoor activities':
                      activitiesPrice += item.price;
                      break;
                    default:
                      othersPrice += item.price;
                      break;
                  }
                });
              }
            });
          }
          
  
          // Calculate total cost for transports in the itinerary
          if (Array.isArray(itinerary.allTransports)) {
            itinerary.allTransports.forEach((transport) => {
              if (Array.isArray(transport.details)) {
                transport.details.forEach((detail, index) => {
                  if (index === 0) {
                    dayTotalCost += detail.priceTo + detail.priceFrom;
                    totalTransportPrice += detail.priceTo + detail.priceFrom;
                  } else {
                    dayTotalCost += detail.priceFrom;
                    totalTransportPrice += detail.priceFrom;
                  }
                });
              }
            });
          }
          
  
          // Add the total cost for the day to the array
          dayWiseCosts.push({ day: `Day ${index + 1}`, cost: dayTotalCost });
        });
        
        totalCost = totalLocationPrice + totalTransportPrice;
        // Update the state with day-wise cost data
        setDayWiseCostData(dayWiseCosts);
    
         
        // Initialize a set to hold unique transport types
        const transportTypes = new Set<string>();
  
        // Iterate over itineraries to collect transport types
        itineraries.forEach((itinerary: ItineraryData) => {
          if (Array.isArray(itinerary.allTransports)) {
            itinerary.allTransports.forEach((transport) => {
              transport.details.forEach((detail) => {
                if (detail.typeFrom) transportTypes.add(detail.typeFrom);
                if (detail.typeTo) transportTypes.add(detail.typeTo);
              });
            });
          }
        });
  
        // Update the transport modes state
        setTransportModes(Array.from(transportTypes));
  
        // Initialize the note counts with exact property names
        const noteThemeCounts: {
          "To Avoid": number;
          Warning: number;
          Profit: number;
          "Don't Forget": number;
        } = {
          "To Avoid": 0,
          Warning: 0,
          Profit: 0,
          "Don't Forget": 0,
        };
  
        // Initialize total cost and subtype counts
       
        setTotalCost(totalCost);
        const subtypeCounts: { [key: string]: number } = {};
  
        // Iterate over itineraries to calculate total cost and count subtypes
        itineraries.forEach((itinerary: ItineraryData) => {
          if (Array.isArray(itinerary.locations)) {
            itinerary.locations.forEach((location: TripLocation) => {
              // Calculate cost of items in each location
              if (Array.isArray(location.details.items)) {
                location.details.items.forEach((item) => {
                  totalCost += item.price; // Add item price to total cost
                });
              }
  
              // Count subtypes
              if (location.subtype) {
                subtypeCounts[location.subtype] =
                  (subtypeCounts[location.subtype] || 0) + 1;
              }
  
              // Count notes by theme
              if (Array.isArray(location.notes)) {
                location.notes.forEach((note) => {
                  const theme = note.theme as keyof typeof noteThemeCounts; // Type assertion to one of the valid keys
                  if (theme in noteThemeCounts) {
                    noteThemeCounts[theme] += 1;
                  }
                });
              }
            });
          }
  
          // Calculate transport cost
          if (Array.isArray(itinerary.allTransports)) {
            itinerary.allTransports.forEach((transport) => {
              if (Array.isArray(transport.details)) {
                transport.details.forEach((detail, index) => {
                  if (index === 0) {
                    totalCost += detail.priceTo + detail.priceFrom; // Add priceTo and priceFrom for the first transport detail
                  } else {
                    totalCost += detail.priceFrom; // Only add priceFrom for subsequent details
                  }
                });
              }
            });
          }
        });
  
        // Update note counts in the state
        setNoteCounts(noteThemeCounts);
  
        // Update total cost and subtype counts in the state
       
        setSubtypeCounts(subtypeCounts);
  
        // Initialize an array to hold all image paths
        let locationImages: string[] = [];
  
        // Extract images from locations
        itineraries.forEach((itinerary: ItineraryData) => {
          if (Array.isArray(itinerary.locations)) {
            itinerary.locations.forEach((location: TripLocation) => {
              if (Array.isArray(location.images)) {
                // Accumulate image paths from each location
                locationImages = locationImages.concat(location.images);
              }
            });
          }
        });
  
        // Retrieve Firebase image URLs for each image path
        const firebaseImageUrls = await Promise.all(
          locationImages.map(async (path) => {
            const imageRef = ref(storage, path);
            return await getDownloadURL(imageRef);
          })
        );
  
        // Store the image URLs in the state
        setImages(firebaseImageUrls);
        setSelectedDay(0);
        setIsLoading(false);
  
        // Update the pie chart data state
        setPieChartData([
          { name: 'Transport', value: totalTransportPrice },
          { name: 'Accommodation', value: accommodationPrice },
          { name: 'Meals', value: mealsPrice },
          { name: 'Activities', value: activitiesPrice },
          { name: 'Others', value: othersPrice }
        ]);

      } catch (error) {
        console.error("Error fetching plan data or images:", error);
        setIsLoading(false);
      }
    };
  
    fetchPlan();
  }, [planId]);
  

  useEffect(() => {
    setHasMounted(true);
  }, []);



  const noteGroups = [
    {
      label: "To Avoid",
      value: noteCounts["To Avoid"],
      icon: FaThumbsDown,
      bgColor: "bg-red-200",
      iconColor: "text-red-500",
    },
    {
      label: "Warning",
      value: noteCounts["Warning"],
      icon: FaExclamationTriangle,
      bgColor: "bg-yellow-200",
      iconColor: "text-yellow-500",
    },
    {
      label: "Profit",
      value: noteCounts["Profit"],
      icon: FaThumbsUp,
      bgColor: "bg-green-200",
      iconColor: "text-green-500",
    },
    {
      label: "Don't Forget",
      value: noteCounts["Don't Forget"],
      icon: FaClipboardCheck,
      bgColor: "bg-blue-200",
      iconColor: "text-blue-500",
    },
  ];

  const costData = [
    { name: "Flights", value: 300 },
    { name: "Hotels", value: 200 },
    { name: "Meals", value: 150 },
    { name: "Activities", value: 100 },
    { name: "Transport", value: 40 },
  ];

 

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#FF4560"];

  const BrowseGalleryButton: React.FC<{ onClick: () => void }> = ({
    onClick,
  }) => (
    <button
  onClick={onClick}
  className="absolute z-50 bottom-6 right-6 h-fit w-fit flex items-center justify-center bg-white text-xs lg:text-sm font-base text-gray-700 border-2 border-black-300 px-2 lg:px-4 py-1 rounded-lg shadow-lg hover:bg-gray-100 hover:text-gray-800 hover:scale-105 transition-transform duration-300 focus:outline-none"
  style={{ boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)" }}
>
  <FaImages className="mr-2 text-base lg:text-xl " />
  Browse Gallery
</button>

  );

  // Only render the charts after the component has mounted
  if (!hasMounted) {
    return null; // or a loading spinner, etc.
  }
  const getTransportIcon = (mode: string) => {
    switch (mode.toLowerCase()) {
      case "walking":
        return <FaWalking className="text-2xl text-green-600" title="Walking" />;
      case "cycling":
        return <FaBicycle className="text-2xl text-blue-600" title="Cycling" />;
      case "driving":
        return <FaCar className="text-2xl text-gray-600" title="Driving" />;
      case "public transit":
        return <FaBus className="text-2xl text-orange-600" title="Public Transit" />;
      case "bus":
        return <FaBus className="text-2xl text-yellow-600" title="Bus" />;
      case "subway/metro":
        return <FaSubway className="text-2xl text-blue-800" title="Subway/Metro" />;
      case "train":
        return <FaTrain className="text-2xl text-red-600" title="Train" />;
      case "taxi":
        return <FaTaxi className="text-2xl text-yellow-500" title="Taxi" />;
      case "ride-sharing":
        return <FaCarSide className="text-2xl text-purple-600" title="Ride-sharing" />;
      case "ferry/boat":
        return <FaShip className="text-2xl text-blue-500" title="Ferry/Boat" />;
      default:
        return <FaQuestion className="text-2xl text-gray-500" title="Unknown" />; // Default icon for unknown transport modes
    }
  };
  

  const getIconForType = (type: string) => {
    const normalizedType = type.trim().toLowerCase();
    
    switch (normalizedType) {
      case "accommodation":
        return <FaBed className="text-lg  mb-1" />;
      case "food & beverage":
        return <FaUtensils className="text-lg mb-1" />;
      case "cultural & historical sites":
        return <FaLandmark className="text-lg mb-1" />;
      case "nature & parks":
        return <FaTree className="text-lg mb-1" />;
      case "entertainment & attractions":
        return <FaTheaterMasks className="text-lg mb-1" />;
      case "shopping & markets":
        return <FaShoppingBag className="text-lg mb-1" />;
      case "adventure & outdoor activities":
        return <FaHiking className="text-lg mb-1" />;
      case "health & wellness":
        return <FaHeartbeat className="text-lg mb-1" />;
      case "transportation":
        return <FaCar className="text-lg mb-1" />;
      case "events & festivals":
        return <FaCalendarAlt className="text-lg mb-1" />;
      case "religious & spiritual":
        return <FaPrayingHands className="text-lg mb-1" />;
      case "education & research":
        return <FaBook className="text-lg mb-1" />;
      case "government & civic":
        return <FaGavel className="text-lg mb-1" />;
      case "business & professional":
        return <FaBriefcase className="text-lg mb-1" />;
      case "sports & recreation":
        return <FaFutbol className="text-lg mb-1" />;
      case "agriculture & farming":
        return <FaTractor className="text-lg mb-1" />;
      default:
        return <FaBuilding className="text-lg mb-1" />; // Default icon for unclassified types
    }
  };

  return (
    <div className=" pt-12 min-h-screen bg-gradient-to-r from-white to-blue-200 bg-gray-50 p-4 pl-5 font-amifer">
      <div className="max-w-7xl mx-auto">
        {/* Upper Half - Images */}
        <div className="relative ">
          <ImagesComponent images={images.slice(0, 5)} />{" "}
          {/* Pass first 5 images */}
          {images.length > 5 && (
            <BrowseGalleryButton  onClick={() => setGalleryOpen(true)} />
          )}{" "}
          {/* Show gallery button if more than 5 images */}
        </div>

        {/* Title, Rating, and Buttons */}
        <div className="flex items-center justify-between mt-1 lg:mt-2 ml-4 mr-6">
          <div className="flex items-center">
            {/* Dynamically display the plan name and description */}
            <h1
              className="text-l lg:text-3xl font-base text-gray-800 flex items-center justify-start  lg:mr-8"
              style={{ textShadow: "2px 2px 5px rgba(0, 0, 0, 0.3)" }}
            >
              <FcGlobe className="text-gray-500 mr-2 text-2xl lg:text-4xl " />
              {plan?.name || "Plan Name Not Available"}{" "}
              {/* Display the plan name */}
            </h1>
          </div>
        </div>

        {/* Notes Section */}
        <div className=" mt-4 lg:mt-6">
  <div className="grid grid-cols-4 sm:grid-cols-4 md:grid-cols-4 lg:grid-cols-4  gap-4 lg:gap-8 lg:mx-4 mx-6">
    {noteGroups.map((note, index) => (
      <div
        key={index}
        className="relative px-3 py-1 lg:px-4 lg:py-2 rounded-lg shadow-lg flex items-center justify-between bg-white text-black font-semibold transition-transform duration-300"
        style={{
          border: "1px solid transparent",
          backgroundImage: `linear-gradient(white, white), linear-gradient(to right, ${
            note.iconColor === "text-red-500"
              ? "red, orange"
              : note.iconColor === "text-yellow-500"
              ? "yellow, gold"
              : note.iconColor === "text-green-500"
              ? "green, lime"
              : "blue, cyan"
          })`,
          backgroundClip: "padding-box, border-box",
          backgroundOrigin: "border-box",
        }}
      >
        <div className={`flex items-center ${note.iconColor}`}>
          <note.icon className="text-l lg:text-xl  lg:mr-3 " />
          <span className="text-xs hidden lg:block lg:text-sm font-semibold">{note.label}</span>
        </div>
        <div className="text-xs lg:text-base font-semibold text-gray-700">
          {note.value}
        </div>
      </div>
    ))}
  </div>
</div>


       
    {/* Main Content Section */}
<div className="mt-6 space-y-2">
  {/* Cards Section */}
  <div className="relative overflow-hidden mb-6 mt-8">
      {/* Arrows at the Top of Cards Section (conditionally visible) */}
      {totalPages > 1 && (
        <div className="flex justify-between absolute top-0 left-0 w-full px-4 z-10">
          {currentPage > 0 && (
            <button
              onClick={handlePreviousPage}
              className="bg-gradient-to-r from-indigo-500 to-blue-600 text-white w-6 h-6 lg:w-7 lg:h-7 rounded-lg shadow-lg hover:bg-indigo-600 transition-all duration-300 flex items-center justify-center transform hover:scale-105 "
            >
              <FaArrowLeft className="text-sm lg:text-l" />
            </button>
          )}

          {currentPage < totalPages - 1 && (
            <button
              onClick={handleNextPage}
              className="bg-gradient-to-r from-indigo-500 to-blue-600 text-white w-6 h-6 lg:w-7 lg:h-7 rounded-lg shadow-lg hover:bg-indigo-600 transition-all duration-300 flex items-center justify-center transform hover:scale-105 mr-2 absolute right-0"
            >
              <FaArrowRight className="test-sm lg:text-l" />
            </button>
          )}
        </div>
      )}

      {/* Card Grid */}
      <div className={`grid ${isMobile ? 'grid-cols-4' : 'grid-cols-8'}  mt-8`}>
        {/* Fixed Cards (only on the first page) */}
        {currentPage === 0 && (
          <>
            <div className="flex flex-col items-center justify-center">
              <div className="text-center text-[10px] lg:text-xs font-semibold text-black mb-2">Total Days</div>
              <div className="flex items-center justify-center w-14 h-14 lg:w-16 lg:h-16 bg-gray-100 rounded-full border border-gray-600 shadow-inner">
                <div className="flex flex-col items-center justify-center text-black">
                  <FaGlobe className="text-l lg:text-xl mb-1" />
                  <div className="text-xs font-bold">{totalDays}</div>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-center justify-center">
              <div className="text-center text-[10px] lg:text-xs font-semibold text-black mb-2">Total Cost</div>
              <div className="flex items-center justify-center w-14 h-14 lg:w-16 lg:h-16 bg-gray-100 rounded-full border border-gray-600 shadow-inner">
                <div className="flex flex-col items-center justify-center text-black">
                  <FaDollarSign className="text-l lg:text-xl mb-1" />
                  <div className="text-xs font-bold">{totalCost}</div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Dynamic Cards */}
        {dynamicCardsPage.map((subtype, index) => {
          const location = itineraries.flatMap(itinerary => itinerary.locations).find(location => location.subtype === subtype);
          const typeForIcon = location ? location.type : '';
          return (
            <div key={index} className="flex flex-col items-center justify-center">
              <div className="text-center text-[10px] lg:text-xs font-semibold text-black mb-2 truncate max-w-[70px]">{subtype}</div>
              <div className="flex items-center justify-center w-14 h-14 lg:w-16 lg:h-16 bg-gray-100 rounded-full border border-gray-600 shadow-inner">
                <div className="flex flex-col items-center justify-center text-black">
                  {getIconForType(typeForIcon)}
                  <div className="text-xs font-bold">{subtypeCounts[subtype] || 0}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>





  {/* Description Section */}
  <div className="rounded-lg relative flex flex-col ml-2 lg:mt-2">
   
    <p
      className="description text-gray-600 text-[13px] lg:text-[16px] leading-6 lg:leading-8  max-h-[7rem] lg:max-h-[10rem] max-w-[80rem] overflow-y-auto pr-3  pl-6 lg:pl-8 mr-4 border-l-4 border-blue-500"
      style={{ textShadow: "1px 1px 2px rgba(0, 0, 0, 0.2)" }}
    >
      <FaInfoCircle className="inline-block text-blue-400 mr-2 text-base lg:text-xl" />
      {plan?.description || "No description provided."}
    </p>

    {/* Styled Scrollbar */}
    <style jsx>{`
      .description {
        scrollbar-width: thin; /* For Firefox */
        scrollbar-color: #0000FF #ffffff; /* For Firefox */
      }
      .description::-webkit-scrollbar {
        width: 4px; /* For Chrome, Safari, and Opera */
      }
      .description::-webkit-scrollbar-thumb {
        background: linear-gradient(45deg, #85ffbd, #fffb7d);
        border-radius: 4px;
      }
      .description::-webkit-scrollbar-thumb:hover {
        background: linear-gradient(45deg, #f093fb, #f5576c);
      }
      .description::-webkit-scrollbar-track {
        background-color: #f1f1f1;
        border-radius: 4px;
      }
    `}</style>
  </div>

  {/* Charts Section */}
  <div className="flex flex-col sm:flex-row sm:justify-between space-y-4 sm:space-y-0 mx-4 sm:mx-36">
  {/* Pie Chart */}
  <div className="w-full flex justify-center">
    <PieChart width={window.innerWidth < 640 ? 225 : 275} height={window.innerWidth < 640 ? 190 : 250}>
      <Pie
        data={pieChartData}
        cx={window.innerWidth < 640 ? 90 : 125}
        cy={window.innerWidth < 640 ? 75 : 100}
        innerRadius={window.innerWidth < 640 ? 30 : 40}
        outerRadius={window.innerWidth < 640 ? 60 : 80}
        fill="#8884d8"
        paddingAngle={4}
        dataKey="value"
      >
        {pieChartData.map((entry, index) => (
          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
        ))}
      </Pie>
      <Tooltip />
      <Legend layout="horizontal" verticalAlign="bottom" align="center" wrapperStyle={{ fontSize: window.innerWidth < 640 ? '13px' : '14px' }} />
    </PieChart>
  </div>

  {/* Bar Chart */}
  <div className="w-full sm:w-1/2 flex justify-start">
    <BarChart className="mt-2" width={window.innerWidth < 640 ? 250 : 250} height={window.innerWidth < 640 ? 150 : 200} data={dayWiseCostData}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="day" />
      <YAxis />
      <Tooltip />
      <Bar dataKey="cost" fill="#8884d8" barSize={window.innerWidth < 640 ? 15 : 20} />
    </BarChart>
  </div>
</div>

</div>


        

        {/* Image Gallery Popup */}
        <ImageGalleryPopup
          isOpen={isGalleryOpen}
          images={images}
          onClose={() => setGalleryOpen(false)}
        />
      </div>
    </div>
  );
};

export default GlobalPlanPage;



