import React, { useEffect, useState} from 'react';
import './overview.scss'; // Import the SCSS file
import LocationOnIcon from '@mui/icons-material/LocationOn';
import LabelIcon from '@mui/icons-material/Label';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import DescriptionIcon from '@mui/icons-material/Description';
import { IconButton} from '@mui/material';
import AddIcon from "@mui/icons-material/Add";
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import LocalCafeIcon from '@mui/icons-material/LocalCafe'; // Icon for services
import CreateMeetupForm from '../../../../user/components/createMeetupForm/CreateMeetupForm';
import { useQuery } from '@tanstack/react-query';
import { makeRequest } from '../../../../axios';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../../../context/authContext';
import { useContext } from 'react';


function Overview({ shopId, setShopName, ownerDetails }) {
    const [showCreateForm, setShowCreateForm] = useState(false);
    const { isLoading, error, data } = useQuery({
        queryKey: ['shopdetails', shopId],
        queryFn: async () => {
            const res = await makeRequest.get(`shoplistings/find/${shopId}`);
            return res.data;
        },
    });

    const navigate = useNavigate();
    const { currentUser } = useContext(AuthContext); 
    
    const handleCreateClick = () => {
        setShowCreateForm(true);
      };
    const closeModal = () => {
        setShowCreateForm(false);
    };
    const handleOwnerClick = () => {
        if (ownerDetails?.id) {
            console.log(currentUser.type);
            switch (currentUser.type) {
                case "admin":
                  navigate(`/admin/check-user-profile/profile/${ownerDetails.id}`); // Navigate to admin's view of the owner's profile
                  break;
                case "expert":
                  navigate(`/expert/profile/${ownerDetails.id}`); // Navigate to expert's view
                  break;
                case "owner":
                  navigate(`/owner/profile/${ownerDetails.id}`); // Navigate to owner's view
                  break;
                case "regular":
                  navigate(`/user/profile/${ownerDetails.id}`); // Navigate to user's view
                  break;
                default:
                  console.warn("Unknown user type. Navigation aborted.");
              }
        }
      };
    
    // Update shop name in the parent component when data is fetched
    useEffect(() => {
        if (data?.shopData?.name) {
            setShopName(data.shopData.name);
        }
    }, [data, setShopName]);

    if (isLoading) return <div>Loading...</div>;
    if (error) return <div>Error fetching shop details</div>;

    const shopData = data?.shopData || {};
    const servicesOffered = data?.servicesOffered || [];
    const deliveryOptions = data?.deliveryOptions || [];
    const closedDays = data?.closedDays || [];

    return (
        <div className="shop-overview-container">
            {currentUser?.type === "regular" && (
                <IconButton className="create-meetup-button" onClick={handleCreateClick}>
                    <AddIcon /> Create Meetup
                </IconButton>
            )}
            <h3>{shopData?.name || "No name available"}</h3>
            {ownerDetails?.name ? (
                <>
                {" "}
                by{" "}
                <u
                    onClick={handleOwnerClick}
                    style={{ cursor: "pointer", textDecoration: "underline", color: "brown" }}
                >
                    {ownerDetails.name}
                </u>
                </>
            ) : (
                " (Owner information not available)"
            )}
            <div className="shop-details">
                {/* Shop Description */}
                <div className="shop-detail-item">
                    <DescriptionIcon className="icon" />
                    <div className="info">
                        <strong>Description:</strong>
                        <span>{shopData.description || 'No description available'}</span>
                    </div>
                </div>

                {/* Shop Type */}
                <div className="shop-detail-item">
                    <LabelIcon className="icon" />
                    <div className="info">
                        <strong>Type:</strong>
                        <span>{shopData.type || 'No type specified'}</span>
                    </div>
                </div>

                {/* Location and Postal Code */}
                <div className="location-postal-container">
                    <LocationOnIcon className="icon" />
                    <div className="location-postal-details">
                        <div className="info">
                            <strong>Location:</strong>
                            <span>{shopData.location || 'Location not provided'}</span>
                        </div>
                        <div className="info">
                            <strong>Postal Code:</strong>
                            <span>{shopData.postal_code || 'Postal code not provided'}</span>
                        </div>
                    </div>
                </div>

                {/* Closed On */}
                <div className="shop-detail-item">
                    <CalendarTodayIcon className="icon" />
                    <div className="info">
                        <strong>Closed On:</strong>
                        <span>{closedDays.length > 0 ? closedDays.join(', ') : 'No closed days provided'}</span>
                    </div>
                </div>

                {/* Date Established */}
                <div className="shop-detail-item">
                    <CalendarTodayIcon className="icon" />
                    <div className="info">
                        <strong>Date Established:</strong>
                        <span>
                            {shopData.date_established
                                ? new Date(shopData.date_established).toLocaleDateString()
                                : 'No date available'}
                        </span>
                    </div>
                </div>

                {/* License Number */}
                <div className="shop-detail-item">
                    <LabelIcon className="icon" />
                    <div className="info">
                        <strong>License Number:</strong>
                        <span>{shopData.license_number || 'No license number available'}</span>
                    </div>
                </div>

                {/* Services Offered */}
                <div className="shop-detail-item">
                    <LocalCafeIcon className="icon" />
                    <div className="info">
                        <strong>Services Offered:</strong>
                        <span>{servicesOffered.length > 0 ? servicesOffered.join(', ') : 'No services offered'}</span>
                    </div>
                </div>

                {/* Delivery Options */}
                <div className="shop-detail-item">
                    <LocalShippingIcon className="icon" />
                    <div className="info">
                        <strong>Delivery Options:</strong>
                        <span>{deliveryOptions.length > 0 ? deliveryOptions.join(', ') : 'No delivery options available'}</span>
                    </div>
                </div>
            </div>
            

            {/* Top-Centered Modal for Meetup Form */}
            {showCreateForm && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <CreateMeetupForm onClose={closeModal} shop={shopData.shop_id}/>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Overview;
