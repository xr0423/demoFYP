import React, { useEffect, useState } from "react";
import "./aboutUs.scss";
import {makeRequest} from "../../axios"; // Make sure to adjust the path as needed

const AboutUs = () => {
  const [aboutUsContent, setAboutUsContent] = useState([]);

  // Fetch about us content from the database
  useEffect(() => {
    const fetchAboutUsContent = async () => {
      try {
        const response = await makeRequest.get("/landing?section_name=aboutus");
        setAboutUsContent(response.data);
      } catch (error) {
        console.error("Error fetching About Us content:", error);
      }
    };
    fetchAboutUsContent();
  }, []);

  return (
    <div className="about-us-container" id="about-us">
      {aboutUsContent.length > 0 ? (
        <>
          {/* Render the first item as the hero section */}
          <div className="about-us-hero">
            <h1>{aboutUsContent[0].heading}</h1>
            <p>{aboutUsContent[0].content}</p>
          </div>

          {/* Render the rest of the content items */}
          {aboutUsContent.slice(1).map((item, index) => (
            <section className="about-us-section" key={item.id}>
              <h2>{item.heading}</h2>
              <p>{item.content}</p>
            </section>
          ))}
        </>
      ) : (
        // Default content if no items are fetched from the database
        <>
          <div className="about-us-hero">
            <h1>About Us</h1>
            <p>
              Connecting coffee lovers, shop owners, and coffee experts through a shared passion for coffee.
            </p>
          </div>

          <section className="about-us-section">
            <h2>Our Mission</h2>
            <p>
              At "I Like That Coffee," our mission is to bring the world of coffee closer to you. Whether you're a
              coffee lover looking for the perfect cafe, a shop owner promoting your business, or a coffee expert
              sharing knowledge, our platform is built to connect you with a global community of coffee enthusiasts.
            </p>
          </section>

          <section className="about-us-section">
            <h2>How It Works</h2>

            <div className="about-us-subsection">
              <h3>For Coffee Enthusiasts</h3>
              <p>
                Discover new coffee shops near you by using our map-based search feature. Whether you’re looking for a
                cozy cafe or a new experience while traveling, "I Like That Coffee" makes it easy to find great coffee
                wherever you are.
              </p>
            </div>

            <div className="about-us-subsection">
              <h3>For Coffee Shop Owners</h3>
              <p>
                Promote your shop to local coffee lovers by posting essential information such as your location, menu,
                and special offers. Let coffee enthusiasts in your area discover and visit your shop through our
                platform.
              </p>
            </div>

            <div className="about-us-subsection">
              <h3>For Coffee Experts</h3>
              <p>
                Share your coffee knowledge with the world! Post tips, brewing techniques, bean sourcing stories, and
                more to help coffee lovers deepen their appreciation for coffee. Whether you're a barista or coffee
                connoisseur, your expertise is welcome here.
              </p>
            </div>
          </section>

          <section className="about-us-section">
            <h2>Our Story</h2>
            <p>
              Founded in 2024, "I Like That Coffee" began as a simple tool to help coffee enthusiasts find nearby cafes.
              Today, it's a thriving platform where shop owners, experts, and enthusiasts come together to celebrate
              coffee culture. Whether you’re exploring a new cafe or learning from industry professionals, "I Like That
              Coffee" is here to make every coffee moment better.
            </p>
          </section>

          <section className="about-us-section">
            <h2>Join Our Coffee Community</h2>
            <p>
              Become a part of our growing community. Whether you're searching for your next favorite coffee spot,
              promoting your shop, or sharing your love for coffee, "I Like That Coffee" is the perfect place to
              connect with like-minded coffee lovers.
            </p>
          </section>
        </>
      )}
    </div>
  );
};

export default AboutUs;
