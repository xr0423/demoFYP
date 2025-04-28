import React, { useEffect, useState } from "react";
import Home from "../home/Home";
import Gallery from "../gallery/Gallery";
import Review from "../review/Review";
import AboutUs from "../aboutus/AboutUs";
import Footer from "../components/footer/Footer";
import ContactUs from "../components/contactus/ContactUs"; 
import StepsToJoin from "../components/steptojoin/StepsToJoin";
import "./Main.scss";

function Main() {
  const [showContactUs, setShowContactUs] = useState(false); // State to control visibility

  const toggleContactUs = () => {
    setShowContactUs((prev) => !prev); // Toggle visibility
  };

  useEffect(() => {
    const hash = window.location.hash;
    if (hash) {
      const element = document.getElementById(hash.substring(1)); // Get the element with the hash as id
      if (element) {
        element.scrollIntoView({ behavior: "smooth" }); // Scroll smoothly to that section
      }
    }
  }, []); // This will run on mount to check for the hash

  return (
    <div>
      <section id="home">
        <Home />
      </section>
      
      <section id="steptojoin">
        <StepsToJoin />
      </section>

      <section id="gallery">
        <Gallery />
      </section>

      <section id="review">
        <Review />
      </section>

      <section id="aboutus">
        <AboutUs />
      </section>
      {showContactUs && <ContactUs onClose={toggleContactUs}/>}
      <Footer onContactUsClick={toggleContactUs} />
    </div>
  );
}

export default Main;
