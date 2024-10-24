"use client";

import React, { useState, useEffect } from 'react';
import LocationInput from './LocationInput';
import TransportComponent from './Transport';

import { ItineraryData, TransportDetail, Note, TransportInterface, TripLocation  } from '@/interfaces/Itinerary';
import { FaPlus, FaCar, FaShoppingCart, FaMapMarkerAlt, FaRunning, FaTimesCircle, FaCheckCircle, FaInfoCircle, FaExclamationTriangle } from 'react-icons/fa';
import { LocationType } from '@/interfaces/Itinerary';
interface CreateItineraryPageProps {
  selectedDay: number;
  data: ItineraryData | null;
  onDataChange: (newData: ItineraryData) => void;
  onTotalPriceChange: (dayTotalPrice: number) => void;
}
declare global {
  interface Window {
    google: typeof google; 
  }
}

const CreateItineraryPage: React.FC<CreateItineraryPageProps> = ({ selectedDay, data, onDataChange, onTotalPriceChange  }) => {
  const [locationsState, setLocations] = useState<TripLocation[]>(data?.locations || []);
  const [allTransports, setAllTransports] = useState<TransportInterface[]>(data?.allTransports || []);
  const [totalPrice, setTotalPrice] = useState<number>(data?.totalCost || 0);
  const [hasLoadedInitialData, setHasLoadedInitialData] = useState(false)
  const [query, setQuery] = useState<string>(''); // This defines query state
  const [isSelecting, setIsSelecting] = useState(false);
  const [suggestionsState, setSuggestions] = useState<any[][]>([]);
  const [googleLoaded, setGoogleLoaded] = useState(false);
  const [transportTotalPrice, setTransportTotalPrice] = useState<number>(0);
  const [isEditing, setIsEditing] = useState<boolean>(!!data);
  // State for totals
  const [totalLocations, setTotalLocations] = useState<number>(0);
  const [totalActivities, setTotalActivities] = useState<number>(0);

  const [totalNotes, setTotalNotes] = useState({
    toAvoid: 0,
    profit: 0,
    dontForget: 0,
    warning: 0,
  });

  useEffect(() => {
    if (!window.google) {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places&v=weekly`;
      script.async = true;
      script.defer = true;
      script.onload = () => setGoogleLoaded(true);
      document.head.appendChild(script);
    } else {
      setGoogleLoaded(true);
    }
  }, []);

  useEffect(() => {
    // Load data for the selected day from sessionStorage
    const savedItinerary = sessionStorage.getItem(`itinerary-${selectedDay}`);
  
    if (savedItinerary) {
      try {
        const parsedData = JSON.parse(savedItinerary);
        console.log('Loaded itinerary from sessionStorage:', parsedData);
  
        // Load the correct locations and transports for the selected day
        if (parsedData.locations && parsedData.locations.length > 0) {
          setLocations(parsedData.locations);  // Set the correct locations for the day
          console.log('Setting new locations for day', selectedDay, parsedData.locations);
        }
  
        if (parsedData.allTransports && parsedData.allTransports.length > 0) {
          console.log('Setting transports for day', selectedDay, ':', parsedData.allTransports);
          setAllTransports(parsedData.allTransports);
          const initialTotalTransportPrice = calculateTransportTotalPrice(parsedData.allTransports);
        setTransportTotalPrice(initialTotalTransportPrice);
        }
  
        if (parsedData.suggestions && parsedData.suggestions.length > 0) {
          console.log('Setting suggestions for day', selectedDay, ':', parsedData.suggestions);
          setSuggestions(parsedData.suggestions);
        }
  
        const totalCost = parsedData.totalCost || 0; // Ensure total cost defaults to 0 if undefined
        console.log('Setting total cost for day', selectedDay, ':', totalCost);
        setTotalPrice(totalCost);
  
        // Mark that we have finished loading initial data
        setHasLoadedInitialData(true);
  
      } catch (error) {
        console.error("Error parsing saved plan:", error);
      }
    } else {
      // No saved itinerary in sessionStorage, handle accordingly
      setHasLoadedInitialData(true);  // Still mark as loaded even if no data is found
    }
  }, [selectedDay]);// Re-run only when `selectedDay` changes
  
  // Save the updated data to sessionStorage whenever locationsState or allTransports change


  useEffect(() => {
    if (!hasLoadedInitialData) {
      return; // Prevent saving until the initial data has been fully loaded
    }
  
    if (isEditing) {
      console.log('Edit mode: Saving the updated itinerary for the current day to session storage.');
    } else {
      console.log('Create mode: Saving the updated itinerary for the current day to session storage.');
    }
    
    // Log current locations state before saving
    console.log('Current locations state before saving:', locationsState);
  
    // Calculate the total cost based on the current state
    const calculatedTotalCost = calculateLocationTotalPrice() + calculateTransportTotalPrice(allTransports);
    console.log('Calculated total cost for saving:', calculatedTotalCost);
    
    const currentDayData = {
      locations: locationsState,
      allTransports: allTransports,
      suggestions: suggestionsState,
      totalCost: calculatedTotalCost, // Save the calculated total cost
    };
  
    // Save to sessionStorage
    console.log(`Saving current day (${selectedDay}) itinerary data to session storage:`, currentDayData);
    sessionStorage.setItem(`itinerary-${selectedDay}`, JSON.stringify(currentDayData));
  
    // Prepare updated data for the parent component
    const updatedData: ItineraryData = {
      ...data,
      locations: locationsState,
      allTransports: allTransports,
      title: data?.title || '',
      itineraryId: data?.itineraryId || selectedDay,
      description: data?.description || '',
      totalPrice: calculatedTotalCost, // Use calculated total cost
    };
    console.log(`Updating data for day ${selectedDay} in parent component:`, updatedData);
    onDataChange(updatedData);
  
  }, [locationsState, allTransports, suggestionsState, selectedDay, transportTotalPrice, hasLoadedInitialData]);
  
  

  
  useEffect(() => {
    setTotalLocations(locationsState.length);
    const notesByTheme = countNotesByTheme();
    console.log("Notes Count by Theme (after update): ", notesByTheme);
    setTotalNotes({
      toAvoid: notesByTheme.toAvoid,
      profit: notesByTheme.profit,
      dontForget: notesByTheme.dontForget,
      warning: notesByTheme.warning,
    });
  }, [locationsState]);  // Ensure recalculation happens after locationsState update
  
  
  const calculateTransportTotalPrice = (transports: TransportInterface[] = []): number => {
    let totalTransportPrice = 0;
  
    // Ensure transports is an array and not undefined or null
    if (Array.isArray(transports)) {
      transports.forEach((transport, index) => {
          if (transport?.details) {
              transport.details.forEach((detail, detailIndex) => {
                  // For the first detail, add both priceFrom[0] and priceTo[0]
                  if (index === 0 && detailIndex === 0) {
                      totalTransportPrice += (detail.priceFrom || 0) + (detail.priceTo || 0);
                  } else {
                      // For subsequent details, add both priceTo and priceFrom values
                      totalTransportPrice +=  (detail.priceFrom || 0);
                  }
              });
          }
      });
  }
  
  
    return totalTransportPrice;
  };


  const countNotesByTheme = () => {
    const themes = { toAvoid: 0, profit: 0, dontForget: 0, warning: 0 };
  
    locationsState.forEach(location => {
      location.notes?.forEach(note => {
        const themeLowerCase = note.theme.toLowerCase(); // Convert theme to lowercase for comparison
        if (themeLowerCase === 'to avoid') themes.toAvoid++;
        if (themeLowerCase === 'profit') themes.profit++;
        if (themeLowerCase === "don't forget") themes.dontForget++;
        if (themeLowerCase === 'warning' || themeLowerCase === 'watch out') themes.warning++;
      });
    });
  
    allTransports.forEach(transport => {
      transport.notes?.forEach(note => {
        const themeLowerCase = note.theme.toLowerCase(); // Convert theme to lowercase for comparison
        if (themeLowerCase === 'to avoid') themes.toAvoid++;
        if (themeLowerCase === 'profit') themes.profit++;
        if (themeLowerCase === "don't forget") themes.dontForget++;
        if (themeLowerCase === 'warning' || themeLowerCase === 'watch out') themes.warning++;
      });
    });
  
    console.log("Final Notes Count by Theme: ", themes);  // Log the final count of themes
  
    return themes;
  };
  
  

  

  const saveTransportData = (updatedTransports: TransportInterface[]) => {
    const updatedData = {
      ...data,
      locations: locationsState,
      allTransports: updatedTransports,
      title: data?.title || '',  // Ensure title is always a string
      itineraryId: data?.itineraryId || selectedDay,  // Ensure itineraryId has a fallback value
      description: data?.description || '',  // Ensure description is always a string
      totalPrice: data?.totalPrice || 0,  // Ensure totalPrice has a fallback
      totalCost: data?.totalCost || 0,  // Ensure totalCost has a fallback
    };
  
    onDataChange(updatedData);
    sessionStorage.setItem(`itinerary-${selectedDay}`, JSON.stringify(updatedData));
  };
  

  // Callback to ensure notes count is updated after state change
  const handleNotesUpdate = (index: number, updatedNotes: Note[]) => {
    console.log("Updated Notes to Set in Location: ", updatedNotes);  // Log the updated notes
  
    setLocations(prevLocations => {
      const updatedLocations = [...prevLocations];
      updatedLocations[index] = {
        ...updatedLocations[index],
        notes: updatedNotes,
      };
  
      console.log("Updated Locations State: ", updatedLocations);  // Log the updated locations
  
      return updatedLocations;
    });
  };
  

// New useEffect to trigger recalculation after the state updates

// Adding a new location or modifying the existing state
const handleAddOrUpdateLocation = (newLocation: TripLocation, index: number | null = null) => {
  setLocations((prevLocations: TripLocation[]) => {
    const updatedLocations = [...prevLocations];

    if (index !== null && updatedLocations[index]) {
      // Update existing location at a specific index
      updatedLocations[index] = {
        ...updatedLocations[index],
        ...newLocation, // Merge the existing location with the new data
      };
    } else {
      // Add a new location
      updatedLocations.push(newLocation);
    }

    console.log("Updated locations after addition/modification:", updatedLocations);
    return updatedLocations; // Return the updated state
  });
};


const handleAddTransport = (newTransportDetail: TransportDetail) => {
  const newTransport: TransportInterface = {
    details: [newTransportDetail],
    notes: [],
  };
  setAllTransports(prevAllTransports => [...prevAllTransports, newTransport]);

  // Update the total price with the new transport price
  setTransportTotalPrice(prev => {
    // Sum priceTo from the first transport and all priceFrom values from each transport
    const firstPriceTo = newTransportDetail.priceTo;
    const allPriceFrom = prev + newTransportDetail.priceFrom;
    return prev === 0 ? firstPriceTo + allPriceFrom : allPriceFrom;
  });
};


const handleTransportDataUpdate = (newTransportDetails: TransportDetail[], notes: Note[], transportIndex: number) => {
  setAllTransports(prevTransportState => {
    const updatedTransports = [...prevTransportState];
    
    if (updatedTransports[transportIndex]) {
      updatedTransports[transportIndex] = {
        ...updatedTransports[transportIndex],
        details: newTransportDetails,
        notes: notes,
      };
    } else {
      updatedTransports.push({
        details: newTransportDetails,
        notes: notes,
      });
    }

    saveTransportData(updatedTransports); // Ensure this saves correctly
    return updatedTransports;
  });
};



  const handleTransportPriceUpdate = (price: number) => {
    setTransportTotalPrice(price);
  };

  const calculateLocationTotalPrice = (): number => {
    return locationsState.reduce((total: number, location: TripLocation) =>
      total + location.details.items.reduce((sum: number, item: { price: number }) =>
        sum + item.price, 0
      ), 0
    );
  };

  const locationTotalPrice = calculateLocationTotalPrice();

  
  const handleAutocompleteChange = async (index: number, query: string) => {
    if (!googleLoaded) {
      console.log('Google Maps not loaded yet');
      return;
    }
  
    if (isSelecting) {
      console.log("Autocomplete change ignored due to selection process.");
      return;
    }
  
    console.log("Autocomplete triggered for query:", query);
  
    const newLocationsState = [...locationsState];
    newLocationsState[index] = {
      ...newLocationsState[index],
      details: {
        ...newLocationsState[index].details,
        value: query,
      },
    };
    setLocations(newLocationsState);
  
    
    if (query.length > 2) {
      try {
        // Check if the google object is available
        if (window.google && window.google.maps && window.google.maps.places) {
          const autocompleteService = new google.maps.places.AutocompleteService();
          autocompleteService.getPlacePredictions({ input: query }, (predictions, status) => {
            if (status === google.maps.places.PlacesServiceStatus.OK && predictions) {
              const newSuggestions = [...suggestionsState];
              newSuggestions[index] = predictions;
              setSuggestions(newSuggestions);
              console.log("Updated suggestions:", predictions);
            } else {
              console.error('Autocomplete error:', status);
            }
          });
        } else {
          console.error('Google Maps API is not loaded yet.');
        }
      } catch (error) {
        console.error('Failed to fetch autocomplete suggestions:', error);
      }
    } else {
      const newSuggestions = [...suggestionsState];
      newSuggestions[index] = [];
      setSuggestions(newSuggestions);
    }
  };
  

  const handleSuggestionClick = (index: number, suggestion: any) => {
    if (!googleLoaded) return;
  setIsSelecting(true); 
    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ placeId: suggestion.place_id }, (results, status) => {
      if (status === google.maps.GeocoderStatus.OK && results && results[0]) {
        const { lat, lng } = results[0].geometry.location;
  
        console.log("Selected suggestion:", suggestion.description, { lat: lat(), lng: lng() });
  
        // Update location state with the selected suggestion's description and coordinates
        const updatedLocations = [...locationsState];
        updatedLocations[index] = {
          ...updatedLocations[index],
          details: {
            ...updatedLocations[index].details,
            value: suggestion.description,
            coordinates: { lat: lat(), lng: lng() },  // Update coordinates
          },
        };
        setLocations(updatedLocations);
        
        // Optionally, clear suggestions
        const newSuggestions = [...suggestionsState];
        newSuggestions[index] = [];
        setSuggestions(newSuggestions);
        setIsSelecting(false);
      } else {
        console.error("Geocoding failed:", status);
        setIsSelecting(false);
      }
    });
  };
  



  const handleAddItem = (index: number, item: { name: string; price: number }) => {
    setLocations((prevLocations: TripLocation[]) => {
      const updatedLocations = [...prevLocations];
      const updatedItems = [...(updatedLocations[index]?.details.items || [])];
      updatedItems.push(item);
      updatedLocations[index] = {
        ...updatedLocations[index],
        details: {
          ...updatedLocations[index].details,
          items: updatedItems,
        },
      };
      return updatedLocations;
    });
  };

  const handleImportImages = (index: number, imageUrls: string[]) => {
    // Update locations state with new images
    setLocations((prevLocations: TripLocation[]) => {
      const updatedLocations = [...prevLocations];
      
      // Update images at the root level instead of inside details
      updatedLocations[index] = {
        ...updatedLocations[index],
        images: [...(updatedLocations[index].images || []), ...imageUrls], // Directly update images
      };
      
      return updatedLocations;
    });
  
    // Update session storage with new images
    const currentItinerary = JSON.parse(sessionStorage.getItem(`itinerary-${selectedDay}`) || '{}');
    const updatedItinerary = {
      ...currentItinerary,
      locations: currentItinerary.locations.map((loc: any, locIndex: number) =>
        locIndex === index
          ? { ...loc, images: [...(loc.images || []), ...imageUrls] } // Directly update images
          : loc
      ),
    };
  
    sessionStorage.setItem(`itinerary-${selectedDay}`, JSON.stringify(updatedItinerary));  // Save images
  };
  

  

  const handleTransportModeChange = (e: React.ChangeEvent<HTMLSelectElement>, transportIndex: number) => {
    const value = e.target.value;
    setAllTransports(prevTransportState => {
      const updatedTransports = [...prevTransportState];
      if (updatedTransports[transportIndex]) {
        const updatedDetails = updatedTransports[transportIndex].details.map(detail => ({
          ...detail,
          type: value, // Update the transport mode type
        }));
  
        updatedTransports[transportIndex] = {
          ...updatedTransports[transportIndex],
          details: updatedDetails,
        };
      }
      return updatedTransports;
    });
  };

      
  const addInputField = () => {
    setLocations([
      ...locationsState,
      {
        name: '', // Move name to the root level
        type: '', // Move type to the root level
        subtype: '', // Move subtype to the root level
        images: [], // Initialize images at the root level
        details: {
          value: '', // Keep value inside details
          items: [], // Keep items inside details
          coordinates: { lat: 0, lng: 0 }, // Keep coordinates inside details
          arrivalTime: '', // Keep arrivalTime inside details
          departureTime: '', // Keep departureTime inside details
        },
        notes: [], // Keep notes at the root level
      },
    ]);
  
    setSuggestions([...suggestionsState, []]);
  };
  
  

  const handleArrivalTimeChange = (index: number, time: string) => {
    setLocations((prevLocations: TripLocation[]) => {
      const newLocations = [...prevLocations];
      newLocations[index] = {
        ...newLocations[index],
        details: {
          ...newLocations[index].details,
          arrivalTime: time,
        },
      };
      return newLocations;
    });
  };

  const handleDepartureTimeChange = (index: number, time: string) => {
    setLocations((prevLocations: TripLocation[]) => {
      const newLocations = [...prevLocations];
      newLocations[index] = {
        ...newLocations[index],
        details: {
          ...newLocations[index].details,
          departureTime: time,
        },
      };
      return newLocations;
    });
  };

  const handleTypeChange = (index: number,type: LocationType | '') => {
    if (type) { // Ensure we only update if a valid type is selected
      const updatedLocations = [...locationsState];
      
      // Update the type at the root level of the location
      updatedLocations[index] = {
        ...updatedLocations[index],
        type: type, // Update the type directly
      };
      
      setLocations(updatedLocations);
  
      // Recalculate the total activities count based on the selected type
      const activityCount = updatedLocations.filter(
        location => location.type === 'Adventure & Outdoor Activities'
      ).length;
      
      setTotalActivities(activityCount);
    }
  };
  

  const handleNameChange = (locationIndex: number, newName: string) => {
    const updatedLocations = [...locationsState];
    
    // Update the name at the root level of the location
    updatedLocations[locationIndex] = {
      ...updatedLocations[locationIndex],
      name: newName, // Update the name directly
    };
    
    setLocations(updatedLocations); // Update the state
  };
  


  const handleSubTypeChange = (index: number, subType: string) => {
    const updatedLocations = [...locationsState];
    
    // Update the subtype at the root level of the location
    updatedLocations[index] = {
      ...updatedLocations[index],
      subtype: subType, // Update the subtype directly
    };
    
    setLocations(updatedLocations);
  };
  

  return (
    <div className="flex h-screen ">
      <div className="w-full h-full  relative scrollbar-hide scrollbar-custom">
        {/* Summary Section */}
        <div className="flex flex-cols-5 gap-3 lg:gap-10 mx-2 justify-center mt-2 mb-6 overflow-visible">
          {/* Total Price - Transportation */}
          <div 
            className="flex px-1 flex-col items-center justify-center  lg:w-32 lg:h-28  w-22 h-22  bg-white rounded-lg shadow-lg"
            style={{
              border: '2px solid transparent',
              backgroundImage: 'linear-gradient(white, white), linear-gradient(to right, #4CAF50, #81C784)',
              backgroundClip: 'padding-box, border-box',
              backgroundOrigin: 'border-box',
            }}
          >
            <FaCar className="text-green-500 text-xl lg:text-3xl mb-2" />
            <div className="text-md lg:text-xl text-black font-bold">{`${(transportTotalPrice).toFixed(2)}$`}</div>
            <div className="text-xs hidden lg:block font-medium text-gray-800">Transport</div>
          </div>

          {/* Total Price - Items & Locations */}
          <div 
            className="flex px-1 flex-col items-center justify-center lg:w-32 lg:h-28  w-22 h-22 bg-white rounded-lg shadow-lg"
            style={{
              border: '2px solid transparent',
              backgroundImage: 'linear-gradient(white, white), linear-gradient(to right, #FF5722, #FF8A65)',
              backgroundClip: 'padding-box, border-box',
              backgroundOrigin: 'border-box',
            }}
          >
            <FaShoppingCart className="text-orange-500 text-xl lg:text-3xl mb-2" />
            <div className="text-md lg:text-xl text-black font-bold">{`${(locationTotalPrice).toFixed(2)}$`}</div>
            <div className="text-xs hidden lg:block lg:text-sm font-medium text-gray-800">Items </div>
          </div>

          {/* Total Locations */}
          <div 
            className="flex px-1 flex-col items-center justify-center lg:w-32 lg:h-28  w-22 h-22 bg-white rounded-lg shadow-lg"
            style={{
              border: '2px solid transparent',
              backgroundImage: 'linear-gradient(white, white), linear-gradient(to right, #2196F3, #64B5F6)',
              backgroundClip: 'padding-box, border-box',
              backgroundOrigin: 'border-box',
            }}
          >
            <FaMapMarkerAlt className="text-blue-500  text-xl lg:text-3xl mb-2" />
            <div className="text-md lg:text-xl  text-black font-bold">{totalLocations}</div>
            <div className="text-xs hidden lg:block  font-medium text-gray-800">Locations</div>
          </div>

         

          {/* Total Activities */}
          <div 
            className="flex px-1 flex-col items-center justify-center lg:w-32 lg:h-28  w-22 h-22 bg-white rounded-lg shadow-lg"
            style={{
              border: '2px solid transparent',
              backgroundImage: 'linear-gradient(white, white), linear-gradient(to right, #FFEB3B, #FFC107)',
              backgroundClip: 'padding-box, border-box',
              backgroundOrigin: 'border-box',
            }}
          >
            <FaRunning className="text-yellow-500  text-xl lg:text-3xl mb-2" />
            <div className=" text-md lg:text-xl text-black font-bold">{totalActivities}</div>
            <div className=" text-xs hidden lg:block font-medium text-gray-800">Activities</div>
          </div>

           {/* Total Notes by Theme */}
           <div 
            className="flex px-3  flex-col items-center justify-center lg:w-32 lg:h-28  w-22 h-22  bg-white rounded-lg shadow-lg"
            style={{
              border: '2px solid transparent',
              backgroundImage: 'linear-gradient(white, white), linear-gradient(to right, #9C27B0, #BA68C8)',
              backgroundClip: 'padding-box, border-box',
              backgroundOrigin: 'border-box',
            }}
          >
            <div className="grid grid-cols-2 p-y-1 gap-x-3 mt-1 gap-y-1">
  {[
    { theme: 'to avoid', icon: <FaTimesCircle className="text-red-500 text-xs lg:text-2xl" />, count: totalNotes.toAvoid, colorClass: 'text-red-500' },
    { theme: 'profit', icon: <FaCheckCircle className="text-green-500 text-xs lg:text-2xl" />, count: totalNotes.profit, colorClass: 'text-green-500' },
    { theme: "don't forget", icon: <FaInfoCircle className="text-blue-500 text-xs lg:text-2xl" />, count: totalNotes.dontForget, colorClass: 'text-blue-500' },
    { theme: 'warning', icon: <FaExclamationTriangle className="text-yellow-500 text-xs lg:text-2xl" />, count: totalNotes.warning, colorClass: 'text-yellow-500' }
  ].map(({ theme, icon, count, colorClass }, index) => (
    <div key={index} className="flex flex-col items-center">
      {icon}
      <span className={`text-sm font-semibold ${colorClass}`}>
        {count} {/* Render the individual count for each theme */}
      </span>
    </div>
  ))}
</div>

          </div>
        </div>

        {locationsState.map((location, index) => (
          <React.Fragment key={index}>
           <LocationInput
  index={index}
  value={location.details.value}
  suggestions={suggestionsState[index]}
  onAutocompleteChange={handleAutocompleteChange}
  onSuggestionClick={handleSuggestionClick} 
  onTypeChange={handleTypeChange}
  onAddItem={handleAddItem}
  items={location.details.items}
  onImportImages={handleImportImages}
  onNotesUpdate={handleNotesUpdate}
  onArrivalTimeChange={handleArrivalTimeChange}
  onDepartureTimeChange={handleDepartureTimeChange}
  onNameChange={handleNameChange} // Pass name change handler
  onSubTypeChange={handleSubTypeChange} // Pass subtype change handler
  notes={location.notes || []}
  arrivalTime={location.details.arrivalTime || ''}
  departureTime={location.details.departureTime || ''}
  name={location.name || ''} // Pass the name here
  type={location.type || ''} // Pass the type here
  subType={location.subtype || ''} // Pass the subtype here
  images={location.images || []} 
/>



            {index < locationsState.length - 1 && (
              <div className="mb-6"> {/* Added margin bottom here */}
                <TransportComponent
                 key={`${selectedDay}-${index}-${allTransports[index]?.details?.length || 0}`} 
  googleLoaded={googleLoaded}
  startLocation={locationsState[index]}
  endLocation={locationsState[index + 1]}
  onTransportDataUpdate={handleTransportDataUpdate}
  locationTotalPrice={locationTotalPrice}
  notes={allTransports[index]?.notes || []} // Ensure notes is at least an empty array
  details={allTransports[index]?.details || []} // Ensure details is at least an empty array
  onTransportPriceUpdate={handleTransportPriceUpdate}
  transportIndex={index}
/>
              </div>
            )}
          </React.Fragment>
        ))}

        <div className="flex justify-center  mt-2   lg:mt-12 ">
          <button
            onClick={addInputField}
            className="w-16 h-16 lg:w-24 lg:h-24 lg:mb-32 mb-8   flex flex-col items-center justify-center border-4 border-blue-500 rounded-full text-blue-500 hover:bg-blue-500 hover:text-white transition-all duration-300 ease-in-out"
          >
            <FaPlus className="h-8 w-8 " />
          </button>
        </div>  
      </div>
    </div>
  );
};

export default CreateItineraryPage;