import "./navbar.scss";
import React, { useState, useRef, useEffect, useContext } from "react";
import {
  Menu as MenuIcon,
  StorefrontOutlined as StorefrontOutlinedIcon,
  MapOutlined as MapOutlinedIcon,
  SearchOutlined as SearchOutlinedIcon,
  PersonOutlined as PersonOutlinedIcon,
  NotificationsOutlined as NotificationsOutlinedIcon,
  Logout as LogoutIcon,
  RateReview as RateReviewIcon,
  Star as StarIcon,
  EventNote as EventNoteIcon,
  DashboardOutlined as DashboardOutlinedIcon,
} from "@mui/icons-material";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../../../context/authContext";
import { makeRequest } from "../../../axios";
import ReviewForm from "../../../component/review form/ReviewForm";
import NotificationDropdown from "../../../user/components/navbar/AllNotification";
import Upgrade from "../plan/Upgrade"

const Navbar = () => {
  const { currentUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const [isShopPanelOpen, setIsShopPanelOpen] = useState(false);
  const [isProfilePanelOpen, setIsProfilePanelOpen] = useState(false);
  const [openUpgrade, setOpenUpgrade] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [coinsBalance, setCoinsBalance] = useState(0);

  const shopPanelRef = useRef();
  const profilePanelRef = useRef();
  const toggleShopPanel = () => setIsShopPanelOpen((prev) => !prev);
  const toggleProfilePanel = () => setIsProfilePanelOpen((prev) => !prev);

  const toggleSearch = () => setIsSearchOpen((prev) => !prev);

  const handleReviewAppClick = () => setShowReviewForm(true);
  const handleCloseReviewForm = () => setShowReviewForm(false);

  const logout = async (e) => {
    localStorage.removeItem("user");
    e.preventDefault();
    await makeRequest.post("/auth/logout");
    navigate("/");
  };

  const fetchOwnerCoins = async () => {
    try {
      const coinsResponse = await makeRequest.get(`/users/coins`);
      setCoinsBalance(coinsResponse.data.coins);
    } catch (error) {
      console.error("Error fetching coins balance:", error);
    }
  };

  useEffect(() => {
    fetchOwnerCoins();
  }, [currentUser?.id]);

      const handleUpgradePlanModal = () => {
        setOpenUpgrade((prev) => !prev)
      }

      const handleUpgradeSuccess = () => {
        fetchOwnerCoins();
      };

  const handleClickOutside = (event) => {
    if (
      isShopPanelOpen &&
      shopPanelRef.current &&
      !shopPanelRef.current.contains(event.target)
    ) {
      setIsShopPanelOpen(false);
    }
    if (
      isProfilePanelOpen &&
      profilePanelRef.current &&
      !profilePanelRef.current.contains(event.target)
    ) {
      setIsProfilePanelOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isShopPanelOpen, isProfilePanelOpen]);

  return (
    <div className="navbar">
      <div className="left">
        <MenuIcon onClick={toggleShopPanel} className="drawer-icon" />
        <div
          ref={shopPanelRef}
          className={`drawer ${isShopPanelOpen ? "open" : ""}`}
        >
          <div className="drawer-header">
            <h3>Menu</h3>
          </div>
          <ul>
            <li onClick={() => navigate("/owner/dashboard")}>
              <DashboardOutlinedIcon /> Dashboard
            </li>
            <li onClick={() => navigate("/owner/shoplisting")}>
              <StorefrontOutlinedIcon /> My Shops
            </li>
            <li onClick={() => navigate("/owner/map")}>
              <MapOutlinedIcon /> Map
            </li>
          </ul>
        </div>
      </div>

      <div className="center">
        <li onClick={() => navigate("/owner")}>I Like That Coffee</li>
      </div>

      <div className="right">
      <div className="coin-balance-container">
        <span className="coin-balance-text"onClick={handleUpgradePlanModal}>Coins Balance: {coinsBalance}</span>
      </div>
        {openUpgrade && (
          <Upgrade open={openUpgrade} onClose={handleUpgradePlanModal} onUpgradeSuccess={handleUpgradeSuccess} />
        )}

        <div>
          <NotificationDropdown />
        </div>
        
        <div className="profile-icon" ref={profilePanelRef}>
          <PersonOutlinedIcon onClick={toggleProfilePanel} />
          {isProfilePanelOpen && (
            <div className="dropdown-panel profile-panel">
              <ul>
                <div
                  className="user"
                  onClick={() => navigate("/owner/profile/" + currentUser.id)}
                >
                  <img
                    src={
                      currentUser.profilePic
                        ? `/upload/${currentUser.profilePic}`
                        : "/upload/empty-profile-picture.jpg"
                    }
                    alt="Profile"
                  />
                  <span>{currentUser.name}</span>
                </div>
                <li onClick={handleReviewAppClick}>
                  <RateReviewIcon /> Review App
                </li>
                <li className="logoutBtn" onClick={logout}>
                  <LogoutIcon /> Logout
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>

      {showReviewForm && (
        <div className="owner-app-review-modal">
          <div className="owner-app-review-content">
            <ReviewForm onClose={handleCloseReviewForm} />
          </div>
        </div>
      )}
    </div>
  );
};

export default Navbar;
