import React, { useContext, useEffect, useState } from "react";
import "../share/share.scss";
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
import CloseIcon from "@mui/icons-material/Close";

const PostUpdate = ({ shopId = null, postId, onUpdateSuccess  }) => {
  // Accept postId as a prop
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

  const { currentUser } = useContext(AuthContext);
  const queryClient = useQueryClient();

  const [postDetails, setPostDetails] = useState(null);
  const [isLoadingPost, setIsLoadingPost] = useState(true);
  const [errorPost, setErrorPost] = useState(null);

  useEffect(() => {
    const fetchPostDetails = async () => {
      try {
        const response = await makeRequest.get(`/posts/${postId}`);
        const { desc, img, shop_id, shop_name, categories } = response.data;
  
        const serverFiles = img
          ? img.split(",").map((url) => ({ url }))
          : [];
  
        // Filter unique files by URL
        const uniqueServerFiles = serverFiles.filter(
          (file, index, self) =>
            self.findIndex((f) => f.url === file.url) === index
        );
  
        setFiles(uniqueServerFiles);
        setDesc(desc || "");
        setSelectedShop(
          shop_id && shop_name ? { id: shop_id, name: shop_name } : null
        );
  
        // Convert category IDs to objects with ID and name
        const categoryIds = categories ? categories.split(",").map(Number) : [];
        const matchedCategories = categoryIds
          .map((id) => category.find((cat) => cat.id === id)) // Match IDs with `category`
          .filter((cat) => cat); // Remove unmatched IDs
  
        setSelectedCategory(matchedCategories);
  
        setIsLoadingPost(false);
      } catch (error) {
        setErrorPost(error);
        setIsLoadingPost(false);
      }
    };
  
    if (postId && category.length > 0) {
      fetchPostDetails();
    }
  }, [postId, category]); // Ensure `category` is loaded before processing
  

  
  

  // Upload images
  const upload = async () => {
    try {
      const formData = new FormData();
      files.forEach((file) => {
        if (!file.url) formData.append("files", file); // Only append new files
      });
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

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
  
    // Validate selected files
    const validFiles = selectedFiles.filter((file) =>
      ["image/jpeg", "image/png", "image/jpg"].includes(file.type)
    );
  
    if (validFiles.length !== selectedFiles.length) {
      setSnackbarMessage("Only .jpg, .jpeg, and .png files are allowed.");
      setOpenSnackbar(true);
    }
  
    // Combine existing files and new valid files
    const newFiles = [...files, ...validFiles];
  
    // Limit to a maximum of 5 images
    if (newFiles.length > 5) {
      setSnackbarMessage("You can only upload a maximum of 5 images.");
      setOpenSnackbar(true);
      return;
    }
  
    setFiles(newFiles); // Update state with the combined files
  };  

  // Handle removing an image
  const handleRemoveFile = (index) => {
    setFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
  };

  // Close the Snackbar
  const handleSnackbarClose = () => {
    setOpenSnackbar(false);
  };


  //update button
  const handleClick = async (e) => {
    e.preventDefault();
  
    if (desc.trim() === "") {
      setSnackbarMessage("Description cannot be empty.");
      setOpenSnackbar(true);
      return;
    }
  
    // Separate existing URLs from new files
    const existingUrls = files
      .filter((file) => file.url)
      .map((file) => file.url);
  
    const newFiles = files.filter((file) => !file.url);
  
    // Upload new files
    let uploadedUrls = [];
    if (newFiles.length > 0) {
      try {
        uploadedUrls = await upload(newFiles); // Upload new images
      } catch (err) {
        console.error("Error uploading images:", err);
        setSnackbarMessage("Error uploading images. Please try again.");
        setOpenSnackbar(true);
        return;
      }
    }
  
    // Combine all image URLs
    const allImages = [...existingUrls, ...uploadedUrls].map((url) =>
        url.startsWith("/upload/") ? url.replace("/upload/", "") : url
      );
      
    const postData = {
    desc,
    imgs: allImages,
    shop_id: selectedShop?.shop_id || null, // Send the correct shop_id
    categories: selectedCategory.map((cat) => cat.id),
    };

    if (shopId) {
      postData.shop_id = shopId;
    }
  
    mutation.mutate(postData, {
      onSuccess: () => {
        setSnackbarMessage("Post updated successfully!");
        setOpenSnackbar(true);
    

        if (onUpdateSuccess) {
          setTimeout(onUpdateSuccess, 500); 
        }
      },
      onError: (error) => {
        console.error("Error updating post:", error);
        setSnackbarMessage("Error updating post. Please try again.");
        setOpenSnackbar(true);
      },
    });
  };    
  
  
  const mutation = useMutation({
    mutationFn: (updatedPost) =>
      makeRequest.put(`/posts/${postId}`, updatedPost),
    onSuccess: () => {
      queryClient.invalidateQueries(["posts"]);
      queryClient.invalidateQueries(["postDetails", postId]);
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
  const { isLoading: isLoadingShopListings, error: errorShopListings } =
    useQuery({
      queryKey: ["shoplistings"],
      queryFn: () =>
        makeRequest.get("/shoplistings/findall").then((res) => {
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
    setSearchTerm("");
    setOpenShopDialog(false);
  };

  const handleShopSelect = (shop) => {
    setSelectedShop(shop);
    setOpenShopDialog(false);
  };

  const handleCategorySelect = (cat) => {
    if (selectedCategory.some((selected) => selected.id === cat.id)) {
      setSelectedCategory(
        selectedCategory.filter((selected) => selected.id !== cat.id)
      );
    } else if (selectedCategory.length < 3) {
      setSelectedCategory([...selectedCategory, cat]);
    }
  };

  // Limit to 3 rows of tags initially (assume around 3 tags per row)
  const tagsPerRow = 3;
  const initialTagDisplayLimit = 3 * tagsPerRow;
  const displayedCategories = showAllTags
    ? category
    : category.slice(0, initialTagDisplayLimit);

  if (isLoadingPost) return <p>Loading post details...</p>;
  if (errorPost) return <p>Error loading post: {errorPost.message}</p>;

  if (isLoadingCategory) return <p>Loading post details...</p>;
  if (errorCategory) return <p>Error loading post: {errorCategory.message}</p>;

  if (isLoadingShopListings) return <p>Loading post details...</p>;
  if (errorShopListings)
    return <p>Error loading post: {errorShopListings.message}</p>;

  return (
    <div className="user-post-share">
      <div className="container">
        {/* Top Section */}
        <div className="top">
          <div className="left">
            <img
              src={currentUser.profilePic? `/upload/${currentUser.profilePic}` : "/upload/empty-profile-picture.jpg"}
              alt={`${currentUser.name}`}
            />
            <textarea
              placeholder={`What's on your mind, ${currentUser.name}?`}
              onChange={handleDescChange}
              value={desc} // Pre-fill description from state
              rows={3}
              maxLength={500}
              style={{ width: "100%", resize: "none" }}
            />
            <span>{desc.length}/500</span>
          </div>
        </div>

        <hr />

        {/* Bottom Section */}
        <div className="bottom">
          <div className="left">
            {/* Upload Images */}
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

            {/* Preview Uploaded and Existing Images */}
            {files.length > 0 && (
              <div className="image-preview-container">
                {files.map((file, index) => (
                  <div key={index} className="image-preview">
                    <img
                        className="file-preview"
                        alt={`File ${index}`}
                        src={file.url ? `/upload/${file.url.replace('/upload/', '')}` : URL.createObjectURL(file)} // Add prefix dynamically
                        />
                    <IconButton
                      className="remove-icon"
                      onClick={() => handleRemoveFile(index)}
                      size="small"
                      sx={{
                        position: "absolute",
                        top: 0,
                        right: 0,
                        color: "white",
                        backgroundColor: "rgba(0, 0, 0, 0.6)",
                        "&:hover": { backgroundColor: "rgba(0, 0, 0, 0.8)" },
                      }}
                    >
                      <CloseIcon />
                    </IconButton>
                  </div>
                ))}
              </div>
            )}

            {/* Select Shop */}
            {(currentUser?.type === "regular" || currentUser?.type === "expert") && (
              <div className="item-row" onClick={handleOpenShopDialog}>
                <div className="item">
                  <img src={Shop} alt="Select Shop" />
                  <span>{selectedShop ? selectedShop.name : "Add Shop"}</span>
                </div>
              </div>
            )}


            {/* Categories Selection */}
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
                    <img src={Category} alt="Categories" />
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

          {/* Update Button */}
          <div className="right">
            <button onClick={handleClick}>Update</button>
          </div>
        </div>
      </div>

      {/* Dialog for Shop Selection */}
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
                backgroundColor:
                  selectedShop === null ? "#f6f3f3" : "transparent",
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
                  backgroundColor:
                    selectedShop?.id === shop.id ? "#f6f3f3" : "transparent",
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

      {/* Snackbar Notifications */}
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

export default PostUpdate;
