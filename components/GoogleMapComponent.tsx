"use client";

import React, { useEffect, useRef, useState } from "react";

interface GoogleMapComponentProps {
  selectedLocations: any[];
}

const GoogleMapComponent: React.FC<GoogleMapComponentProps> = ({
  selectedLocations,
}) => {
  const googleMapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<google.maps.Map | null>(null);
  const directionsService = useRef<google.maps.DirectionsService | null>(null);
  const directionsRenderer = useRef<google.maps.DirectionsRenderer | null>(null);
  const [isMapInitialized, setIsMapInitialized] = useState(false);
  const markers = useRef<google.maps.Marker[]>([]); // Store markers

  useEffect(() => {
    const scriptId = "google-maps-api-script";

    const loadGoogleMapScript = () => {
      if (!document.getElementById(scriptId)) {
        const script = document.createElement("script");
        script.id = scriptId;
        script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`;
        script.async = true;
        script.defer = true;
        script.onload = () => {
          console.log("Google Maps script loaded");
          initMap();
        };
        script.onerror = () => {
          console.error("Google Maps script failed to load.");
        };
        document.head.appendChild(script);
      } else if (window.google && window.google.maps && !mapInstance.current) {
        initMap();
      }
    };

    loadGoogleMapScript();
  }, []);

  const initMap = () => {
    if (googleMapRef.current && !mapInstance.current) {
      const mapOptions = {
        zoom: 8,
        center: { lat: 37.7749, lng: -122.4194 }, // Default center
        mapTypeId: "roadmap",
        
      };
      mapInstance.current = new window.google.maps.Map(googleMapRef.current, mapOptions);
      directionsService.current = new google.maps.DirectionsService();
      directionsRenderer.current = new google.maps.DirectionsRenderer({
        suppressMarkers: true, // We manage markers manually
        preserveViewport: true,
      });
      directionsRenderer.current.setMap(mapInstance.current);
      setIsMapInitialized(true);
      console.log("Map initialized");
    } else {
      console.error("Map initialization failed. Check if the div reference or Google Maps API is loaded correctly.");
    }
  };

  const clearMarkers = () => {
    markers.current.forEach((marker) => marker.setMap(null));
    markers.current = [];
  };

  const createCustomIcon = (index: number) => {
    const svgMarker = {
      path: google.maps.SymbolPath.CIRCLE, // Use a simple circle or create your own SVG path
      fillColor: "#ff0000", // Marker background color
      fillOpacity: 1,
      strokeWeight: 0,
      scale: 7, // Size of the marker
      labelOrigin: new google.maps.Point(0, 0), // Position of the label
    };

    return {
      url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(
        `<svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 40 40">
          <circle cx="20" cy="20" r="18" fill="#FF0000" />
          <text x="50%" y="50%" text-anchor="middle" dy=".3em" font-size="15" font-family="Arial" font-weight="600" fill="white">${index + 1}</text>
         </svg>`
      )}`,
      scaledSize: new google.maps.Size(40, 40), // Size of the custom icon
      labelOrigin: new google.maps.Point(20, 20), // Position for label (center of the marker)
    };
  };

  const addNumberedMarker = (
    position: google.maps.LatLng,
    description: string,
    index: number
  ) => {
    if (mapInstance.current) {
      const marker = new google.maps.Marker({
        position,
        map: mapInstance.current,
        title: description,
        icon: createCustomIcon(index),
      });
      markers.current.push(marker);
    }
  };

  useEffect(() => {
    if (isMapInitialized && mapInstance.current) {
      clearMarkers(); // Clear previous markers

      const validLocations = selectedLocations.filter(
        (location) =>
          location.geometry?.coordinates?.lat && location.geometry.coordinates.lng
      );

      // Add numbered markers for each valid location
      validLocations.forEach((location, index) => {
        const position = new google.maps.LatLng(
          location.geometry.coordinates.lat,
          location.geometry.coordinates.lng
        );
        addNumberedMarker(position, location.description, index); // Use addNumberedMarker with index
      });

      if (validLocations.length >= 2) {
        const bounds = new google.maps.LatLngBounds();

        validLocations.forEach((location) => {
          const position = new google.maps.LatLng(
            location.geometry.coordinates.lat,
            location.geometry.coordinates.lng
          );
          bounds.extend(position);
        });

        if (!bounds.isEmpty()) {
          mapInstance.current.fitBounds(bounds);
        }

        const waypoints = validLocations.slice(1, -1).map((location) => ({
          location: new google.maps.LatLng(
            location.geometry.coordinates.lat,
            location.geometry.coordinates.lng
          ),
          stopover: true,
        }));

        const origin = new google.maps.LatLng(
          validLocations[0].geometry.coordinates.lat,
          validLocations[0].geometry.coordinates.lng
        );
        const destination = new google.maps.LatLng(
          validLocations[validLocations.length - 1].geometry.coordinates.lat,
          validLocations[validLocations.length - 1].geometry.coordinates.lng
        );

        const request = {
          origin: origin,
          destination: destination,
          waypoints: waypoints,
          travelMode: google.maps.TravelMode.DRIVING,
        };

        directionsService.current!.route(request, (result, status) => {
          if (status === google.maps.DirectionsStatus.OK) {
            directionsRenderer.current!.setDirections(result);
            console.log("Directions rendered successfully.");
          } else {
            console.error("Failed to render directions:", status);
          }
        });
      } else if (validLocations.length === 1) {
        // If only one location is valid, center the map on it
        const singleLocation = validLocations[0];
        const singlePosition = new google.maps.LatLng(
          singleLocation.geometry.coordinates.lat,
          singleLocation.geometry.coordinates.lng
        );
        mapInstance.current.setCenter(singlePosition);
        mapInstance.current.setZoom(12); // Set a reasonable zoom level for a single marker
      }
    }
  }, [selectedLocations, isMapInitialized]);

  return <div
  ref={googleMapRef}
  className="w-full h-[53vh] mb-20 lg:mb-0 lg:h-[91vh] 2xl:h-[94vh] "
/>;
};

export default GoogleMapComponent;
