"use client";
import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import GoogleMapComponent from '@/components/GoogleMapComponent';
import LocationComponent from './preview-location';
import TransportComponent from './preview-transport';
import { Plan, ItineraryData } from '@/interfaces/Itinerary';
import { FaChevronLeft, FaChevronRight, FaExclamationTriangle, FaCheckCircle, FaInfoCircle, FaTimesCircle, FaCar, FaShoppingCart, FaMapMarkerAlt, FaStickyNote, FaRunning } from 'react-icons/fa';
import { GoogleMapComponentProps } from '@/interfaces/Itinerary';
import ImageGalleryPopup from '@/components/gallery-popup';

interface PreviewPlanProps {
  planId: string;
}

const PreviewPlan: React.FC<PreviewPlanProps> = ({ planId }) => {
  const [selectedDay, setSelectedDay] = useState<number>(0);
  const [plan, setPlan] = useState<Plan | null>(null);
  const [itineraries, setItineraries] = useState<ItineraryData[]>([]);
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const maxVisibleDays = 10; // Maximum number of days to show at once

  useEffect(() => {
    const fetchPlan = async () => {
      try {
        const response = await axios.get(`/api/plan/${planId}`);
        const { plan, itineraries } = response.data;
        setPlan(plan);
        setItineraries(itineraries);
        setSelectedDay(0);
        setIsLoading(false);
        console.log("Retrieved plan data:", response.data);
      } catch (error) {
        console.error('Error fetching plan data:', error);
        setIsLoading(false);
      }
    };

    fetchPlan();
  }, [planId]);

  const currentItinerary = itineraries[selectedDay] || null;

   // Extract locations and pass them to GoogleMapComponent
   const selectedLocations: GoogleMapComponentProps['selectedLocations'] = useMemo(() => {
    if (!currentItinerary) return [];
    return currentItinerary.locations
      .filter((location) => {
        console.log("Inspecting location in PreviewPlan:", location.details.coordinates);
        return location.details.coordinates;
      }) // Ensure only locations with coordinates are passed
      .map((location) => ({
        geometry: {
          coordinates: location.details.coordinates!, // Ensure coordinates are not null
        },
        description: location.details.value,
      }));
  }, [currentItinerary]);
  

 // Calculate the starting index of the days to display
const startIndex = Math.max(0, selectedDay - Math.floor(maxVisibleDays / 2));
const endIndex = Math.min(itineraries.length, startIndex + maxVisibleDays);

  

  const handlePrevDay = () => {
    if (selectedDay > 0) {
      setSelectedDay(selectedDay - 1);
    }
  };

  const handleNextDay = () => {
    if (selectedDay < itineraries.length - 1) {
      setSelectedDay(selectedDay + 1);
    }
  };

  const handleViewGallery = (images: string[]) => {
    console.log('Images passed to gallery:', images);
    setGalleryImages(images);
    setIsGalleryOpen(true);
  };

  
  // Calculate summary information
  const { totalLocations, totalNotesByTheme, totalItemPrice, totalTransportPrice, totalActivities } = useMemo(() => {
    if (!currentItinerary) {
      return { totalLocations: 0, totalNotesByTheme: {}, totalItemPrice: 0, totalTransportPrice: 0, totalActivities: 0 };
    }
  
    const totalLocations = currentItinerary.locations.length;
  
    const totalNotesByTheme = currentItinerary.locations.reduce(
      (counts, location) => {
        location.notes?.forEach(note => {
          const theme = note.theme.toLowerCase();
          if (['to avoid', 'profit', "don't forget", 'warning'].includes(theme)) {
            if (!counts[theme]) {
              counts[theme] = 0;
            }
            counts[theme]++;
          }
        });
        return counts;
      },
      {} as Record<string, number>
    );
  
    // Calculate item prices
    const totalItemPrice = currentItinerary.locations.reduce((sum, location) => {
      return sum + location.details.items.reduce((itemSum, i) => itemSum + i.price, 0);
    }, 0);
  
    // Calculate transport prices based on the new rule
    const totalTransportPrice = currentItinerary.allTransports.reduce((sum, transport, index) => {
      return sum + transport.details.reduce((detailSum, detail, detailIndex) => {
        if (detailIndex === 0) {
          return detailSum + (detail.priceTo || 0) + (detail.priceFrom || 0); // For the first transport detail
        }
        return detailSum + (detail.priceFrom || 0); // For subsequent transport details
      }, 0);
    }, 0);
  
    // Calculate totalActivities
    const totalActivities = currentItinerary.locations.filter(
      location => location.type === 'Adventure & Outdoor Activities'
    ).length;
  
    return { totalLocations, totalNotesByTheme, totalItemPrice, totalTransportPrice, totalActivities };
  }, [currentItinerary]);
  



  if (!plan || itineraries.length === 0) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex flex-col lg:flex-row h-full  bg-gradient-to-r from-white to-blue-200 overflow-hidden" style={{ fontFamily: 'Amifer, sans-serif' }}>
      {/* Left Section (Details and Locations) */}
      <div className="w-full lg:w-[55%] flex flex-col overflow-auto shadow-lg scrollbar-hide scrollbar-custom">
        
        {/* Day Parser Section with Previous and Next Buttons */}
        <div 
          className="p-4 mb-6 shadow-inner flex items-center justify-between" 
          style={{
            paddingTop: '5.2rem',
            boxShadow: 'inset 0 8px 8px -8px rgba(0, 0, 0, 0.3), inset 0 -8px 8px -8px rgba(0, 0, 0, 0.3)',
          }}
        >
          <button 
            onClick={handlePrevDay} 
            className={`p-2 rounded-full transition-all transform hover:scale-110 ${selectedDay === 0 ? 'opacity-50 cursor-not-allowed' : 'bg-blue-300 text-white'}`}
            disabled={selectedDay === 0}
          >
            <FaChevronLeft className="text-xl" />
          </button>
  
          <div className="flex mx-2 justify-center space-x-1">
            {itineraries.slice(startIndex, endIndex).map((itinerary, index) => (
              <button
                key={itinerary.itineraryId}
                onClick={() => setSelectedDay(startIndex + index)}
                className={`relative py-2 px-2 rounded-full font-semibold transition-all transform hover:scale-110 shadow-md ${
                  startIndex + index === selectedDay
                    ? 'bg-gradient-to-r from-blue-500 to-blue-300 text-white'
                    : 'bg-white text-gray-800 hover:bg-gray-200'
                }`}
              >
                <div className="flex items-center justify-center">
                <span className='sm:py-2 text-xs  sm:text-[14px]' >{`Day ${startIndex + index + 1}`}</span>
                  {startIndex + index === selectedDay && (
                    <div className="absolute top-0 right-0 w-3 h-3 bg-green-500 rounded-full animate-ping" />
                  )}
                </div>
              </button>
            ))}
          </div>
  
          <button 
            onClick={handleNextDay} 
            className={`p-2 rounded-full transition-all transform hover:scale-110 ${selectedDay === itineraries.length - 1 ? 'opacity-50 cursor-not-allowed' : 'bg-blue-300 text-white'}`}
            disabled={selectedDay === itineraries.length - 1}
          >
            <FaChevronRight className="text-xl" />
          </button>
        </div>
  
        {/* Content Section (Details, Locations, and Transport) */}
        <div 
          className="flex-grow overflow-auto p-4 shadow-inner"  
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', overflowY: 'scroll', boxShadow: 'inset 0 8px 8px -8px rgba(0, 0, 0, 0.3)' }}
        >
          <div className="flex flex-wrap gap-2 justify-center space-x-2">
            
            {/* Total Price - Transportation */}
            <div 
              className="flex flex-col  px-1 items-center justify-center lg:w-28 lg:h-28 w-22 h-22 bg-white rounded-lg shadow-lg"
              style={{
                border: '2px solid transparent',
                backgroundImage: 'linear-gradient(white, white), linear-gradient(to right, #4CAF50, #81C784)',
                backgroundClip: 'padding-box, border-box',
              }}
            >
              <FaCar className="text-green-500 text-xl lg:text-3xl mb-2" />
              <div className="text-sm lg:text-xl text-black font-bold">{`${totalTransportPrice.toFixed(2)}$`}</div>
              <div className="text-xs hidden lg:block font-medium text-gray-800">Transportation</div>
            </div>
  
            {/* Total Price - Items & Locations */}
            <div 
              className="flex flex-col px-1 items-center justify-center lg:w-28 lg:h-28 w-22 h-22 bg-white rounded-lg shadow-lg"
              style={{
                border: '2px solid transparent',
                backgroundImage: 'linear-gradient(white, white), linear-gradient(to right, #FF5722, #FF8A65)',
                backgroundClip: 'padding-box, border-box',
              }}
            >
              <FaShoppingCart className="text-orange-500 text-xl lg:text-3xl mb-2" />
              <div className="text-sm lg:text-xl text-black font-bold">{`${totalItemPrice.toFixed(2)}$`}</div>
              <div className="text-xs hidden lg:block font-medium text-gray-800">Items & Locations</div>
            </div>
  
            {/* Total Locations */}
            <div 
              className="flex flex-col px-1 items-center justify-center lg:w-28 lg:h-28 w-22 h-22 bg-white rounded-lg shadow-lg"
              style={{
                border: '2px solid transparent',
                backgroundImage: 'linear-gradient(white, white), linear-gradient(to right, #2196F3, #64B5F6)',
                backgroundClip: 'padding-box, border-box',
              }}
            >
              <FaMapMarkerAlt className="text-blue-500 text-xl lg:text-3xl mb-2" />
              <div className="text-sm lg:text-xl text-black font-bold">{totalLocations}</div>
              <div className="text-xs hidden lg:block font-medium text-gray-800">Locations</div>
            </div>
  
            {/* Total Activities */}
            <div 
              className="flex px-1 flex-col items-center justify-center lg:w-28 lg:h-28 w-22 h-22 bg-white rounded-lg shadow-lg"
              style={{
                border: '2px solid transparent',
                backgroundImage: 'linear-gradient(white, white), linear-gradient(to right, #FFEB3B, #FFC107)',
                backgroundClip: 'padding-box, border-box',
              }}
            >
              <FaRunning className="text-yellow-500 text-xl lg:text-3xl mb-2" />
              <div className="text-sm lg:text-xl text-black font-bold">{totalActivities}</div>
              <div className="text-xs hidden lg:block font-medium text-gray-800">Activities</div>
            </div>
  
            {/* Total Notes by Theme */}
            <div 
              className="flex flex-col items-center justify-center lg:w-28 lg:h-28 w-22 h-22 bg-white rounded-lg shadow-lg"
              style={{
                border: '2px solid transparent',
                backgroundImage: 'linear-gradient(white, white), linear-gradient(to right, #9C27B0, #BA68C8)',
                backgroundClip: 'padding-box, border-box',
              }}
            >
              <div className="grid p-2 grid-cols-2 gap-x-2 mt-1 gap-y-1">
                {['to avoid', 'profit', "don't forget", 'warning'].map((theme, index) => {
                  let icon, colorClass;
                  switch (theme) {
                    case 'to avoid':
                      icon = <FaTimesCircle className="text-red-500 text-sm" />;
                      colorClass = 'text-red-500';
                      break;
                    case 'profit':
                      icon = <FaCheckCircle className="text-green-500 text-sm" />;
                      colorClass = 'text-green-500';
                      break;
                    case "don't forget":
                      icon = <FaInfoCircle className="text-blue-500 text-sm" />;
                      colorClass = 'text-blue-500';
                      break;
                    case 'warning':
                      icon = <FaExclamationTriangle className="text-yellow-500 text-sm" />;
                      colorClass = 'text-yellow-500';
                      break;
                    default:
                      return null;
                  }
                  return (
                    <div key={index} className="flex flex-col items-center">
                      {icon}
                      <span className={`text-sm font-semibold ${colorClass}`}>
                        {totalNotesByTheme[theme] || 0}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
  
          </div>
  
        
          {/* Locations and Transport */}
<div className="space-y-6 mt-8">
  {currentItinerary?.locations.map((location, index) => (
    <React.Fragment key={index}>
      {/* Location Component */}
      <div className="w-full transform scale-95 lg:scale-100 lg:flex lg:flex-col lg:items-center">
        <LocationComponent 
          location={location}
          onViewGallery={handleViewGallery}
        />
      </div>

      {/* Transport Component */}
      {currentItinerary.allTransports[index] && index < currentItinerary.locations.length - 1 && (
        <div className="w-full transform scale-95 lg:scale-100 lg:flex lg:flex-col lg:items-center">
          <TransportComponent
            transport={currentItinerary.allTransports[index]}
            startLocation={currentItinerary.locations[index].details.value}
            endLocation={currentItinerary.locations[index + 1]?.details.value}
          />
        </div>
      )}
    </React.Fragment>
  ))}
</div>

        </div>
      </div>
  
      {/* Google Map Section (Now Responsive) */}
      <div className="w-full lg:w-[45%] lg:h-auto flex items-center justify-center bg-gray-200 shadow-lg mt-4 lg:mt-0">
      <div className="w-full h-full">
        <GoogleMapComponent 
          selectedLocations={currentItinerary?.locations.map(location => ({
            geometry: {
              coordinates: location.details.coordinates,
            },
            description: location.details.value,
          })) || []} 
        />
      </div>
    </div>

    {/* Gallery Popup rendered at the parent level */}
    {isGalleryOpen && (
      <ImageGalleryPopup
        isOpen={isGalleryOpen}
        images={galleryImages}
        onClose={() => setIsGalleryOpen(false)}
      />
    )}
  </div>
);

  
    
};

export default PreviewPlan;

