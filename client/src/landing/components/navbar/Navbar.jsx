import "./navbar.scss";
import React, { useState, useRef, useEffect, useContext } from 'react';
import { ModalContext } from "../../../context/ModalContext.js";
import Button from '@mui/material/Button';
import { Link } from "react-router-dom";
import { Drawer, IconButton, List, ListItem, ListItemText, useMediaQuery } from "@mui/material";
import { useTheme } from '@mui/material/styles';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import Login from "../../../auth/login/Login";
import Register from "../../../auth/register/Register";

const Navbar = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('768x'));
  const [drawerOpen, setDrawerOpen] = useState(false);
  // const [loginModalOpen, setLoginModalOpen] = useState(false);
  // const [registerModalOpen, setRegisterModalOpen] = useState(false);

  const { 
    loginModalOpen, 
    registerModalOpen, 
    toggleLoginModal, 
    toggleRegisterModal, 
    openRegisterFromLogin,
    openLoginFromRegister
  } = useContext(ModalContext);
  
  const drawerRef = useRef(null);
  
  const toggleDrawer = (open) => {
    setDrawerOpen(open);
  };
  const handleClickOutside = (e) => {
    if (drawerOpen && drawerRef.current && !drawerRef.current.contains(e.target)) {
      setDrawerOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [drawerOpen]);

  // const toggleLoginModal = () => {
  //   setLoginModalOpen((prev) => !prev);
  // };

  // const toggleRegisterModal = () => {
  //   setRegisterModalOpen((prev) => !prev);
  // };

  // const openRegisterFromLogin = () => {
  //   setLoginModalOpen(false);
  //   setRegisterModalOpen(true);
  // };
  
  // const openLoginFromRegister = () => {
  //   setRegisterModalOpen(false);
  //   setLoginModalOpen(true);
  // };

  const scrollToSection = (id) => {
    if (window.location.pathname === "/" || window.location.pathname === "/index.html") {
      // Scroll to the section within the current page if we are on the root path
      const section = document.getElementById(id);
      if (section) {
        section.scrollIntoView({ behavior: "smooth", block: "start" });
      }
      setDrawerOpen(false); // Close the drawer after scrolling
    } else {
      // Redirect to the root with the section anchor if we are not on the root path
      window.location.href = `${window.location.origin}/#${id}`;
    }
  };

  const menuItems = [
    { label: "Home", link: "/#home" },
    { label: "Gallery", link: "/#gallery" },
    { label: "Reviews", link: "/#review" },
    { label: "About Us", link: "/#aboutus" },
  ];

  const menuItems2 = [
    { label: "HomePage", link: "#home" },
    { label: "Gallery", link: "#gallery" },
    { label: "Reviews", link: "#review" },
    { label: "About Us", link: "#aboutus" },
  ];

  return (
    <div className="navbar">
      <div className="Left">
        <Link to="/" style={{ textDecoration: "none" }}>
          <span>I Like That Coffee</span>
        </Link>
      </div>

      <div className="center">
        {!isMobile && menuItems.map((item, index) => (
          <span
            key={index}
            className="nav-link"
            onClick={() => window.location.href = item.link}
          >
            {item.label}
          </span>
        ))}
      </div>

      <div className="right">
      <Button
        variant="contained"
        sx={{
          backgroundColor: '#fff',
          color: '#8B4513',
          transition: 'background-color 0.3s, color 0.3s',
          '&:hover': {
            backgroundColor: '#392d2d', // Slightly darker than #fff for a subtle inverse effect
            color: '#f0f0f0', // A slightly darker shade of the text color
          },
        }}
        onClick={toggleLoginModal}
      >
        Login
      </Button>

      <Button
        variant="outlined"
        sx={{
          borderColor: '#fff',
          color: '#fff',
          transition: 'background-color 0.3s, color 0.3s, border-color 0.3s',
          '&:hover': {
            backgroundColor: '#fff', // Fill in the background with white
            color: '#8B4513', // Darken the text color for contrast
            borderColor: '#8B4513', // Change the border to match the text color
          },
        }}
        onClick={toggleRegisterModal}
      >
        Register
      </Button>


        {isMobile && (
          <>
            <MenuIcon onClick={() => toggleDrawer(true)} className="menu-button"/>
            
            <div ref ={drawerRef} className={`drawer ${drawerOpen ? "open" : ""}`}>
              <div className="drawer-header">
                <h3>Menu</h3>
              </div>
              <List>
                {menuItems2.map((item, index) => (
                  item.link.startsWith("#") ? (
                    <ListItem 
                      button 
                      key={index} 
                      onClick={() => scrollToSection(item.link.substring(1))} // Remove "#" and scroll to section
                    >
                      <ListItemText primary={item.label} />
                    </ListItem>
                  ) : (
                    <ListItem 
                      button 
                      component={Link} 
                      to={item.link} 
                      key={index} 
                      onClick={() => toggleDrawer(false)}
                    >
                      <ListItemText primary={item.label} />
                    </ListItem>
                  )
                ))}
                </List>
            </div>
          </>
        )}
        {isTablet && (
          <>
            <MenuIcon onClick={() => toggleDrawer(true)} className="menu-button"/>
            
            <div ref ={drawerRef} className={`drawer ${drawerOpen ? "open" : ""}`}>
              <div className="drawer-header">
                <h3>Menu</h3>
              </div>
              <List>
              {menuItems2.map((item, index) => (
                  item.link.startsWith("#") ? (
                    <ListItem 
                      button 
                      key={index} 
                      onClick={() => scrollToSection(item.link.substring(1))} // Remove "#" and scroll to section
                    >
                      <ListItemText primary={item.label} />
                    </ListItem>
                  ) : (
                    <ListItem 
                      button 
                      component={Link} 
                      to={item.link} 
                      key={index} 
                      onClick={() => toggleDrawer(false)}
                    >
                      <ListItemText primary={item.label} />
                    </ListItem>
                  )
                ))}
              </List>
            </div>
          </>
        )}
      </div>

      {/* Login Modal */}
      {loginModalOpen && (
        <div className="login-modal" onClick={toggleLoginModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <IconButton className="close-btn" onClick={toggleLoginModal}>
              <CloseIcon />
            </IconButton>
            <Login toggleRegisterModal={openRegisterFromLogin} />
          </div>
        </div>
      )}

      {/* Register Modal */}
      {registerModalOpen && (
        <div className="login-modal" onClick={toggleRegisterModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <IconButton className="close-btn" onClick={toggleRegisterModal}>
              <CloseIcon />
            </IconButton>
            <Register toggleLoginModal={openLoginFromRegister} />
          </div>
        </div>
      )}
    </div>
  );
};

export default Navbar;
