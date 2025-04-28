import { useState, useEffect, useContext } from 'react';
import { makeRequest } from "../../../axios"; // Assuming makeRequest is the utility function for Axios
import { AuthContext } from "../../../context/authContext";
import './rewards.scss';

function Rewards({ shopId }) {
    const { currentUser } = useContext(AuthContext);
    const [rewards, setRewards] = useState([]);
    const [pointsBalance, setPointsBalance] = useState(0);  // State to hold user points balance

    // Fetch rewards
    const fetchRewards = async () => {
        try {
            const response = await makeRequest(`/shoplistings/rewards?shopId=${shopId}`);
            setRewards(response.data);
        } catch (error) {
            console.error('Error fetching rewards:', error);
        }
    };

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

    // Handle Redeem button click with confirmation
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

    return (
        <div className="rewards-container">
            <h2>Available Rewards</h2>
            <div className="points-balance">
                <h3>Points Balance: {pointsBalance}</h3>
            </div>
            <div className="reward-list">
                {rewards.length === 0 ? (
                    <p>No rewards available.</p>
                ) : (
                    rewards.map((reward) => (
                        <div key={reward.voucher_id} className="reward-item">
                            <img 
                                src={reward.img ? `/upload/${reward.img}` : '/upload/default-empty.jpg'} 
                                alt={reward.voucher_name} 
                                className="reward-image" 
                            />
                            <div className="reward-content">
                                <h4 className="reward-title">{reward.voucher_name}</h4>
                                <p className="reward-points">Points Cost: {reward.points_cost}</p>
                                <p className="reward-value">Value (up-to): ${reward.value_in_dollars}</p>
                                <p className="reward-amount">Amount available: {reward.amount_available}</p>
                                <p className="reward-validity">Validity Period: {reward.validity_period} days</p>
                            </div>
                            <button
                                onClick={() => handleRedeem(reward.voucher_id, reward.points_cost)}
                            >
                                Redeem
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

export default Rewards;
