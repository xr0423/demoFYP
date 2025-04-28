import React, { useState, useEffect } from "react";
import Posts from "../components/posts/Posts";
import Share from "../components/share/Share";
import Dashboard from "../dashboard/Dashboard";
import "./home.scss";
import { trackLocation } from "../../utils/locationTracking";

const Home = () => {
  const [selectedTab, setSelectedTab] = useState("Dashboard");
  useEffect(() => {
    trackLocation(1);
  }, []);

  return (
    <div className="ownerhome">
      {/* Navigation Tabs */}
      <div className="ownertab">
        <button
          className={selectedTab === "Dashboard" ? "active" : ""}
          onClick={() => setSelectedTab("Dashboard")}
        >
          Dashboard
        </button>
      </div>

      {/* Content Container */}
      <div className="selectcontainer">

        {selectedTab === "Dashboard" && (
          <div className="dashboardcontent">
            <Dashboard/>
          </div>
        )}




      </div>
    </div>
  );
};

export default Home;
