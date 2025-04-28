import React, { useContext, useState } from "react";
import {
  IconButton,
  Grid,
  CircularProgress,
  Box,
  Typography,
  Snackbar,
  Alert,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { makeRequest } from "../../axios";
import { AuthContext } from "../../context/authContext";
import { useNavigate } from "react-router-dom";
import CreateShopListing from "../components/createShopListing/CreateShoplisting";
import UpdateShopListingForm from "../components/updateShopListing/UpdateShoplistingForm";
import Shoplisting from "../components/shoplisting/Shoplisting";
import "./shopListings.scss";

const Shoplistings = () => {
  const { currentUser } = useContext(AuthContext);
  const userId = currentUser?.id;
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [shopListings, setShopListings] = useState([]);
  const [showCreateListingForm, setShowCreateListingForm] = useState(false);
  const [showUpdateListingForm, setShowUpdateListingForm] = useState(false);
  const [selectedShopId, setSelectedShopId] = useState(null);

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");

  const openSnackbar = (message, severity = "success") => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  const closeSnackbar = () => {
    setSnackbarOpen(false);
  };

  const { isLoading, error } = useQuery({
    queryKey: ["shoplistings", userId],
    queryFn: () =>
      userId
        ? makeRequest.get(`/shoplistings/find?userId=${userId}`).then((res) => {
            setShopListings(res.data);
            return res.data;
          })
        : Promise.reject(new Error("No user ID")),
    enabled: !!userId,
  });

  const filteredListings = shopListings.filter((listing) => {
    const lowerSearchTerm = searchTerm.toLowerCase();
    return (
      listing.name.toLowerCase().includes(lowerSearchTerm) ||
      listing.location.toLowerCase().includes(lowerSearchTerm)
    );
  });

  const toggleCreateForm = () => setShowCreateListingForm((prev) => !prev);

  const toggleUpdateForm = (id) => {
    setSelectedShopId(id);
    setShowUpdateListingForm((prev) => !prev);
  };

  return (
    <div className="shoplistings">
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
        <IconButton onClick={toggleCreateForm} className="add-button">
          <AddIcon />
        </IconButton>
      </div>

      <Grid container spacing={2} justifyContent="center">
        {isLoading ? (
          <Box display="flex" justifyContent="center" alignItems="center" height="300px">
            <CircularProgress />
          </Box>
        ) : error ? (
          <Box display="flex" justifyContent="center" alignItems="center" height="300px">
            <Typography color="error">Error: {error.message}</Typography>
          </Box>
        ) : shopListings.length === 0 ? (
          <Box
            display="flex"
            flexDirection="column"
            justifyContent="center"
            alignItems="center"
            height="300px"
            textAlign="center"
          >
            <Typography variant="h6" gutterBottom>
              No shop listings available.
            </Typography>
            <Typography variant="body2" color="textSecondary" gutterBottom>
              Create your first shop listing to start showcasing your business.
            </Typography>
          </Box>
        ) : filteredListings.length === 0 ? (
          <Box
            display="flex"
            flexDirection="column"
            justifyContent="center"
            alignItems="center"
            height="300px"
            textAlign="center"
          >
            <Typography variant="h6" gutterBottom>
              No shop listings found.
            </Typography>
          </Box>
        ) : (
          <Box sx={{ padding: "0 20px", width: "100%", boxSizing: "border-box", marginTop: "15px" }}>
            <Grid container spacing={2} justifyContent="flex-start">
              {filteredListings.map((shoplisting) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={shoplisting.shop_id}>
                  <Shoplisting
                    shoplisting={shoplisting}
                    onEdit={() => toggleUpdateForm(shoplisting.shop_id)}
                    access={true}
                    onSnackbar={openSnackbar}
                  />
                </Grid>
              ))}
            </Grid>
          </Box>
        )}
      </Grid>

      {showCreateListingForm && <CreateShopListing onClose={toggleCreateForm} />}

      {showUpdateListingForm && (
        <UpdateShopListingForm onClose={() => setShowUpdateListingForm(false)} id={selectedShopId} />
      )}

      <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={closeSnackbar}>
        <Alert onClose={closeSnackbar} severity={snackbarSeverity} sx={{ width: "100%" }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default Shoplistings;
