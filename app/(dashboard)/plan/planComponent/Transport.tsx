import React, { useState, useEffect, useRef  } from 'react';
import { FaExclamationTriangle, FaTimesCircle, FaDollarSign, FaLightbulb, FaWalking, FaCar, FaQuestion } from 'react-icons/fa';
import { TransportDetail, Note, TransportInterface } from './../../../../interfaces/Itinerary';
import { IconType } from 'react-icons';

interface TransportProps {
    googleLoaded: boolean;
    onTransportPriceUpdate: (price: number) => void;
    locationTotalPrice: number;
    startLocation?: any;  // Location above this transport component
    endLocation?: any;    // Location below this transport component
    onTransportDataUpdate: (newTransportDetails: TransportDetail[], notes: Note[], transportIndex: number) => void;
    details: TransportDetail[];
    notes?: Note[];
    transportIndex: number;
}

const Transport: React.FC<TransportProps> = ({
    googleLoaded,
    onTransportPriceUpdate,
    locationTotalPrice,
    startLocation,
    endLocation,
    onTransportDataUpdate,
    details = [],
    notes = [],
    transportIndex,
}) => {
    const [currentTransportDetails, setCurrentTransportDetails] = useState<TransportDetail[]>(details);
    const [currentNotes, setCurrentNotes] = useState<Note[]>(notes);
    const inputSectionRef = useRef<HTMLDivElement>(null);
    const [inputSectionHeight, setInputSectionHeight] = useState<number>(0);

    // State for transport type
    const [newTransportTypeTo, setNewTransportTypeTo] = useState<string>('Walking');
    const [newTransportNameTo, setNewTransportNameTo] = useState<string>('');
    const [newTransportPriceTo, setNewTransportPriceTo] = useState<number>(0);
    const [newDestination, setNewDestination] = useState<string>('');
    const [finishSuggestionsTo, setFinishSuggestionsTo] = useState<any[]>([]);

    const [newTransportTypeFrom, setNewTransportTypeFrom] = useState<string>('Walking');
    const [newTransportNameFrom, setNewTransportNameFrom] = useState<string>('');
    const [newTransportPriceFrom, setNewTransportPriceFrom] = useState<number>(0);

    const [currentTheme, setCurrentTheme] = useState<string>('');
    const [newNoteText, setNewNoteText] = useState<string>('');
    const [isAddingDetail, setIsAddingDetail] = useState<boolean>(false);

    useEffect(() => {
        if (currentTransportDetails.length > 0) {
            const lastDetail = currentTransportDetails[currentTransportDetails.length - 1];
            setNewTransportTypeTo(lastDetail.typeFrom);
            setNewTransportNameTo(lastDetail.nameFrom);
            setNewTransportPriceTo(lastDetail.priceFrom);
        }
    }, [currentTransportDetails]);

    const getIconForType = (type: string): IconType => {
        switch (type) {
            case 'Walking':
                return FaWalking;
            case 'Driving':
                return FaCar;
            // Add other cases for different types
            default:
                return FaQuestion;
        }
    };

    const handleAddTransport = () => {
      const newTransportDetail: TransportDetail = {
          typeTo: newTransportTypeTo,
          nameTo: newTransportNameTo,
          priceTo: newTransportPriceTo,
          typeFrom: newTransportTypeFrom,
          nameFrom: newTransportNameFrom,
          priceFrom: newTransportPriceFrom,
          destination: newDestination,
      };
  
      const updatedTransportDetails = [...currentTransportDetails, newTransportDetail];
      setCurrentTransportDetails(updatedTransportDetails);
      setIsAddingDetail(false);
  
      // Immediately update the parent component with new details
      onTransportDataUpdate(updatedTransportDetails, currentNotes, transportIndex);
  
      // Update total price
      onTransportPriceUpdate(calculateTotalPrice() + newTransportPriceTo + newTransportPriceFrom);
  };
  

    const handleSaveNote = () => {
        if (newNoteText && currentTheme) {
            const newNote = { text: newNoteText, theme: currentTheme };
            const updatedNotes = [...currentNotes, newNote];
            setCurrentNotes(updatedNotes);
            
            // Make sure we update the parent component with the new notes
            onTransportDataUpdate(currentTransportDetails, updatedNotes, transportIndex);
            
            setNewNoteText('');
            setCurrentTheme('');
        }
     };
     

    const handleNoteButtonClick = (theme: string) => {
        setCurrentTheme(theme);
    };

    const handleAutocompleteChange = async (
        inputValue: string,
        setInputValue: React.Dispatch<React.SetStateAction<string>>,
        setSuggestions: React.Dispatch<React.SetStateAction<any[]>>
    ) => {
        setInputValue(inputValue);

        if (!googleLoaded) return;

        if (inputValue.length > 2) {
            const autocompleteService = new google.maps.places.AutocompleteService();
            autocompleteService.getPlacePredictions({ input: inputValue }, (predictions, status) => {
                if (status === google.maps.places.PlacesServiceStatus.OK && predictions) {
                    setSuggestions(predictions);
                }
            });
        } else {
            setSuggestions([]);
        }
    };
    

    const handleSuggestionClick = (
        suggestion: any,
        setInputValue: React.Dispatch<React.SetStateAction<string>>,
        setSuggestions: React.Dispatch<React.SetStateAction<any[]>>
    ) => {
        setInputValue(suggestion.description);
        setSuggestions([]);
    };

    const calculateTotalPrice = () => {
        return currentTransportDetails.reduce((total, detail) => total + (detail.priceTo || 0) + (detail.priceFrom || 0), 0);
    };

    const calculateFinalTotalPrice = () => {
        return locationTotalPrice + calculateTotalPrice();
    };

    return (
        <div className="p-4 bg-gray-100 2xl:mx-10 rounded-lg shadow-lg text-black">
          <div className="flex flex-col lg:flex-row justify-between">
            
            {/* Transport Detail Inputs on the Left */}
            <div className="w-full lg:w-1/2 pr-0 lg:pr-4 mb-4 lg:mb-0" ref={inputSectionRef}>
              
              {/* First Transport Input Section */}
              <div className="mb-4">
                <label className="block mb-2  text-md font-semibold">Transport Mode:</label>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <select
                    value={newTransportTypeTo}
                    onChange={(e) => setNewTransportTypeTo(e.target.value)}
                    className="block w-full sm:w-1/3 p-2 text-sm border border-gray-300 rounded-lg bg-white text-black"
                  >
                    {/* Transport Mode Options */}
                    <option value="Walking">Walking</option>
                    <option value="Cycling">Cycling</option>
                    <option value="Driving">Driving</option>
                    <option value="Public Transit">Public Transit</option>
                    <option value="Bus">Bus</option>
                    <option value="Subway/Metro">Subway/Metro</option>
                    <option value="Train">Train</option>
                    <option value="Taxi">Taxi</option>
                    <option value="Ride-sharing">Ride-sharing</option>
                    <option value="Ferry/Boat">Ferry/Boat</option>
                  </select>
      
                  <input
                    type="text"
                    value={newTransportNameTo || ""}
                    onChange={(e) => setNewTransportNameTo(e.target.value)}
                    placeholder="Name"
                    className="block w-full sm:w-1/3 p-2 border text-sm border-gray-300 rounded-lg bg-white text-black"
                  />
      
                  <input
                    type="number"
                    value={newTransportPriceTo || ""}
                    onChange={(e) => setNewTransportPriceTo(parseFloat(e.target.value))}
                    placeholder="Price ($)"
                    className="block w-full sm:w-1/3 p-2 border text-sm border-gray-300 rounded-lg bg-white text-black"
                  />
                </div>
              </div>
      
              {/* Destination Section */}
              <div className="flex-1 mb-4">
                <label className="block mb-2 font-semibold">Destination:</label>
                <input
                  type="text"
                  value={newDestination || ""}
                  onChange={(e) => handleAutocompleteChange(e.target.value, setNewDestination, setFinishSuggestionsTo)}
                  className="block w-full  text-sm p-2 border rounded-lg bg-white text-black"
                />
                {/* Autocomplete Suggestions */}
                <ul className="border rounded-lg bg-white text-sm text-black mt-2">
                  {finishSuggestionsTo.map((suggestion) => (
                    <li
                      key={suggestion.place_id}
                      onClick={() => handleSuggestionClick(suggestion, setNewDestination, setFinishSuggestionsTo)}
                      className="cursor-pointer p-2 hover:bg-gray-200"
                    >
                      {suggestion.description}
                    </li>
                  ))}
                </ul>
              </div>
      
              {/* Second Transport Input Section */}
              <div className="mb-4">
                <label className="block mb-2 font-semibold">Return Transport Mode:</label>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <select
                    value={newTransportTypeFrom}
                    onChange={(e) => setNewTransportTypeFrom(e.target.value)}
                    className="block w-full sm:w-1/3 p-2 border text-sm border-gray-300 rounded-lg bg-white text-black"
                  >
                    {/* Transport Mode Options */}
                    <option value="Walking">Walking</option>
                    <option value="Cycling">Cycling</option>
                    <option value="Driving">Driving</option>
                    <option value="Public Transit">Public Transit</option>
                    <option value="Bus">Bus</option>
                    <option value="Subway/Metro">Subway/Metro</option>
                    <option value="Train">Train</option>
                    <option value="Taxi">Taxi</option>
                    <option value="Ride-sharing">Ride-sharing</option>
                    <option value="Ferry/Boat">Ferry/Boat</option>
                  </select>
      
                  <input
                    type="text"
                    value={newTransportNameFrom}
                    onChange={(e) => setNewTransportNameFrom(e.target.value)}
                    placeholder="Name"
                    className="block w-full sm:w-1/3 p-2 border text-sm border-gray-300 rounded-lg bg-white text-black"
                  />
      
                  <input
                    type="number"
                    value={newTransportPriceFrom}
                    onChange={(e) => setNewTransportPriceFrom(parseFloat(e.target.value))}
                    placeholder="Price ($)"
                    className="block w-full sm:w-1/3 p-2 border text-sm border-gray-300 rounded-lg bg-white text-black"
                  />
                </div>
              </div>
      
              {/* Add Transport Button */}
              <div className="flex-1 mt-4 text-sm mb-2">
                <button
                  onClick={handleAddTransport}
                  className="p-2 w-full bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                  {currentTransportDetails.length > 0 ? 'Add Another Transport Detail' : 'Add Transport Detail'}
                </button>
              </div>
            </div>
      
            {/* Added Transport Details on the Right */}
            <div className="w-full lg:w-1/2 pl-0 lg:pl-10 mt-2 lg:mt-0 max-h-72  overflow-y-auto scrollbar-thin scrollbar-thumb-rounded-full scrollbar-thumb-blue-500 scrollbar-track-gray-200">
              {currentTransportDetails.length > 0 && (
                <div className="relative w-full max-h-80 overflow-y-visible">
                  {/* Dotted Vertical Line */}
                  <div className="absolute left-12 border-l-2 border-dotted border-blue-500"
                    style={{ top: '-0.5rem', bottom: `calc(100% - ${currentTransportDetails.length * 6}rem - 5.3rem )` }}
                  ></div>
      
                  {/* Render Transport Details */}
                  {currentTransportDetails.map((detail, index) => {
                    const IconComponent = getIconForType(detail.typeTo);
                    return (
                      <div key={index} className="relative flex items-start ml-8 space-y-9 mb-7 mt-8">
                        <div className="flex-row items-center justify-between">
                          <div className="flex-shrink-0 flex items-center p-[2px] bg-gradient-to-r from-blue-100 to-blue-400 rounded-full shadow-lg"
                            style={{ position: 'absolute', top: '-1rem' }}
                          >
                            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-blue-500 mr-2">
                              <IconComponent className="text-blue-500" />
                            </div>
                            <span className="text-gray-800 font-semibold text-[13px] mr-2">{detail.typeTo}</span>
                            <span className="text-gray-800 font-semibold text-[13px] mr-2">{detail.nameTo}</span>
                            <span className="text-gray-800 font-semibold text-[13px] mr-2">{detail.priceTo}$</span>
                          </div>
                        </div>
      
                        <div
                          className="w-[50%] h-10 rounded-lg flex items-center space-x-2 -ml-2 pl-6 py-2 mb-4"
                          style={{
                            border: '2px solid transparent',
                            backgroundImage: 'linear-gradient(white, white), linear-gradient(to right, #4A90E2, #919dfa)',
                            backgroundClip: 'padding-box, border-box',
                            backgroundOrigin: 'border-box',
                          }}
                        >
                          <div className="flex items-center">
                            <div className="w-5 h-5 -ml-3 bg-white border-2 border-blue-500 rounded-full flex items-center justify-center">
                              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            </div>
                          </div>
                          <span className="text-blue-700 font-semibold text-sm">
                            {detail.destination.split(',')[0]}
                          </span>
                        </div>
                      </div>
                    );
                  })}
      
                  {/* Final icon after the last transport detail */}
                  <div className="relative flex items-start ml-8">
                    <div className="flex flex-row items-center justify-start">
                      <div className="flex-shrink-0 flex items-center p-[2px] bg-gradient-to-r from-blue-100 to-blue-400 rounded-full shadow-lg"
                        style={{ position: 'relative', top: '-1rem' }}
                      >
                        <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-blue-500 mr-2">
                          {(() => {
                            const IconComponent = getIconForType(currentTransportDetails[currentTransportDetails.length - 1]?.typeFrom);
                            return <IconComponent className="text-blue-500" />;
                          })()}
                        </div>
                        <span className="text-gray-800 font-semibold text-[13px] mr-2">
                          {currentTransportDetails[currentTransportDetails.length - 1]?.typeFrom}
                        </span>
                        <span className="                  text-gray-800 font-semibold text-[13px] mr-2">
                    {currentTransportDetails[currentTransportDetails.length - 1]?.nameFrom}
                  </span>
                  <span className="text-gray-800 font-semibold text-[13px] mr-2">
                    {currentTransportDetails[currentTransportDetails.length - 1]?.priceFrom}$
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>

    {/* Themed Notes Section */}
    <div className="mt-4 w-full">
      <div className="flex flex-wrap gap-4 mb-4 justify-between">
        <button
          onClick={() => handleNoteButtonClick('Watch Out')}
          className="flex-1 flex items-center justify-center gap-1 text-sm bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-1 px-4 rounded"
        >
          <FaExclamationTriangle />
          Watch Out
        </button>
        <button
          onClick={() => handleNoteButtonClick('To Avoid')}
          className="flex-1 flex items-center justify-center gap-1 text-sm bg-red-400 hover:bg-red-500 text-white font-bold py-1 px-4 rounded"
        >
          <FaTimesCircle />
          To Avoid
        </button>
        <button
          onClick={() => handleNoteButtonClick('Profit')}
          className="flex-1 flex items-center justify-center gap-1 text-sm bg-green-400 hover:bg-green-500 text-white font-bold py-1 px-2 rounded"
        >
          <FaDollarSign />
          Profit
        </button>
        <button
          onClick={() => handleNoteButtonClick("Don't Forget")}
          className="flex-1 flex items-center justify-center gap-1 text-sm bg-blue-400 hover:bg-blue-500 text-white font-bold py-1 px-2 rounded"
        >
          <FaLightbulb />
          Don't Forget
        </button>
      </div>

      {/* Note Input Area */}
      {currentTheme && (
        <div
          className={`p-3 bg-opacity-50 border-l-4 rounded-md ${
            currentTheme === 'Watch Out'
              ? 'bg-yellow-100 border-yellow-400 text-yellow-700'
              : currentTheme === 'To Avoid'
              ? 'bg-red-100 border-red-400 text-red-700'
              : currentTheme === 'Profit'
              ? 'bg-green-100 border-green-400 text-green-700'
              : currentTheme === "Don't Forget"
              ? 'bg-blue-100 border-blue-400 text-blue-700'
              : ''
          }`}
        >
          <div className="flex items-center gap-1">
            {currentTheme === 'Watch Out' && <FaExclamationTriangle />}
            {currentTheme === 'To Avoid' && <FaTimesCircle />}
            {currentTheme === 'Profit' && <FaDollarSign />}
            {currentTheme === "Don't Forget" && <FaLightbulb />}
            <span className="font-bold">{currentTheme}</span>
          </div>
          <textarea
            rows={2}
            value={newNoteText}
            onChange={(e) => setNewNoteText(e.target.value)}
            placeholder="Write your note here..."
            className={`w-full p-2 mt-2 border rounded-md ${
              currentTheme === 'Watch Out'
                ? 'border-yellow-300 focus:ring-yellow-500'
                : currentTheme === 'To Avoid'
                ? 'border-red-300 focus:ring-red-500'
                : currentTheme === 'Profit'
                ? 'border-green-300 focus:ring-green-500'
                : currentTheme === "Don't Forget"
                ? 'border-blue-300 focus:ring-blue-500'
                : ''
            }`}
          />
          <button
            onClick={handleSaveNote}
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg mt-2"
          >
            Save Note
          </button>
        </div>
      )}

      {/* List of Saved Notes */}
      {currentNotes.length > 0 && (
        <div className="mt-4">
          <h4 className="text-lg font-semibold mb-2">Saved Notes:</h4>
          <ul>
            {currentNotes.map((note, index) => (
              <li
                key={index}
                className={`p-3 mb-2 border-l-4 rounded-md ${
                  note.theme === 'Watch Out'
                    ? 'bg-yellow-100 border-yellow-400 text-yellow-700'
                    : note.theme === 'To Avoid'
                    ? 'bg-red-100 border-red-400 text-red-700'
                    : note.theme === 'Profit'
                    ? 'bg-green-100 border-green-400 text-green-700'
                    : note.theme === "Don't Forget"
                    ? 'bg-blue-100 border-blue-400 text-blue-700'
                    : ''
                }`}
              >
                <div className="flex items-center gap-1">
                  {note.theme === 'Watch Out' && <FaExclamationTriangle />}
                  {note.theme === 'To Avoid' && <FaTimesCircle />}
                  {note.theme === 'Profit' && <FaDollarSign />}
                  {note.theme === "Don't Forget" && <FaLightbulb />}
                  <span className="font-bold">{note.theme}</span>
                </div>
                <p>{note.text}</p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  </div>
);
                        };
                        
                        export default Transport;
                        

