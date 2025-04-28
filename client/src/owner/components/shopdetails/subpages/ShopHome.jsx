import React, { useState, useEffect, useContext } from "react";
import ShopPosts from "./ShopPosts";
import Share from "../../../../user/components/share/Share";
import '../../../../user/home/home.scss';
import { useQuery } from "@tanstack/react-query";

import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import OutlinedInput from "@mui/material/OutlinedInput";
import { makeRequest } from "../../../../axios";
import { AuthContext } from "../../../../context/authContext";

const ShopHome = ({shopId, ownerDetails}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [selectedCategories, setSelectedCategories] = useState([]); // Selected categories
  const [categories, setCategories] = useState([]); // All categories
  const {currentUser} = useContext(AuthContext);

  // Fetch categories
  const { isLoading: isLoadingCategory, error: errorCategory } = useQuery({
    queryKey: ["category"],
    queryFn: () =>
      makeRequest.get("/posts/getcategory").then((res) => {
        // Filter categories by type "regular"
        const filteredCategories = res.data.filter((category) => category.type === "owner");
        setCategories(filteredCategories); // Set the filtered categories
        return filteredCategories; // Return the filtered categories
      }),
  });
  

  // Handle category selection
  const handleCategoryChange = (event) => {
    const { value } = event.target;

    // Handle deselection even when limit is reached
    if (selectedCategories.includes(value[value.length - 1])) {
      setSelectedCategories(value);
      return;
    }

    // Allow selection of up to 3 categories
    if (value.length <= 3) {
      setSelectedCategories(value);
    }
  };

  // Function to open the modal
  const openModal = () => {
    setIsModalOpen(true);
  };

  // Function to close the modal
  const closeModal = () => {
    setIsModalOpen(false);
  };

  // Callback function for successful share
  const handleShareSuccess = () => {
    setIsModalOpen(false);
    setSnackbarMessage("Post shared successfully!");
    setSnackbarOpen(true);
  };

  // Function to handle Snackbar close
  const handleSnackbarClose = (event, reason) => {
    if (reason === "clickaway") return;
    setSnackbarOpen(false);
  };

  return (
    <div className="user-home">
      {/* Header with Category Filter and Add Post Button */}
      <div className="header-container">
        {/* Dropdown for Category Filter */}
        <div className="header-actions">
          <FormControl sx={{ width: "250px" }}>
            <Select
              multiple
              value={selectedCategories}
              onChange={handleCategoryChange}
              input={<OutlinedInput />}
              displayEmpty
              renderValue={(selected) =>
                selected.length > 0
                  ? selected.join(", ") // Render selected category names
                  : "Select categories" // Placeholder text
              }
              MenuProps={{
                PaperProps: {
                  style: {
                    maxHeight: 300, // Limit dropdown height
                    width: 250, // Matches the dropdown width
                    overflowY: "auto", // Add vertical scrolling for items
                  },
                },
              }}
              sx={{
                "& .MuiSelect-select": {
                  padding: "8px 12px",
                  fontSize: "14px",
                  color: "#5f3615", // Brown text color
                },
                "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#5f3615", // Brown border when focused
                },
                "&:hover .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#8b6324", // Darker brown border on hover
                },
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#d4a76b", // Default light brown border
                },
              }}
            >
              {/* Display Categories */}
              {categories.map((category) => (
                <MenuItem
                  key={category.name}
                  value={category.name}
                  disabled={
                    selectedCategories.length >= 3 &&
                    !selectedCategories.includes(category.name)
                  } // Disable extra selections
                  sx={{
                    "&.Mui-selected": {
                      backgroundColor: "#f4e4d6", // Light brown for selected items
                      color: "#5f3615",
                    },
                    "&.Mui-selected:hover": {
                      backgroundColor: "#e8d3bf", // Slightly darker on hover
                    },
                  }}
                >
                  {category.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {currentUser?.id === ownerDetails?.id && (
            <button className="add-post-button" onClick={openModal}>
              + Add Post
            </button>
          )}

        </div>
      </div>

      {/* Content Container */}
      <div className="content-container">
        <ShopPosts shopId={shopId} ownerDetails={ownerDetails} selectedCategories={selectedCategories} />
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-modal" onClick={closeModal}>
              x
            </button>
            <Share shopId={shopId} ownerDetails={ownerDetails} onShareSuccess={handleShareSuccess} />
          </div>
        </div>
      )}

      {/* Snackbar Notification */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={2000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity="success"
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default ShopHome;
