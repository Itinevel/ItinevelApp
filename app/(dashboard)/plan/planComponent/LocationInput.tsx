import React, { useState, useEffect } from 'react';
import {
    FaExclamationTriangle,
    FaTimesCircle,
    FaDollarSign,
    FaLightbulb,
    FaPlusCircle,
    FaMapMarkerAlt,
    FaClock,
    FaDollarSign as FaPriceTag,
    FaEye
} from 'react-icons/fa';
import { Note } from './../../../../interfaces/Itinerary';
import ImageGalleryPopup from './../../../../components/gallery-popup';
import { storage } from './../../../../config/firebaseConfig';
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { LocationType } from '../../../../interfaces/Itinerary';
// Import in both files:


interface LocationInputProps {
    index: number;
    value: string;
    suggestions: any[];
    onAutocompleteChange: (index: number, value: string) => void;
    onSuggestionClick: (index: number, suggestion: any) => void;
    onAddItem: (index: number, item: { name: string; price: number }) => void;
    items: { name: string; price: number }[];
    onImportImages: (index: number, imageUrls: string[]) => void;
    onNotesUpdate: (index: number, notes: Note[]) => void;
    onArrivalTimeChange: (index: number, time: string) => void;
    onDepartureTimeChange: (index: number, time: string) => void;
    notes?: { text: string; theme: string }[];
    arrivalTime: string;
    departureTime: string;
    onTypeChange: (index: number, type: LocationType | '') => void;
    onNameChange: (index: number, name: string) => void;
    onSubTypeChange: (index: number, subType: string) => void;
    name: string;
    type: LocationType | '';
    subType: string;
    images: string[];
    
}


    

const LocationInput: React.FC<LocationInputProps> = ({
    index,
    value,
    suggestions = [],
    onAutocompleteChange,
    onSuggestionClick,
    onAddItem,
    items,
    onImportImages,
    onNotesUpdate,
    onArrivalTimeChange,
    onDepartureTimeChange,
    notes = [],
    arrivalTime,
    departureTime,
    onTypeChange,
    onSubTypeChange,
    onNameChange,
    name,
    type,
    subType,
    images,
}) => {
    const [itemName, setItemName] = useState('');
    const [itemPrice, setItemPrice] = useState<number | ''>('');
    const [noteText, setNoteText] = useState<string>(''); 
    const [arrivalTimeState, setArrivalTimeState] = useState<string>(arrivalTime || ''); 
    const [departureTimeState, setDepartureTimeState] = useState<string>(departureTime || '');
    const [currentTheme, setCurrentTheme] = useState<string>(''); 
    const [isGalleryOpen, setGalleryOpen] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [locationName, setLocationName] = useState<string>(''); 
    const [locationType, setLocationType] = useState<LocationType | ''>(''); 
    const [subTypeState, setSubTypeState] = useState<string>(''); 

    const [query, setQuery] = useState(value);

    // Synchronize the loaded values with the internal state
    useEffect(() => {
        setQuery(value);
        setLocationName(name);
        setLocationType(type);
        setSubTypeState(subType) ;
    }, [value, name, type, index]);
      


    // Handle query (address input) changes and call the onAutocompleteChange handler
    useEffect(() => {
        onAutocompleteChange(index, query);
    }, [query]);

    // Handle location type changes and call the onTypeChange handler
    useEffect(() => {
        onTypeChange(index, locationType);
    }, [locationType]);

    // Handle subtype changes and call the onSubTypeChange handler
    useEffect(() => {
        onSubTypeChange(index, subTypeState);
    }, [subTypeState]);

    

    const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newQuery = e.target.value;
        setQuery(newQuery);
        onAutocompleteChange(index, newQuery);
    };

    const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedType = e.target.value as LocationType;
        setLocationType(selectedType);
        onTypeChange(index, selectedType);
    };

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newName = e.target.value;
        setLocationName(newName);
        onNameChange(index, newName);
    };

    const handleSubTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newSubType = e.target.value;
        setSubTypeState(newSubType);
        onSubTypeChange(index, newSubType);
    };

    const handleAddItem = () => {
        if (itemName && itemPrice !== '') {
            onAddItem(index, { name: itemName, price: Number(itemPrice) });
            setItemName('');
            setItemPrice('');
        }
    };

  
    // Image import handler (including Firebase upload)
    // If not required in this component, remove handleImageImport logic:
const handleImageImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
        const newFiles = Array.from(files);
        const imageUrls: string[] = [];

        for (const file of newFiles) {
            const storageRef = ref(storage, `images/${file.name}`);
            await uploadBytes(storageRef, file);
            const downloadURL = await getDownloadURL(storageRef);
            imageUrls.push(downloadURL); 
        }
        onImportImages(index, imageUrls);
    }
};

    


    const handleNoteButtonClick = (theme: string) => {
        setCurrentTheme(theme);
    };

    const handleSaveNote = () => {
        if (noteText && currentTheme) {
            const newNote = { text: noteText, theme: currentTheme };
            const updatedNotes = [...notes, newNote];
            setNoteText('');
            setCurrentTheme('');
            onNotesUpdate(index, updatedNotes);
        }
    };

    const handleArrivalTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newTime = e.target.value;
        setArrivalTimeState(newTime);
        onArrivalTimeChange(index, newTime);
    };

    const handleDepartureTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newTime = e.target.value;
        setDepartureTimeState(newTime);
        onDepartureTimeChange(index, newTime); 
    };

    const openGallery = (index: number) => {
        setCurrentImageIndex(index);
        setGalleryOpen(true);
    };

    const totalPrice = items.reduce((total, item) => total + item.price, 0);
    const displayImages = images; // Directly use the images prop (URLs)

        // Assume imageFiles contains URLs


        const types: LocationType[] = [
            'Accommodation', 
            'Food & Beverage', 
            'Cultural & Historical Sites', 
            'Nature & Parks', 
            'Entertainment & Attractions', 
            'Shopping & Markets', 
            'Adventure & Outdoor Activities', 
            'Health & Wellness', 
            'Transportation', 
            'Events & Festivals', 
            'Religious & Spiritual', 
            'Education & Research',
            'Business & Professional',
            'Sports & Recreation',
            'Agriculture & Farming'
        ];
        
        const subTypes: Record<LocationType, string[]> = {
            Accommodation: [
                'Hotel', 'Motel', 'Hostel', 'Bed & Breakfast', 
                'Resort', 'Villa', 'Cottage', 'Lodge', 'Capsule Hotel', 'Homestay'
            ],
            'Food & Beverage': [
                'Restaurant', 'Cafe', 'Bar', 'Pub', 'Bakery', 'Food Truck', 
                'Diner', 'Tea House', 'Wine Bar', 'Street Food Stall'
            ],
            'Cultural & Historical Sites': [
                'Museum', 'Art Gallery', 'Historical Monument', 'Archaeological Site', 
                'Palace', 'Castle', 'Fort', 'Heritage Site', 'Ancient Ruins'
            ],
            'Nature & Parks': [
                'National Park', 'Wildlife Sanctuary', 'Botanical Garden', 'Beach', 
                'Forest Reserve', 'Marine Reserve', 'Mountain Range', 'Desert', 
                'Lake', 'Waterfall'
            ],
            'Entertainment & Attractions': [
                'Amusement Park', 'Zoo', 'Aquarium', 'Theme Park', 'Water Park', 
                'Casino', 'Circus', 'Movie Theater', 'Planetarium', 'Music Venue'
            ],
            'Shopping & Markets': [
                'Mall', 'Local Market', 'Flea Market', 'Souvenir Shop', 'Farmers Market', 
                'Supermarket', 'Department Store', 'Outlet Mall', 'Night Market', 'Artisanal Market'
            ],
            'Adventure & Outdoor Activities': [
                'Hiking Trail', 'Ski Resort', 'Surfing Spot', 'Diving Site', 
                'Rock Climbing Area', 'Adventure Park', 'Hot Air Balloon Site', 
                'Skydiving Center', 'Zip Line Park', 'Safari Park'
            ],
            'Health & Wellness': [
                'Spa', 'Fitness Center', 'Yoga Retreat', 'Meditation Center', 
                'Thermal Baths', 'Wellness Retreat', 'Health Resort', 'Massage Parlor', 
                'Detox Center'
            ],
            Transportation: [
                'Train Station', 'Airport', 'Bus Terminal', 'Ferry Port', 
                'Subway Station', 'Tram Stop', 'Taxi Stand', 'Cable Car Station', 
                'Heliport'
            ],
            'Events & Festivals': [
                'Festival Ground', 'Exhibition Hall', 'Conference Center', 
                'Concert Hall', 'Sports Arena', 'Convention Center', 'Stadium', 
                'Fairground', 'Opera House', 'Open-Air Theater'
            ],
            'Religious & Spiritual': [
                'Church', 'Mosque', 'Synagogue', 'Temple', 'Monastery', 'Shrine', 
                'Gurdwara', 'Pagoda', 'Cathedral', 'Chapel'
            ],
            'Education & Research': [
                'University', 'Library', 'Research Institute', 'Observatory', 
                'Science Museum', 'Planetarium', 'School', 'Language Center', 
                'Technology Park', 'Innovation Hub'
            ],
            
            
            'Business & Professional': [
                'Office Building', 'Co-working Space', 'Conference Room', 
                'Corporate Headquarters', 'Startup Incubator', 'Trade Center', 
                'Industrial Park', 'Business District', 'Bank'
            ],
            'Sports & Recreation': [
                'Sports Complex', 'Golf Course', 'Tennis Court', 'Sports Arena', 
                'Skate Park', 'Ice Skating Rink', 'Bowling Alley', 'Gymnasium', 
                'Swimming Pool'
            ],
            'Agriculture & Farming': [
                'Vineyard', 'Farm', 'Orchard', 'Ranch', 'Plantation', 'Dairy Farm', 
                'Fishery', 'Poultry Farm', 'Livestock Farm'
            ]
        };
        return (
            <div key={index} className="relative mb-6 p-6 2xl:mx-10 border border-gray-200 rounded-xl shadow-lg bg-white transition-all hover:shadow-2xl hover:-translate-y-1 transform">
                {/* Image Section */}
                <div className=" mb-8">
                    {displayImages.length === 0 ? (
                        <div className="flex flex-col items-center">
                            <input
                                type="file"
                                multiple
                                onChange={handleImageImport}
                                className="hidden"
                                id={`file-input-${index}`}
                            />
                            <label
                                htmlFor={`file-input-${index}`}
                                className="flex items-center justify-center w-16 h-16 mb-2 border-4 border-transparent rounded-full shadow-lg cursor-pointer transition-all hover:shadow-xl hover:scale-105"
                                style={{
                                    backgroundImage: 'linear-gradient(white, white), linear-gradient(to right, #9b59b6, #8e44ad)',
                                    backgroundOrigin: 'border-box',
                                    backgroundClip: 'padding-box, border-box',
                                }}
                            >
                                <FaPlusCircle className="text-3xl text-purple-500" />
                            </label>
                            <span className="text-purple-500">Import Images</span>
                        </div>
                    ) : (
                        <div className="relative">
                            <div className="grid grid-cols-3  gap-x-14 lg:gap-x-8 2xl:gap-x-4 ">
                                {/* Main Image */}
                                <div className="relative col-span-2 w-[90%] h-64">
                                    {displayImages.length > 0 && (
                                        <img
                                            src={displayImages[0]}  // Main image
                                            alt="Main Uploaded Image"
                                            className="w-full h-full object-cover rounded-xl shadow-md cursor-pointer"
                                            onClick={() => openGallery(0)}  // Open gallery starting at the first image
                                        />
                                    )}
                                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-xl opacity-0 hover:opacity-100 transition-opacity duration-300">
                                        <button
                                            onClick={() => document.getElementById(`file-input-hover-${index}`)?.click()}
                                            className="flex items-center justify-center w-10 h-10 bg-white rounded-full shadow-lg text-blue-500 hover:bg-blue-100 transition-all mx-2"
                                        >
                                            <FaPlusCircle className="text-xl" />
                                        </button>
                                        <input
                                            type="file"
                                            multiple
                                            onChange={handleImageImport}
                                            className="hidden"
                                            id={`file-input-hover-${index}`}
                                        />
                                        <button
                                            onClick={() => openGallery(0)}  // Open gallery when the button is clicked
                                            className="flex items-center justify-center w-10 h-10 bg-white rounded-full shadow-lg text-green-500 hover:bg-green-100 transition-all mx-2"
                                        >
                                            <FaEye className="text-xl" />
                                        </button>
                                    </div>
                                </div>
        
                                {/* Small Images Section */}
                                <div className="flex flex-col gap-4 h-65 lg:h-60 -ml-16">
                                    {displayImages.length > 1 && (
                                        <div className="relative h-1/2">
                                            <img
                                                src={displayImages[1]}  // First small image
                                                alt="Small Uploaded Image 1"
                                                className="w-full h-full object-cover rounded-xl shadow-md cursor-pointer"
                                                onClick={() => openGallery(1)}  // Open gallery starting at the second image
                                            />
                                        </div>
                                    )}
                                    {displayImages.length > 2 && (
                                        <div className="relative h-1/2">
                                            <img
                                                src={displayImages[2]}  // Second small image (third in list)
                                                alt="Small Uploaded Image 2"
                                                className="w-full h-full object-cover rounded-xl shadow-md cursor-pointer"
                                                onClick={() => openGallery(2)}  // Open gallery starting at the third image
                                            />
                                            {displayImages.length > 3 && (
                                                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-xl text-white font-bold">
                                                    +{displayImages.length - 3}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
        
                {/* Name Input */}
                <div className="relative mb-4">
                    <input
                        type="text"
                        value={locationName}
                        onChange={handleNameChange}
                        placeholder="Enter Location Name"
                        className="w-full p-3 border border-gray-300 rounded-xl text-sm text-gray-700 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    />
                </div>
        
                {/* Type and Subtype Input in the Same Row */}
                <div className="flex gap-4 mb-4">
                    <div className="flex-1">
                        <select
                            value={locationType}
                            onChange={handleTypeChange}
                            className="w-full p-3 border border-gray-300 rounded-xl text-sm text-gray-700 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                        >
                            <option value="" disabled>Select Type</option>
                            {types.map((type, idx) => (
                                <option key={idx} value={type}>
                                    {type}
                                </option>
                            ))}
                        </select>
                    </div>
        
                    <div className="flex-1">
                        <select
                            value={subTypeState}
                            onChange={handleSubTypeChange}
                            disabled={!locationType}
                            className="w-full p-3 border border-gray-300 rounded-xl text-sm text-gray-700 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                        >
                            <option value="" disabled>Select Subtype</option>
                            {locationType && subTypes[locationType]?.map((subTypeOption, idx) => (
                                <option key={idx} value={subTypeOption}>
                                    {subTypeOption}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
        
                {/* Address and Suggestions */}
                <div className="relative mb-4 flex flex-col gap-4">
                    <div className="relative">
                        <FaMapMarkerAlt className="absolute top-1/2 transform -translate-y-1/2 left-3 text-gray-500" />
                        <input
                            type="text"
                            value={query}
                            onChange={handleQueryChange}
                            placeholder={`Search Location ${index + 1}`}
                            className="w-full pl-10 p-3 border border-gray-300 rounded-xl text-sm text-gray-700 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                        />
                    </div>
        
                    {suggestions?.length > 0 && (
                        <ul className="absolute top-full left-0 w-full mt-2 border border-gray-300 bg-white rounded-xl shadow-lg z-20">
                            {suggestions.map((suggestion) => (
                                <li
                                    key={suggestion.place_id}
                                    onClick={() => onSuggestionClick(index, suggestion)}
                                    className="p-3 cursor-pointer hover:bg-gray-100 text-sm text-gray-700 rounded-xl transition-colors"
                                >
                                    {suggestion.description}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
        
                {/* Arrival and Departure Time Section */}
                <div className="mb-4 flex gap-4">
                    <div className="relative w-1/2">
                        <FaClock className="absolute top-1/2 transform -translate-y-1/2 left-3 text-gray-500" />
                        <input
                            type="time"
                            value={arrivalTimeState}
                            onChange={handleArrivalTimeChange}
                            className="w-full pl-10 p-3 border border-gray-300 rounded-xl text-sm text-gray-700 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                        />
                    </div>
                    <div className="relative w-1/2">
                        <FaClock className="absolute top-1/2 transform -translate-y-1/2 left-3 text-gray-500" />
                        <input
                            type="time"
                            value={departureTimeState}
                            onChange={handleDepartureTimeChange}
                            className="w-full pl-10 p-3 border border-gray-300 rounded-xl text-sm text-gray-700 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                        />
                    </div>
                </div>
        
                {/* Items Section */}
                <div className="mb-4">
    <div className="flex flex-col sm:flex-row justify-between gap-4 sm:gap-x-1 mb-4">
        <div className="relative flex-1">
            <FaPlusCircle className="absolute top-1/2 transform -translate-y-1/2 left-3 text-gray-500" />
            <input
                type="text"
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
                placeholder="Item Name"
                className="w-full pl-8 sm:pl-10 p-3 sm:p-3 border border-gray-300 rounded-xl text-sm text-gray-700 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all  sm:text-base"
            />
        </div>
        <div className="relative w-full sm:w-32 mx-2">
            <FaPriceTag className="absolute top-1/2 transform -translate-y-1/2 left-3 text-gray-500" />
            <input
                type="number"
                value={itemPrice}
                onChange={(e) => setItemPrice(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="Price"
                className="w-full pl-10 p-3 border  border-gray-300 rounded-xl text-xs  text-gray-700 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all  sm:text-base"
            />
        </div>
        <button
            onClick={handleAddItem}
            className="flex items-center justify-center text-xs sm:text-sm bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-2 sm:py-2 sm:px-4 rounded-xl transition-all shadow-lg w-full sm:w-auto"
        >
            <FaPlusCircle className="mr-2" />
            Add Item
        </button>
    </div>

    <div className="mt-4">
        {items.map((item, idx) => (
            <div key={idx} className="flex justify-between p-2  text-sm border-b border-gray-200">
                <span className="text-gray-700">{item.name}</span>
                <span className="text-gray-700">${item.price.toFixed(2)}</span>
            </div>
        ))}
        <div className="flex justify-end mt-2  text-sm font-bold text-gray-900">
            Total Price: ${totalPrice.toFixed(2)}
        </div>
    </div>
</div>


        {/* Notes Section */}
        <div className="flex justify-between items-center mb-4 w-full">
    <div className="flex flex-wrap gap-4 w-full justify-around">
        <button
            onClick={() => handleNoteButtonClick('Watch Out')}
            className="flex items-center justify-center gap-2 bg-yellow-400 hover:bg-yellow-600 text-sm text-black font-bold py-2 rounded transition-all flex-1 min-w-[100px] sm:min-w-[120px]"
        >
            <FaExclamationTriangle />
            Watch Out
        </button>
        <button
            onClick={() => handleNoteButtonClick('To Avoid')}
            className="flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white text-sm font-bold py-2  rounded transition-all flex-1 min-w-[100px] sm:min-w-[120px]"
        >
            <FaTimesCircle />
            To Avoid
        </button>
        <button
            onClick={() => handleNoteButtonClick('Profit')}
            className="flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white text-sm font-bold  px-6 rounded transition-all flex-1 min-w-[100px] sm:min-w-[120px]"
        >
            <FaDollarSign />
            Profit
        </button>
        <button
            onClick={() => handleNoteButtonClick("Don't Forget")}
            className="flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-bold  px-6 rounded transition-all flex-1 "
        >
            <FaLightbulb />
            Don’t Forget
        </button>
    </div>
</div>


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
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
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
                    className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg mt-2 transition-all"
                >
                    Save Note
                </button>
            </div>
        )}

        {notes.length > 0 && (
            <div className="mt-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Saved Notes:</h3>
                <ul className="space-y-2">
                    {notes.map((note, idx) => (
                        <li
                            key={idx}
                            className={`p-3 rounded-xl text-white ${
                                note.theme === 'Watch Out'
                                    ? 'bg-yellow-500'
                                    : note.theme === 'To Avoid'
                                    ? 'bg-red-500'
                                    : note.theme === 'Profit'
                                    ? 'bg-green-500'
                                    : note.theme === "Don't Forget"
                                    ? 'bg-blue-500'
                                    : 'bg-gray-400'
                            }`}
                        >
                            {note.text}
                        </li>
                    ))}
                </ul>
            </div>
        )}

      
        {/* Image Gallery Popup */}
        <ImageGalleryPopup isOpen={isGalleryOpen} images={images} onClose={() => setGalleryOpen(false)} />
    </div>
);

        

   
};

export default LocationInput;


