import React, { useState, useEffect } from 'react';
import { Link, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { IconButton, Tabs, Tab, Box } from '@mui/material';
import Overview from './subpages/Overview';
import Events from './subpages/Events';
import UserMenuItem from './subpages/MenuItem';
import ShopReview from './subpages/ShopReview'; // Import the ShopReview subpage
import './UserShopDetails.scss';
import Gallery from './subpages/Gallery';
import Rewards from './subpages/Rewards';
function UserShopDetails() {
  const location = useLocation();
  const shopId = parseInt(location.pathname.split("/")[3]);
  const shopBasePath = `/user/shoplisting/${shopId}`;
  const [tabValue, setTabValue] = useState(0);
  const navigate = useNavigate();

  const backToListings = () => {
    navigate("/owner/shoplisting");
  };

  useEffect(() => {
    switch (location.pathname) {
      case `${shopBasePath}/overview`:
        setTabValue(0);
        break;
      case `${shopBasePath}/events`:
        setTabValue(1);
        break;
      case `${shopBasePath}/menuitems`:
        setTabValue(2);
        break;
      case `${shopBasePath}/gallery`:
        setTabValue(3);
        break;
      case `${shopBasePath}/shopreviews`:
        setTabValue(4);
        break;
      case `${shopBasePath}/rewards`:
         setTabValue(5);
        break;
      default:
        setTabValue(0);
    }
  }, [location.pathname, shopBasePath]);

  return (
    <div className="user-shop-details-container">
      <div className='header-container'>
        <IconButton onClick={backToListings}>
          <ArrowBackIcon />
        </IconButton>
        <h2>Shop Details</h2>
      </div>
      <Box className="shop-navbar">
        <Tabs value={tabValue} 
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label="Overview" component={Link} to={`${shopBasePath}/overview`} />
          <Tab label="Events" component={Link} to={`${shopBasePath}/events`} />
          <Tab label="Menu Items" component={Link} to={`${shopBasePath}/menuitems`} />
          <Tab label="Gallery" component={Link} to={`${shopBasePath}/gallery`}/>
          <Tab label="Reviews" component={Link} to={`${shopBasePath}/shopreviews`} />
          <Tab label="Rewards" component={Link} to={`${shopBasePath}/rewards`} />
        </Tabs >
      </Box >

    <div className="shop-content">
      <Routes>
        <Route path={`/overview`} element={<Overview shopId={shopId} />} />
        <Route path={`/events`} element={<Events shopId={shopId} />} />
        <Route path={`/menuitems`} element={<UserMenuItem shopId={shopId} />} />
        <Route path={'/gallery'} element ={<Gallery shopId = {shopId}/>} />
        <Route path={`/shopreviews`} element={<ShopReview shopId={shopId} />} />
        <Route path={`/rewards`} element={<Rewards shopId={shopId} />} />
      </Routes >
      </div >
    </div >
  );
}

export default UserShopDetails;
