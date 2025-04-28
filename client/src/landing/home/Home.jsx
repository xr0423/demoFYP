import React, { useEffect, useState } from "react";
import "./home.scss";
import { makeRequest } from "../../axios";

const Home = () => {
  const [homeContent, setHomeContent] = useState([]);
  const [backgroundImageExists, setBackgroundImageExists] = useState(false);

  // Fetch home content from the database
  useEffect(() => {
    const fetchHomeContent = async () => {
      try {
        const response = await makeRequest.get("/landing?section_name=home");
        setHomeContent(response.data);
      } catch (error) {
        console.error("Error fetching home content:", error);
      }
    };
    fetchHomeContent();
  }, []);

  // Check if the background image exists
  useEffect(() => {
    const checkBackgroundImage = () => {
      const img = new Image();
      img.src = `/landing-content/home-background.jpg`; // Define the image path

      // If image loads, set backgroundExists to true
      img.onload = () => setBackgroundImageExists(true);

      // If image fails to load, set backgroundExists to false
      img.onerror = () => setBackgroundImageExists(false);
    };

    checkBackgroundImage();
  }, []);

  return (
    <div
      className="landing-home"
      id="home"
      style={{
        backgroundImage: backgroundImageExists
          ? `url("/landing-content/home-background.jpg")`
          : "none",
        backgroundSize: "cover",
        backgroundPosition: "center",
        filter: backgroundImageExists ? "" : "none",
      }}
    >
      <div className="content">
        {/* Displaying home content from the database */}
        {homeContent.length > 0 ? (
          <>
            {/* Render the first content item */}
            <div key={homeContent[0].id}>
              <h1>{homeContent[0].heading}</h1>
              <p>{homeContent[0].content}</p>
            </div>

            {/* Render the remaining content items */}
            {homeContent.slice(1).map((item) => (
              <div key={item.id}>
                <h1>{item.heading}</h1>
                <p>{item.content}</p>
              </div>
            ))}
            <button className="cta-button">
              <a
                href="#gallery"
                style={{ textDecoration: "none", color: "inherit" }}
              >
                Discover More
              </a>
            </button>
          </>
        ) : (
          // Default content if no items are fetched from the database
          <>
            <div>
              <h1>This is home section</h1>
              <p>
                Connecting coffee lovers, shop owners, and coffee experts
                through a shared passion for coffee. Discover new coffee shops,
                share your experiences, and engage with a community that loves
                coffee as much as you do!
              </p>
            </div>
            {/* Button displayed below the first default content item */}
            <h1>I Like That Coffee</h1>
            <p>
              We aim to connect everyone passionate about coffee, from casual
              drinkers to coffee enthusiasts.
            </p>
            <button className="cta-button">
              <a
                href="#gallery"
                style={{ textDecoration: "none", color: "inherit" }}
              >
                Discover More
              </a>
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default Home;
