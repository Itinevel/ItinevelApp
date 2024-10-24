export interface ItineraryData {
  title?: string;
  itineraryId: number;
  description: string;
  locations: TripLocation[]; // Directly including locations
  allTransports: TransportInterface[]; // Directly including all transports
  totalPrice?: number;
  totalCost?: number;
}



export type LocationType =
  | 'Accommodation'
  | 'Food & Beverage'
  | 'Cultural & Historical Sites'
  | 'Nature & Parks'
  | 'Entertainment & Attractions'
  | 'Shopping & Markets'
  | 'Adventure & Outdoor Activities'
  | 'Health & Wellness'
  | 'Transportation'
  | 'Events & Festivals'
  | 'Religious & Spiritual'
  | 'Education & Research'
  | 'Business & Professional'
  | 'Sports & Recreation'
  | 'Agriculture & Farming';

  export interface TripLocation {
    name: string; // Moved to the root
    type: LocationType | '';// Moved to the root
    subtype?: string; // Moved to the root
    images?: string[]; // Moved to the root
    details: {
      value: string;
      arrivalTime?: string;
      departureTime?: string;
      coordinates?: {
        lat: number;
        lng: number;
      };
      items: Item[];
    };
    notes?: Note[];
  }
  

export interface TransportInterface {
  details: TransportDetail[];
  notes?: Note[];
}

export interface TransportDetail {
  typeTo: string;       // Type of transport to the destination (e.g., Walking, Driving)
  nameTo: string;       // Name of the transport to the destination (e.g., Uber, Train)
  priceTo: number;      // Price for this transport to the destination
  typeFrom: string;     // Type of transport from the destination (e.g., Walking, Driving)
  nameFrom: string;     // Name of the transport from the destination (e.g., Uber, Train)
  priceFrom: number;    // Price for this transport from the destination
  destination: string;  // The common destination for both transport types
}

export interface Note {
  text: string;
  theme: string;
}

export interface Item {
  name: string;
  price: number;
}

export interface Plan {
  id?: string;
  name: string;
  description: string;
  totalDays: number;
  itineraries: { [key: number]: ItineraryData };
  imageUrls?: string[];       // New: Array of image URLs for the plan
  selectedCountries?: string[]; // New: Array of selected countries
  totalPrice?: number;
  cost?: number; 
  sell: boolean;
}

// Define GoogleMapComponentProps to handle selected locations on map
export interface GoogleMapComponentProps {
  selectedLocations: Array<{
    geometry: {
      coordinates: {
        lat: number;
        lng: number;
      };
    };
    description: string;
  }>;
}
export interface InitialPlan {
  plan: Plan;
  itineraries: ItineraryData[];
}
