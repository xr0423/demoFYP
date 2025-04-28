import { useState, useEffect, useContext } from 'react'; 
import { AuthContext } from "../../../../context/authContext";
import { makeRequest } from "../../../../axios";
import { Link } from "@mui/material";
import CreateRewardForm from '../../createRewardForm/CreateRewardForm';
import UpdateRewardForm from '../../updateRewardForm/UpdateRewardForm';
import Upgrade from "../../../components/plan/Upgrade"
import './rewards.scss';

function Rewards({ shopId, ownerDetails }) {
    const [rewards, setRewards] = useState([]);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [showUpdateForm, setShowUpdateForm] = useState(false);
    const [selectedRewardId, setSelectedRewardId] = useState(null);
    const { currentUser } = useContext(AuthContext);
    const [isTncModalOpen, setIsTncModalOpen] = useState(false);
    const [selectedTnc, setSelectedTnc] = useState("");
    const [pointsBalance, setPointsBalance] = useState(0);  // State to hold user points balance
    const [openUpgrade, setOpenUpgrade] = useState(false);

    const fetchRewards = async () => {
        try {
            const response = await makeRequest(`/shoplistings/rewards?shopId=${shopId}`);
            setRewards(response.data);
        } catch (error) {
            console.error('Error fetching rewards:', error);
        }
    };
    const handleUpgradePlanModal = () => {
        setOpenUpgrade((prev) => !prev)
      }

    useEffect(() => {
        fetchRewards();
    }, [shopId]);

    const handleCreateForm = () => {
        setShowCreateForm((prev) => !prev);
    };

    const handleUpdateForm = (rewardId) => {
        setSelectedRewardId(rewardId);
        setShowUpdateForm((prev) => !prev);
    };

    const openTncModal = (tncContent) => {
        setSelectedTnc(tncContent);
        setIsTncModalOpen(true);
    };

    const closeTncModal = () => {
        setIsTncModalOpen(false);
        setSelectedTnc("");
    };

    const handleDelete = async (voucherId) => {
        const isConfirmed = window.confirm("Are you sure you want to delete this reward?");
        if (!isConfirmed) return;

        try {
            await makeRequest.delete(`/shoplistings/rewards?rewardId=${voucherId}`);
            setRewards(rewards.filter((reward) => reward.voucher_id !== voucherId));
            alert("Reward deleted successfully!");
        } catch (error) {
            console.error('Error deleting reward:', error);
        }
    };

    const handleSubmitSuccess = (message) => {
        alert(message);
        fetchRewards();
    };

    // redeem rewards
    // Fetch user points balance
    const fetchUserPoints = async () => {
        try {
            const response = await makeRequest(`/myrewards/points?userId=${currentUser.id}`);
            setPointsBalance(response.data.points_balance);
        } catch (error) {
            console.error('Error fetching points balance:', error);
        }
    };

    useEffect(() => {
        fetchRewards();
        fetchUserPoints();
    }, [shopId, currentUser?.id]);

    const handleRedeem = async (voucherId, pointsCost) => {
        if (pointsBalance < pointsCost) {
            alert("Insufficient points to redeem this voucher.");
            return;
        }

        const confirmRedeem = window.confirm("Are you sure you want to redeem this voucher?");
        if (!confirmRedeem) return; // Cancel redemption if user clicks "Cancel"

        try {
            const response = await makeRequest.post('/myrewards/redeem', { userId: currentUser.id, voucherId });
            if (response.status === 200) {
                alert('Voucher redeemed successfully!');
                fetchRewards();  // Update the rewards list after redemption
                fetchUserPoints();  // Update the points balance
            }
        } catch (error) {
            console.error('Error redeeming voucher:', error);
            alert('Failed to redeem voucher. Please try again later.');
        }
    };

    // Separate exclusive and regular rewards
    const exclusiveRewards = rewards.filter((reward) => reward.exclusive === "exclusive");
    const regularRewards = rewards.filter((reward) => reward.exclusive !== "exclusive");

    return (
        <div className="rewards-container">
            {(currentUser?.type === "admin" || currentUser?.type === "expert" || currentUser?.type === "regular") && (
                <div className="points-balance">
                    <h3 style={{ fontSize: "16px" }}>Points Balance: {pointsBalance}</h3>
                </div>
            )}
            {ownerDetails?.id === currentUser?.id && (
                <button className="addBtn" onClick={handleCreateForm}>
                    Create New Reward
                </button>
                )}


            {/* Exclusive Rewards Section */}
            <h3>Exclusive Rewards</h3>
            <div className="reward-list">
                {exclusiveRewards && exclusiveRewards.length === 0 ? (
                    <p>No exclusive rewards available.</p>
                ) : (
                    exclusiveRewards.map((reward) => (
                        <div key={reward.voucher_id} className="reward-item">
                            {reward.img && (
                                <img src={reward.img ? `/upload/${reward.img}` : '/upload/default-empty.jpg'}  
                                    alt={reward.voucher_name} 
                                    className="reward-image" />
                            )}
                            <div className="reward-content">
                                <h3 className="reward-title">{reward.voucher_name}</h3>
                                <div className="reward-desc">Description: {reward.description}</div>
                                <div className="reward-points">Points Cost: {reward.points_cost}</div>
                                <div className="reward-value">Value (up-to): ${reward.value_in_dollars}</div>
                                <div className="reward-amount">Amount available: {reward.amount_available}</div>
                                <div className="reward-validity">Validity Period: {reward.validity_period} days</div>
                                <div className="reward-tnc">
                                    <Link variant="text" onClick={() => openTncModal(reward.tnc)} className="tnc-button">
                                        Terms and Conditions
                                    </Link>
                                </div> 
                            </div>
                            <div className="reward-actions">
                                    {ownerDetails?.id === currentUser?.id && (
                                        <>
                                            <button className="edit-btn"  onClick={() => handleUpdateForm(reward.voucher_id)} >
                                                Edit
                                            </button>
                                            <button className="delete-btn" onClick={() => handleDelete(reward.voucher_id)}>
                                                Delete
                                            </button>
                                        </>
                                    )}  
                                        {/*exclusive*/} 
                                        {currentUser?.type !== "owner" && (
                                    <>
                                        {(currentUser?.type === "regular" && currentUser?.subscriptionId !== 1) || currentUser?.type === "expert" ? (
                                            <button
                                                onClick={() => handleRedeem(reward.voucher_id, reward.points_cost)}
                                                className="redeem-btn"
                                            >
                                                Redeem
                                            </button>
                                        ) : (
                                            currentUser?.type === "regular" && currentUser?.subscriptionId === 1 && (
                                                <button
                                                    onClick={handleUpgradePlanModal}
                                                    className="upgrade-plan-btn"
                                                >
                                                    Upgrade Plan
                                                </button>
                                            )
                                        )}
                                    </>
                                )}
                                {openUpgrade && (
                                    <Upgrade open={openUpgrade} onClose={handleUpgradePlanModal} />
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Regular Rewards Section */}
            <h3 style={{ marginTop: "100px" }}>Regular Rewards</h3>
            <div className="reward-list">
                {regularRewards && regularRewards.length === 0 ? (
                    <p>No regular rewards available.</p>
                ) : (
                    regularRewards.map((reward) => (
                        <div key={reward.voucher_id} className="reward-item">
                            {reward.img && (
                                <img src={reward.img ? `/upload/${reward.img}` : '/upload/default-empty.jpg'}  
                                    alt={reward.voucher_name} 
                                    className="reward-image" />
                            )}
                            <div className="reward-content">
                                <h3 className="reward-title">{reward.voucher_name}</h3>
                                <div className="reward-desc">Description: {reward.description}</div>
                                <div className="reward-points">Points Cost: {reward.points_cost}</div>
                                <div className="reward-value">Value (up-to): ${reward.value_in_dollars}</div>
                                <div className="reward-amount">Amount available: {reward.amount_available}</div>
                                <div className="reward-validity">Validity Period: {reward.validity_period} days</div>
                                <div className="reward-tnc">
                                    <Link variant="text" onClick={() => openTncModal(reward.tnc)} className="tnc-button">
                                        Terms and Conditions
                                    </Link>
                                </div> 
                            </div>
                            <div className="reward-actions">
                                {ownerDetails?.id === currentUser?.id && ( <>
                                    <button className="edit-btn" onClick={() => handleUpdateForm(reward.voucher_id)}>Edit</button>
                                    <button className="delete-btn" onClick={() => handleDelete(reward.voucher_id)}>Delete</button>
                                </>)}
                                {(currentUser?.type === "regular" || currentUser?.type === "expert") && (
                                    <button
                                        onClick={() => handleRedeem(reward.voucher_id, reward.points_cost)}
                                    >
                                        Redeem
                                    </button>
                                    )}

                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Modals */}
            {showCreateForm && (
                <div className="modal-overlay">
                    <CreateRewardForm 
                        shopId={shopId} 
                        onClose={handleCreateForm}
                        onSubmitSuccess={() => handleSubmitSuccess("Reward created successfully!")}
                    />
                </div>
            )}

            {showUpdateForm && (
                <div className="modal-overlay">
                    <UpdateRewardForm 
                        rewardId={selectedRewardId} 
                        onClose={handleUpdateForm} 
                        onSubmitSuccess={() => handleSubmitSuccess("Reward updated successfully!")}
                    />
                </div>
            )}

            {isTncModalOpen && (
                <div className="tnc-modal" onClick={closeTncModal}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h3>Terms and Conditions</h3>
                        <p>{selectedTnc}</p>
                        <Link variant="contained" onClick={closeTncModal}>
                            Close
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Rewards;
