import React, { useState, useEffect, useContext } from "react";
import { makeRequest } from "../../axios";
import './myRewards.scss';
import { Tabs, Tab, Box } from '@mui/material';
import StarIcon from '@mui/icons-material/Star';
import { AuthContext } from "../../context/authContext"; // Assuming you use AuthContext for user data

function MyRewards() {
    const { currentUser } = useContext(AuthContext); // Get the current user
    const [userVouchers, setUserVouchers] = useState([]);
    const [pointsBalance, setPointsBalance] = useState(0); // State for points obtained
    const [activeTab, setActiveTab] = useState(0);
    const [voucherError, setVoucherError] = useState(""); // Handle voucher errors

    // Fetch user vouchers
    const fetchUserVouchers = async () => {
        if (!currentUser?.id) {
            console.error("User ID is not available.");
            return;
        }

        try {
            const vouchersResponse = await makeRequest(`/myrewards?userId=${currentUser.id}`);
            setUserVouchers(vouchersResponse.data);
            setVoucherError(""); // Clear any previous errors
        } catch (error) {
            if (error.response?.status === 404) {
                setVoucherError("No vouchers found.");
                setUserVouchers([]); // Clear vouchers if none are found
            } else {
                setVoucherError("Error fetching vouchers.");
            }
            console.error("Error fetching user vouchers:", error);
        }
    };

    // Fetch user points balance
    const fetchUserPoints = async () => {
        if (!currentUser?.id) {
            console.error("User ID is not available.");
            return;
        }

        try {
            const pointsResponse = await makeRequest(`/myrewards/points?userId=${currentUser.id}`);
            setPointsBalance(pointsResponse.data.points_balance);
        } catch (error) {
            console.error("Error fetching points balance:", error);
        }
    };

    useEffect(() => {
        fetchUserVouchers();
        fetchUserPoints();
    }, [currentUser?.id]);

    // Handle tab change
    const handleChange = (event, newValue) => {
        setActiveTab(newValue);
    };

    // Use Voucher: Change voucher status to 'Used'
    const handleUseVoucher = async (voucherId) => {
        const isConfirmed = window.confirm("Are you sure you want to use this voucher?");
        if (!isConfirmed) {
            return; // Exit if user cancels
        }
        try {
            const response = await makeRequest.post(`/myrewards/use`, { userId: currentUser.id, voucherId });
            if (response.status === 200) {
                alert("Voucher used successfully!");
                fetchUserVouchers(); // Refresh vouchers after updating status
            }
        } catch (error) {
            console.error("Error using voucher:", error);
        }
    };

    // Automatically mark expired vouchers
    const checkForExpiredVouchers = (voucher) => {
        const currentDate = new Date();
        const expiryDate = new Date(voucher.expiry_date);

        if (currentDate > expiryDate) {
            return true; // Voucher is expired
        }
        return false;
    };

    // Filter vouchers by status
    const filterVouchers = (status) => {
        const filteredVouchers = userVouchers.filter((voucher) => {
            if (status === 'Expired' && checkForExpiredVouchers(voucher)) {
                return true;
            }
            return voucher.status === status;
        });
    
        // Sort based on status
        if (status === 'Used') {
            // Sort by latest used_date for "Used" vouchers (descending order)
            return filteredVouchers.sort((a, b) => new Date(b.used_date) - new Date(a.used_date));
        } else if (status === 'Available') {
            // Sort by earliest expiry_date for "Available" vouchers (ascending order)
            return filteredVouchers.sort((a, b) => new Date(a.expiry_date) - new Date(b.expiry_date));
        } else if (status === 'Expired') {
            // Sort by latest expiry_date for "Expired" vouchers (descending order)
            return filteredVouchers.sort((a, b) => new Date(b.expiry_date) - new Date(a.expiry_date));
        }
    
        return filteredVouchers;
    };

    return (
        <div className="my-rewards-container">

            <h2><StarIcon /> My Rewards</h2>
            <div className="points-balance">
                <h3>Points Balance: {pointsBalance}</h3>
            </div>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs value={activeTab} onChange={handleChange} aria-label="voucher status tabs">
                    <Tab label="Available" />
                    <Tab label="Used" />
                    <Tab label="Expired" />
                </Tabs>
            </Box>

            {/* Display voucher error message if no vouchers are found */}
            {voucherError && <p className="error-message">{voucherError}</p>}

            <div className="voucher-list">
                {activeTab === 0 && filterVouchers('Available').map((voucher) => (
                    <div key={voucher.user_voucher_id} className="voucher-item">
                        <img 
                                src={voucher.img ? `/upload/${voucher.img}` : '/upload/default-empty.jpg'} 
                                alt={voucher.voucher_name} 
                                className="voucher-image" 
                            />
                        <div className="label-value">
                            <p className="label">Voucher Name:</p>
                            <p className="value">{voucher.voucher_name}</p>
                        </div>
                        <div className="label-value">
                            <p className="label">Value (up-to):</p>
                            <p className="value">${voucher.value_in_dollars}</p>
                        </div>
                        <div className="label-value">
                            <p className="label">Redeemed Date:</p>
                            <p className="value">{new Date(voucher.redeemed_date).toLocaleDateString()}</p>
                        </div>
                        <div className="label-value">
                            <p className="label">Expiry Date:</p>
                            <p className="value">{new Date(voucher.expiry_date).toLocaleDateString()}</p>
                        </div>
                        <button onClick={() => handleUseVoucher(voucher.user_voucher_id)}>Use</button>
                    </div>
                ))}

                {activeTab === 1 && filterVouchers('Used').map((voucher) => (
                    <div key={voucher.user_voucher_id} className="voucher-item">
                        <img 
                                src={voucher.img ? `/upload/${voucher.img}` : '/upload/default-empty.jpg'} 
                                alt={voucher.voucher_name} 
                                className="voucher-image"  
                            />
                        <div className="label-value">
                            <p className="label">Voucher Name:</p>
                            <p className="value">{voucher.voucher_name}</p>
                        </div>
                        <div className="label-value">
                            <p className="label">Value (up-to):</p>
                            <p className="value">${voucher.value_in_dollars}</p>
                        </div>
                        <div className="label-value">
                            <p className="label">Redeemed Date:</p>
                            <p className="value">{new Date(voucher.redeemed_date).toLocaleDateString()}</p>
                        </div>
                        <div className="label-value">
                            <p className="label">Expiry Date:</p>
                            <p className="value">{new Date(voucher.expiry_date).toLocaleDateString()}</p>
                        </div>
                        <div className="label-value">
                        <p className = "label">Used Date:</p>
                        <p className="value"> {voucher.used_date ? new Date(voucher.used_date).toLocaleDateString() : 'N/A'}</p>
                        </div>
                    </div>
                ))}

                {activeTab === 2 && filterVouchers('Expired').map((voucher) => (
                    <div key={voucher.user_voucher_id} className="voucher-item">
                        <img 
                                src={voucher.img ? `/upload/${voucher.img}` : '/upload/default-empty.jpg'} 
                                alt={voucher.voucher_name} 
                                className="voucher-image" 
                            />
                        <div className="label-value">
                            <p className="label">Voucher Name:</p>
                            <p className="value">{voucher.voucher_name}</p>
                        </div>
                        <div className="label-value">
                            <p className="label">Value (up-to):</p>
                            <p className="value">${voucher.value_in_dollars}</p>
                        </div>
                        <div className="label-value">
                            <p className="label">Redeemed Date:</p>
                            <p className="value">{new Date(voucher.redeemed_date).toLocaleDateString()}</p>
                        </div>
                        <div className="label-value">
                            <p className="label">Expiry Date:</p>
                            <p className="value">{new Date(voucher.expiry_date).toLocaleDateString()}</p>
                        </div>
                    </div>
                ))}

                {/* Display a message when no vouchers are found in the selected tab */}
                {userVouchers.length > 0 && filterVouchers(activeTab === 0 ? 'Available' : activeTab === 1 ? 'Used' : 'Expired').length === 0 && (
                    <p>No vouchers found in this category.</p>
                )}
            </div>
        </div>
    );
}

export default MyRewards;
