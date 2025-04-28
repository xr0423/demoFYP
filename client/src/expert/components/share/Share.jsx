import "./share.scss";
import Image from "../../../assets/img.png";
import Shop from "../../../assets/3.png";
import Category from "../../../assets/6.png";
import { useContext, useState } from "react";
import { AuthContext } from "../../../context/authContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { makeRequest } from "../../../axios";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  List,
  ListItem,
  ListItemText,
  Button,
} from "@mui/material";

const Share = () => {
  const [files, setFiles] = useState([]);
  const [desc, setDesc] = useState("");
  const [openShopDialog, setOpenShopDialog] = useState(false);
  const [openCategoryDialog, setOpenCategoryDialog] = useState(false);
  const [shopListings, setShopListings] = useState([]);
  const [category, setCategory] = useState([]);
  const [selectedShop, setSelectedShop] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState([]); // Array to hold multiple selected categories

  const { currentUser } = useContext(AuthContext);
  const queryClient = useQueryClient();

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

  // Fetch shop listings
  const { isLoading: isLoadingShopListings, error: errorShopListings } = useQuery({
    queryKey: ["shoplistings"],
    queryFn: () =>
      makeRequest.get("/shoplistings/findall").then((res) => {
        setShopListings(res.data);
        return res.data;
      }),
  });

  // Fetch categories
  const { isLoading: isLoadingCategory, error: errorCategory } = useQuery({
    queryKey: ["category"],
    queryFn: () =>
      makeRequest.get("/posts/getcategory").then((res) => {
        setCategory(res.data);
        return res.data;
      }),
  });

  const handleOpenShopDialog = () => setOpenShopDialog(true);
  const handleCloseShopDialog = () => setOpenShopDialog(false);

  const handleOpenCategoryDialog = () => setOpenCategoryDialog(true);
  const handleCloseCategoryDialog = () => setOpenCategoryDialog(false);

  const handleShopSelect = (shop) => {
    setSelectedShop(shop);
    setOpenShopDialog(false);
  };

  const handleCategorySelect = (cat) => {
    // Check if the category is already selected
    if (selectedCategory.some((selected) => selected.id === cat.id)) {
      // If already selected, remove it
      setSelectedCategory(selectedCategory.filter((selected) => selected.id !== cat.id));
    } else if (selectedCategory.length < 3) {
      // Add the category if less than three are selected
      setSelectedCategory([...selectedCategory, cat]);
    }
  };

  const mutation = useMutation({
    mutationFn: (newPost) => makeRequest.post("/posts", newPost),
    onSuccess: () => {
      queryClient.invalidateQueries(["posts"]);
    },
  });

  const handleClick = async (e) => {
    e.preventDefault();

    let imgUrls = [];
    if (files.length > 0) {
      imgUrls = await upload();
    }

    let postData = {
      desc,
      imgs: imgUrls,
    };

    if (selectedShop) postData.shop_id = selectedShop.shop_id;
    if (selectedCategory.length > 0) postData.categories = selectedCategory.map((cat) => cat.id); // Send category IDs

    console.log(postData);
    mutation.mutate(postData, {
      onSuccess: (response) => {
        alert(response.data);
        setDesc("");
        setFiles([]);
        setSelectedShop(null);
        setSelectedCategory([]);
      },
      onError: (error) => {
        console.error("Error sharing post:", error);
        alert("Error sharing post. Please try again.");
      },
    });
  };

  return (
    <div className="expertshare">
      <div className="expertsharecontainer">
        <div className="sharetop">
          <div className="left">
            <img src={`/upload/${currentUser.profilePic}`} alt="" />
            <input
              type="text"
              placeholder={`What's on your mind ${currentUser.name}?`}
              onChange={(e) => setDesc(e.target.value)}
              value={desc}
            />
          </div>
          <div className="right">
            {files.length > 0 && (
              <div className="image-preview-container">
                {files.map((file, index) => (
                  <img key={index} className="file" alt={`Selected file ${index}`} src={URL.createObjectURL(file)} />
                ))}
              </div>
            )}
          </div>
        </div>
        <div className = "selected-item">
          {selectedShop && (
            <div className="selected-shop">
              <img src={Shop} alt="" /> {selectedShop.name}
            </div>
          )}
          {selectedCategory.length > 0 && (
            <div className="selected-category">
              <img src={Category} alt="" /> {selectedCategory.map((cat) => cat.name).join(", ")}
            </div>
          )}
        </div>
        <hr />
        <div className="sharebottom">
          <div className="left">
            <input
              type="file"
              id="file"
              multiple
              style={{ display: "none" }}
              onChange={(e) => setFiles([...e.target.files])}
            />
            <label htmlFor="file">
              <div className="item">
                <img src={Image} alt="" />
                <span>Add Image</span>
              </div>
            </label>
            <div className="item" onClick={handleOpenShopDialog}>
              <img src={Shop} alt="" />
              <span>Add Shop</span>
            </div>
            <div className="item" onClick={handleOpenCategoryDialog}>
              <img src={Category} alt="" />
              <span>Select Post Category</span>
            </div>
          </div>
          <div className="right">
            <button onClick={handleClick}>Share</button>
          </div>
        </div>
      </div>

      {/* Shop Selection Dialog */}
      <Dialog
        open={openShopDialog}
        onClose={handleCloseShopDialog}
        sx={{
          "& .MuiDialog-paper": {
            width: "400px",
            maxWidth: "90%",
          },
        }}
      >
        <DialogTitle>Select a Shop</DialogTitle>
        <DialogContent>
          <List
            sx={{
              width: "100%",
              maxWidth: 360,
              bgcolor: "background.paper",
              borderRadius: "8px",
            }}
          >
            {shopListings.map((shop) => (
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
            <ListItem
              button
              onClick={() => {
                setSelectedShop(null);
                setOpenShopDialog(false);
              }}
              sx={{
                backgroundColor: selectedShop === null ? "transparent" : "#f6f3f3",
                "&:hover": { backgroundColor: "#e1c7ad" },
                borderRadius: "8px",
                marginBottom: "8px",
                transition: "background-color 0.3s ease",
              }}
            >
              <ListItemText primary="No Shop Selected" />
            </ListItem>
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

      {/* Category Selection Dialog */}
      <Dialog
        open={openCategoryDialog}
        onClose={handleCloseCategoryDialog}
        sx={{
          "& .MuiDialog-paper": {
            width: "400px",
            maxWidth: "90%",
          },
        }}
      >
        <DialogTitle>Select a Category (Max 3)</DialogTitle>
        <DialogContent>
          {category.length > 0 ? (
            <List
              sx={{
                width: "100%",
                maxWidth: 360,
                bgcolor: "background.paper",
                borderRadius: "8px",
              }}
            >
              {category.map((cat) => (
                <ListItem
                  button
                  key={cat.id}
                  onClick={() => handleCategorySelect(cat)}
                  sx={{
                    backgroundColor: selectedCategory.some((selected) => selected.id === cat.id) ? "#f6f3f3" : "transparent",
                    "&:hover": { backgroundColor: "#e1c7ad" },
                    borderRadius: "8px",
                    marginBottom: "8px",
                    transition: "background-color 0.3s ease",
                  }}
                >
                  <ListItemText primary={cat.name} />
                </ListItem>
              ))}
              <ListItem
                button
                onClick={() => {
                  setSelectedCategory([]);
                  setOpenCategoryDialog(false);
                }}
                sx={{
                  backgroundColor: selectedCategory.length === 0 ? "transparent" : "#f6f3f3",
                  "&:hover": { backgroundColor: "#e1c7ad" },
                  borderRadius: "8px",
                  marginBottom: "8px",
                  transition: "background-color 0.3s ease",
                }}
              >
                <ListItemText primary="No Category" />
              </ListItem>
            </List>
          ) : (
            <p style={{ textAlign: "center", color: "gray" }}>No categories available</p>
          )}
        </DialogContent>
        <Button
          onClick={handleCloseCategoryDialog}
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

    </div>
  );
};

export default Share;
