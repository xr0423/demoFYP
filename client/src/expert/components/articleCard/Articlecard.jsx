import React, { useState, useContext, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./articleCard.scss";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import ShareOutlinedIcon from "@mui/icons-material/ShareOutlined";
import BookmarkBorderIcon from "@mui/icons-material/BookmarkBorder";
import BookmarkIcon from "@mui/icons-material/Bookmark";
import DeleteIcon from "@mui/icons-material/Delete";
import LocalCafeIcon from "@mui/icons-material/LocalCafe";
import LocalCafeOutlinedIcon from "@mui/icons-material/LocalCafeOutlined";
import { AuthContext } from "../../../context/authContext";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { makeRequest } from "../../../axios";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";

const ArticleCard = ({ article }) => {
  const { id, title, topics, author_name, author_profile, author_id } = article;
  const { currentUser } = useContext(AuthContext);
  const queryClient = useQueryClient();
  const [isSaved, setIsSaved] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const dropdownRef = useRef();
  const navigate = useNavigate();
  const [snackbarOpen, setSnackbarOpen] = useState(false); // For Snackbar state
  const [snackbarMessage, setSnackbarMessage] = useState(""); // Snackbar message
  const [shareModalOpen, setShareModalOpen] = useState(false); // To manage modal visibility
  const [friendsList, setFriendsList] = useState([]); // To store the fetched friends list
  const [selectedFriends, setSelectedFriends] = useState([]); // To store selected friends
  const [searchTerm, setSearchTerm] = useState(""); 


  const toggleMenu = (e) => {
    e.stopPropagation(); // Prevents handleDetails from being triggered
    setMenuOpen((prev) => !prev);
  };
  

  // Fetch the like status for the article
  const { data: likesData = [] } = useQuery({
    queryKey: ["articleLikes", article.id],
    queryFn: async () => {
      const res = await makeRequest.get(`/likes/getArtLike?articleId=${article.id}`);
      return res.data;
    },
  });

  // Mutation to like/unlike the article
  const likeMutation = useMutation({
    mutationFn: (liked) => {
      return liked
        ? makeRequest.delete(`/likes/deleteArtLike?articleId=${article.id}`)
        : makeRequest.post(`/likes/addArtLike`, { articleId: article.id });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["articleLikes", article.id]);
    },
  });

  const handleLike = (e) => {
    e.stopPropagation();
    const liked = likesData.includes(currentUser.id);
    likeMutation.mutate(liked);
  };


  // Mutation to save/unsave the article
  const saveMutation = useMutation({
    mutationFn: async () => {
      if (isSaved) {
        return makeRequest.delete(`/favorites/delfavArticle?articleId=${id}`);
      } else {
        return makeRequest.post(`/favorites/addfavArticle`, { articleId: id });
      }
    },
    onSuccess: () => {
      setIsSaved((prev) => !prev);
      queryClient.invalidateQueries(["articleSavedState", id]);
      queryClient.invalidateQueries(["favorites"]);
    },
  });

  const handleSave = (e) => {
    e.stopPropagation();
    saveMutation.mutate();
    setMenuOpen(false);
  };

  // Function to delete the article
  const deleteMutation = useMutation({
    mutationFn: () => makeRequest.delete(`/articles/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries(["articles"]);
    },
    onError: (error) => {
      console.error("Error deleting article:", error);
      alert("Failed to delete the article. Please try again.");
    },
  });
  

  const handleDelete = (e) => {
    e.stopPropagation();
    deleteMutation.mutate();
    setMenuOpen(false);
  };
  

  const handleDetails = () => {

    if (currentUser?.type === "expert") {
      navigate(`/expert/articledetails/${id}`);
    } else {
      navigate(`/user/articledetails/${id}`);
    }

  };
  
  
  // fetch friends for share
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
  const openShareModal = (e) => {
    e.stopPropagation();
    setShareModalOpen(true);
    fetchFriends();
  };
  const handleShareAll = async () => {
    try {
      await makeRequest.post("/articles/sharearticle", {
        articleId: article.id, // Include the post ID being shared
        friends: selectedFriends, // Send the selected friend IDs
      });
      alert("Article shared successfully!");
      setShareModalOpen(false); // Close the modal after sharing
      setSelectedFriends([]); // Clear selected friends
    } catch (error) {
      console.error("Error sharing with friends:", error);
    }
  };  

  const filteredFriends = friendsList.filter((friend) =>
    friend.name.toLowerCase().includes(searchTerm.toLowerCase())
  );  
  
  const closeShareModal = (e) => {
    e.stopPropagation();
    setShareModalOpen(false);
};

  const handleSnackbarClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setSnackbarOpen(false);
  };
  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const fetchSavedStatus = async () => {
      try {
        const res = await makeRequest.get(`/favorites/article/favStatus/${article.id}`);
        setIsSaved(res.data.saved); // Now this should work correctly
      } catch (error) {
        console.error("Error fetching saved status:", error);
      }
    };

    fetchSavedStatus();
  }, [article.id]);

  // name route
  const targetRoute = 
    currentUser?.type === "expert"
      ? `/expert/profile/${author_id}`
      : `/user/profile/${author_id}`;
  
  return (
    <div>
    <div className="article-item" onClick={handleDetails}>
      <div className="articleauthorinfo">
        <img src={ author_profile? `/upload/${author_profile}` : "/upload/empty-profile-picture.jpg"} alt="/upload/empty-profile-picture.jpg" className="articleauthorpic" />
        <Link
                to={targetRoute}
                onClick={(e) => e.stopPropagation()}
                style={{ textDecoration: "none", color: "inherit" }}
              >
                <span className="articleauthorname">
                  <u>{author_name}</u>
                </span>
          </Link>

        <div className="more-icon-container" ref={dropdownRef}>
          <MoreHorizIcon onClick={toggleMenu} className="more-icon" />
          {menuOpen && (
            <div className="dropdown-menu">
              {currentUser.id === author_id ? (
                <>
                  <span onClick={handleDelete}>
                    Delete <DeleteIcon />
                  </span>
                    <span onClick={openShareModal}>
                      Share <ShareOutlinedIcon/>
                    </span>
                 
                </>
              ) : (
                <>
                  <span onClick={handleSave}>
                    {isSaved ? "Unsave" : "Save"}{" "}
                    {isSaved ? <BookmarkIcon /> : <BookmarkBorderIcon />}
                  </span>
                  <span onClick={openShareModal}>
                    Share <ShareOutlinedIcon />
                  </span>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="articlecontent">
        <h2 className="article-title">{title}</h2>
        <p className="article-topics">
          <strong>Topics:</strong> {topics || "No topics available"}
        </p>
        <p className="card-excerpt">
          {article.content.substring(0, 100)}...
        </p>

        <div className="buttons">
          <div className="like-container" onClick={handleLike}>
            {likesData.includes(currentUser.id) ? (
              <LocalCafeIcon className="icon-hover" />
            ) : (
              <LocalCafeOutlinedIcon className="icon-hover" />
            )}
            <span>{likesData.length || 0} Likes</span>

          </div>
        </div>

      </div>
      
    </div>
    {/*Share modal  */}
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
            {filteredFriends.length > 0 ? (
              <ul className="friends-list">
                {filteredFriends.map((friend) => (
                  <li
                    key={friend.id}
                    className={`friend-item ${selectedFriends.includes(friend.id) ? "selected" : ""}`}
                    onClick={() => toggleFriendSelection(friend.id)}
                  >
                    <div className="friend-details">
                      <img
                        src={friend.profilePic ? `/upload/${friend.profilePic}` : "/upload/empty-profile-picture.jpg"}
                        alt="/upload/empty-profile-picture.jpg"
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
                onClick={handleShareAll} // Add the onClick handler here
              >
                Share with {selectedFriends.length} Friend{selectedFriends.length !== 1 && "s"}
              </button>

          </div>
        </div>
      
      )}
       <Snackbar
        open={snackbarOpen}
        autoHideDuration={2000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert onClose={handleSnackbarClose} severity="info" sx={{ width: "100%" }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default ArticleCard;