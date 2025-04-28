import { useState, useEffect } from 'react';
import { makeRequest } from '../../../axios';
import './updateRewardForm.scss';

function UpdateRewardForm({ rewardId, onClose, onSubmitSuccess }) {
    const [formData, setFormData] = useState({
        voucher_name: '',
        points_cost: '',
        value_in_dollars: '',
        amount_available: '',
        validity_period: '',
        img: '',
        exclusive: "public",
        description: '',
        tnc: '',
    });

    const [file, setFile] = useState(null); // State to handle new uploaded image file

    useEffect(() => {
        const fetchRewardDetails = async () => {
            try {
                const response = await makeRequest.get(`/shoplistings/rewards/details?rewardId=${rewardId}`);
                const reward = response.data;
                setFormData({
                    voucher_name: reward.voucher_name,
                    points_cost: reward.points_cost,
                    value_in_dollars: reward.value_in_dollars,
                    amount_available: reward.amount_available,
                    validity_period: reward.validity_period,
                    img: reward.img, // Set the existing image URL
                    exclusive: reward.exclusive || "public",
                    description: reward.description,
                    tnc: reward.tnc,
                });
            } catch (error) {
                console.error('Error fetching reward details:', error);
            }
        };
        fetchRewardDetails();
    }, [rewardId]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };
    const handleCheckboxChange = (e) => {
        setFormData((prev) => ({
          ...prev,
          exclusive: e.target.checked ? "exclusive" : "public",
        }));
      };

    const handleFileChange = (e) => {
        setFile(e.target.files[0]); // Set the selected file
    };

    // Image upload function
    const uploadImage = async () => {
        if (!file) return null;
        try {
            const uploadFormData = new FormData();
            uploadFormData.append("file", file);
            const response = await makeRequest.post("/upload", uploadFormData); // Adjust endpoint as necessary
            return response.data; // Expecting a file URL or path from the server response
        } catch (err) {
            console.error("Error uploading image:", err);
            return null;
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Upload new image if a file is selected
        let imgUrl = formData.img; // Default to the existing image URL
        if (file) {
            imgUrl = await uploadImage(); // Update to new image URL if a new file is uploaded
        }

        // Combine form data with updated image URL
        const finalFormData = { ...formData, img: imgUrl };

        try {
            await makeRequest.put(`/shoplistings/rewards?rewardId=${rewardId}`, finalFormData);
            onSubmitSuccess();  // Trigger success message in parent component
            onClose();
        } catch (error) {
            console.error('Error updating reward:', error);
            alert("Failed to update reward.");
        }
    };

    console.log(formData);

    return (
        <div className="update-reward-form">
            <h2>Update Reward</h2>
            <form onSubmit={handleSubmit}>
                <label htmlFor="voucher_name">Voucher Name</label>
                <input
                    type="text"
                    id="voucher_name"
                    name="voucher_name"
                    placeholder="Voucher Name"
                    value={formData.voucher_name}
                    onChange={handleInputChange}
                    required
                />

                <label htmlFor="description">Description</label>
                <input
                    type="text"
                    id="description"
                    name="description"
                    placeholder="Description"
                    value={formData.description}
                    onChange={handleInputChange}
                    maxLength={100}
                    required
                />
                <div className="field-row">
                    <div className="field">
                        <label htmlFor="points_cost">Points Cost</label>
                        <input
                            type="number"
                            id="points_cost"
                            name="points_cost"
                            placeholder="Points Cost"
                            value={formData.points_cost}
                            onChange={handleInputChange}
                            required
                        />
                    </div>
                    <div className="field">
                        <label htmlFor="value_in_dollars">Value in Dollars</label>
                        <input
                            type="number"
                            id="value_in_dollars"
                            name="value_in_dollars"
                            placeholder="Value in Dollars"
                            value={formData.value_in_dollars}
                            onChange={handleInputChange}
                            required
                        />
                    </div>
                </div>

                <div className="field-row">
                    <div className="field">
                        <label htmlFor="amount_available">Amount Available</label>
                        <input
                            type="number"
                            id="amount_available"
                            name="amount_available"
                            placeholder="Amount Available"
                            value={formData.amount_available}
                            onChange={handleInputChange}
                            required
                        />
                    </div>
                    <div className="field">
                        <label htmlFor="validity_period">Validity Period (days)</label>
                        <input
                            type="number"
                            id="validity_period"
                            name="validity_period"
                            placeholder="Validity Period"
                            value={formData.validity_period}
                            onChange={handleInputChange}
                            required
                        />
                    </div>
                </div>
                {/* Exclusive Checkbox */}
                <label htmlFor="exclusive">
                    <input
                    type="checkbox"
                    id="exclusive"
                    name="exclusive"
                    checked={formData.exclusive === "exclusive"}
                    onChange={handleCheckboxChange}
                    />
                    Exclusive Reward
                </label>

                <label htmlFor="img">Upload New Image</label>
                <input
                    type="file"
                    id="img"
                    name="img"
                    accept="image/*"
                    onChange={handleFileChange}
                />
                {/* Display current image if no new file is selected */}
                {file ? (
                    <img src={URL.createObjectURL(file)} alt="Selected" className="image-preview" />
                ) : (
                    formData.img && <img src={`/upload/${formData.img}`} alt="Current" className="image-preview" />
                )}

                <label htmlFor="tnc">Terms and Conditions</label>
                <input
                    type="text"
                    id="tnc"
                    name="tnc"
                    placeholder="Terms and Conditions"
                    value={formData.tnc}
                    onChange={handleInputChange}
                    maxLength={1000}
                    required
                />

                <button type="submit" className='update-button'>Update Reward</button>
                <button type="button" className='cancel-button' onClick={onClose}>Cancel</button>
            </form>
        </div>
    );
}

export default UpdateRewardForm;
