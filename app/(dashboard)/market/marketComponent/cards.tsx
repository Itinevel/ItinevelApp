import React, { useState } from 'react';
import {
  FaStar,
  FaHeart,
  FaGlobe,
  FaMoneyBillWave,
  FaInfoCircle,
  FaCalendarAlt,
  FaDollarSign,
} from 'react-icons/fa';

interface MarketCardsComponentProps {
  plans: any[]; // List of plans
  sortOption: string; // Sorting option (e.g., by name or price)
  isAscending: boolean; // Boolean for ascending/descending order
}

const MarketCardsComponent: React.FC<MarketCardsComponentProps> = ({
  plans,
  sortOption,
  isAscending,
}) => {
  // Sorting the plans based on the sortOption and sort order
  const sortedPlans = [...plans].sort((a, b) => {
    if (sortOption === 'price') {
      return isAscending ? a.totalPrice - b.totalPrice : b.totalPrice - a.totalPrice;
    } else {
      return isAscending
        ? a.name.localeCompare(b.name)
        : b.name.localeCompare(a.name);
    }
  });

  const [favorites, setFavorites] = useState<{ [key: number]: boolean }>({});

  // Toggle favorite state
  const toggleFavorite = (id: number) => {
    setFavorites((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  return (
    <div className="space-y-2 font-sans overflow-y-auto scrollbar-thin scrollbar-thumb-rounded-full scrollbar-thumb-blue-500 scrollbar-track-gray-200   p-4"> 
      {/* The max-h adjusts the height to allow scrolling */}
      {sortedPlans.map((plan) => (
        <div
          key={plan.id}
          className="bg-white shadow-lg rounded-lg flex flex-col lg:flex-row w-full mx-auto relative overflow-hidden"
        >
          {/* Image Section */}
          <div className="w-full lg:w-1/3 p-2 relative">
            <img
              src={plan.imageUrls[0]} // Fallback to a test image if plan.imageUrl is not available
              alt={plan.name}
              className="h-40 lg:h-60 w-full object-cover rounded-md shadow-lg"
            />
          </div>

          {/* Details Section */}
          <div className="w-full lg:w-2/3 p-4 flex flex-col justify-between">
            <div>
              {/* Title, Reviews, and Heart Icon in the same row */}
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <h3 className="text-base lg:text-lg font-semibold text-blue-500 mr-2 truncate max-w-[250px] lg:max-w-[400px]">
                    {plan.name}
                  </h3>
                 
                </div>
                
              </div>

              {/* Countries */}
              <div className='flex  space-x-6'>
              <div className="flex items-center mt-2">
                <FaGlobe className="text-gray-500 mr-2" />
                <p className="text-xs lg:text-sm text-gray-500 truncate">
                  Countries: <span className="underline">
                    {Array.isArray(plan.selectedCountries) && plan.selectedCountries.length > 0 
                      ? plan.selectedCountries.join(', ') 
                      : 'N/A'}
                  </span>
                </p>
              </div>
                {/* Days Information */}
              <div className="flex items-center mt-2">
                <FaCalendarAlt className="text-gray-500 mr-2" />
                <p className="text-xs lg:text-sm text-gray-500">
                  Duration: <span>{plan.totalDays} day(s) </span>
                </p>
              </div>
              </div>

              {/* Description */}
              <div className="flex items-center mt-3">
  <FaInfoCircle className="text-gray-500 w-36 lg:h-12 lg:w-20 mr-2 -mt-4" />
  <p className="text-gray-600 text-sm lg:text-base line-clamp-2">
    {plan.description}
  </p>
</div>
            </div>

            <div className="flex items-center mt-2">
      <FaDollarSign className="text-gray-500 mr-2" />
      <p className="text-[13px] lg:text-sm font-semibold text-gray-600 truncate">
        Budget: <span className="text-[13px] lg:text-base">{plan.totalPrice} $</span>
      </p>
    </div>
    
            {/*  Price and Button Information */}
            <div className="flex  justify-between space-x-4  mt-4">
    <div className="flex items-center lg:mt-0">
      <FaMoneyBillWave className="text-green-600 mr-2" />
      <p className="text-base font-semibold text-green-600 truncate">
        Price: <span className="text-base lg:text-lg">{plan.totalCost} $</span>
      </p>
    </div>
  <button className=" lg:mt-0 text-sm  lg:text-base 2xl:text-base bg-blue-500 text-white px-3 lg:px-4 py-2 rounded-md hover:bg-blue-600 transition duration-200  ">
    View Details
  </button>
 
</div>

          </div>
        </div>
      ))}
    </div>
  );
};

export default MarketCardsComponent;
