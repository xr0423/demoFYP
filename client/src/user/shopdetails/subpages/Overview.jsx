import React from 'react';
import './Overview.scss'; // Import the SCSS file
import LocationOnIcon from '@mui/icons-material/LocationOn';
import LabelIcon from '@mui/icons-material/Label';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import DescriptionIcon from '@mui/icons-material/Description';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import LocalCafeIcon from '@mui/icons-material/LocalCafe';
import { useQuery } from '@tanstack/react-query';
import { makeRequest } from '../../../axios';

function Overview({ shopId, ownerDetails}) {
  const { isLoading, error, data } = useQuery({
    queryKey: ['shopdetails', shopId],
    queryFn: async () => {
      const res = await makeRequest.get(`/shoplistings/find/${shopId}`);
      return res.data;
    },
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error fetching shop details</div>;

  const shopData = data?.shopData;
  const servicesOffered = data?.servicesOffered || [];
  const deliveryOptions = data?.deliveryOptions || [];
  const closedDays = data?.closedDays || [];

  return (
    <div className="shop-overview-container">
      <h3>{shopData?.name || "No name available"}</h3>
      <div className="shop-details">
        {/* Shop Description */}
        <div className="shop-detail-item">
          <DescriptionIcon className='icon' />
          <div className="info">
            <strong>Description:</strong>
            <span>{shopData?.description || "No description available"}</span>
          </div>
        </div>

        {/* Shop Type */}
        <div className="shop-detail-item">
          <LabelIcon className="icon" />
          <div className='info'>
            <strong>Type:</strong>
            <span>{shopData?.type_name || "No type specified"}</span>
          </div>
        </div>

        {/* Location and Postal Code */}
        <div className="location-postal-container">
          <LocationOnIcon className="icon" />
          <div className="location-postal-details">
            <div className="info">
              <strong>Location:</strong>
              <span>{shopData?.location || "Location not provided"}</span>
            </div>
            <div className="info">
              <strong>Postal Code:</strong>
              <span>{shopData?.postal_code || "Postal code not provided"}</span>
            </div>
          </div>
        </div>

        {/* Closed On */}
        <div className="shop-detail-item">
          <CalendarTodayIcon className="icon" />
          <div className='info'>
            <strong>Closed On:</strong>
            <span>{closedDays.length > 0 ? closedDays.join(', ') : "No closed days provided"}</span>
          </div>
        </div>

        {/* Date Established */}
        <div className="shop-detail-item">
          <CalendarTodayIcon className="icon" />
          <div className='info'>
            <strong>Date Established:</strong>
            <span>{shopData?.date_established ? new Date(shopData.date_established).toLocaleDateString() : "No date available"}</span>
          </div>
        </div>

        {/* License Number */}
        <div className="shop-detail-item">
          <LabelIcon className="icon" />
          <div className='info'>
            <strong>License Number:</strong>
            <span>{shopData?.license_number || "No license number available"}</span>
          </div>
        </div>

        {/* Services Offered */}
        <div className="shop-detail-item">
          <LocalCafeIcon className="icon" />
          <div className='info'>
            <strong>Services Offered:</strong>
            <span>{servicesOffered.length > 0 ? servicesOffered.join(', ') : "No services offered"}</span>
          </div>
        </div>
        {/* Delivery Options */}
        <div className="shop-detail-item">
          <LocalShippingIcon className="icon" />
          <div className='info'>
            <strong>Delivery Options:</strong>
            <span>{deliveryOptions.length > 0 ? deliveryOptions.join(', ') : "No delivery options available"}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Overview;
