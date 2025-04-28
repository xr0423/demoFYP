import React, { useEffect, useState } from "react";
import { makeRequest } from "../../axios";
import "./menu.scss";

const Menu = ({ shopId }) => {
  const [menuItems, setMenuItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMenuItems = async () => {
      try {
        const response = await makeRequest.get(`/shoplistings/menuitem?shopId=${shopId}`);
        setMenuItems(response.data);
        setIsLoading(false);
      } catch (err) {
        setError(err);
        setIsLoading(false);
      }
    };
    fetchMenuItems();
  }, [shopId]);

  if (isLoading) return <div>Loading menu...</div>;
  if (error) return <div>Error loading menu: {error.message}</div>;

  return (
    <div className="menu-list">
      <h2>Menu</h2>
      {menuItems && menuItems.length > 0 ? (
        <div className="menu-items">
          {menuItems.map((item) => (
            <div key={item.id} className="menu-item">
              <img src={item.img} alt={item.name} />
              <h3>{item.name}</h3>
              <p>Price: ${item.usual_price}</p>
              <p>Category: {item.category_name}</p>
            </div>
          ))}
        </div>
      ) : (
        <p>No menu items available.</p>
      )}
    </div>
  );
};

export default Menu;
