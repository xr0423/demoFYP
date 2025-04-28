import React from "react";
import FavoriteBorderOutlinedIcon from "@mui/icons-material/FavoriteBorderOutlined";
import FavoriteOutlinedIcon from "@mui/icons-material/FavoriteOutlined";
import { useNavigate } from "react-router-dom";


const Shoplisting = ({ shoplisting, isFavorite, toggleFavorite, onClose }) => {
     const navigate = useNavigate();


     const handleNavigate = () => {
          onClose();
          navigate(`/user/shoplisting/${shoplisting.shop_id}/overview`);
     };

     const handleFavoriteClick = (e) => {
          e.stopPropagation();
          toggleFavorite(shoplisting.shop_id);

     };

     const getImageSrc = () => {
          const photos = shoplisting.photo_gallery
               ? shoplisting.photo_gallery.split(",")
               : [];
          const firstPhoto = photos.length > 0 ? photos[0] : null;
          return firstPhoto
               ? firstPhoto.startsWith("http")
                    ? firstPhoto
                    : `/upload/${firstPhoto}`
               : "/upload/default.png";
     };

     return (
          <div className="shoplisting" onClick={handleNavigate}>
               <div className="shop">
                    <img src={getImageSrc()} alt={shoplisting.name} />
                    <div className="details">
                         <h2>{shoplisting.name}</h2>
                         <p className="type">{shoplisting.type || "No Type Provided"}</p>
                         {/* Favorite Button */}
                         <div className="favorite-btn" onClick={(e) => { handleFavoriteClick(e); }}>
                              {isFavorite ? (
                                   <FavoriteOutlinedIcon style={{ color: "red", width: "fit-content" }} />
                              ) : (
                                   <FavoriteBorderOutlinedIcon />
                              )}
                         </div>
                    </div>
               </div>
          </div>

     )
}

export default Shoplisting;