// SuccessPopup.js
import React from 'react';
import './popUpSuccess.scss'; // Add styles for the success popup

const SuccessPopup = ({ message, onClose }) => {
  console.log("Success Popup is triggered"); // Add this log
  return (
    <div className="success-popup">
      <div className="popup-content">
        <h2>{message}</h2>
        <button onClick={onClose}>OK</button>
      </div>
    </div>
  );
};


export default SuccessPopup;
