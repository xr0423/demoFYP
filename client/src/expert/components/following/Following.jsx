import React, { useContext, useEffect, useState } from "react";
import { makeRequest } from "../../../axios";
import "./following.scss";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../../context/authContext";
import Articlecard from "../articleCard/Articlecard";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";

const Following = ({ selectedTopics = [] }) => {
  const [followedArticles, setFollowedArticles] = useState([]);
  const [filteredArticles, setFilteredArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(null);
  const [isSaved, setIsSaved] = useState({});
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [friendsList, setFriendsList] = useState([]);
  const [selectedFriends, setSelectedFriends] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentArticleId, setCurrentArticleId] = useState(null);

  const navigate = useNavigate();
  const { currentUser } = useContext(AuthContext);

  useEffect(() => {
    const fetchApprovedFollows = async () => {
      try {
        const { data: followedUserIds } = await makeRequest.get("/friendRequest/getApproved");
        if (followedUserIds.length === 0) {
          setFollowedArticles([]);
          setFilteredArticles([]);
          setLoading(false);
          return;
        }

        const articlePromises = followedUserIds.map(async (userId) => {
          const { data: articles } = await makeRequest.get(`/articles?userId=${userId}`);
          return articles;
        });

        const articlesArray = await Promise.all(articlePromises);
        setFollowedArticles(articlesArray.flat());
      } catch (error) {
        console.error("Error fetching followed articles:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchApprovedFollows();
  }, []);

  useEffect(() => {
    const filterArticles = () => {
      if (!selectedTopics.length) {
        setFilteredArticles(followedArticles);
        return;
      }

      const filtered = followedArticles.filter((article) => {
        const articleTopics = article.topics
          ? article.topics.split(",").map((topic) => topic.trim().toLowerCase())
          : [];
        return selectedTopics.every((selectedTopic) =>
          articleTopics.includes(selectedTopic.toLowerCase())
        );
      });

      setFilteredArticles(filtered);
    };

    filterArticles();
  }, [followedArticles, selectedTopics]);

  const handleCardClick = (articleId) => {
    const route = currentUser.type === "expert" ? "expert" : "user";
    navigate(`/${route}/articledetails/${articleId}`);
  };

  const toggleMenu = (e, articleId) => {
    e.stopPropagation();
    setMenuOpen(menuOpen === articleId ? null : articleId);
  };

  const handleSave = async (e, articleId) => {
    e.stopPropagation();
    const currentlySaved = isSaved[articleId];
  
    try {
      if (currentlySaved) {
        await makeRequest.delete(`/favorites/delfavArticle?articleId=${articleId}`);
      } else {
        await makeRequest.post(`/favorites/addfavArticle`, { articleId });
      }
  
      setIsSaved((prev) => ({ ...prev, [articleId]: !prev[articleId] }));
      setSnackbarMessage(currentlySaved ? "Article unsaved!" : "Article saved!");
      setSnackbarOpen(true);
    } catch (error) {
      console.error("Error saving or unsaving article:", error);
      setSnackbarMessage("Failed to save the article. Please try again.");
      setSnackbarOpen(true);
    }
  
    setMenuOpen(null);
  };

  const openShareModal = (e, articleId) => {
    e.stopPropagation();
    setCurrentArticleId(articleId);
    setShareModalOpen(true);
    fetchFriends();
  };

  const closeShareModal = (e) => {
    e.stopPropagation();
    setShareModalOpen(false);
    setSelectedFriends([]); // Reset selected friends when closing the modal
  };

  const fetchFriends = async () => {
    try {
      const res = await makeRequest.get(`/friendRequest/getall?userId=${currentUser.id}`);
      setFriendsList(res.data.friendsInfo);
    } catch (error) {
      console.error("Error fetching friends list:", error);
    }
  };

  const toggleFriendSelection = (friendId) => {
    setSelectedFriends((prev) =>
      prev.includes(friendId)
        ? prev.filter((id) => id !== friendId) // Remove if already selected
        : [...prev, friendId] // Add if not selected
    );
  };

  const handleShareAll = async () => {
    try {
      await makeRequest.post("/articles/sharearticle", {
        articleId: currentArticleId,
        friends: selectedFriends,
      });
      alert("Article shared successfully!");
      closeShareModal(); // Close the modal after sharing
    } catch (error) {
      console.error("Error sharing article with friends:", error);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="following">
      {filteredArticles.length > 0 ? (
        <div className="article-grid">
          {filteredArticles.map((article) => (
            <Articlecard
              key={article.id}
              article={article}
              handleCardClick={handleCardClick}
              handleSave={handleSave}
              openShareModal={(e) => openShareModal(e, article.id)}
              isSaved={isSaved[article.id]}
            />
          ))}
        </div>
      ) : (
        <p>No articles match the selected topics.</p>
      )}

      {shareModalOpen && (
        <div className="share-modal-overlay" onClick={closeShareModal}>
          <div className="share-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-modal" onClick={closeShareModal}>
              x
            </button>
            <h3>Select Friends to Share</h3>
            <div className="search-bar">
              <input
                type="text"
                placeholder="Search friends..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
            {friendsList.length > 0 ? (
              <ul className="friends-list">
                {friendsList
                  .filter((friend) => friend.name.toLowerCase().includes(searchTerm.toLowerCase()))
                  .map((friend) => (
                    <li
                      key={friend.id}
                      className={`friend-item ${selectedFriends.includes(friend.id) ? "selected" : ""}`}
                      onClick={() => toggleFriendSelection(friend.id)}
                    >
                      <div className="friend-details">
                        <img
                          src={friend.profilePic ? `/upload/${friend.profilePic}` : "/upload/empty-profile-picture.jpg"}
                          alt={friend.name}
                          className="friend-avatar"
                        />
                        <span>{friend.name}</span>
                      </div>
                    </li>
                  ))}
              </ul>
            ) : (
              <p>No friends match your search</p>
            )}
            <button 
              className="share-all-btn" 
              onClick={handleShareAll}
            >
              Share with {selectedFriends.length} Friend{selectedFriends.length !== 1 && "s"}
            </button>
          </div>
        </div>
      )}

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={2000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert onClose={() => setSnackbarOpen(false)} severity="info" sx={{ width: "100%" }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default Following;
