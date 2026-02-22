"use client";

import { useState, useEffect, useRef } from "react";
import { X, MapPin, AlertCircle } from "lucide-react";

interface MapPickerProps {
  onLocationSelect: (location: { lat: number; lng: number; distance: number; placeName?: string }) => void;
  isOpen: boolean;
  onClose: () => void;
}

// Base coordinates (Palm Riders location)
const BASE_LAT = 9.785420336695513;
const BASE_LNG = 126.15741075767107;

// Search area center and radius
const SEARCH_CENTER_LAT = 9.871362025665805;
const SEARCH_CENTER_LNG = 126.06512981286865;
const SEARCH_RADIUS_KM = 25;

// Get API key from environment variable
const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";

// Calculate distance using Google Maps Distance Matrix API (road distance)
const calculateRoadDistance = async (
  originLat: number,
  originLng: number,
  destLat: number,
  destLng: number
): Promise<number> => {
  return new Promise((resolve, reject) => {
    if (!window.google?.maps?.DistanceMatrixService) {
      reject(new Error("Distance Matrix Service not available"));
      return;
    }

    const service = new window.google.maps.DistanceMatrixService();
    const origin = new window.google.maps.LatLng(originLat, originLng);
    const destination = new window.google.maps.LatLng(destLat, destLng);

    service.getDistanceMatrix(
      {
        origins: [origin],
        destinations: [destination],
        travelMode: window.google.maps.TravelMode.DRIVING,
        unitSystem: window.google.maps.UnitSystem.METRIC,
      },
      (response, status) => {
        if (status === "OK" && response?.rows[0]?.elements[0]?.status === "OK") {
          const distanceInMeters = response.rows[0].elements[0].distance.value;
          const distanceInKm = Math.round((distanceInMeters / 1000) * 10) / 10;
          resolve(distanceInKm);
        } else {
          console.error("Distance Matrix request failed:", status);
          reject(new Error("Could not calculate road distance"));
        }
      }
    );
  });
};

// Global flag to track if Google Maps script is loaded
let googleMapsLoaded = false;
let googleMapsLoading = false;

