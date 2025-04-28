import React, { useEffect, useState } from "react";
import { Card, CardContent, CardMedia, Typography, Tooltip, Badge } from "@mui/material";
import StarIcon from "@mui/icons-material/Star";
import RestaurantMenuIcon from "@mui/icons-material/RestaurantMenu";
import { makeRequest } from "../../axios";
import "./UserMenuItem.scss";

function UserMenuItem({ shopId }) {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    makeRequest.get(`/shoplistings/menuitem?shopId=${shopId}`).then((response) => {
      setMenuItems(response.data);
      setLoading(false);
    }).catch((err) => {
      setError(err);
      setLoading(false);
    });
  }, [shopId]);

  const getImageSrc = (item) => {
    const photos = item.img;
    return photos ? `/upload/${photos}` : "/upload/default.menu.png";
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error loading menu items</div>;

  return (
    <div className="menu-item-container">
      <div className="menu-items-wrapper">
        {menuItems.map((item) => (
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
                </CardContent>
              </Card>
            </Badge>
          </div>
        ))}
      </div>
    </div>
  );
}

export default UserMenuItem;
