import React from 'react';
import './footer.scss';
// for the contact us, idk how to lead it to contact-us page
const Footer = () => {
  return (
    <footer className="footer-container">
      <div className="footer-content">
        <div className="footer-links">
          <a href="#about-us">About Us</a>
          <a href="#review">Reviews</a>
          <a href="#gallery">Gallery</a>
          <a href="/landing/contactus">Contact Us</a>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; 2024 I Like That Coffee. All Rights Reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
