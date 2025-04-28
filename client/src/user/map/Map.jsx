import React, { useState, useEffect, useMemo, useCallback } from "react";
import { LoadScript, GoogleMap, Marker, Circle } from "@react-google-maps/api";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { makeRequest } from "../../axios";
import {
  Drawer,
  List,
  ListItem,
  ListItemText,
  Divider,
  TextField,
  IconButton,
  Typography,
  Card,
  CardContent,
  CardMedia,
  Box,
  Grid,
  Slide,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ShopListing from "../shoplisting/ShopListing";
import CloseIcon from "@mui/icons-material/Close";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import "./map.scss";
import {fetchShopCoordinates, fetchTopRatedShops, fetchFeaturedShops} from"../../utils/shopHelpers.js";

const defaultCenter = {
  lat: 1.335,
  lng: 103.776,
};


function Map() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  
  const [currentLocation, setCurrentLocation] = useState(defaultCenter);
  const [selectedCafe, setSelectedCafe] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [proximity, setProximity] = useState(1);
  const [shoplistings, setShoplistings] = useState([]);
  const [filteredCafes, setFilteredCafes] = useState([]);
  const [drawerOpen, setDrawerOpen] = useState(true);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [favoriteShops, setFavoriteShops] = useState(new Set());
  const [refetchShops, setRefetchShops] = useState(false);
  const queryClient = useQueryClient();
  const [filterType, setFilterType] = useState("all");


  const mapOptions = useMemo(
    () => ({
      disableDefaultUI: true,
      zoomControl: true,
    }),
  );

  // Fetch favorite shops
  useEffect(() => {
    makeRequest.get("/shoplistings/FavoriteShops").then((res) => {
      setFavoriteShops(new Set(res.data));
    });
  }, [refetchShops]);

  const toggleFavorite = (shopId) => {
    const isFavorite = favoriteShops.has(shopId);
    const mutation = isFavorite ? removeFavorite : addFavorite;
    mutation.mutate(shopId);
  };

  const addFavorite = useMutation({
    mutationFn: (shopId) =>
      makeRequest.post("/shoplistings/addFavoriteShop", { shop_id: shopId }),
    onSuccess: () => {
      queryClient.invalidateQueries(["favoriteShops"]);
      setRefetchShops((prevRefetchShop) => !prevRefetchShop);
    },
  });

  const removeFavorite = useMutation({
    mutationFn: (shopId) =>
      makeRequest.delete("/shoplistings/removeFavoriteShop", {
        data: { shop_id: shopId },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries(["favoriteShops"]);
      setRefetchShops((prevRefetchShop) => !prevRefetchShop);
    },
  });

  // Fetch all shop listings on component mount
  useEffect(() => {
    const fetchData = async () => {
      let response;
        if (filterType === "topRated") {
            response = await fetchTopRatedShops();
        } else if (filterType === "featured") {
            response = await fetchFeaturedShops();
        } else {
            response = await fetchShopCoordinates();
        }
      setShoplistings(response);
      setFilteredCafes(response);
    };
    fetchData();
  }, [filterType]);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setCurrentLocation({ lat: latitude, lng: longitude });
        },
        (error) => {
          console.error("Error getting location:", error);
          setCurrentLocation(defaultCenter);
        }
      );
    }
  }, []);

  const calculateDistance = useCallback((loc1, loc2) => {
    const R = 6371;
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

  useEffect(() => {
    const filtered = shoplistings.filter((cafe) => {
      const matchesSearch = cafe.name
        .toLowerCase()
        .includes(searchText.toLowerCase());

      const distance = calculateDistance(currentLocation, {
        lat: parseFloat(cafe.lat),
        lng: parseFloat(cafe.lng),
      });

      console.log(`Cafe: ${cafe.name}, Distance: ${distance} km, Proximity: ${proximity} km`);
      console.log(filteredCafes);
      return matchesSearch && distance <= proximity;
    });
    setFilteredCafes(filtered);
  }, [searchText, proximity, currentLocation, shoplistings, calculateDistance]);

  const handleSearch = () => {
    const filtered = shoplistings.filter((cafe) =>
      cafe.name.toLowerCase().includes(searchText.toLowerCase()) ||
      cafe.description.toLowerCase().includes(searchText.toLowerCase()) ||
      cafe.location.toLowerCase().includes(searchText.toLowerCase())
    );

    setFilteredCafes(filtered);
    setDrawerOpen(true); // Open the drawer on search
    console.log(filtered.length)
    console.log(searchText);

    if (searchText === "") {
      setSelectedCafe(null);
      setFilteredCafes([]);
    }
    console.log(selectedCafe);
  };

  const handleCafeClick = (cafe) => {
    setSelectedCafe(cafe);
    setDetailsOpen(true);
    if (isMobile) setDrawerOpen(false);
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      handleSearch();
    }
  };

  const toggleDrawer = () => {
    setDrawerOpen((prev) => !prev);
  };
  
  const closeCafeDetails = () => setSelectedCafe(null);

  const renderMarkers = (map) => {
    if (!window.google?.maps?.marker?.AdvancedMarkerElement) {
      console.error(
        "AdvancedMarkerElement is not available. Make sure the Google Maps API is loaded correctly."
      );
      return;
    }

    if (currentLocation) {
      new window.google.maps.marker.AdvancedMarkerElement({
        map,
        position: currentLocation,
        title: "You are here",
        content: `<div class="marker-icon"><img src="http://maps.google.com/mapfiles/ms/icons/blue-dot.png" alt="Current Location" /></div>`,
      });
    }

    filteredCafes.forEach((cafe) => {
      new window.google.maps.marker.AdvancedMarkerElement({
        map,
        position: { lat: cafe.lat, lng: cafe.lng },
        title: cafe.name,
        content: `<div class="marker-icon">${cafe.name}</div>`,
      });
    });
  };
  
  return (
    <div className={`map-page ${drawerOpen ? "drawer-open" : ""}`}>
      <Drawer
          variant="persistent"
          anchor="left"
          open={drawerOpen}
          PaperProps={{
            sx: {
              width: isMobile ? "100%" : 240,
              top: "70px", // Adjust this according to your navbar height
              height: `calc(100% - 64px)`, // Ensure it doesn’t overflow below the navbar
              boxShadow: 'none',
              zIndex: 900,
            },
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", padding: "10px" }}>
            {/* <Typography variant="button"></Typography> */}
            <IconButton onClick={toggleDrawer}>
              <ChevronLeftIcon />
            </IconButton>
          </Box>
          <Divider />
          <List>
          {filteredCafes.length === 0 ? (
            <Typography variant="body1" sx={{ margin: 2 }}>
              The cafe searched is not exists.
            </Typography>
          ) : (
            filteredCafes.map((cafe) => (
              <div key={cafe.shop_id}>
                <ListItem button onClick={() => handleCafeClick(cafe)}>
                  <LocationOnIcon sx={{ marginRight: 1 }} />
                  <ListItemText primary={cafe.name} secondary={cafe.location} />
                </ListItem>
                <Divider />
              </div>
            ))
          )}
        </List>
        </Drawer>
      <div className="map-container">
        <h2>Coffee Trail: Explore Cafes Around You</h2>
      
        <TextField
            variant="outlined"
            placeholder="Search for cafes"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            onKeyDown={handleKeyDown}
            InputProps={{
              endAdornment: (
                <IconButton onClick={handleSearch} size="small">
                  <SearchIcon fontSize="small" />
                </IconButton>
              ),
            }}
            size="small"  // Makes the input smaller
            margin="dense" // Reduces vertical padding
            sx={{
              width: '400px', // Adjust width as needed
              borderRadius: '8px',
            }}
          />
          <br/>
          
          <div className="proximity-slider-container">
          <div className="select-filter">
            <select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
                <option value="all">All Shops</option>
                <option value="topRated">Top Rated</option>
                <option value="featured">Featured</option>
            </select>
          </div>
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

        {/* Render the "Open Drawer" button when the drawer is closed */}
        {!drawerOpen && (
          <Box
            sx={{
              position: "fixed",
              top: "75px", // Same height as navbar
              left: 0,
              padding: "10px",
              zIndex: 900,
            }}
          >
            {/* <Typography variant="button">Cafes</Typography> */}
            <IconButton onClick={toggleDrawer}>
              <ChevronRightIcon />
            </IconButton>
          </Box>
        )}

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
        </div>
      
        {selectedCafe && !isMobile && (
        <Grid item xs={12} md={4} style={{ backgroundColor: "#f6f3f3" }}>
          <IconButton onClick={closeCafeDetails}>
                  <CloseIcon />
                </IconButton>
          <Slide direction="up" in={detailsOpen} mountOnEnter unmountOnExit>
            <Grid item xs={12} sm={6} md={4} lg={2.4} key={selectedCafe.shop_id}>
              <ShopListing
                shoplisting={selectedCafe}
                isFavorite={favoriteShops.has(selectedCafe.shop_id)}
                toggleFavorite={toggleFavorite}
              />
            </Grid>
          </Slide>
        </Grid>
        )}

      {selectedCafe && isMobile && (
        <Drawer
          anchor={"bottom"}
          open={detailsOpen}
          onClose={closeCafeDetails}
          PaperProps={{
            sx: { height: "93%", width: "100%"},
          }}
        >
          {/* <Box className="cafe-details" sx={{ p: 2 }}> */}
            <Card>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <IconButton onClick={closeCafeDetails}>
                  <CloseIcon />
                </IconButton>
              </Box>
              <Grid item xs={12} sm={6} md={4} lg={2.4} key={selectedCafe.shop_id}>
              <ShopListing
                shoplisting={selectedCafe}
                isFavorite={favoriteShops.has(selectedCafe.shop_id)}
                toggleFavorite={toggleFavorite}
              />
            </Grid>
            </Card>
          {/* </Box> */}
        </Drawer>
      )}
  </div>
  
  );
}

export default Map;
