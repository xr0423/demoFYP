import React, { useContext } from 'react';
import { Modal, Box, Button, Typography, Avatar, Chip } from '@mui/material';
import Carousel from 'react-material-ui-carousel';
import moment from 'moment';
import CoffeeIcon from '@mui/icons-material/Coffee';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import StoreIcon from '@mui/icons-material/Store';
import EventIcon from '@mui/icons-material/Event';
import { ModalContext } from "../../context/ModalContext";
import { useNavigate } from 'react-router-dom';

const AdvertisementModal = ({ adsData }) => {
  const { closeAdvertiseModal, advertiseModalOpen } = useContext(ModalContext);
  const navigate = useNavigate();

  const handleAdClick = (shopId) => {
    closeAdvertiseModal();
    navigate(`/user/shoplisting/${shopId}/overview`);
  };

  
  // Define an array of icons
  const icons = [
    <CoffeeIcon fontSize="large" />,
    <LocalOfferIcon fontSize="large" />,
    <StoreIcon fontSize="large" />,
    <EventIcon fontSize="large" />
  ];

  // Function to shuffle icons for each row
  const getRandomizedIcons = () => {
    const shuffledIcons = [...icons];
    for (let i = shuffledIcons.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledIcons[i], shuffledIcons[j]] = [shuffledIcons[j], shuffledIcons[i]];
    }
    return shuffledIcons;
  };

  return (
    <Modal open={advertiseModalOpen} onClose={closeAdvertiseModal}>
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '90%',
          maxWidth: 500,
          boxShadow: 24,
          borderRadius: 2,
          overflow: 'hidden',
          bgcolor: '#FAF3E0',
        }}
      >
        <Carousel autoPlay interval={3000} indicators={true}>
          {adsData.map((ad, index) => {
            const backgroundImage = ad.image
              ? `url(${ad.image.startsWith("http") ? ad.image : `/upload/${ad.image}`})`
              : ad.shop_img
                ? `url(${ad.shop_img.startsWith("http") ? ad.shop_img : `/upload/${ad.shop_img}`})`
                : null;

            return (
              <Box
                key={index}
                onClick={() => handleAdClick(ad.shop_id)}
                sx={{
                  position: 'relative',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  height: 400,
                  color: '#4A3F35',
                  cursor: 'pointer',
                  backgroundImage: backgroundImage ? backgroundImage : 'none',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  bgcolor: 'transparent',
                }}
              >
                {/* Icon Background Overlay */}
                {!backgroundImage && (
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      display: 'grid',
                      gridTemplateColumns: 'repeat(4, 1fr)',
                      gridTemplateRows: 'repeat(4, 1fr)',
                      opacity: 0.1, // Light opacity for subtle effect
                      zIndex: 0, // Behind content
                    }}
                  >
                    {Array.from({ length: 5 }).map((_, rowIndex) => (
                      getRandomizedIcons().map((IconComponent, colIndex) => (
                        <Box key={`${rowIndex}-${colIndex}`} sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                          {IconComponent}
                        </Box>
                      ))
                    ))}
                  </Box>
                )}

                {/* User and Timestamp */}
                <Box
                  sx={{
                    position: 'absolute',
                    top: 10,
                    left: 10,
                    display: 'flex',
                    alignItems: 'center',
                    zIndex: 2,
                    backgroundColor: 'rgba(250, 243, 224, 0.9)',
                    padding: '5px 10px',
                    borderRadius: '8px',
                  }}
                >
                  <Avatar
                    src={ad.profilePic ? `/upload/${ad.profilePic}` : '/upload/default-profile.png'}
                    alt={ad.username}
                    sx={{ width: 32, height: 32, mr: 1 }}
                  />
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                      {ad.username}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {moment(ad.createdAt).fromNow()}
                    </Typography>
                  </Box>
                </Box>

                {/* Category Tags */}
                <Box
                  sx={{
                    position: 'absolute',
                    top: 50,
                    right: 10,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1,
                    zIndex: 2,
                  }}
                >
                  {ad.categories.map((category, idx) => (
                    <Chip
                      key={idx}
                      label={category}
                      sx={{
                        bgcolor: '#8C6D40',
                        color: '#FAF3E0',
                        fontSize: '0.75rem',
                        fontWeight: 'bold',
                        borderRadius: '16px',
                        padding: '5px 10px',
                        cursor: 'pointer',
                      }}
                    />
                  ))}
                </Box>

                {/* Overlay with Shop Name and Description */}
                <Box
                  sx={{
                    position: 'absolute',
                    bottom: 0,
                    width: '100%',
                    bgcolor: 'rgba(74, 63, 53, 0.8)',
                    p: 2,
                    textAlign: 'center',
                  }}
                >
                  <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#FAF3E0', mb: 1 }}>
                    {ad.shop_name}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#EDE3D0', mb: 1 }}>
                    {ad.desc || 'Check out this amazing offer!'}
                  </Typography>
                </Box>
              </Box>
            );
          })}
        </Carousel>

        {/* Close Button */}
        <Button
          variant="contained"
          onClick={closeAdvertiseModal}
          sx={{
            position: 'absolute',
            top: 10,
            right: 10,
            zIndex: 3,
            bgcolor: '#FAF3E0',
            color: '#4A3F35',
            fontWeight: 'bold',
            minWidth: '32px',
            minHeight: '32px',
            borderRadius: '50%',
            '&:hover': {
              bgcolor: '#E0D1B8',
            },
          }}
        >
          X
        </Button>
      </Box>
    </Modal>
  );
};

export default AdvertisementModal;
