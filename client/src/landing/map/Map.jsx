import React, { useState, useEffect, useMemo, useCallback } from "react";
import { LoadScript, GoogleMap, Marker, Circle  } from "@react-google-maps/api";
import "./map.scss";

import {fetchShopCoordinates} from"../../utils/shopHelpers.js";

// Default center coordinates
const defaultCenter = {
  lat: 1.335,
  lng: 103.776,
};

const darkModeMapStyles = [
  { elementType: "geometry", stylers: [{ color: "#1d2c4d" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#8ec3b9" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#1a3646" }] },
  { featureType: "administrative.country", elementType: "geometry.stroke", stylers: [{ color: "#4b6878" }] },
  { featureType: "administrative.land_parcel", elementType: "labels.text.fill", stylers: [{ color: "#64779e" }] },
  { featureType: "administrative.province", elementType: "geometry.stroke", stylers: [{ color: "#4b6878" }] },
  { featureType: "landscape.man_made", elementType: "geometry.stroke", stylers: [{ color: "#334e87" }] },
  { featureType: "landscape.natural", elementType: "geometry", stylers: [{ color: "#023e58" }] },
  { featureType: "poi", elementType: "geometry", stylers: [{ color: "#283d6a" }] },
  { featureType: "poi", elementType: "labels.text.fill", stylers: [{ color: "#6f9ba5" }] },
  { featureType: "poi", elementType: "labels.text.stroke", stylers: [{ color: "#1d2c4d" }] },
  { featureType: "poi.park", elementType: "geometry.fill", stylers: [{ color: "#023e58" }] },
  { featureType: "poi.park", elementType: "labels.text.fill", stylers: [{ color: "#3C7680" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#304a7d" }] },
  { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#98a5be" }] },
  { featureType: "road", elementType: "labels.text.stroke", stylers: [{ color: "#1d2c4d" }] },
  { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#2c6675" }] },
  { featureType: "road.highway", elementType: "geometry.stroke", stylers: [{ color: "#255763" }] },
  { featureType: "road.highway", elementType: "labels.text.fill", stylers: [{ color: "#b0d5ce" }] },
  { featureType: "road.highway", elementType: "labels.text.stroke", stylers: [{ color: "#023e58" }] },
  { featureType: "transit", elementType: "labels.text.fill", stylers: [{ color: "#98a5be" }] },
  { featureType: "transit", elementType: "labels.text.stroke", stylers: [{ color: "#1d2c4d" }] },
  { featureType: "transit.line", elementType: "geometry.fill", stylers: [{ color: "#283d6a" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#0e1626" }] },
  { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#4e6d70" }] }
];


function Map() {
  const [currentLocation, setCurrentLocation] = useState(defaultCenter);
  const [selectedCafe, setSelectedCafe] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [proximity, setProximity] = useState(1);
  const [shoplistings, setShoplistings] = useState([]);
  const [filteredCafes, setFilteredCafes] = useState([]);

  const isDarkMode = useMemo(
    () => JSON.parse(localStorage.getItem("darkMode")) || false,
    []
  );

  // Memoized map options to avoid unnecessary re-renders
  const mapOptions = useMemo(
    () => ({
      styles: isDarkMode ? darkModeMapStyles : null,
      disableDefaultUI: true,
      zoomControl: true,
    }),
    [isDarkMode]
  );

  // Fetch all shop listings on component mount
  useEffect(() => {
    const fetchData = async () => {
      const response = await fetchShopCoordinates();
      setShoplistings(response);
      setFilteredCafes(response);
    };
    fetchData();
  }, []);

  // Get user’s current location when the component mounts
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setCurrentLocation({ lat: latitude, lng: longitude });
        },
        (error) => {
          console.error("Error getting location:", error);
        }
      );
    }
  }, []);

  // Memoized distance calculation
  const calculateDistance = useCallback((loc1, loc2) => {
    const R = 6371; // Radius of the Earth in km
    const dLat = ((loc2.lat - loc1.lat) * Math.PI) / 180;
    const dLng = ((loc2.lng - loc1.lng) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos((loc1.lat * Math.PI) / 180) *
        Math.cos((loc2.lat * Math.PI) / 180) *
        Math.sin(dLng / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }, []);

  // Filter cafes based on search and proximity
  useEffect(() => {
    const filtered = shoplistings.filter((cafe) => {
      const matchesSearch = cafe.name
        .toLowerCase()
        .includes(searchText.toLowerCase());

      const distance = calculateDistance(currentLocation, {
        lat: cafe.lat,
        lng: cafe.lng,
      });

      return matchesSearch && distance <= proximity;
    });
    setFilteredCafes(filtered);
  }, [searchText, proximity, currentLocation, shoplistings, calculateDistance]);

  const handleCafeClick = (cafe) => {
    setSelectedCafe(cafe);
  };

  return (
    <div className="map-container">
      <h2>Coffee Trail: Explore Cafes Around You</h2>

      <div className="map-search-container">
        <input
          type="text"
          placeholder="Search for cafes"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          className="map-search-input"
        />
      </div>

      <div className="proximity-slider-container">
        <label>Proximity: </label>
        <input
          type="range"
          min="0"
          max="50"
          step="1"
          value={proximity}
          onChange={(e) => setProximity(Number(e.target.value))}
          className="proximity-slider"
        />
        <input
          type="number"
          min="0"
          max="50"
          value={proximity}
          onChange={(e) => setProximity(Math.max(0, Math.min(50, Number(e.target.value))))}
          className="proximity-input"
        />
        <label> km</label>
      </div>

      <LoadScript googleMapsApiKey="AIzaSyADPNpHr57R9nj5kHaSiUnuOZGFb0x4ki8">
        <GoogleMap
          mapContainerClassName="map"
          center={currentLocation}
          zoom={15}
          options={mapOptions}
        >
          <Marker
            position={currentLocation}
            title="You are here"
            icon={{ url: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png" }}
          />
          <Circle
            center={currentLocation}
            radius={proximity * 1000}
            options={{
              fillColor: "#FF0000",
              fillOpacity: 0.2,
              strokeColor: "#FF0000",
              strokeOpacity: 0.5,
              strokeWeight: 2,
            }}
          />
          {filteredCafes.map((cafe) => (
            <Marker
              key={cafe.id}
              position={{ lat: cafe.lat, lng: cafe.lng }}
              title={cafe.name}
              onClick={() => handleCafeClick(cafe)}
            />
          ))}
        </GoogleMap>
      </LoadScript>

      {selectedCafe && (
        <div className="cafe-info">
          <h3>{selectedCafe.name}</h3>
          <p>{selectedCafe.location}</p>
        </div>
      )}
    </div>
  );
}

export default Map;