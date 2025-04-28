import React, { useState, useEffect } from "react";
import { makeRequest } from "../../../axios";
import "./activities.scss";

const Activities = (userId) => {
  const [activities, setActivities] = useState([]);
  const [filteredActivities, setFilteredActivities] = useState([]); // State to store filtered activities
  const [searchTerm, setSearchTerm] = useState(""); // State for search input
  const [loading, setLoading] = useState(true);

  const getImageSrc = (profilePic) => {
    if(!profilePic) return  '/upload/empty-cover-picture.jpg'
    if(profilePic.startsWith("http")){
      return profilePic}
    else{
      return `/upload/${profilePic}`
    }
  };

  // Fetch activities from backend
  const fetchActivities = async () => {
    try {
      setLoading(true);
      const response = await makeRequest.get(`/users/activity?id=${userId.userId}`);
      const data = Array.isArray(response.data) ? response.data : [];
      console.log(response.data);
      setActivities(data);
      setFilteredActivities(data); // Initialize with all activities
    } catch (error) {
      console.error("Error fetching activities:", error);
      setActivities([]);
      setFilteredActivities([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities(); // Fetch activities on mount
  }, []);

  const handleSearch = () => {
    if (searchTerm.trim() === "") {
      // If search input is empty, reset to all activities
      setFilteredActivities(activities);
    } else {
      // Filter activities based on search input
      const filtered = activities.filter(
        (activity) =>
          activity.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
          activity.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredActivities(filtered);
    }
  };



  return (
    <div className="activities-container">
      <div className="activities-list">
        <h2>Recent Activities</h2>

        {/* Search Bar with Button */}
        <div className="search-container">
          <input
            type="text"
            placeholder="Search activities..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-bar"
          />
          <button onClick={handleSearch} className="search-button">
            Search
          </button>
        </div>

        {loading ? (
          <p>Loading activities...</p>
        ) : (
          <div className="activity-items">
            {filteredActivities.length > 0 ? (
              filteredActivities.map((activity) => (
                <div
                  key={activity.id}
                  className={`activity-item `}
                >
                  <img src={getImageSrc(activity.profilePic)} alt="User" />
                  <div className="activity-info">
                    <p>
                      <strong>{activity.username}</strong> {activity.description}
                    </p>
                    <span>{activity.date}</span>
                  </div>
                </div>
              ))
            ) : (
              <p>No activities found.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Activities;
