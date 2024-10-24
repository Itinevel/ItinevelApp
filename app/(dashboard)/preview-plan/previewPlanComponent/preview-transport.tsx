import React, { useState, useEffect } from 'react';
import { TransportInterface } from '@/interfaces/Itinerary';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faWalking,
  faBicycle,
  faCar,
  faBus,
  faTrain,
  faSubway,
  faShip,
  faTaxi,
  faQuestionCircle,
  faMapMarkedAlt,
  faClock,
  faRoad,
  faArrowLeft,
  faArrowRight,
} from '@fortawesome/free-solid-svg-icons';

interface TransportProps {
  transport: TransportInterface;
  startLocation: string; // New prop for the location above this transport
  endLocation: string;   // New prop for the location below this transport
}

const iconMap: { [key: string]: any } = {
  walking: faWalking,
  bicycling: faBicycle,
  driving: faCar,
  transit: faBus,
  train: faTrain,
  subway: faSubway,
  ship: faShip,
  taxi: faTaxi,
  default: faQuestionCircle,
};

const TransportComponent: React.FC<TransportProps> = ({ transport, startLocation, endLocation }) => {
  const [directions, setDirections] = useState<string[] | null>(null);
  const [travelMode, setTravelMode] = useState<google.maps.TravelMode | null>(null);
  const [travelTime, setTravelTime] = useState<string | null>(null);
  const [travelDistance, setTravelDistance] = useState<string | null>(null);
  const [googleMapsUrl, setGoogleMapsUrl] = useState<string | null>(null);
  const [travelIcons, setTravelIcons] = useState<{ mode: google.maps.TravelMode; icon: any }[]>([]);
  const [showLeftSection, setShowLeftSection] = useState(true); // Toggle between left and right sections on mobile

  useEffect(() => {
    if (typeof google === 'undefined' || typeof google.maps === 'undefined') {
      console.error('Google Maps JavaScript API not loaded.');
      return;
    }

    if (!travelMode) {
      setTravelMode(google.maps.TravelMode.DRIVING);
    }

    setTravelIcons([
      { mode: google.maps.TravelMode.WALKING, icon: faWalking },
      { mode: google.maps.TravelMode.BICYCLING, icon: faBicycle },
      { mode: google.maps.TravelMode.DRIVING, icon: faCar },
      { mode: google.maps.TravelMode.TRANSIT, icon: faBus },
    ]);

    const directionsService = new google.maps.DirectionsService();

    directionsService.route(
      {
        origin: startLocation || '',
        destination: endLocation || '',
        travelMode: travelMode || google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        if (status === google.maps.DirectionsStatus.OK && result && result.routes[0]?.legs[0]) {
          const steps = result.routes[0].legs[0].steps?.map((step) => step.instructions) ?? [];
          setDirections(steps);
          setTravelTime(result.routes[0].legs[0].duration?.text ?? 'Unknown');
          setTravelDistance(result.routes[0].legs[0].distance?.text ?? 'Unknown');

          setGoogleMapsUrl(
            `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(startLocation)}&destination=${encodeURIComponent(endLocation)}&travelmode=${travelMode?.toString().toLowerCase()}`
          );
        } else {
          console.error(`Error fetching directions: ${status}`);
        }
      }
    );
  }, [travelMode, startLocation, endLocation]);

  const getIconForType = (type: string) => {
    return iconMap[type.toLowerCase()] || iconMap.default;
  };

  const handleTravelModeChange = (mode: google.maps.TravelMode) => {
    if (typeof google !== 'undefined' && google.maps) {
      setTravelMode(mode);
    } else {
      console.error('Google Maps JavaScript API not loaded.');
    }
  };

  return (
    <div className="relative w-full flex flex-col lg:flex-row space-x-2 max-h-[400px]" style={{ fontFamily: 'Amifer, sans-serif' }}>
      {/* Toggle Button for Mobile */}
      <div className="lg:hidden flex justify-between p-2">
        <button
          onClick={() => setShowLeftSection(true)}
          className={`p-2 rounded-full ${showLeftSection ? 'bg-blue-500 text-white' : 'text-gray-500'}`}
        >
          <FontAwesomeIcon icon={faArrowLeft} />
        </button>
        <button
          onClick={() => setShowLeftSection(false)}
          className={`p-2 rounded-full ${!showLeftSection ? 'bg-blue-500 text-white' : 'text-gray-500'}`}
        >
          <FontAwesomeIcon icon={faArrowRight} />
        </button>
      </div>

      {/* Left Half - Transport Details (Hidden on mobile if showLeftSection is false) */}
      <div className={`relative w-full lg:w-1/2 pr-4 left-10 overflow-y-auto custom-scrollbar-left ${showLeftSection ? '' : 'hidden lg:flex'}`}>
        {/* Dotted Vertical Line */}
        <div
          className="absolute left-12 border-l-2 border-dotted border-blue-500"
          style={{ top: '-0.5rem', bottom: `calc(100% - ${transport.details.length * 6}rem - 7rem)` }}
        ></div>

        {/* Render Transport Details */}
        {transport.details.map((detail, index) => {
          let iconType = index === 0 ? detail.typeTo : detail.typeFrom;
          let priceType = index === 0 ? detail.priceTo : detail.priceFrom;
          let nameType = index === 0 ? detail.nameTo : detail.nameFrom;

          return (
            <div key={index} className="relative flex items-start ml-8 space-y-9 mb-7 mt-8">
              <div className='flex-row items-center justify-between'>
                <div
                  className="flex-shrink-0 flex items-center p-[2px] bg-gradient-to-r from-blue-100 to-blue-400 rounded-full shadow-lg"
                  style={{ position: 'absolute', top: '-1rem' }}
                >
                  <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-blue-500 mr-2">
                    <FontAwesomeIcon icon={getIconForType(iconType)} className="text-blue-500" />
                  </div>
                  <span className="text-gray-800 font-semibold text-[14px] mr-2">{iconType}</span>
                  <span className="text-gray-800 font-semibold text-[14px] mr-2">{nameType}</span>
                  <span className="text-gray-800 font-semibold text-[14px] mr-2">{priceType}$</span>
                </div>
              </div>

              <div className="w-[50%] h-10 rounded-lg flex items-center space-x-2 -ml-2 pl-6 py-2 mb-4"
                style={{
                  border: '2px solid transparent',
                  backgroundImage: 'linear-gradient(white, white), linear-gradient(to right, #4A90E2, #919dfa)',
                  backgroundClip: 'padding-box, border-box',
                  backgroundOrigin: 'border-box',
                }}>
                <div className="flex items-center">
                  <div className="w-5 h-5 -ml-3 bg-white border-2 border-blue-500 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  </div>
                </div>
                <span className="text-blue-700 font-semibold text-md">
                  {detail.destination.split(',')[0]}
                </span>
              </div>
            </div>
          );
        })}

        {/* Final icon after the last transport detail */}
        <div className="relative flex items-start ml-8">
          <div className="flex flex-row items-center justify-start">
            <div
              className="flex-shrink-0 flex items-center p-[2px] bg-gradient-to-r from-blue-100 to-blue-400 rounded-full shadow-lg"
              style={{ position: 'relative', top: '-1rem' }}
            >
              <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-blue-500 mr-2">
                <FontAwesomeIcon icon={getIconForType(transport.details[transport.details.length - 1]?.typeFrom)} className="text-blue-500" />
              </div>
              <span className="text-gray-800 font-semibold text-[14px] mr-2">{transport.details[transport.details.length - 1]?.typeFrom}</span>
              <span className="text-gray-800 font-semibold text-[14px] mr-2">{transport.details[transport.details.length - 1]?.nameFrom}</span>
              <span className="text-gray-800 font-semibold text-[14px] mr-2">{transport.details[transport.details.length - 1]?.priceFrom}$</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Half - Display Directions with Vertical Line and Mode Selection (Hidden on mobile if showLeftSection is true) */}
      <div className={`w-full lg:w-1/2 flex flex-col bg-gray-50 border border-gray-200 rounded-lg relative overflow-y-auto custom-scrollbar-right ${showLeftSection ? 'hidden lg:flex' : ''}`}>
        <div className="flex justify-around p-2 bg-white border-b border-gray-200">
          {travelIcons.map((iconData, index) => (
            <button
              key={index}
              onClick={() => handleTravelModeChange(iconData.mode)}
              className={`p-2 rounded-full ${travelMode === iconData.mode ? 'bg-blue-500 text-white' : 'text-gray-500'}`}
            >
              <FontAwesomeIcon icon={iconData.icon} className="text-lg" />
            </button>
          ))}

          {/* View on Google Maps Button */}
          {googleMapsUrl && (
            <a
              href={googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-full bg-green-500 text-white flex items-center justify-center"
              title="View on Google Maps"
            >
              <FontAwesomeIcon icon={faMapMarkedAlt} className="text-lg" />
            </a>
          )}
        </div>

        {/* Custom Styling for Distance and Time */}
        <div className="flex justify-between items-center p-4 mr-6 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-r-lg shadow-lg">
          {travelTime && (
            <div className="flex items-center space-x-2">
              <FontAwesomeIcon icon={faClock} className="text-lg" />
              <span className="font-semibold text-md">{travelTime}</span>
            </div>
          )}
          {travelDistance && (
            <div className="flex items-center space-x-2">
              <FontAwesomeIcon icon={faRoad} className="text-lg" />
              <span className="font-semibold text-md">{travelDistance}</span>
            </div>
          )}
        </div>

        {/* Display Directions */}
        <div className="flex-grow overflow-auto p-4">
          {directions ? (
            directions.map((step, index) => (
              <div key={index} className="relative flex items-start mb-4">
                {/* Vertical line linking steps */}
                {index < directions.length - 1 && (
                  <div
                    className="absolute left-2 top-4 border-l-2 border-dotted border-blue-500 h-full"
                    style={{ bottom: '-1rem' }}
                  ></div>
                )}
                {/* Step icon and text */}
                <div className="flex-shrink-0 w-4 h-4 bg-white border-2 border-blue-500 rounded-full flex items-center justify-center text-blue-500" style={{ position: 'relative' }}>
                  <span className="w-1 h-1 bg-blue-500 rounded-full"></span>
                </div>
                <div className="ml-6 text-gray-600" dangerouslySetInnerHTML={{ __html: step }}></div>
              </div>
            ))
          ) : (
            <span className="text-gray-600">Loading directions...</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default TransportComponent;

