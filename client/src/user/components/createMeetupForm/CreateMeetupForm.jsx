import React, { useEffect, useState } from "react";
import { makeRequest } from "../../../axios";
import { Snackbar, Alert, IconButton, TextField, Autocomplete, Box } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import "./createMeetupForm.scss";

const CreateMeetupForm = ({ onClose, onSuccess, shop }) => {
  const [meetupData, setMeetupData] = useState({
    title: "",
    description: "",
    startDate_Time: "",
    endDate_Time: "",
    shop_id: shop || "",
  });
  const [shops, setShops] = useState([]);
  const [error, setError] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  const handleSnackbarClose = () => setSnackbarOpen(false);

  const fetchShops = async () => {
    try {
      const response = await makeRequest.get("/meetups/related-data");
      const shopOptions = [{ shop_id: "", shop_name: "Select Shop..." }, ...response.data.shops]; // Add default option
      setShops(shopOptions);
    } catch (err) {
      setError("Failed to load shops");
    }
  };

  useEffect(() => {
    fetchShops();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "title" && value.length > 20) return;
    if (name === "description" && value.length > 100) return;

    setMeetupData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleShopChange = (event, newValue) => {
    setMeetupData((prevData) => ({
      ...prevData,
      shop_id: newValue ? newValue.shop_id : "", // Set shop_id based on selection
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await makeRequest.post("/meetups", meetupData);
      if (response.status === 200) {
        setSnackbarOpen(true); // Show success Snackbar
        onSuccess("Meetup created successfully!"); // Call onSuccess from parent component
      }
    } catch (err) {
      if (err.response && err.response.status === 409) {
        setError("Meetup time range conflicts with another meetup.");
      } 
      setSnackbarOpen(true); // Show error Snackbar
    }
  };

  const handleDropdownOpen = () => {
    document.body.style.overflow = "hidden"; // Disable background scroll
  };

  const handleDropdownClose = () => {
    document.body.style.overflow = "auto"; // Enable background scroll
  };

  return (
    <div className="create-meetup-form">
      <h2>Create a Meetup</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="title"
          value={meetupData.title}
          maxLength={20}
          onChange={handleInputChange}
          placeholder="Meetup Title"
          required
        />
        <div className="character-counter">{meetupData.title.length}/20</div>
        <textarea
          name="description"
          value={meetupData.description}
          maxLength={100}
          onChange={handleInputChange}
          placeholder="Meetup Description"
          required
        />
        <div className="character-counter">{meetupData.description.length}/100</div>
        <input
          type="datetime-local"
          name="startDate_Time"
          value={meetupData.startDate_Time}
          onChange={handleInputChange}
          min={new Date().toISOString().slice(0, 16)}
          required
        />
        <input
          type="datetime-local"
          name="endDate_Time"
          value={meetupData.endDate_Time}
          onChange={handleInputChange}
          min={meetupData.startDate_Time || new Date().toISOString().slice(0, 16)}
          required
        />
        <br/>
        <br/>
        {/* Styled Autocomplete for Shop Selection */}
        <Box sx={{ mb: 2 }}>
        <Autocomplete
    options={shops}
    getOptionLabel={(option) => option.shop_name || ""}
    value={shops.find((shop) => shop.shop_id === meetupData.shop_id) || null}
    onChange={handleShopChange}
    clearOnBlur={false}
    renderInput={(params) => (
      <TextField
        {...params}
        label="Select Shop"
        placeholder="Search Shop..."
        variant="outlined"
        fullWidth
        required
        sx={{
          "& .MuiOutlinedInput-root": {
            borderRadius: "8px",
            boxShadow: "0 3px 6px rgba(0, 0, 0, 0.1)",
            backgroundColor: "#f9f9f9",
            paddingRight: "32px", // Add padding to make space for the dropdown button
            "& fieldset": {
              borderColor: "#d3d3d3",
            },
            "&:hover fieldset": {
              borderColor: "#a3a3a3",
            },
            "&.Mui-focused fieldset": {
              borderColor: "#4caf50",
            },
          },
          "& .MuiOutlinedInput-input": {
            fontSize: "16px",
            padding: "8px 12px",
          },
          "& .MuiInputLabel-root": {
            fontSize: "16px",
            color: "#6b6b6b",
          },
          "& .MuiAutocomplete-popupIndicator": {
            position: "absolute", // Position inside the text field container
            right: "20px", // Position it to the right within the container
            top: "50%",
            transform: "translateY(-80%)", // Center vertically
            fontSize: "1rem", // Adjust icon size as needed
            padding: "2px",
            backgroundColor: "transparent", // Remove any background
            "&:hover": {
              color: "#333",
            },
          },
          "& .MuiAutocomplete-clearIndicator": {
            display: "none", // Remove the clear button
          },
        }}
      />
    )}
    sx={{
      "& .MuiAutocomplete-option": {
        fontSize: "15px",
        padding: "10px 20px",
        "&[data-focus='true']": {
          backgroundColor: "#f5f5f5",
          color: "#333",
        },
        "&[aria-selected='true']": {
          backgroundColor: "#e0f7e9",
          color: "#4caf50",
        },
      },
    }}
  />


        </Box>

        <button type="submit">Create Meetup</button>
        <button type="button" onClick={onClose} className="cancel">
          Cancel
        </button>
      </form>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={error ? "error" : "success"}
          sx={{
            width: "100%",
            backgroundColor: error ? "#ff7961" : "#4caf50",
            color: "#ffffff",
            "& .MuiAlert-icon": { color: "#ffffff" },
          }}
          action={
            <IconButton
              size="small"
              aria-label="close"
              color="inherit"
              onClick={handleSnackbarClose}
              sx={{
                marginLeft: "auto",
                padding: 0,
                "&:hover": { backgroundColor: "transparent" },
                color: "rgba(255, 255, 255, 0.8)",
              }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          }
        >
          {error || "Meetup created successfully!"}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default CreateMeetupForm;
