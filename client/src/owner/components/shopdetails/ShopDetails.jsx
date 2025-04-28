import { useContext, useState, useEffect } from 'react';
import './shopdetails.scss';
import { Link, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../../context/authContext';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { IconButton, Tabs, Tab, Box } from '@mui/material';
import Overview from './subpages/Overview';
import Events from './subpages/Events';
import MenuItem from './subpages/MenuItem';
import ShopReview from './subpages/ShopReview';
import ShopHome from './subpages/ShopHome'; // Import the new Posts component
import CreateMenuItem from '../createMenuItem/CreateMenuItem';
import UpdateMenuItem from '../updateMenuItem/UpdateMenuItem';
import Gallery from './subpages/Gallery';
import UploadGallery from '../uploadGallery/UploadGallery';
import Rewards from './subpages/Rewards';
import { useQuery } from '@tanstack/react-query';
import { makeRequest } from '../../../axios';

function ShopDetails() {
    const { currentUser } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();
    const shopId = parseInt(location.pathname.split('/')[3]);
    const [ownerDetails, setOwnerDetails] = useState(null);

    const shopBasePath = location.pathname.split('/').slice(0, -1).join('/');

    const backToListings = () => {
        const userType = currentUser?.type;

        switch (userType) {
            case 'admin':
                navigate('/admin/shoplistings-management');
                break;
            case 'owner':
                navigate('/owner/shoplisting');
                break;
            case 'expert':
                navigate('/expert/coffeeshops');
                break;
            case 'regular':
            default:
                navigate('/user/shoplisting');
                break;
        }
    };

    const [showCreateMenuItemForm, setShowCreateMenuItemForm] = useState(false);
    const [showUpdateMenuItemForm, setShowUpdateMenuItemForm] = useState(false);
    const [selectedMenuItemId, setSelectedMenuItemId] = useState(null);
    const [showUploadGalleryForm, setShowUploadGalleryForm] = useState(false);
    const [shopName, setShopName] = useState('');

    const handleCreateMenuItemForm = () => {
        setShowCreateMenuItemForm((prev) => !prev);
    };

    const handleUpdateMenuItemForm = () => {
        setShowUpdateMenuItemForm((prev) => !prev);
    };

    const handleUploadGalleryForm = () => {
        setShowUploadGalleryForm((prev) => !prev);
    };

    const [tabValue, setTabValue] = useState(0);

    useEffect(() => {
        switch (location.pathname) {
            case `${shopBasePath}/overview`:
                setTabValue(0);
                break;
            case `${shopBasePath}/posts`: // New Posts tab logic
                setTabValue(1);
                break;
            case `${shopBasePath}/events`:
                setTabValue(2);
                break;
            case `${shopBasePath}/menuitems`:
                setTabValue(3);
                break;
            case `${shopBasePath}/gallery`:
                setTabValue(4);
                break;
            case `${shopBasePath}/shopreviews`:
                setTabValue(5);
                break;
            case `${shopBasePath}/rewards`:
                setTabValue(6);
                break;
            default:
                setTabValue(0);
        }
    }, [location.pathname, shopBasePath]);

    const { data, isLoading, error } = useQuery({
        queryKey: ['ownerDetails', shopId],
        queryFn: () =>
            makeRequest
                .get(`/shoplistings/getOwner?shopId=${shopId}`)
                .then((res) => res.data),
        enabled: !!shopId,
    });

    useEffect(() => {
        if (data) {
            setOwnerDetails(data);
        }
    }, [data]);

    if (isLoading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error loading owner details</div>;
    }

    return (
        <div className="shop-details-container">
            <div className="header-container">
                <IconButton onClick={backToListings}>
                    <ArrowBackIcon />
                </IconButton>
                <h2>{shopName || 'Shop Details'}</h2>
            </div>

            <Box className="shop-navbar">
                <Tabs value={tabValue} variant="scrollable" scrollButtons="auto">
                    <Tab label="Overview" component={Link} to={`${shopBasePath}/overview`} />
                    <Tab label="Posts" component={Link} to={`${shopBasePath}/posts`} />
                    <Tab label="Events" component={Link} to={`${shopBasePath}/events`} />
                    <Tab label="Menu Items" component={Link} to={`${shopBasePath}/menuitems`} />
                    <Tab label="Gallery" component={Link} to={`${shopBasePath}/gallery`} />
                    <Tab label="Reviews" component={Link} to={`${shopBasePath}/shopreviews`} />
                    <Tab label="Rewards" component={Link} to={`${shopBasePath}/rewards`} />
                </Tabs>
            </Box>

            <div className="shop-content">
                <Routes>
                    <Route
                        path={`/overview`}
                        element={<Overview shopId={shopId} setShopName={setShopName} ownerDetails={ownerDetails} />}
                    />
                    <Route
                        path={`/posts`}
                        element={<ShopHome shopId={shopId} ownerDetails={ownerDetails} />} // New Posts Route
                    />
                    <Route path={`/events`} element={<Events shopId={shopId} ownerDetails={ownerDetails} />} />
                    <Route
                        path={`/menuitems`}
                        element={
                            <MenuItem
                                shopId={shopId}
                                handleCreateForm={handleCreateMenuItemForm}
                                createFormStatus={showCreateMenuItemForm}
                                handleUpdateForm={handleUpdateMenuItemForm}
                                updateFormStatus={showUpdateMenuItemForm}
                                setSelectedMenuItemId={setSelectedMenuItemId}
                                ownerDetails={ownerDetails}
                            />
                        }
                    />
                    <Route path={`/gallery`} element={<Gallery shopId={shopId} ownerDetails={ownerDetails} />} />
                    <Route path={`/shopreviews`} element={<ShopReview shopId={shopId} ownerDetails={ownerDetails} />} />
                    <Route path={`/rewards`} element={<Rewards shopId={shopId} ownerDetails={ownerDetails} />} />
                </Routes>
            </div>

            {showCreateMenuItemForm && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <CreateMenuItem onClose={handleCreateMenuItemForm} shopId={shopId} ownerDetails={ownerDetails} />
                    </div>
                </div>
            )}

            {showUpdateMenuItemForm && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <UpdateMenuItem onClose={handleUpdateMenuItemForm} item_id={selectedMenuItemId} ownerDetails={ownerDetails} />
                    </div>
                </div>
            )}

            {showUploadGalleryForm && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <UploadGallery onClose={handleUploadGalleryForm} shopId={shopId} ownerDetails={ownerDetails} />
                    </div>
                </div>
            )}
        </div>
    );
}

export default ShopDetails;
