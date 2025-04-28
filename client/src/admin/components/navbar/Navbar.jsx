import "./navbar.scss";
import React, { useState, useRef, useContext, useEffect } from "react";
import {
  DarkModeOutlined,
  WbSunnyOutlined,
  GridViewOutlined,
  EmailOutlined,
  PersonOutlined,
  StorefrontOutlined,
  Tune,
  ChatBubbleOutlineOutlined,
  Web,
  Logout,
  Menu as MenuIcon,
} from "@mui/icons-material";
import { Link, useNavigate } from "react-router-dom";
import { DarkModeContext } from "../../../context/darkModeContext";
import { AuthContext } from "../../../context/authContext";
import { useQuery } from "@tanstack/react-query";
import { makeRequest } from "../../../axios";

const Navbar = () => {
  const { toggle, darkMode } = useContext(DarkModeContext);
  const { currentUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const [profilePic, setProfilePic] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  const drawerRef = useRef();

  const { isLoading, data: user } = useQuery({
    queryKey: ["user", currentUser.id],
    queryFn: () =>
      makeRequest.get("/admin/profile?id=" + currentUser.id).then((res) => {
        setProfilePic('/upload/' + res.data.profilePic);
        return res.data;
      }),
  });

  const toggleDrawer = () => setIsDrawerOpen((prev) => !prev);
  const toggleProfileMenu = () => setProfileMenuOpen((prev) => !prev);

  const viewProfile = () => {
    navigate(`/admin/profile/${currentUser.id}`);
    toggleProfileMenu();
  };

  const logout = async (e) => {
    e.preventDefault();
    await makeRequest.post("/auth/logout");
    localStorage.removeItem("user");
    navigate("/");
  };

  // Close the drawer if clicked outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isDrawerOpen && drawerRef.current && !drawerRef.current.contains(event.target)) {
        setIsDrawerOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isDrawerOpen]);
  
  console.log(profilePic);

  return (
    <div className="navbar">
      {/* Left Section with Drawer Icon */}
      <div className="navbar-left">
        <MenuIcon onClick={toggleDrawer} className="drawer-icon" />
        {isDrawerOpen && (
          <div ref={drawerRef} className="drawer open">
            <div className="drawer-header">
              <h3>Admin Menu</h3>
            </div>
            <ul>
              <li onClick={() => navigate("/admin/users-management")}>
                <PersonOutlined fontSize="small" /> User Management
              </li>
              <li onClick={() => navigate("/admin/shoplistings-management")}>
                <StorefrontOutlined fontSize="small" /> Shoplisting Management
              </li>
              <li onClick={() => navigate("/admin/contactus")}>
                <ChatBubbleOutlineOutlined fontSize="small" /> Contact Us
              </li>
              <li onClick={() => navigate("/admin/variable-control")}>
                <Tune fontSize="small" /> Variables Settings
              </li>
              <li onClick={() => navigate("/admin/landing-control")}>
                <Web fontSize="small" /> Landing Page Settings
              </li>
            </ul>
          </div>
        )}
      </div>

      {/* Center Section */}
      <div className="center">
          <li onClick={() => navigate("/user")}>
            I Like That Coffee
          </li>
      </div>

      {/* Right Section */}
      <div className="navbar-right">
        <div className="message-icon">
          <EmailOutlined />
        </div>
        <div className="profile-icon" onClick={toggleProfileMenu}>
          <PersonOutlined />
        </div>

        {/* Profile Menu */}
        {profileMenuOpen && (
          <div className="profile-menu">
              <div className="profile-name">{currentUser.name}</div>
              <div className="profile-email">{currentUser.email}</div>
            <div className= "view-profile"onClick={viewProfile}>
            <img 
              className="admin-profile-photo" 
              src={profilePic ? `/upload/${user.profilePic}` : '/upload/empty-profile-picture.jpg'} alt="Profile" />
               &nbsp;&nbsp; Profile
            </div>
            <div className = "logoutBtn" onClick={logout}>
              <Logout/> Logout
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Navbar;
