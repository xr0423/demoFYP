import React, { useContext, useState } from "react";
import "./share.scss";
import Image from "../../../assets/img.png";
import Shop from "../../../assets/3.png";
import Category from "../../../assets/6.png";
import { AuthContext } from "../../../context/authContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { makeRequest } from "../../../axios";
import {
  Box,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  List,
  ListItem,
  ListItemText,
  Snackbar,
  IconButton,
  Alert,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close"; // Import Close icon from MUI

const Share = ({shopId = null, ownerDetails, onShareSuccess}) => {
  const [files, setFiles] = useState([]);
  const [desc, setDesc] = useState("");
  const [openShopDialog, setOpenShopDialog] = useState(false);
  const [shopListings, setShopListings] = useState([]);
  const [category, setCategory] = useState([]);
  const [selectedShop, setSelectedShop] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAllTags, setShowAllTags] = useState(false);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [isAdvertise, setIsAdvertise] = useState(false); // New state to track advertise status


  const { currentUser } = useContext(AuthContext);
  const queryClient = useQueryClient();

  // Upload images
  const upload = async () => {
    try {
      const formData = new FormData();
      files.forEach((file) => formData.append("files", file));
      const res = await makeRequest.post("/upload-multiple", formData);
      return res.data;
    } catch (err) {
      console.log(err);
    }
  };

  // Handle description change with character limit
  const handleDescChange = (e) => {
    const value = e.target.value;
    if (value.length <= 500) {
      setDesc(value);
    }
  };

  // Handle file change with validation
  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    const validFiles = selectedFiles.filter((file) =>
      ["image/jpeg", "image/png", "image/jpg"].includes(file.type)
    );

    if (validFiles.length !== selectedFiles.length) {
      setSnackbarMessage("Only .jpg, .jpeg, and .png files are allowed.");
      setOpenSnackbar(true);
    }

    if (files.length + validFiles.length <= 5) {
      setFiles([...files, ...validFiles]);
    } else {
      setSnackbarMessage("You can only upload a maximum of 5 images.");
      setOpenSnackbar(true);
    }
  };

  // Handle removing an image
  const handleRemoveFile = (index) => {
    setFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
  };

  // Close the Snackbar
  const handleSnackbarClose = () => {
    setOpenSnackbar(false);
  };

 
  // Handle post submission
  const handleClick = async (e, advertise = false) => {
    e.preventDefault();

    if (desc.trim() === "") {
      setSnackbarMessage("Description cannot be empty.");
      setOpenSnackbar(true);
      return;
    }

    let imgUrls = [];
    if (files.length > 0) {
      try {
        imgUrls = await upload();
      } catch (error) {
        console.error("Error uploading images:", error);
        setSnackbarMessage("Error uploading images. Please try again.");
        setOpenSnackbar(true);
        return;
      }
    }

    let postData = {
      desc,
      imgs: imgUrls,
      advertised: advertise ? 1 : 0,
    };

    if (shopId) postData.shop_id = shopId;
    if (selectedShop) postData.shop_id = selectedShop.shop_id;
    if (selectedCategory.length > 0) postData.categories = selectedCategory.map((cat) => cat.id);

    console.log("Post Data:", postData); // Log post data for debugging

    // Mutation for advertising
    if (advertise) {
      advertiseMutation.mutate(postData, {
        onSuccess: () => {
          setSnackbarMessage("Post advertised successfully!");
          setOpenSnackbar(true);
          setDesc("");
          setFiles([]);
          setSelectedShop(null);
          setSelectedCategory([]);
        },
        onError: (error) => {
          console.error("Error advertising post:", error);
          setSnackbarMessage(`Error advertising post: ${error.response?.data || error.message}`);
          setOpenSnackbar(true);
        },
      });
    } else {
      // Mutation for sharing
      mutation.mutate(postData, {
        onSuccess: () => {
          setSnackbarMessage("Post shared successfully!");
          setOpenSnackbar(true);
          setDesc("");
          setFiles([]);
          setSelectedShop(null);
          setSelectedCategory([]);
          if (onShareSuccess) onShareSuccess();
        },
        onError: (error) => {
          console.error("Error sharing post:", );
          setSnackbarMessage(`Error sharing post: ${error.response?.data || error.message}`);
          setOpenSnackbar(true);
        },
      });
    }
  };


  const mutation = useMutation({
    mutationFn: (newPost) => makeRequest.post("/posts", newPost),
    onSuccess: () => {
      queryClient.invalidateQueries(["posts"]);
    },
  });

  // advertise mutation 
  const advertiseMutation = useMutation({
    mutationFn: (advertisePost) => makeRequest.post("/posts", advertisePost),
    onSuccess: () => {
      queryClient.invalidateQueries(["posts"]);
    },
  });

  // Fetch categories
  const { isLoading: isLoadingCategory, error: errorCategory } = useQuery({
    queryKey: ["category", shopId], // Include shopId in the queryKey to refetch when shopId changes
    queryFn: () =>
      makeRequest.get("/posts/getcategory").then((res) => {
        // Check if shopId is not null and filter accordingly
        const filteredData =
          shopId !== null
            ? res.data.filter((item) => item.type === "owner") // Filter by "owner"
            : res.data.filter((item) => item.type === "regular"); // Filter by "regular"
        setCategory(filteredData); // Set the filtered data
        return filteredData; // Return the filtered data
      }),
    enabled: true, // Keep the query enabled
  });
  

  // Fetch shop listings
  const { isLoading: isLoadingShopListings, error: errorShopListings } = useQuery({
    queryKey: ["shoplistings"],
    queryFn: () =>
      makeRequest.get("/shoplistings/findall").then((res) => {
        res.data = res.data.filter(listing => listing.status === "active");
        setShopListings(res.data);
        return res.data;
      }),
  });
  
  // Filter shops based on search term
  const filteredShops = shopListings.filter((shop) =>
    shop.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenShopDialog = () => setOpenShopDialog(true);
  const handleCloseShopDialog = () => {
    setSearchTerm(""); // Clear search when closing dialog
    setOpenShopDialog(false);
  };

  const handleShopSelect = (shop) => {
    setSelectedShop(shop);
    setOpenShopDialog(false);
  };

  const handleCategorySelect = (cat) => {
    if (selectedCategory.some((selected) => selected.id === cat.id)) {
      setSelectedCategory(selectedCategory.filter((selected) => selected.id !== cat.id));
    } else if (selectedCategory.length < 3) {
      setSelectedCategory([...selectedCategory, cat]);
    }
  };

  if (isLoadingCategory) return <p>Loading post details...</p>;
  if (errorCategory) return <p>Error loading post: {errorCategory.message}</p>;  

  if (isLoadingShopListings) return <p>Loading post details...</p>;
  if (errorShopListings) return <p>Error loading post: {errorShopListings.message}</p>;  

  // Limit to 3 rows of tags initially (assume around 3 tags per row)
  const tagsPerRow = 3;
  const initialTagDisplayLimit = 3 * tagsPerRow;
  const displayedCategories = showAllTags ? category : category.slice(0, initialTagDisplayLimit);

  return (
    <div className="user-post-share">
      <div className="container">
        <div className="top">
          <div className="left">
            <img src={currentUser.profilePic ? `/upload/${currentUser.profilePic}` : "/upload/empty-profile-picture.jpg"} alt="" />
            <textarea
              placeholder={`What's on your mind ${currentUser.name}?`}
              onChange={handleDescChange}
              value={desc}
              rows={3}
              maxLength={500}
              style={{ width: "100%", resize: "none" }}
            />
            <span>{desc.length}/500</span>
          </div>
        </div>

        <hr />

        <div className="bottom">
          <div className="left">
            <div className="item-row">
              <input
                type="file"
                id="file"
                multiple
                style={{ display: "none" }}
                onChange={handleFileChange}
                accept=".jpg, .jpeg, .png"
              />
              <label htmlFor="file">
                <div className="item">
                  <img src={Image} alt="Add Image" />
                  <span>Add Image</span>
                </div>
              </label>
            </div>

            {files.length > 0 && (
              <div className="image-preview-container">
                {files.map((file, index) => (
                  <div key={index} className="image-preview">
                    <img
                      className="file-preview"
                      alt={`Selected file ${index}`}
                      src={URL.createObjectURL(file)}
                    />
                    <IconButton
                      className="remove-icon"
                      onClick={() => handleRemoveFile(index)}
                      size="small"
                    >
                      <CloseIcon fontSize="small" />
                    </IconButton>

                  </div>
                ))}
              </div>
            )}

            {(currentUser?.type === "regular" || currentUser?.type === "expert") && (
              <div className="item-row" onClick={handleOpenShopDialog}>
                <div className="item">
                  <img src={Shop} alt="Select Shop" />
                  <span>{selectedShop ? selectedShop.name : "Add Shop"}</span>
                </div>
              </div>
            )}


            <Box sx={{ marginTop: "10px" }}>
              <Box
                sx={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 1,
                  overflow: "visible",
                }}
              >
                <div className="item-row">
                  <div className="item">
                    <img src={Category} alt="" />
                    <span>Select Categories (3 max)</span>
                  </div>
                </div>
                {displayedCategories.map((cat) => (
                  <Box
                    key={cat.id}
                    onClick={() => handleCategorySelect(cat)}
                    sx={{
                      padding: "8px 16px",
                      borderRadius: "20px",
                      backgroundColor: selectedCategory.some(
                        (selected) => selected.id === cat.id
                      )
                        ? "rgba(87, 57, 2, 1.0)"
                        : "rgba(153, 101, 21, 0.8)",
                      color: "white",
                      cursor: "pointer",
                      fontSize: "14px",
                      fontWeight: "500",
                      "&:hover": {
                        backgroundColor: selectedCategory.some(
                          (selected) => selected.id === cat.id
                        )
                          ? "rgba(87, 20, 2, 0.9)"
                          : "rgba(153, 101, 21, 1.0)",
                        color: "#ffffff",
                      },
                    }}
                  >
                    {cat.name}
                  </Box>
                ))}
              </Box>

              {category.length > initialTagDisplayLimit && (
                <Button
                className="moretags"
                onClick={() => setShowAllTags(!showAllTags)}
                variant="text"
              >
                {showAllTags ? "Show Less" : "More Tags"}
              </Button>
              
              )}
            </Box>
          </div>

          <div className="right">
            <button onClick={handleClick}>Share</button>
            {currentUser?.id === ownerDetails?.id && (
              <button
                onClick={(e) => handleClick(e, true)}
                style={{ marginLeft: "10px", backgroundColor: "#FF5722", color: "#fff", border: "none", padding: "8px 12px", cursor: "pointer", borderRadius: "4px" }}
              >
                Advertise
              </button>
            )}

          </div>
        </div>
      </div>

      <Dialog
        open={openShopDialog}
        onClose={handleCloseShopDialog}
        sx={{
          "& .MuiDialog-paper": {
            width: "400px",
            maxWidth: "90%",
            minHeight: "400px",
          },
        }}
      >
        <DialogTitle>Select a Shop</DialogTitle>
        <DialogContent
          sx={{
            minHeight: "300px",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <TextField
            label="Search Shops"
            variant="outlined"
            fullWidth
            margin="dense"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          <List
            sx={{
              width: "100%",
              maxWidth: 360,
              bgcolor: "background.paper",
              borderRadius: "8px",
              overflowY: "auto",
              maxHeight: "200px",
              marginTop: "10px",
            }}
          >
            <ListItem
              button
              onClick={() => {
                setSelectedShop(null);
                setOpenShopDialog(false);
              }}
              sx={{
                backgroundColor: selectedShop === null ? "#f6f3f3" : "transparent",
                "&:hover": { backgroundColor: "#e1c7ad" },
                borderRadius: "8px",
                marginBottom: "8px",
                transition: "background-color 0.3s ease",
              }}
            >
              <ListItemText primary="No Shop Selected" />
            </ListItem>

            {filteredShops.map((shop) => (
              <ListItem
                button
                key={shop.id}
                onClick={() => handleShopSelect(shop)}
                sx={{
                  backgroundColor: selectedShop?.id === shop.id ? "#f6f3f3" : "transparent",
                  "&:hover": { backgroundColor: "#e1c7ad" },
                  borderRadius: "8px",
                  marginBottom: "8px",
                  transition: "background-color 0.3s ease",
                }}
              >
                <ListItemText primary={shop.name} />
              </ListItem>
            ))}
          </List>
        </DialogContent>
        <Button
          onClick={handleCloseShopDialog}
          variant="contained"
          sx={{
            margin: "10px",
            borderRadius: "20px",
            backgroundColor: "rgb(107, 70, 5)",
            color: "#ffffff",
            "&:hover": { backgroundColor: "rgb(85, 55, 4)" },
          }}
        >
          Close
        </Button>
      </Dialog>

      <Snackbar
        open={openSnackbar}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity="info"
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default Share;