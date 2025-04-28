import React, { useEffect, useState, useContext } from "react";
import "./menuItem.scss"; // Import the styling file
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Tooltip,
  Badge,
  IconButton,
  Box,
  CircularProgress,
  Alert,
  Button,
} from "@mui/material";
import StarIcon from "@mui/icons-material/Star"; // Icon for special items
import InfoIcon from "@mui/icons-material/Info";
import RestaurantMenuIcon from "@mui/icons-material/RestaurantMenu"; // Icon for dietary restrictions
import { makeRequest } from "../../../../axios"; // Assuming this is the correct path for axios
import { Add } from "@mui/icons-material";
import { AuthContext } from "../../../../context/authContext";

function MenuItem({
  shopId,
  handleCreateForm,
  createFormStatus,
  handleUpdateForm,
  updateFormStatus,
  setSelectedMenuItemId,
  ownerDetails,
}) {
  const [menuItems, setMenuItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null); // Store the selected item
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("All"); // Filter state
  const { currentUser} = useContext(AuthContext);

  // get menu items
  const fetchMenuItems = async () => {
    try {
      const response = await makeRequest.get(`/shoplistings/menuitem?shopId=${shopId}`);
      setMenuItems(response.data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching menu items:", err);
      setError(err);
      setLoading(false);
    }
  };

  const [shopStatus, setShopStatus] = useState(false);
  const getShopStatus = async () => {
    try {
      const response = await makeRequest.get(`/shoplistings/status?id=${shopId}`);
      setShopStatus(response.data === "active" ? true : false);
      setLoading(false);
    } catch (err) {}
  };

  useEffect(() => {
    getShopStatus();
    fetchMenuItems();
  }, [shopId, createFormStatus, updateFormStatus]);

  const handleItemClick = (id) => {
    // Toggle the selected item state
    setSelectedItem(selectedItem === id ? null : id);
  };

  const handleEdit = (id) => {
    console.log("Edit in menuitem.jsx", id);
    handleUpdateForm();
    setSelectedMenuItemId(id);
  };

  const handleDelete = async (id) => {
    const userConfirmed = window.confirm("Are you sure you want to delete this item?");
    if (userConfirmed) {
      try {
        await makeRequest.delete(`shoplistings/menuitem?item_id=${id}`);
        fetchMenuItems();
        alert("Item deleted.");
      } catch (err) {
        alert("Item not deleted.");
      }
    } else {
      alert("Item not deleted.");
    }
  };

  const filteredItems =
    filter === "All" ? menuItems : menuItems.filter((item) => item.category_name === filter);

  const uniqueCategories = ["All", ...new Set(menuItems.map((item) => item.category_name || "Others"))];

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="300px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="300px" textAlign="center">
        <Alert severity="error">Error loading menu items</Alert>
      </Box>
    );
  }

  if (menuItems.length === 0) {
    return (
      <div className="menu-item-container">
        <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" height="300px" textAlign="center">
          <Typography variant="h6" gutterBottom>
            No menu items available.
          </Typography>
          <Typography variant="body2" color="textSecondary" gutterBottom>
            Create a new menu item to showcase your offerings.
          </Typography>

            {ownerDetails?.id === currentUser?.id && ( // Check if current user is the owner
              <IconButton
                className="addBtn"
                sx={{ marginBottom: "15px" }}
                onClick={handleCreateForm}
                disabled={!shopStatus}
              >
                <Add style={{ color: "white" }} />
              </IconButton>
            )}

        </Box>
      </div>
    );
  }

  return (
    <div className="menu-item-container">
      {ownerDetails?.id === currentUser?.id && (
        <IconButton
          className="addBtn"
          sx={{ marginBottom: "15px" }}
          onClick={handleCreateForm}
          disabled={!shopStatus}
        >
          <Add style={{ color: "white" }} />
        </IconButton>
       )}

      {/* Filter Buttons */}
      <div className="filter-buttons">
        {uniqueCategories.map((category) => (
          <Button key={category} onClick={() => setFilter(category)}>
            {category}
          </Button>
        ))}
      </div>

      <div className="menu-items-wrapper">
        {filteredItems.map((item) => (
          <div
            className={`menu-card ${selectedItem === item.id ? "selected" : ""}`}
            key={item.id}
            onClick={ownerDetails?.id === currentUser?.id ? () => handleItemClick(item.id) : undefined}
          >
            <Badge
              badgeContent={item.special ? <StarIcon style={{ color: "gold" }} /> : null}
              overlap="rectangular"
              anchorOrigin={{ vertical: "top", horizontal: "left" }}
              className="badge-container"
            >
              <Card className="menu-card-content" raised>
                <CardMedia component="img" height="140" 
                  src={item.img? `/upload/${item.img}` : '/upload/default-menu.png'}  
                  alt={item.name} />
                <CardContent>
                  <div className="item-header">
                    <Typography gutterBottom variant="h5" component="div" className="item-name">
                      {item.name}
                    </Typography>
                    <Tooltip 
                      title={<Typography sx={{ fontSize: '1rem' }}>{item.desc}</Typography>} 
                    >
                      <InfoIcon className="info-icon" />
                    </Tooltip>
                  </div>
                    <Typography variant="body2" color="textSecondary">
                      {item.category_name}
                    </Typography>

                  <div className="price-section">
                    <Typography variant="subtitle1">
                      {item.discounted_rate
                        ? `Discounted: $${((item.usual_price / 100) * (100 - item.discounted_rate)).toFixed(2)}`
                        : `Price: $${item.usual_price}`}
                    </Typography>
                    {item.discounted_rate > 0 && (
                      <Typography variant="body2" className="original-price" sx={{ textDecoration: "line-through" }}>
                        Original: ${item.usual_price}
                      </Typography>
                    )}
                  </div>

                  {item.dietary_restriction && (
                    <div className="dietary-info">
                      <RestaurantMenuIcon style={{ marginRight: 5 }} />
                      <div className="dietary-tags">
                        {item.dietary_restriction.split(",").map((restriction, index) => (
                          <span key={index} className="dietary-tag">
                            {restriction}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
              {selectedItem === item.id && (
                <div className="action-buttons">
                  <IconButton className="edit-btn" onClick={() => handleEdit(item.id)}>
                    Edit
                  </IconButton>
                  <IconButton className="delete-btn" onClick={() => handleDelete(item.id)}>
                    Delete
                  </IconButton>
                </div>
              )}
            </Badge>
          </div>
        ))}
      </div>
    </div>
  );
}

export default MenuItem;
