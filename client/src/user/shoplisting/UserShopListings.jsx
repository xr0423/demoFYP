import React, { useState, useEffect } from "react";
import { Grid, Snackbar, Alert, CircularProgress, Box, Typography, Button } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import ShopListing from "./ShopListing";
import { makeRequest } from "../../axios"; // Import makeRequest
import "./UserShopListings.scss";
import ShopCarousel from "./shopCarousel.jsx";

const UserShopListings = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [favoriteShops, setFavoriteShops] = useState(new Set());
  const [showFavorites, setShowFavorites] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const queryClient = useQueryClient();

  const { isLoading, error, data } = useQuery({
    queryKey: ["shoplistings"],
    queryFn: () => makeRequest.get("/shoplistings/find/highlights").then((res) => res.data),
  });

  useEffect(() => {
    makeRequest.get("/shoplistings/FavoriteShops").then((res) => {
      setFavoriteShops(new Set(res.data));
    });
  }, []);

  const toggleFavorite = (shopId) => {
    const isFavorite = favoriteShops.has(shopId);
    const mutation = isFavorite ? removeFavorite : addFavorite;
    mutation.mutate(shopId);
  };

  const addFavorite = useMutation({
    mutationFn: (shopId) => makeRequest.post("/shoplistings/addFavoriteShop", { shop_id: shopId }),
    onSuccess: (_, shopId) => {
      queryClient.invalidateQueries(["favoriteShops"]);
      setFavoriteShops((prev) => new Set(prev.add(shopId)));
      setSnackbarMessage("Added to favorites");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
    },
  });

  const removeFavorite = useMutation({
    mutationFn: (shopId) => makeRequest.delete("/shoplistings/removeFavoriteShop", { data: { shop_id: shopId } }),
    onSuccess: (_, shopId) => {
      queryClient.invalidateQueries(["favoriteShops"]);
      setFavoriteShops((prev) => {
        const newSet = new Set(prev);
        newSet.delete(shopId);
        return newSet;
      });
      setSnackbarMessage("Removed from favorites");
      setSnackbarSeverity("info");
      setSnackbarOpen(true);
    },
  });

  const {
    featuredShops = [],
    latestShops = [],
    topRatedShops = [],
  } = data || {};

  const searchTermLower = searchTerm.toLowerCase();
  const filterShops = (shops) => {
    return shops.filter((listing) => {
      const matchesSearch =
        listing.name.toLowerCase().includes(searchTermLower) ||
        listing.type?.toLowerCase().includes(searchTermLower) ||
        listing.location?.toLowerCase().includes(searchTermLower) ||
        listing.postal_code?.toLowerCase().includes(searchTermLower);

      const matchesFavorites = showFavorites
        ? favoriteShops.has(listing.shop_id)
        : true;

      return matchesSearch && matchesFavorites;
    });
  };

  const handleCloseSnackbar = () => setSnackbarOpen(false);

  const renderShopRow = (title, shops) => (
    <div className="shop-row-container">
      <h2>{title}</h2>
      <Grid container spacing={2} justifyContent="left">
        {filterShops(shops).map((shop) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={shop.shop_id}>
            <ShopListing
              shoplisting={shop}
              isFavorite={favoriteShops.has(shop.shop_id)}
              toggleFavorite={toggleFavorite}
            />
          </Grid>
        ))}
      </Grid>
    </div>
  );

  if (error) return <div>Error: {error.message}</div>;
  if (isLoading) return <div>Loading...</div>;
  console.log(data)
  return (
    <div className="user-shop-listings">
      <div className="search-bar-container">
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search shop listings..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <SearchIcon className="search-icon" />
        </div>
        <Button
          variant={showFavorites ? "contained" : "outlined"}
          onClick={() => setShowFavorites((prev) => !prev)}
        >
          {showFavorites ? "Show All Shops" : "Favorite Shops"}
        </Button>
      </div>
      {renderShopRow("Featured Shops", featuredShops)}
      {renderShopRow("Latest Shops", latestShops)}
      {renderShopRow("Top Rated Shops", topRatedShops)}
      <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity} sx={{ width: "100%" }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default UserShopListings;
