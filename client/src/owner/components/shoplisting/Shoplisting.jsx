import React, { useContext, useState } from 'react';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import StarIcon from "@mui/icons-material/Star";
import { useNavigate } from 'react-router-dom';
import './shoplisting.scss';
import { makeRequest } from '../../../axios';
import { IconButton, Rating, Modal, Box, Typography, Button, Snackbar, Alert } from "@mui/material";
import { QueryClient, useMutation, useQueryClient } from '@tanstack/react-query';
import { AuthContext } from '../../../context/authContext';

function Shoplisting({ shoplisting, onDelete, onEdit, access, onSnackbar  }) {
    const navigate = useNavigate();
    const queryClient = useQueryClient(); 
    const [featureLoading, setFeatureLoading] = useState(false);
    const [isModalOpen, setModalOpen] = useState(false);
    const [isConfirmModalOpen, setConfirmModalOpen] = useState(false); // New state for delete confirmation modal
    const [modalMessage, setModalMessage] = useState('');
    const {currentUser} = useContext(AuthContext);

    const handleToggle = () => {
        switch (currentUser.type) {
            case "owner":
              navigate(`/owner/shoplisting/${shoplisting.shop_id}/overview`);
              break;
            case "regular":
              navigate(`/user/shoplisting/${shoplisting.shop_id}/overview`);
              break;
            case "admin":
              navigate(`/admin/shoplisting/${shoplisting.shop_id}/overview`);
              break;
            case "expert":
              navigate(`/expert/shoplisting/${shoplisting.shop_id}/overview`);
              break;
            default:
              console.error("Invalid user type");
          }
    };

const deleteMutation = useMutation({
    mutationFn: (id) => {
        return makeRequest.delete(`/shoplistings/delete/${id}`);
    },
    onSuccess: () => {
        onSnackbar('Shop deleted successfully.', 'success');
        queryClient.invalidateQueries(["shoplistings"]);
    },
    onError: (err) => {
        onSnackbar(err.response.data || 'An error occurred.', 'error');
    }
})

    const handleDeleteShop = async (id) => {
        deleteMutation.mutate(id)
    };

// Mutation to update the "featured" status of a shop
const toggleFeatureStatus = useMutation({
    mutationFn: ({ shop_id, action, currentExpireDate }) => {
        return makeRequest.put(`/shoplistings/feature/${shop_id}`, {
            action,
            currentExpireDate: action === 'extend' ? currentExpireDate : undefined,
        });
    },
    onSuccess: () => {
        setFeatureLoading(false);
        queryClient.invalidateQueries(["shoplistings"]);
        onSnackbar('Action completed successfully.', 'success');
    },
    onError: (err) => {
        onSnackbar(err.response.data || 'An error occurred.', 'error');
    }
});

const handleFeatureToggle = (shoplisting) => {
    if (shoplisting.is_featured) {
        setModalMessage(`This shop has been featured and will end on ${shoplisting.featured_expire_date}.`);
        setModalOpen(true);
    } else {
        setConfirmModalOpen(true); // Open the modal for feature confirmation
    }
};

    const handleUnfeature = () => {
        toggleFeatureStatus.mutate({ shop_id: shoplisting.shop_id, action: 'unfeature' });
        setModalOpen(false);
    };

    const handleExtend = () => {
        toggleFeatureStatus.mutate({
            shop_id: shoplisting.shop_id,
            action: 'extend',
            currentExpireDate: shoplisting.featured_expire_date,
        });
        setModalOpen(false);
    };

    const handleFeature = () => {
        toggleFeatureStatus.mutate({ shop_id: shoplisting.shop_id, action: 'feature' });
        setConfirmModalOpen(false);
    };


    const handleCloseModal = () => {
        setModalOpen(false);
        setConfirmModalOpen(false);
    };

    // Function to validate if the image is a full URL or needs a prefix
    const getImageSrc = () => {
        const photo = shoplisting.img;
        if (photo) {
            // If it starts with http or https, it's a full URL
            if (photo.startsWith('http') || photo.startsWith('https')) {
                return photo;
            } else {
                // Otherwise, prepend '/upload/' to the filename
                return `/upload/${photo}`;
            }
        }
        // Default image if no photo is available
        return '/upload/default.png';
    };

    // Conditional rendering for no shop message
    if (!shoplisting || Object.keys(shoplisting).length === 0) {
        return (
            <div className="no-shop-message">
                <p>No shop listings found. Please create a shop.</p>
                <button onClick={() => navigate('/owner/shoplisting/create')}>Create Shop</button>
            </div>
        );
    }

    return (
        <div className="shoplisting">
            <div className="shop" onClick={handleToggle}>
                <img
                    src={getImageSrc()}
                    alt={shoplisting.name}
                />
                <div className="detailsbutton">
                    <div className="details">
                        <h2>{shoplisting.name}</h2>
                        <p className="type">{shoplisting.type || 'No Type Provided'}</p>
                        {access === true && (
                            <p className="status">{shoplisting.status || 'No Status'}</p>
                        )}
                    </div>

                    {access === true ? (
                        <div className="buttons">
                            {shoplisting.status !== "pending" && (
                                <>
                                    <IconButton
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onEdit();
                                        }}
                                        className="editBtn"
                                    >
                                        <EditIcon />
                                    </IconButton>
                                    <IconButton
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleFeatureToggle(shoplisting);
                                        }}
                                        className="featureBtn"
                                    >
                                        <StarIcon />
                                    </IconButton>
                                </>
                            )}
                            <IconButton
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteShop(shoplisting.shop_id);
                                }}
                                className="cancelBtn"
                            >
                                <DeleteIcon />
                            </IconButton>
                        </div>
                    ) : (
                        <Rating
                            name="shop-rating"
                            value={shoplisting.rating || 0}
                            precision={0.5}
                            readOnly
                        />
                    )}
                </div>
            </div>

            {/* Modal for feature actions */}
            <Modal open={isModalOpen} onClose={handleCloseModal} aria-labelledby="modal-title" aria-describedby="modal-description">
                <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 400, bgcolor: 'background.paper', border: '2px solid #000', boxShadow: 24, p: 4, borderRadius: 2 }}>
                    <Typography id="modal-title" variant="h6" component="h2">{modalMessage}</Typography>
                    <Box mt={3} display="flex" justifyContent="space-between">
                        <Button variant="contained" color="error" onClick={handleUnfeature}>Unfeature</Button>
                        <Button variant="contained" color="primary" onClick={handleExtend}>Extend</Button>
                        <Button variant="outlined" onClick={handleCloseModal}>Cancel</Button>
                    </Box>
                </Box>
            </Modal>

            {/* Modal for feature confirmation */}
            <Modal open={isConfirmModalOpen} onClose={handleCloseModal} aria-labelledby="confirm-title" aria-describedby="confirm-description">
                <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 400, bgcolor: 'background.paper', border: '2px solid #000', boxShadow: 24, p: 4, borderRadius: 2 }}>
                    <Typography id="confirm-title" variant="h6" component="h2">Are you sure you want to feature this shop?</Typography>
                    <Box mt={3} display="flex" justifyContent="flex-end">
                        <Button variant="contained" color="primary" onClick={handleFeature}>Yes</Button>
                        <Button variant="outlined" onClick={handleCloseModal} sx={{ ml: 2 }}>No</Button>
                    </Box>
                </Box>
            </Modal>

        </div>
    );
}

export default Shoplisting;