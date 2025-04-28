import "./navbar.scss";
import React, { useState, useRef, useEffect, useContext } from "react";
import {
  Menu as MenuIcon,
  SearchOutlined as SearchOutlinedIcon,
  PersonOutlined as PersonOutlinedIcon,
  Group as GroupIcon,
  Store as StoreIcon,
  Favorite as FavoriteIcon,
  EventNote as EventNoteIcon,
  Handshake as HandshakeIcon,
  Description as DescriptionIcon,
  MapOutlined as MapOutlinedIcon,
  NotificationsOutlined as NotificationsOutlinedIcon,
  Logout as LogoutIcon,
  Star as StarIcon,
  RateReview as RateReviewIcon,
  Article as ArticleIcon,
} from "@mui/icons-material";
import { Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { AuthContext } from "../../../context/authContext";
import { makeRequest } from "../../../axios";
import ReviewForm from "../../../component/review form/ReviewForm";
import NotificationDropdown from "./AllNotification";

import { ModalContext } from "../../../context/ModalContext";
import AdvertisementModal from "../../../component/AdvertisementModal/AdvertisementModal";

const Navbar = () => {
  const { currentUser } = useContext(AuthContext);
  const { advertiseModalOpen, closeAdvertiseModal, setAdvertiseModalOpen } = useContext(ModalContext);
  const navigate = useNavigate();
  const [adsData, setAdsData] = useState([]);

  const [isUserPanelOpen, setIsUserPanelOpen] = useState(false);
  const [isProfilePanelOpen, setIsProfilePanelOpen] = useState(false);
  const [isNotificationPanelOpen, setIsNotificationPanelOpen] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);

  const userPanelRef = useRef(null);
  const profilePanelRef = useRef(null);
  const notificationPanelRef = useRef(null);

  const userId = parseInt(currentUser.id);

  const { data, isLoading, error } = useQuery({
    queryKey: ["user", userId],
    queryFn: () => makeRequest.get(`/users/find/${userId}`).then((res) => res.data),
  });

  // get advertisements and check if user has expired subscription from local storage

  const toggleUserPanel = () => setIsUserPanelOpen((prev) => !prev);
  const toggleProfilePanel = () => setIsProfilePanelOpen((prev) => !prev);
  const toggleNotificationPanel = () => setIsNotificationPanelOpen((prev) => !prev);

  const handleReviewAppClick = () => setShowReviewForm(true);
  const handleCloseReviewForm = () => setShowReviewForm(false);

  const logout = async (e) => {
    localStorage.removeItem("user");
    localStorage.removeItem("showAdvertisement")
    setAdvertiseModalOpen(true);
    e.preventDefault();
    await makeRequest.post("/auth/logout");
    navigate("/");
  };

  const handleClickOutside = (e) => {
    if (isUserPanelOpen && userPanelRef.current && !userPanelRef.current.contains(e.target)) {
      setIsUserPanelOpen(false);
    }
    if (isProfilePanelOpen && profilePanelRef.current && !profilePanelRef.current.contains(e.target)) {
      setIsProfilePanelOpen(false);
    }
    if (isNotificationPanelOpen && notificationPanelRef.current && !notificationPanelRef.current.contains(e.target)) {
      setIsNotificationPanelOpen(false);
    }
  };


  const fetchAdvertisements = async () => {
    setAdvertiseModalOpen((localStorage.getItem("showAdvertisement") === "true"));
    console.log(currentUser.isExpired + " - " + advertiseModalOpen);
    
    // Check if the subscription is expired
    console.log("test")
    if (currentUser.isExpired && advertiseModalOpen) {
      try {
        const response = await makeRequest.get(`/advertise/posts`);
        if (response.data.length > 0) {
          setAdsData(response.data);
        } else {
          closeAdvertiseModal();
          console.log("no showing ads as no ads is fetched")
        }
      } catch (error) {
        closeAdvertiseModal();
        console.log("no showing ads as error occurred while fetching ads: ", error);
        return;
      }
    } else {
      closeAdvertiseModal();
      console.log("no showing ads as the subscription is not expired or no ads are available.");
      return;
    }


  }

  useEffect(() => {
      fetchAdvertisements();
  }, []);

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isUserPanelOpen, isProfilePanelOpen, isNotificationPanelOpen]);

  return (
    <div className="navbar">
      <div className="left">
        <MenuIcon onClick={toggleUserPanel} className="drawer-icon" />
        <div ref={userPanelRef} className={`drawer ${isUserPanelOpen ? "open" : ""}`}>
          <div className="drawer-header">
            <h3>Menu</h3>
          </div>
          <ul>
            <li onClick={() => navigate("/user")}><DescriptionIcon /> Posts</li>
            <li onClick={() => navigate("/user/viewarticles")}><ArticleIcon /> Articles</li>
            <li onClick={() => navigate("/user/shoplisting")}><StoreIcon /> Shops</li>
            <li onClick={() => navigate("/user/map")}><MapOutlinedIcon /> Map</li>
            <li onClick={() => navigate("/user/events")}><EventNoteIcon /> Events</li>
            <li onClick={() => navigate("/user/meetup")}><HandshakeIcon /> Social </li>
            <li onClick={() => navigate("/user/favorites")}><FavoriteIcon /> Favorites</li>
            <li onClick={() => navigate("/user/friends")}><GroupIcon /> Friends</li>
          </ul>
        </div>
      </div>

      <div className="center">
        <li onClick={() => navigate("/user")}>I Like That Coffee</li>
      </div>

      <div className="right">
        <NotificationDropdown />

        {/* Profile Icon */}
        <div className="profile-icon" ref={profilePanelRef}>
          <PersonOutlinedIcon onClick={toggleProfilePanel} className="profile-icon" />
          {isProfilePanelOpen && (
            <div className="dropdown-panel profile-panel">
              <ul>
                <div className="user" onClick={() => navigate("/user/profile/" + currentUser.id)}>
                  <img
                    src={data.profilePic ? `/upload/${data.profilePic}` : '/upload/empty-profile-picture.jpg'}
                    alt="Cover"
                    className="profile-photo"
                  />
                  <span>{currentUser.name}</span>
                </div>
                <li onClick={() => navigate(`/user/myRewards`)}><StarIcon /> My Rewards</li>
                <li onClick={handleReviewAppClick}><RateReviewIcon /> Review App</li>
                <li className="logoutBtn" onClick={logout}><LogoutIcon /> Logout</li>
              </ul>
            </div>
          )}
        </div>
      </div>

      {showReviewForm && (
        <div className="user-app-reviewmodal">
          <div className="user-app-review-content">
            <button className="close-modal" onClick={handleCloseReviewForm}>X</button>
            <ReviewForm onClose={handleCloseReviewForm} />
          </div>
        </div>
      )}

      {advertiseModalOpen && (
        <div className="advertise-modal">
          <div className="advertise-modal-content">
            <AdvertisementModal adsData={adsData} />
          </div>
        </div>
      )}
    </div>
  );
};

export default Navbar;
