import React, { useState } from 'react';
import { makeRequest } from '../../../axios';
import './updateShopReplyForm.scss';

const UpdateShopReplyForm = ({ reviewId, currentReplyText, onReplyUpdated, onCancel }) => {
  const [replyText, setReplyText] = useState(currentReplyText || "");
  const [error, setError] = useState(null);

  const handleSubmit = async () => {
    // Ensure the review ID is provided
    if (!reviewId) {
      setError('Review ID is missing. Cannot update reply.');
      return;
    }

    // Check if replyText is empty
    if (!replyText.trim()) {
      setError('Reply cannot be empty.');
      return;
    }

    try {
      // Send PUT request to update the reply_text
      const response = await makeRequest.put(`/shopreviews/reply?id=${reviewId}`, {
        reply_text: replyText,
      });

      if (response.status === 200) {
        // Call the parent function to notify that the reply has been updated
        onReplyUpdated();
      } else {
        // Handle non-success status codes
        setError('Failed to update reply.');
        console.error('Update failed with status:', response.status);
      }
    } catch (err) {
      // Catch network or server-side errors
      setError('Error during update');
      console.error('Error during update:', err);
    }
  };

  return (
    <div className="reply-section">
      {error && <div className="error">{error}</div>}
      <textarea
        value={replyText}
        onChange={(e) => {
          setReplyText(e.target.value);
          setError(null); // Clear the error when user types
        }}
        placeholder="Write your reply here"
        maxLength={200}
      />
      <div>{replyText.length} / 200</div>
      <button onClick={onCancel}>
        Cancel
      </button>
      <button type = "submit"onClick={handleSubmit} disabled={!replyText.trim()}>
        Submit Reply
      </button>
    </div>
  );
};

export default UpdateShopReplyForm;
