import "./navbar.scss";
import React, { useState, useRef, useEffect, useContext } from 'react';
import MenuIcon from '@mui/icons-material/Menu';
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";
import NotificationsOutlinedIcon  from "@mui/icons-material/NotificationsOutlined";
import CoffeeIcon from '@mui/icons-material/Coffee';
import EventNoteIcon from '@mui/icons-material/EventNote';
import DescriptionIcon from '@mui/icons-material/Description';
import FavoriteIcon from '@mui/icons-material/Favorite';
import MapOutlinedIcon from "@mui/icons-material/MapOutlined";
import RateReviewIcon from '@mui/icons-material/RateReview';
import LogoutIcon from '@mui/icons-material/Logout';
import HomeIcon from '@mui/icons-material/Home';
import StarIcon from '@mui/icons-material/Star';
import {Handshake as HandshakeIcon} from "@mui/icons-material";
import {
  Group as GroupIcon,
} from "@mui/icons-material";

import ReviewForm from "../../../component/review form/ReviewForm";

import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../../../context/authContext";
import { makeRequest } from "../../../axios";
import NotificationDropdown from "../../../user/components/navbar/AllNotification";

const Navbar = () => {
  const { currentUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isExpertPanelOpen, setIsExpertPanelOpen] = useState(false);
  const [isProfilePanelOpen, setIsProfilePanelOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  
  
  const expertPanelRef = useRef(null);
  const profilePanelRef = useRef(null);
  const notificationPanelRef = useRef();

  const toggleExpertPanel = () => setIsExpertPanelOpen(prev => !prev);
  const toggleProfilePanel = () => setIsProfilePanelOpen(prev => !prev);

  const toggleSearch = () => setIsSearchOpen(prev => !prev);

  const handleReviewAppClick = () => {
    setShowReviewForm(true);
  };

  const handleCloseReviewForm = () => {
    setShowReviewForm(false);
  };

  const logout = async (e) => {
    localStorage.removeItem('user');
    e.preventDefault();
    makeRequest.post("/auth/logout");
    navigate("/");
  };


  const handleClickOutside = (e) => {
    // Close expert panel if clicked outside
    if (isExpertPanelOpen && expertPanelRef.current && !expertPanelRef.current.contains(e.target)) {
      setIsExpertPanelOpen(false);
    }
    // Close profile panel if clicked outside
    if (isProfilePanelOpen && profilePanelRef.current && !profilePanelRef.current.contains(e.target)) {
      setIsProfilePanelOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isExpertPanelOpen, isProfilePanelOpen]);

  return (
    <div className="navbar">
      <div className="left">
        <MenuIcon onClick={toggleExpertPanel} className="drawer-icon" />
        <div ref={expertPanelRef} className={`drawer ${isExpertPanelOpen ? "open" : ""}`}>
          <div className="drawer-header">
            <h3>Menu</h3>
          </div>
          <ul>
          <li onClick={() => navigate("/expert/")}><HomeIcon /> Home</li>
          <li onClick={() => navigate("/expert/articlestab")}><DescriptionIcon /> Articles</li>
            <li onClick={() => navigate("/expert/coffeeshops")}><CoffeeIcon /> Shops</li>
            <li onClick={() => navigate("/expert/map")}><MapOutlinedIcon /> Map</li>
            <li onClick={() => navigate("/expert/events")}><EventNoteIcon /> Events</li>
            <li onClick={() => navigate("/expert/meetup")}><HandshakeIcon /> Social </li>
            <li onClick={() => navigate("/expert/favorites")}><FavoriteIcon /> Favorites</li>
            <li onClick={() => navigate("/expert/friends")}><GroupIcon /> Friends</li>
          </ul>
        </div>
      </div>

      <div className="center">
        <li onClick={() => navigate("/expert")}>
          I Like That Coffee
        </li>
      </div>

      <div className="right">
        <NotificationDropdown />

        <div className="profile-icon" ref={profilePanelRef}>
          <PersonOutlinedIcon onClick={toggleProfilePanel} />
          {isProfilePanelOpen && (
          <div ref={profilePanelRef} className="dropdown-panel profile-panel">
            <ul>
              <div className="user" onClick={() => navigate('/expert/profile/' + currentUser.id)}>
              <img src={currentUser.profilePic ? `/upload/${currentUser.profilePic}` : '/upload/empty-profile-picture.jpg'}  alt="Profile" />
                <span>{currentUser.name}</span>
              </div>
              <li onClick={() => navigate(`/expert/myRewards`)}><StarIcon /> My Rewards</li>
              <li onClick={handleReviewAppClick}><RateReviewIcon /> Review App</li>
              <li className="logoutBtn" onClick={logout}><LogoutIcon /> Logout</li>
            </ul>
          </div>
          
        )}
      </div>
    </div>

      {showReviewForm && (
        <div className="expert-app-review-modal">
          <div className="expert-app-review-content">
            <button className="close-modal" onClick={handleCloseReviewForm}>X</button>
            <ReviewForm onClose={handleCloseReviewForm} />
          </div>
        </div>
      )}
    </div>
  );
};

export default Navbar;
