import React, { useState, useEffect, useCallback } from 'react';
import {
  FaChevronDown, FaChevronUp, FaGlobe, FaHome, FaSearchDollar, FaSearch,
  FaCalendarAlt, FaSnowflake, FaLeaf, FaSun, FaCloudSun
} from 'react-icons/fa';
import { Range, getTrackBackground } from 'react-range';
import { countriesData } from '@/data/countries'; // Ensure this points to the correct data structure

interface FilterComponentProps {
  plans: any[]; // The list of plans to filter
  onFilterChange: (filteredPlans: any[]) => void; // The function to call when filters are applied
}
interface Country {
  code: string;
  name: string;
}

const countries: Country[] = countriesData;

const FilterComponent: React.FC<FilterComponentProps> = ({ plans, onFilterChange }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [countrySearchQuery, setCountrySearchQuery] = useState('');
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
  const [budgetRange, setBudgetRange] = useState<[number, number]>([0, 1000000]);
  const [totalCostRange, setTotalCostRange] = useState<[number, number]>([0, 1000000]); // New totalCost range
  const [selectedAccommodations, setSelectedAccommodations] = useState<string[]>([]);
  const [selectedDaysRange, setSelectedDaysRange] = useState<[number, number]>([1, 30]);
  const [selectedSeasons, setSelectedSeasons] = useState<string[]>([]);
  const [isCountriesExpanded, setIsCountriesExpanded] = useState(true);
  


  const accommodations = ['Hotels', 'Residences', 'Hostels', 'Apartments'];
  const seasons = ['Winter', 'Spring', 'Summer', 'Autumn'];

  useEffect(() => {
    filterPlans();
  }, [searchQuery, selectedCountries, budgetRange, totalCostRange, selectedDaysRange, selectedAccommodations, selectedSeasons]);

  const filterPlans = useCallback(() => {
    const filteredPlans = plans.filter(plan => {
      const matchesSearch =
        (plan.name && plan.name.toLowerCase().includes(searchQuery)) || 
        (plan.description && plan.description.toLowerCase().includes(searchQuery));
  
      const lowerCaseSelectedCountries = selectedCountries.map(country => country.toLowerCase());
      console.log("Selected Countries:", lowerCaseSelectedCountries);
  
      const matchesCountries =
  selectedCountries.length === 0 || 
  (plan.selectedCountries && selectedCountries.some((selectedCountry: string) => {
    const planCountriesLowerCase = plan.selectedCountries.map((country: string) => country.toLowerCase());

    // Log the comparison
    console.log(`Comparing selected country: ${selectedCountry} with plan countries: ${planCountriesLowerCase.join(', ')}`);
    
    const isMatch = planCountriesLowerCase.includes(selectedCountry.toLowerCase());
    console.log(`Match found: ${isMatch}`);
    
    return isMatch;
  }));

// Add additional logging for the whole plan
console.log(`Plan "${plan.name}" matches: ${matchesCountries}`);

    
    
  
      const matchesBudget =
        plan.totalPrice !== undefined && 
        plan.totalPrice >= budgetRange[0] && 
        plan.totalPrice <= budgetRange[1];
  
      const matchesTotalCost =
        plan.totalCost !== undefined && 
        plan.totalCost >= totalCostRange[0] && 
        plan.totalCost <= totalCostRange[1];
  
      const matchesDays =
        plan.totalDays >= selectedDaysRange[0] && 
        plan.totalDays <= selectedDaysRange[1];
  
      

        const fetchItineraryById = (itineraryId: string) => {
          // Assuming plans is an array of itinerary objects
          return plans.find(plan => plan.id === itineraryId);
        };
        
      
      const matchesSeasons =
        selectedSeasons.length === 0 || 
        (plan.season && selectedSeasons.includes(plan.season));
  
      const isMatch = matchesSearch &&
                      matchesCountries &&
                      matchesBudget &&
                      matchesTotalCost &&
                      matchesDays &&
                      
                      matchesSeasons;
  
      console.log(`Plan "${plan.name}" matches:`, isMatch);
  
      return isMatch;
    });
  
    console.log("Filtered Plans:", filteredPlans);
    onFilterChange(filteredPlans);
  }, [plans, searchQuery, selectedCountries, budgetRange, totalCostRange, selectedDaysRange, selectedAccommodations, selectedSeasons, onFilterChange]);
  
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value.toLowerCase());
  };

  const handleCountrySearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCountrySearchQuery(e.target.value.toLowerCase());
  };

  const handleCountryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const country = e.target.value;
    // Store the full country name instead of the code
    const countryName = countries.find(c => c.code === country)?.name;
    if (countryName) {
      setSelectedCountries(prev => prev.includes(countryName) ? prev.filter(c => c !== countryName) : [...prev, countryName]);
    }
  };

  const handleBudgetRangeChange = (values: number[]) => {
    setBudgetRange([values[0], values[1]] as [number, number]);
  };

  const handleTotalCostRangeChange = (values: number[]) => {
    setTotalCostRange([values[0], values[1]] as [number, number]);
  };

  const handleDaysRangeChange = (values: number[]) => {
    setSelectedDaysRange([values[0], values[1]] as [number, number]);
  };

  const handleSeasonChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const season = e.target.value;
    setSelectedSeasons((prev) =>
      prev.includes(season) ? prev.filter((s) => s !== season) : [...prev, season]
    );
  };

  const handleAccommodationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const accommodation = e.target.value;
    setSelectedAccommodations((prev) =>
      prev.includes(accommodation) ? prev.filter((a) => a !== accommodation) : [...prev, accommodation]
    );
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setCountrySearchQuery('');
    setSelectedCountries([]);
    setBudgetRange([0, 1000000]);
    setTotalCostRange([0, 1000000]); // Reset totalCost range
    setSelectedAccommodations([]);
    setSelectedDaysRange([1, 30]);
    setSelectedSeasons([]);
  };

  const handleBudgetInputChange = (index: number, value: number) => {
    const newRange = [...budgetRange] as [number, number];
    newRange[index] = value;
    setBudgetRange(newRange);
  };

  const handleTotalCostInputChange = (index: number, value: number) => {
    const newRange = [...totalCostRange] as [number, number];
    newRange[index] = value;
    setTotalCostRange(newRange);
  };

  return (
    <div className="space-y-4 relative p-4  mt-16 rounded-md font-amifer">
      {/* Search Filter */}
      <div className="z-10">
        <label htmlFor="search"  className=" flex text-xs font-medium text-gray-700  items-center">
          <FaSearch className="mr-2 text-blue-600" /> Search
        </label>
        <input
          type="text"
          id="search"
          value={searchQuery}
          onChange={handleSearchChange}
          placeholder="Search itineraries"
          className="mt-1 block w-full p-2 text-xs text-black border border-gray-300 rounded-md shadow-sm"
        />
      </div>

      {/* Budget Filter */}
      <div className="sticky top-12  z-10">
        <label className=" text-xs font-medium text-gray-700 flex items-center">
          <FaSearchDollar className="mr-2 text-blue-600" /> Budget (TND)
        </label>
        <div className="flex space-x-2 mt-1">
          <input
            type="number"
            value={budgetRange[0]}
            onChange={(e) => handleBudgetInputChange(0, Number(e.target.value))}
            className="w-1/2 p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-xs text-black"
            min="0"
            max="1000000"
          />
          <input
            type="number"
            value={budgetRange[1]}
            onChange={(e) => handleBudgetInputChange(1, Number(e.target.value))}
            className="w-1/2 p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-xs text-black"
            min="0"
            max="1000000"
          />
        </div>
        {/* Budget Range Slider */}
        <div className="mt-4">
          <Range
            step={100}
            min={0}
            max={1000000}
            values={budgetRange}
            onChange={handleBudgetRangeChange}
            renderTrack={({ props, children }) => (
              <div
                {...props}
                style={{
                  ...props.style,
                  height: '6px',
                  width: '100%',
                  background: getTrackBackground({
                    values: budgetRange,
                    colors: ['#ccc', '#548BF4', '#ccc'],
                    min: 0,
                    max: 1000000,
                  }),
                }}
              >
                {children}
              </div>
            )}
            renderThumb={({ props }) => (
              <div
                {...props}
                style={{
                  ...props.style,
                  height: '16px',
                  width: '16px',
                  borderRadius: '50%',
                  backgroundColor: '#548BF4',
                }}
              />
            )}
          />
        </div>
      </div>

          {/* Total Cost Filter */}
          <div className=" top-12 pb-2 z-10">
        <label className="text-xs font-medium text-gray-700 flex items-center">
          <FaSearchDollar className="mr-2 text-blue-600" /> Total Cost (TND)
        </label>
        <div className="flex space-x-2 mt-1">
          <input
            type="number"
            value={totalCostRange[0]}
            onChange={(e) => handleTotalCostInputChange(0, Number(e.target.value))}
            className="w-1/2 p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-xs text-black"
            min="0"
            max="1000000"
          />
          <input
            type="number"
            value={totalCostRange[1]}
            onChange={(e) => handleTotalCostInputChange(1, Number(e.target.value))}
            className="w-1/2 p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-xs text-black"
            min="0"
            max="1000000"
          />
        </div>
        {/* Total Cost Range Slider */}
        <div className="mt-4">
          <Range
            step={100}
            min={0}
            max={1000000}
            values={totalCostRange}
            onChange={handleTotalCostRangeChange}
            renderTrack={({ props, children }) => (
              <div
                {...props}
                style={{
                  ...props.style,
                  height: '6px',
                  width: '100%',
                  background: getTrackBackground({
                    values: totalCostRange,
                    colors: ['#ccc', '#548BF4', '#ccc'],
                    min: 0,
                    max: 1000000,
                  }),
                }}
              >
                {children}
              </div>
            )}
            renderThumb={({ props }) => (
              <div
                {...props}
                style={{
                  ...props.style,
                  height: '16px',
                  width: '16px',
                  borderRadius: '50%',
                  backgroundColor: '#548BF4',
                }}
              />
            )}
          />
        </div>
      </div>

      {/* Days Range Filter */}
      <div>
        <label className=" text-xs font-medium text-gray-700 flex items-center">
          <FaCalendarAlt className="mr-2 text-blue-600" /> Days Range
        </label>
        <div className="mt-3">
          <Range
            step={1}
            min={1}
            max={30}
            values={selectedDaysRange}
            onChange={handleDaysRangeChange}
            renderTrack={({ props, children }) => (
              <div
                {...props}
                style={{
                  ...props.style,
                  height: '6px',
                  width: '100%',
                  background: getTrackBackground({
                    values: selectedDaysRange,
                    colors: ['#ccc', '#548BF4', '#ccc'],
                    min: 1,
                    max: 30,
                  }),
                }}
              >
                {children}
              </div>
            )}
            renderThumb={({ props }) => (
              <div
                {...props}
                style={{
                  ...props.style,
                  height: '16px',
                  width: '16px',
                  borderRadius: '50%',
                  backgroundColor: '#548BF4',
                }}
              />
            )}
          />
          <div className="flex justify-between mt-2 text-xs text-gray-700">
            <span>{selectedDaysRange[0]} Days</span>
            <span>{selectedDaysRange[1]} Days</span>
          </div>
        </div>
      </div>

     {/* Countries Filter */}
<div className="relative">
  <div
    className="flex justify-between items-center cursor-pointer"
    onClick={() => setIsCountriesExpanded(!isCountriesExpanded)}
  >
    <label className=" text-xs font-medium text-gray-700 flex items-center">
      <FaGlobe className="mr-2 text-blue-600" /> Countries
    </label>
    {isCountriesExpanded ? <FaChevronUp className="text-black  text-xs" /> : <FaChevronDown className="text-black text-xs" />}
  </div>
  {isCountriesExpanded && (
    <div className="mt-2">
      <input
        type="text"
        value={countrySearchQuery}
        onChange={handleCountrySearchChange}
        placeholder="Search countries..."
        className="w-full p-2 border text-xs text-black border-gray-300 rounded-md shadow-sm mb-2"
      />
      <div className=" lg:max-h-36 max-h-24 overflow-y-auto"> {/* Adjusted height for scrolling */}

        {countries
          .filter(country => country.name.toLowerCase().includes(countrySearchQuery))
          .map((country , index) => (
            <div key={country.code} className="flex items-center">
              <input
                type="checkbox"
                id={country.code}
                value={country.code}
                checked={selectedCountries.includes(country.name)}
                onChange={handleCountryChange}
                className="mr-2"
              />
              <label htmlFor={country.code} className=" text-sm text-black">
                {country.name}
              </label>
            </div>
          ))}
      </div>
    </div>
  )}
</div>



      {/* Accommodations Filter */}
      {/*
      <div>
        <label className="block text-sm font-medium text-gray-700 flex items-center">
          <FaHome className="mr-2 text-blue-600" /> Accommodation
        </label>
        {isAccommodationsExpanded && (
          <div className="mt-2 space-y-2">
            {accommodations.map((accommodation) => (
              <div key={accommodation} className="flex items-center">
                <input
                  type="checkbox"
                  id={accommodation}
                  value={accommodation}
                  checked={selectedAccommodations.includes(accommodation)}
                  onChange={handleAccommodationChange}
                  className="mr-2"
                />
                <label htmlFor={accommodation} className="text-black">
                  {accommodation}
                </label>
              </div>
            ))}
          </div>
        )}
      </div>*/}

      

      {/* Reset Button */}
      <div>
        <button
          onClick={handleResetFilters}
          className="w-full bg-red-500 text-xs text-white py-2 px-4 rounded-md shadow-lg hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500"
        >
          Reset Filters
        </button>
      </div>
    </div>
  );
};

export default FilterComponent;

