import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { makeRequest } from "../../axios"; // Assuming axios is properly configured
import "./ShopListing.scss";

const ShopListing = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [shopListings, setShopListings] = useState([]);

  // Fetch shop listings for all users
  const { isLoading, error } = useQuery({
    queryKey: ["shoplistings"],
    queryFn: () => makeRequest.get(`/shoplistings`).then((res) => res.data),
    onSuccess: (data) => setShopListings(data),
  });

  // Filter shop listings based on search term
  const filteredListings = shopListings.filter((listing) => {
    const shopName = listing?.name?.toLowerCase() || "";
    return shopName.includes(searchTerm.toLowerCase());
  });

  return (
    <div className="shop-listing">
      <div className="header-container">
        <h1>Available Shops</h1>
        <input
          type="text"
          placeholder="Search shops..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Loading, Error, and Empty States */}
      {error ? (
        <div>Error: {error.message}</div>
      ) : isLoading ? (
        <div>Loading shops...</div>
      ) : filteredListings.length === 0 ? (
        <div>No shops available</div>
      ) : (
        <ul className="shop-list">
          {filteredListings.map((shop) => (
            <li key={shop.shop_id} className="shop-item">
              <h2>{shop.name}</h2>
              <p>Location: {shop.location}</p>
              <p>Type: {shop.type_name}</p>
              <p>Postal Code: {shop.postal_code}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ShopListing;