export function MapPicker({ onLocationSelect, isOpen, onClose }: MapPickerProps) {
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [distance, setDistance] = useState<number>(0);
  const [placeName, setPlaceName] = useState<string>("");
  const [mapError, setMapError] = useState<string>("");
  const [mapReady, setMapReady] = useState(false);
  const [calculating, setCalculating] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    console.log("🗺️ Modal opened!");

    // Reset states when modal opens
    setMapError("");
    setMapReady(false);
    setSelectedLocation(null);
    setDistance(0);
    setPlaceName("");

    if (!GOOGLE_MAPS_API_KEY) {
      setMapError("Google Maps API key is missing. Please add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to your environment.");
      return;
    }

    console.log("🔑 API Key found:", GOOGLE_MAPS_API_KEY.substring(0, 10) + "...");

    // Function to initialize the map
    const initializeMap = () => {
      if (!mapRef.current) {
        console.error("❌ Map container not found");
        return;
      }

      if (!window.google) {
        console.error("❌ Google Maps not loaded");
        return;
      }

      console.log("✅ Initializing map...");

      try {
        const map = new window.google.maps.Map(mapRef.current, {
          center: { lat: BASE_LAT, lng: BASE_LNG },
          zoom: 12,
          clickableIcons: false, // Disable POI clicks so users can click anywhere
        });

        // Base marker
        new window.google.maps.Marker({
          position: { lat: BASE_LAT, lng: BASE_LNG },
          map: map,
          title: "Palm Riders Location",
          icon: { url: "https://maps.google.com/mapfiles/ms/icons/blue-dot.png" },
        });

        let selectedMarker: google.maps.Marker | null = null;

        // Click listener
        map.addListener("click", async (e: google.maps.MapMouseEvent) => {
          if (!e.latLng || calculating) return;

          const lat = e.latLng.lat();
          const lng = e.latLng.lng();

          if (selectedMarker) selectedMarker.setMap(null);

          selectedMarker = new window.google.maps.Marker({
            position: { lat, lng },
            map: map,
            title: "Your Selected Location",
          });

          // Clear any previous errors and show loading state
          setMapError("");
          setDistance(0);
          setPlaceName(""); // Clear place name for manual clicks
          setSelectedLocation({ lat, lng });
          setCalculating(true);

          // Calculate road distance using Distance Matrix API
          try {
            const dist = await calculateRoadDistance(BASE_LAT, BASE_LNG, lat, lng);
            setDistance(dist);
            console.log(`✅ Road distance calculated: ${dist}km`);
          } catch (error) {
            console.error("❌ Failed to calculate road distance:", error);
            setMapError("Could not calculate road distance. Please try another location.");
            if (selectedMarker) selectedMarker.setMap(null);
            setSelectedLocation(null);
          } finally {
            setCalculating(false);
          }
        });

        mapInstanceRef.current = map;
        setMapReady(true);
        setMapError("");
        console.log("✅ Map ready!");

        // Initialize Google Places Autocomplete
        if (searchInputRef.current && window.google.maps.places) {
          console.log("🔍 Initializing autocomplete...");

          try {
            // Create a circle to define the search bounds (25km radius)
            const searchCenter = new window.google.maps.LatLng(SEARCH_CENTER_LAT, SEARCH_CENTER_LNG);
            const searchCircle = new window.google.maps.Circle({
              center: searchCenter,
              radius: SEARCH_RADIUS_KM * 1000, // Convert km to meters
            });
            const searchBounds = searchCircle.getBounds();

            const autocomplete = new window.google.maps.places.Autocomplete(searchInputRef.current, {
              bounds: searchBounds!,
              strictBounds: true, // Enforce the bounds strictly
              componentRestrictions: { country: "ph" }, // Restrict to Philippines
              fields: ["geometry", "name", "formatted_address"],
            });

            autocomplete.addListener("place_changed", async () => {
              if (calculating) return;

              const place = autocomplete.getPlace();
              console.log("📍 Place selected:", place);

              if (place.geometry?.location) {
                const lat = place.geometry.location.lat();
                const lng = place.geometry.location.lng();

                // Save the place name - prioritize name, then add formatted_address if available
                let locationName = "";
                if (place.name && place.formatted_address) {
                  // Both available - combine them
                  locationName = `${place.name} - ${place.formatted_address}`;
                } else if (place.name) {
                  // Only name available
                  locationName = place.name;
                } else if (place.formatted_address) {
                  // Only address available
                  locationName = place.formatted_address;
                }
                setPlaceName(locationName);
                console.log("📍 Place name saved:", locationName);

                // Move map to this location
                map.setCenter({ lat, lng });
                map.setZoom(15);

                // Remove previous marker
                if (selectedMarker) {
                  selectedMarker.setMap(null);
                }

                // Add new marker
                selectedMarker = new window.google.maps.Marker({
                  position: { lat, lng },
                  map: map,
                  title: place.name || "Selected Location",
                });

                // Clear any previous errors and show loading state
                setMapError("");
                setDistance(0);
                setSelectedLocation({ lat, lng });
                setCalculating(true);

                // Calculate road distance using Distance Matrix API
                try {
                  const dist = await calculateRoadDistance(BASE_LAT, BASE_LNG, lat, lng);
                  setDistance(dist);
                  console.log(`✅ Location set: ${lat}, ${lng} - Road Distance: ${dist}km`);
                } catch (error) {
                  console.error("❌ Failed to calculate road distance:", error);
                  setMapError("Could not calculate road distance. Please try another location.");
                  if (selectedMarker) selectedMarker.setMap(null);
                  setSelectedLocation(null);
                } finally {
                  setCalculating(false);
                }
              } else {
                console.warn("⚠️ No geometry found for selected place");
              }
            });

            autocompleteRef.current = autocomplete;
            console.log("✅ Autocomplete initialized successfully!");
          } catch (error) {
            console.error("❌ Autocomplete init error:", error);
          }
        } else {
          console.error("❌ Cannot initialize autocomplete - missing requirements");
        }
      } catch (error) {
        console.error("❌ Map init error:", error);
        setMapError("Failed to initialize map");
      }
    };

    // Set up auth failure handler
    window.gm_authFailure = () => {
      console.error("❌ Google Maps authentication failed!");
      setMapError("Google Maps API key error. Please check your API key settings.");
      googleMapsLoading = false;
    };

    // Load Google Maps script if not already loaded
    if (window.google?.maps) {
      console.log("✅ Google Maps already loaded");
      googleMapsLoaded = true;
      setTimeout(initializeMap, 100);
    } else if (!googleMapsLoading) {
      console.log("📥 Loading Google Maps script...");
      googleMapsLoading = true;

      // Remove any existing Google Maps scripts to force fresh load
      const existingScripts = document.querySelectorAll('script[src*="maps.googleapis.com"]');
      existingScripts.forEach(script => script.remove());

      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places&callback=Function.prototype`;
      script.async = true;
      script.defer = true;

      script.onload = () => {
        console.log("✅ Script loaded!");
        googleMapsLoaded = true;
        googleMapsLoading = false;
        setTimeout(initializeMap, 100);
      };

      script.onerror = () => {
        console.error("❌ Script failed to load");
        googleMapsLoading = false;
        setMapError("Failed to load Google Maps. Please check your internet connection.");
      };

      document.head.appendChild(script);
    } else {
      // Script is loading, wait for it
      const checkLoaded = setInterval(() => {
        if (googleMapsLoaded && window.google?.maps) {
          clearInterval(checkLoaded);
          initializeMap();
        }
      }, 100);

      return () => clearInterval(checkLoaded);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const handleConfirm = () => {
    if (selectedLocation) {
      onLocationSelect({
        lat: selectedLocation.lat,
        lng: selectedLocation.lng,
        distance: distance,
        placeName: placeName || undefined, // Pass place name if available
      });
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-4 border-b">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-xl font-bold text-black">Select Delivery Location</h3>
              <p className="text-sm text-slate-600">Search or click on the map</p>
            </div>
            <button
              onClick={onClose}
              aria-label="Close map picker"
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <X className="w-6 h-6 text-black" />
            </button>
          </div>

          {/* Search Input */}
          <div className="relative">
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search for a place, hotel, resort, or address..."
              className="w-full px-4 py-3 pr-10 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-slate-800"
              autoComplete="off"
            />
            <MapPin className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          </div>
        </div>

        {/* Map */}
        <div className="flex-1 relative min-h-[400px]">
          {mapError ? (
            <div className="w-full h-full flex items-center justify-center p-8">
              <div className="text-center">
                <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                <h4 className="text-lg font-bold mb-2">Map Failed to Load</h4>
                <p className="text-slate-600">{mapError}</p>
              </div>
            </div>
          ) : !mapReady ? (
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-slate-600">Loading map...</p>
              </div>
            </div>
          ) : null}
          <div
            ref={mapRef}
            className="w-full h-full absolute inset-0"
          />
        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-slate-50">
          {selectedLocation && !mapError ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-slate-700">
                  <MapPin className="w-5 h-5 text-teal-500" />
                  {calculating || distance === 0 ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
                      <span className="font-semibold text-teal-500">Calculating road distance...</span>
                    </div>
                  ) : (
                    <span className="font-semibold">Distance: {distance} km (via roads)</span>
                  )}
                </div>
                {distance > 0 && !calculating && (
                  <div className="text-sm text-slate-600">
                    Delivery cost: ₱{Math.round(distance * 12.5 * 2)} (round trip)
                  </div>
                )}
              </div>
              {distance > 0 && !calculating && (
                <button
                  onClick={handleConfirm}
                  className="bg-teal-500 hover:bg-teal-600 text-white font-bold py-2 px-6 rounded-lg transition-colors"
                >
                  Confirm Location
                </button>
              )}
            </div>
          ) : !mapError ? (
            <div className="text-center text-slate-500">
              Click on the map or search for your delivery location
            </div>
          ) : (
            <div className="text-center space-y-3">
              <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-200">
                {mapError}
              </div>
              <button
                onClick={onClose}
                className="bg-slate-500 hover:bg-slate-600 text-white font-bold py-2 px-6 rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

declare global {
  interface Window {
    google?: {
      maps: typeof google.maps;
    };
    gm_authFailure?: () => void;
  }
}

/// <reference types="@types/google.maps" />
