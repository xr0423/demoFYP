import { useState } from 'react';
import { makeRequest } from '../../../axios';
import './createRewardForm.scss';

function CreateRewardForm({ shopId, onClose, onSubmitSuccess }) {
    const [formData, setFormData] = useState({
        shop_id: shopId,
        voucher_name: '',
        points_cost: '',
        value_in_dollars: '',
        amount_available: '',
        validity_period: '',
        exclusive:'public',
        description: '',
        tnc:'',
    });
    const [file, setFile] = useState(null); // State to store the uploaded image file
    const [fileError, setFileError] = useState(null);
    
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            const fileType = selectedFile.type;
            // Accept only jpg and png formats
            if (fileType === "image/jpeg" || fileType === "image/png") {
                setFile(selectedFile);
                setFileError(null); // Clear previous error if the format is valid
            } else {
                setFile(null);
                setFileError("Only JPG and PNG formats are accepted.");
            }
        }
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

    const handleCheckboxChange = (e) => {
        setFormData((prev) => ({
          ...prev,
          exclusive: e.target.checked ? "exclusive" : "public",
        }));
      };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const isConfirmed = window.confirm("Are you sure you want to create this reward?");
        if (!isConfirmed) return;

        // Upload image if a file is selected
        let imgUrl = "";
        if (file) {
            imgUrl = await uploadImage();
        }else {
            imgUrl = 'default-empty.jpg'; // Set to default image if no file is selected
        }

        // Combine form data with uploaded image URL
        const finalFormData = { ...formData, img: imgUrl, shopId };

        try {
            const response = await makeRequest.post(`/shoplistings/rewards`, finalFormData);
            if (response.status === 201) {
                onSubmitSuccess();
                onClose();
            }
        } catch (error) {
            console.error('Error creating reward:', error);
            alert("Failed to create reward.");
        }
    };

    return (
        <div className="create-reward-form">
            <h2>Create New Reward</h2>
            <form onSubmit={handleSubmit}>
                <label htmlFor="voucher_name">Voucher Name</label>
                <input
                    type="text"
                    id="voucher_name"
                    name="voucher_name"
                    placeholder="Voucher Name"
                    value={formData.voucher_name}
                    onChange={handleInputChange}
                    maxLength={100}
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
                            maxLength={200}
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
                            maxLength={200}
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
                            maxLength={200}
                            onChange={handleInputChange}
                            required
                        />
                    </div>
                    <div className="field">
                        <label htmlFor="validity_period">Validity Period (in days)</label>
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
                <label htmlFor="img">Upload Image</label>
                <input
                    type="file"
                    id="img"
                    name="img"
                    accept="image/*"
                    onChange={handleFileChange}
                />
                {fileError && <div className="error-message">{fileError}</div>}
                
                {file && <img src={URL.createObjectURL(file)} alt="Selected" className="image-preview" />}
                
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
                <button type="submit" className="submit-button">Create Reward</button>
                <button type="button" className="cancel-button" onClick={onClose}>Cancel</button>
            </form>
        </div>
    );
}

export default CreateRewardForm;
