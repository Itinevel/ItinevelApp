import React, { useState } from 'react';
import { TripLocation } from '@/interfaces/Itinerary';
import { FaExclamationTriangle, FaCheckCircle, FaInfoCircle, FaTimesCircle, FaChevronDown, FaChevronUp, FaImages } from 'react-icons/fa';


interface LocationProps {
  location: TripLocation;
  onViewGallery: (images: string[]) => void; // Function to handle gallery opening
}

const getThemeStyles = (theme: string) => {
  switch (theme.toLowerCase()) {
    case 'to avoid':
      return {
        className: 'bg-red-100 text-red-700 border-red-500',
        icon: <FaTimesCircle className="text-red-500" />
      };
    case 'profit':
      return {
        className: 'bg-green-100 text-green-700 border-green-500',
        icon: <FaCheckCircle className="text-green-500" />
      };
    case "don't forget":
      return {
        className: 'bg-blue-100 text-blue-700 border-blue-500',
        icon: <FaInfoCircle className="text-blue-500" />
      };
    case 'warning':
      return {
        className: 'bg-yellow-100 text-yellow-700 border-yellow-500',
        icon: <FaExclamationTriangle className="text-yellow-500" />
      };
    default:
      return {
        className: 'bg-gray-100 text-gray-700 border-gray-500',
        icon: <FaInfoCircle className="text-gray-500" />
      };
  }
};

const LocationComponent: React.FC<LocationProps> = ({ location, onViewGallery }) => {
  const [expanded, setExpanded] = useState(false);
  const [expandedNotes, setExpandedNotes] = useState<Record<number, boolean>>({});

  const toggleNote = (index: number) => {
    setExpandedNotes((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const toggleExpand = () => {
    setExpanded(!expanded);
  };

  const noteCounts = location.notes?.reduce(
    (counts, note) => {
      const theme = note.theme.toLowerCase();
      if (!counts[theme]) {
        counts[theme] = 0;
      }
      counts[theme]++;
      return counts;
    },
    {} as Record<string, number>
  ) || {};

  return (
    <div className="relative w-full rounded-lg overflow-hidden shadow-xl my-6 bg-white transform transition-all hover:scale-105 hover:shadow-2xl" style={{ fontFamily: 'Amifer, sans-serif' }}>
      {/* Image and "View Gallery" button */}
      {location.images && location.images.length > 0 ? (
        <div className="relative">
          <img className="w-full h-48 object-cover" src={location.images[0]} alt={location.name} />
          <button
            onClick={() => onViewGallery(location.images || [])}
            className="absolute bottom-2 right-4 flex items-center justify-center bg-white text-xs md:text-sm font-semibold text-gray-700 border-2 border-black-300 px-4 md:px-6 py-1 rounded-lg shadow-lg hover:bg-gray-100 hover:text-gray-800 hover:scale-105 transition-transform duration-300 focus:outline-none"
            style={{ boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)' }}
          >
            <FaImages className="mr-2 text-sm md:text-lg" />
            Browse Gallery
          </button>
        </div>
      ) : (
        <div className="relative">
          
          <button
            onClick={() => onViewGallery([])}
            className="absolute bottom-6 right-6 flex items-center justify-center bg-white text-xs md:text-sm font-semibold text-gray-700 border-2 border-black-300 px-4 md:px-6 py-1 rounded-lg shadow-lg hover:bg-gray-100 hover:text-gray-800 hover:scale-105 transition-transform duration-300 focus:outline-none"
            style={{ boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)' }}
          >
            <FaImages className="mr-2 text-sm md:text-lg" />
            Browse Gallery
          </button>
        </div>
      )}
  
      <div className="px-4 md:px-6 py-4 pb-12">
        {/* Main Content */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-2 space-y-4 md:space-y-0">
          <div className="flex flex-col md:flex-row md:items-center space-y-2 md:space-y-0 md:space-x-4 w-full md:w-[65%]">
            <div className="flex items-center space-x-2">
              <span className="font-bold text-sm md:text-lg text-blue-700">{location.subtype}:</span>
              <div 
                className="font-bold text-blue-700 truncate my-2" 
                style={{
                  fontSize: '14px',
                  lineHeight: '1.25rem',
                  maxWidth: '100%',
                  display: '-webkit-box',
                  WebkitLineClamp: 2, 
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
                title={location.details.value}
              >
                {location.details.value.length > 40 ? `${location.details.value.substring(0, 40)}...` : location.details.value}
              </div>
            </div> 
  
            <div className="flex w-1/3 items-center px-3 py-1 rounded-lg border border-gray-300 text-xs md:text-sm">
              <span className="text-gray-600 font-semibold">{location.details.arrivalTime || 'N/A'}</span>
              <span className="mx-2 text-gray-400">→</span>
              <span className="text-gray-600 font-semibold">{location.details.departureTime || 'N/A'}</span>
            </div>
          </div>
  
          {/* Notes */}
          <div className="flex items-center space-x-3 ml-auto pr-0 md:pr-4">
            {Object.keys(noteCounts).map((theme, index) => {
              const { icon } = getThemeStyles(theme);
              return (
                <div key={index} className="flex items-center">
                  {icon}
                  <span className="ml-1 text-gray-600 font-semibold text-xs lg:text-sm">{noteCounts[theme]}</span>
                </div>
              );
            })}
          </div>
        </div>
  
        {/* Notes Preview */}
        {location.notes && location.notes.length > 0 && (
          <div className={`grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-2 ${expanded ? '' : 'max-h-20 overflow-hidden'}`}>
            {location.notes.slice(0, expanded ? location.notes.length : 4).map((note, index) => {
              const { className, icon } = getThemeStyles(note.theme);
              const isExpanded = expandedNotes[index];
              return (
                <div key={index} className="w-full">
                  <div className={`flex items-center justify-between px-4 py-2 border rounded-md ${className}`}>
                    <div className="flex items-center">
                      <span className="mr-2">{icon}</span>
                      <span className={`truncate text-[12px] md:text-[13px] ${isExpanded ? '' : 'overflow-hidden whitespace-nowrap'} block`}
                        style={{
                          maxWidth: '9rem',
                          lineHeight: '1.25rem',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}>
                        {note.text}
                      </span>
                    </div>
                    <button onClick={() => toggleNote(index)} className="text-gray-500">
                      {isExpanded ? <FaChevronUp className="text-xs" /> : <FaChevronDown className="text-xs" />}
                    </button>
                  </div>
                  {isExpanded && (
                    <div className="mt-2 p-4 border rounded-md overflow-hidden">
                      <p className="text-sm md:text-md text-gray-700">{note.text}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
  
        {/* Additional Notes and Items */}
        {expanded && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4 text-gray-600 text-xs md:text-base mt-4">
            {location.details.items.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-gray-100 rounded-md shadow-sm">
                <span className="font-semibold text-[12px] md:text-[13px] text-gray-700">{item.name}</span>
                <span className="text-[12px] md:text-[13px] text-gray-500">${item.price}</span>
              </div>
            ))}
          </div>
        )}
      </div>
  
      {/* Expand/Collapse Button */}
      <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 translate-y-1/4">
        <button onClick={toggleExpand} className="text-black">
          {expanded ? <FaChevronUp className="text-sm" /> : <FaChevronDown className="text-sm" />}
        </button>
      </div>
    </div>
  );
  
};

export default LocationComponent;
