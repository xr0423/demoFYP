import Articles from "../articles/Articles";
import Articlecollabs from "../articleCollabs/Articlecollabs";
import Following from "../following/Following";

import { trackLocation } from "../../../utils/locationTracking";
import { useContext, useEffect, useState } from "react";
import { makeRequest } from "../../../axios";
import "./articlesTab.scss";
import { AuthContext } from "../../../context/authContext";
import { FormControl, Select, MenuItem, OutlinedInput } from "@mui/material";

const Articletab = () => {
  const [selectedTab, setSelectedTab] = useState("Articles");
  const [topics, setTopics] = useState([]); // Available topics from API
  const [filteredTopics, setFilteredTopics] = useState([]); // Topics to display
  const [selectedTopics, setSelectedTopics] = useState([]); // Selected topics

  const { currentUser } = useContext(AuthContext);

  // Fetch topics from the API
  useEffect(() => {
    const fetchTopics = async () => {
      try {
        const response = await makeRequest.get("/articles/getTopics");
        setTopics(response.data); // Assuming the API returns an array of topics
        setFilteredTopics(response.data.slice(0, 5)); // Initially display the first 5 topics
      } catch (error) {
        console.error("Error fetching topics:", error);
      }
    };

    fetchTopics();
    trackLocation(1);
  }, []);

  // Filter topics based on selected topics
  useEffect(() => {
    if (!selectedTopics.length) {
      setFilteredTopics(topics.slice(0, 5)); // Show only the first 5 topics if none are selected
    } else {
      const filtered = topics.filter((topic) =>
        selectedTopics.some((selected) =>
          topic.topic_name.toLowerCase().includes(selected.toLowerCase())
        )
      );
      setFilteredTopics(filtered.slice(0, 5)); // Limit to 5 filtered topics
    }
  }, [selectedTopics, topics]);

  // Handle topic selection in dropdown
  const handleTopicChange = (event) => {
    const value = event.target.value;
    setSelectedTopics(typeof value === "string" ? value.split(",") : value);
  };

  console.log(selectedTopics);


  return (
    <div className="articlestab">
      {/* Navigation Tabs */}
      <div className="tab2">
        <button
          className={selectedTab === "Articles" ? "active" : ""}
          onClick={() => setSelectedTab("Articles")}
        >
          Community
        </button>

        {currentUser?.type === "expert" && (
          <button
            className={selectedTab === "Articlecollabs" ? "active" : ""}
            onClick={() => setSelectedTab("Articlecollabs")}
          >
            Collaborating
          </button>
        )}

        <button
          className={selectedTab === "Following" ? "active" : ""}
          onClick={() => setSelectedTab("Following")}
        >
          Following
        </button>

        {/* Dropdown Menu for Topics */}
        <div className="header-actions">
          <FormControl sx={{ width: "250px" }}>
            <Select
              multiple
              value={selectedTopics}
              onChange={handleTopicChange}
              input={<OutlinedInput />}
              displayEmpty // Enables placeholder text
              renderValue={(selected) =>
                selected.length > 0
                  ? selected.join(", ") // Render selected topic names
                  : "Select topics" // Placeholder text
              }
              MenuProps={{
                PaperProps: {
                  style: {
                    maxHeight: 300, // Limit dropdown height
                    width: 250, // Matches the dropdown width
                    overflowY: "auto", // Add vertical scrolling for items
                  },
                },
              }}
              sx={{
                "& .MuiSelect-select": {
                  padding: "8px 12px",
                  fontSize: "14px",
                  color: "#5f3615", // Brown text color
                },
                "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#5f3615", // Brown border when focused
                },
                "&:hover .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#8b6324", // Darker brown border on hover
                },
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#d4a76b", // Default light brown border
                },
              }}
            >
              {topics.map((topic) => (
                <MenuItem
                  key={topic.id}
                  value={topic.topic_name}
                  disabled={
                    selectedTopics.length >= 5 &&
                    !selectedTopics.includes(topic.topic_name)
                  } // Disable extra selections
                  sx={{
                    "&.Mui-selected": {
                      backgroundColor: "#f4e4d6", // Light brown for selected items
                      color: "#5f3615",
                    },
                    "&.Mui-selected:hover": {
                      backgroundColor: "#e8d3bf", // Slightly darker on hover
                    },
                  }}
                >
                  {topic.topic_name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </div>
      </div>

      {/* Content Sections */}
      {selectedTab === "Articles" && (
        <div className="articlescontent">
          <Articles selectedTopics={selectedTopics} />
        </div>
      )}

      {selectedTab === "Articlecollabs" && (
        <div className="collabscontent">
          <Articlecollabs topicsFilter={selectedTopics} />
        </div>
      )}

      {selectedTab === "Following" && (
        <div className="followingcontent">
          <Following selectedTopics={selectedTopics} />
        </div>
      )}
    </div>
  );
};

export default Articletab;
