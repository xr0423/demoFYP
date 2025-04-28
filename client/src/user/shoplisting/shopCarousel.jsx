import React from "react";
import Slider from "react-slick";
import ShopListing from "./ShopListing";

import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const ShopCarousel = ({ shops, favoriteShops, toggleFavourite }) => {
  const slidesToShow = Math.min(3, shops.length); // Show up to 5 items, or fewer if there are fewer items

  // Slick settings with dynamic `slidesToShow`
  const settings = {
    dots: true, // Show pagination dots
    infinite: false, // Disable infinite looping
    speed: 500, // Transition speed
    slidesToShow: slidesToShow, // Use dynamic slidesToShow
    slidesToScroll: 1,
    centerMode: false,
    responsive: [
      {
        breakpoint: 1600, // Extra-large screens
        settings: {
          slidesToShow: Math.min(3, shops.length), // Dynamically adjust to the number of items
        },
      },
      {
        breakpoint: 1200, // Large screens
        settings: {
          slidesToShow: Math.min(3, shops.length), // Dynamically adjust to the number of items
        },
      },
      {
        breakpoint: 1024, // Medium-large screens
        settings: {
          slidesToShow: Math.min(2, shops.length), // Dynamically adjust to the number of items
        },
      },
      {
        breakpoint: 768, // Tablets and medium screens
        settings: {
          slidesToShow: Math.min(1, shops.length), // Dynamically adjust to the number of items
        },
      },
      {
        breakpoint: 480, // Small screens
        settings: {
          slidesToShow: 1, // Always show 1 item on small screens
        },
      },
    ],
  };

  return (
    <Slider {...settings}>
      {shops.map((shop) => (
          <ShopListing
            key={shop.shop_id} 
            shoplisting={shop}
            isFavorite={favoriteShops.has(shop.shop_id)}
            toggleFavorite={() => toggleFavourite(shop.shop_id)}
          />
      ))}
    </Slider>
  );
};

export default ShopCarousel;
