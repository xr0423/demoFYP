import React, { useEffect, useState } from "react";
import { Card, CardContent, CardMedia, Typography, Tooltip, Badge, Button } from "@mui/material";
import StarIcon from "@mui/icons-material/Star";
import RestaurantMenuIcon from "@mui/icons-material/RestaurantMenu";
import { makeRequest } from "../../../axios";
import "./menuItem.scss";

function UserMenuItem({ shopId }) {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("All");

  useEffect(() => {
    makeRequest.get(`/shoplistings/menuitem?shopId=${shopId}`)
      .then((response) => {
        setMenuItems(response.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching menu items:", err);
        setError(err);
        setLoading(false);
      });
  }, [shopId]);

  const getImageSrc = (item) => {
    const photos = item.img;
    return photos ? `/upload/${photos}`: '/upload/default-menu.png';
  };

  // Extract unique categories
  const uniqueCategories = ["All", ...new Set(menuItems.map(item => item.category_name || "Others"))];

  const filteredItems = filter === "All" 
    ? menuItems 
    : menuItems.filter(item => item.category_name === filter);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error loading menu items</div>;

  return (
    <div className="menu-item-container">
      {/* Filter Buttons */}
      <div className="filter-buttons">
        {uniqueCategories.map((category) => (
          <Button key={category} onClick={() => setFilter(category)}>
            {category}
          </Button>
        ))}
      </div>

      {/* Menu Items */}
      <div className="menu-items-wrapper">
        {filteredItems.map((item) =>
          item.availability && (
            <div key={item.id} className="menu-card">
              <Badge
                badgeContent={item.special ? <StarIcon style={{ color: "gold" }} /> : null}
                overlap="rectangular"
                anchorOrigin={{ vertical: "top", horizontal: "left" }}
                className="badge-container"
              >
                <Card className="menu-card-content" raised>
                  <CardMedia component="img" height="140" image={getImageSrc(item)} alt={item.name} />
                  <CardContent>
                    <Tooltip title={item.desc}>
                      <Typography gutterBottom variant="h5" component="div" className="item-name">
                        {item.name}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        {item.category_name}
                      </Typography>
                    </Tooltip>

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
              </Badge>
            </div>
          )
        )}
      </div>
    </div>
  );
}

export default UserMenuItem;
