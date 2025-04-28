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
import moment from "moment";

const Share = () => {
  const [files, setFiles] = useState([]);
  const [desc, setDesc] = useState("");
  const [openShopDialog, setOpenShopDialog] = useState(false);
  const [openCategoryDialog, setOpenCategoryDialog] = useState(false);
  const [shopListings, setShopListings] = useState([]);
  const [category, setCategory] = useState([]);
  const [selectedShop, setSelectedShop] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState([]);
  const [isAdvertise, setIsAdvertise] = useState(false); // New state to track advertise status

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
  useQuery({
    queryKey: ["shoplistings"],
    queryFn: () =>
      makeRequest.get("/shoplistings/findshopname").then((res) => {
        console.log("res.data",res.data);
        setShopListings(res.data);
        return res.data;
      }),
  });

  // Fetch categories
  useQuery({
    queryKey: ["category"],
    queryFn: () =>
      makeRequest.get("/posts/getcategory").then((res) => {
        setCategory(res.data);
        console.log(res.data);
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
    if (selectedCategory.some((selected) => selected.id === cat.id)) {
      setSelectedCategory(selectedCategory.filter((selected) => selected.id !== cat.id));
    } else if (selectedCategory.length < 3) {
      setSelectedCategory([...selectedCategory, cat]);
    }
  };

  const mutation = useMutation({
    mutationFn: (newPost) => makeRequest.post("/posts", newPost),
    onSuccess: () => {
      queryClient.invalidateQueries(["posts"]);
    },
  });

  const advertiseMutation = useMutation({
    mutationFn: (advertisePost) => makeRequest.post("/posts", advertisePost),
    onSuccess: () => {
      queryClient.invalidateQueries(["posts"]);
    },
  });

  const handleSubmit = async (e, advertise = false) => {
    e.preventDefault();

    let imgUrls = [];
    if (files.length > 0) {
      imgUrls = await upload();
    }

    let postData = {
      desc,
      imgs: imgUrls,
      shop_id: selectedShop ? selectedShop.shop_id : null,
      categories: selectedCategory.length > 0 ? selectedCategory.map((cat) => cat.id) : [],
    };

    if (advertise) {
      postData.advertised = 1;
      console.log(postData);
      advertiseMutation.mutate(postData, {
        onSuccess: () => {
          alert("Advertised post shared successfully!");
          resetForm();
        },
        onError: (error) => {
          console.log("Error advertising post:", error);
          alert(error.response.data);
        },
      });
    } else {
      mutation.mutate(postData, {
        onSuccess: (response) => {
          console.log(postData);
          alert(response.data);
          resetForm();
        },
        onError: (error) => {
          console.error("Error sharing post:", error);
          alert(error.response.data);
        },
      });
    }
  };

  const resetForm = () => {
    setDesc("");
    setFiles([]);
    setSelectedShop(null);
    setSelectedCategory([]);
  };

  return (
    <div className="user-share">
      <div className="container">
        <div className="top">
          <div className="left">
            <img src={currentUser.profilePic} alt="" />
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
        <div className="selected-item">
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
        <div className="bottom">
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
            <button onClick={(e) => handleSubmit(e)}>Share</button>
            <button onClick={(e) => handleSubmit(e, true)} style={{ marginLeft: "10px", backgroundColor: "#FF5722" }}>
              Advertise
            </button>
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
          {shopListings.length > 0 ? (
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
          ) : (
            <p style={{ textAlign: "center", color: "gray" }}>No shops available</p>
          )}
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
                <ListItemText primary="No category" />
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
