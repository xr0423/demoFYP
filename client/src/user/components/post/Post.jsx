import React, { useState, useContext, useEffect } from "react";
import "./post.scss";
import LocalCafeIcon from "@mui/icons-material/LocalCafe";
import LocalCafeOutlinedIcon from "@mui/icons-material/LocalCafeOutlined";
import TextsmsOutlinedIcon from "@mui/icons-material/TextsmsOutlined";
import ShareOutlinedIcon from "@mui/icons-material/ShareOutlined";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import BookmarkIcon from "@mui/icons-material/Bookmark";
import BookmarkBorderIcon from "@mui/icons-material/BookmarkBorder";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import Carousel from "react-material-ui-carousel";
import Chip from "@mui/material/Chip";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";

import { Link } from "react-router-dom";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import moment from "moment";
import { makeRequest } from "../../../axios";
import { AuthContext } from "../../../context/authContext";

import Comments from "../comments/Comments";
import PostUpdate from "../postUpdate/PostUpdate";

const Post = ({ post, shopId }) => {
  const [commentOpen, setCommentOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [numOfComments, setNumOfComments] = useState(0);
  const [showFullText, setShowFullText] = useState(false);
  const [carouselKey, setCarouselKey] = useState(0);
  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false); // For Snackbar state
  const [snackbarMessage, setSnackbarMessage] = useState(""); // Snackbar message
  const [shareModalOpen, setShareModalOpen] = useState(false); // To manage modal visibility
  const [friendsList, setFriendsList] = useState([]); // To store the fetched friends list
  const [selectedFriends, setSelectedFriends] = useState([]); // To store selected friends
  const [searchTerm, setSearchTerm] = useState(""); // To store the search input

  const { currentUser } = useContext(AuthContext);
  const queryClient = useQueryClient();

  // fetch friends for share
  const fetchFriends = async () => {
    try {
      const res = await makeRequest.get(
        `/friendRequest/getall?userId=${currentUser.id}`
      );
      setFriendsList(res.data.friendsInfo);
    } catch (error) {
      console.error("Error fetching friends list:", error);
    }
  };

  // open share modal
  const openShareModal = () => {
    setShareModalOpen(true);
    fetchFriends();
  };

  const toggleFriendSelection = (friendId) => {
    setSelectedFriends(
      (prev) =>
        prev.includes(friendId)
          ? prev.filter((id) => id !== friendId) // Remove if already selected
          : [...prev, friendId] // Add if not selected
    );
  };

  const handleShareAll = async () => {
    try {
      await makeRequest.post("/posts/sharepost", {
        postId: post.id, // Include the post ID being shared
        friends: selectedFriends, // Send the selected friend IDs
      });
      alert("Post shared successfully!");
      setShareModalOpen(false); // Close the modal after sharing
      setSelectedFriends([]); // Clear selected friends
    } catch (error) {
      console.error("Error sharing with friends:", error);
    }
  };

  const filteredFriends = friendsList.filter((friend) =>
    friend.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const closeShareModal = () => setShareModalOpen(false);

  const getImageSrc = (imageUrl) => {
    if (!imageUrl || imageUrl === "")
      return "/upload/empty-profile-picture.jpg";
    if (imageUrl.startsWith("http") || imageUrl.startsWith("https")) {
      return imageUrl;
    } else {
      return `/upload/${imageUrl}`;
    }
  };

  useEffect(() => {
    setCarouselKey((prevKey) => prevKey + 1);
  }, [post.img]);

  const handleToggleText = () => {
    setShowFullText((prevState) => !prevState);
  };

  // get ;ikes
  const { isLoading, data } = useQuery({
    queryKey: ["likes", post.id],
    queryFn: () =>
      makeRequest.get(`/likes?postId=${post.id}`).then((res) => res.data),
  });

  useEffect(() => {
    const fetchSavedStatus = async () => {
      try {
        const res = await makeRequest.get(
          `/favorites/post/favStatus/${post.id}`
        );
        setIsSaved(res.data.saved);
      } catch (error) {
        console.error("Error fetching saved status:", error);
      }
    };
    fetchSavedStatus();
    setNumOfComments(post.totalComments);
  }, [post.id]);

  const likeMutation = useMutation({
    mutationFn: (liked) => {
      return liked
        ? makeRequest.delete(`/likes?postId=${post.id}`)
        : makeRequest.post("/likes", { postId: post.id });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["likes", post.id]);
      setSnackbarMessage("You liked the post!");
      setSnackbarOpen(true);
    },
  });

  const handleLike = () => {
    const liked = data?.includes(currentUser.id);
    likeMutation.mutate(liked);
  };

  const deleteMutation = useMutation({
    mutationFn: () => makeRequest.delete(`/posts/${post.id}`),
    onSuccess: () => {
      queryClient.invalidateQueries(["posts"]);
      setSnackbarMessage("Post deleted successfully!");
      setSnackbarOpen(true);
    },
  });

  const handleDelete = () => {
    deleteMutation.mutate();
  };

  const handleUpdate = () => {
    setUpdateModalOpen(true);
  };

  const closeUpdateModal = () => {
    setUpdateModalOpen(false);
  };

  const saveMutation = useMutation({
    mutationFn: () => {
      return isSaved
        ? makeRequest.delete(`/favorites/delfavPost?postId=${post.id}`)
        : makeRequest.post("/favorites/addfavPost", { postId: post.id });
    },
    onSuccess: () => {
      setIsSaved((prev) => !prev);
      queryClient.invalidateQueries(["favorites"]);
      setSnackbarMessage(isSaved ? "Post unsaved!" : "Post saved!");
      setSnackbarOpen(true);
    },
    onError: (error) => {
      console.error("Error saving/un-saving the post:", error);
      setSnackbarMessage("Error saving/un-saving the post!");
      setSnackbarOpen(true);
    },
  });

  const handleSave = () => {
    saveMutation.mutate();
    setMenuOpen(false);
  };

  const handleSnackbarClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setSnackbarOpen(false);
  };

  const getShopLink = (shopId, userType) => {
    switch (userType) {
      case "regular":
        return `/user/shoplisting/${shopId}/overview`;
      case "owner":
        return `/owner/shoplisting/${shopId}/overview`;
      case "expert":
        return `/expert/shoplisting/${shopId}/overview`;
      default:
        return `/admin/shoplisting/${shopId}/overview`;
    }
  };

  const getProfileLink = (userType, userId) => {
    switch (userType) {
      case "regular":
        return `/user/profile/${userId}`;
      case "owner":
        return `/owner/profile/${userId}`;
      case "expert":
        return `/expert/profile/${userId}`;
      default:
        return `/admin/check-user-profile/${userId}`;
    }
  };

  if (!post) {
    return <div className="post-error">Post data is missing.</div>;
  }

  const images = [...new Set(post.img ? post.img.split(",") : [])]; // Deduplicate images

  return (
    <div className="reg-user-post">
      <div className="container">
        {/* Post details and other functionalities */}
        <div className="user">
          <div className="userInfo">
            <img
              src={getImageSrc(post.profilePic)}
              alt={`${post.name}'s profile picture`}
            />
            <div className="details">
              <Link
                to={getProfileLink(currentUser.type, post.userid)}
                style={{ textDecoration: "none", color: "inherit" }}
              >
                <span className="name">
                  <u>{post.name}</u>
                </span>
              </Link>
              <span className="date">
                {moment(post.createdAt).fromNow()}
                {post.shop_name ? " at " : ""}
                {post.shop_name && (
                  <Link to={getShopLink(post.shop_id, currentUser?.type)} className="shop-link">
                    <u>{post.shop_name}</u>
                  </Link>
                )}
                {post.advertised && (
                  <span style={{ border: "2px solid brown", padding: "3px 6px", borderRadius: "4px", color: "brown", fontWeight: "bold", marginLeft: "20px", display: "inline-block" }}>
                    Advertisement
                  </span>
                )}
              </span>
            </div>
          </div>

          <div className="moreOptions">
            {(currentUser.type === "regular" ||
              currentUser.type === "owner" || currentUser.type==="expert") && (
              <MoreHorizIcon onClick={() => setMenuOpen(!menuOpen)} />
            )}

            {menuOpen && (
              <div className="dropdownMenu">
                <span onClick={handleSave} className="dropdown-item">
                  {isSaved ? (
                    <>
                      <BookmarkIcon className="icon" />
                      Unsave
                    </>
                  ) : (
                    <>
                      <BookmarkBorderIcon className="icon" />
                      Save
                    </>
                  )}
                </span>
                {currentUser.id === post.userid && (
                  <>
                    <span onClick={handleUpdate} className="dropdown-item">
                      <EditIcon className="icon" />
                      Update
                    </span>
                    <span onClick={handleDelete} className="dropdown-item">
                      <DeleteIcon className="icon" />
                      Delete
                    </span>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="content">
          {/* Render content here */}
          {post.categories && post.categories.length > 0 && (
            <div className="categories">
              {post.categories.split(",").map((category, index) => (
                <Chip
                  key={index}
                  label={category.trim()}
                  className="category-chip"
                />
              ))}
            </div>
          )}

          <p className={showFullText ? "show-full-text" : "truncate"}>
            {post.desc || ""}
          </p>
          {post.desc && post.desc.length > 100 && (
            <span className="read-more" onClick={handleToggleText}>
              {showFullText ? "Show Less" : "Read More"}
            </span>
          )}

          {images.length > 0 && (
            <Carousel
              key={carouselKey}
              autoPlay={false}
              navButtonsAlwaysVisible={images.length > 1}
              indicators={false}
              animation="slide"
            >
              {images.map((img, index) => (
                <img
                  key={index}
                  src={`/upload/${img}`}
                  alt={`Post Image ${index + 1}`}
                  style={{
                    width: "100%",
                    height: "400px",
                    objectFit: "contain",
                    borderRadius: "10px",
                    marginTop: "10px",
                  }}
                />
              ))}
            </Carousel>
          )}
        </div>

        <div className="info">
          <div className="item">
            {isLoading ? (
              "Loading"
            ) : data?.includes(currentUser.id) ? (
              <LocalCafeIcon
                style={{ color: "brown" }}
                onClick={handleLike}
                className="icon-hover"
              />
            ) : (
              <LocalCafeOutlinedIcon
                style={{ color: "brown" }}
                onClick={handleLike}
                className="icon-hover"
              />
            )}
            <span>{data?.length || 0} Likes</span>
          </div>
          <div className="item" onClick={() => setCommentOpen(!commentOpen)}>
            <TextsmsOutlinedIcon />
            <span>{numOfComments} Comments</span>
          </div>
          {(currentUser.type === "regular" ||
            currentUser.type === "expert") && (
            <div className="item" onClick={openShareModal}>
              <ShareOutlinedIcon />
              <span>Share</span>
            </div>
          )}
        </div>

        {commentOpen && (
          <Comments postId={post.id} setNumOfComments={setNumOfComments} />
        )}
      </div>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={2000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity="info"
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>

      {/* Update Modal */}
      {/* Update Modal */}
      {updateModalOpen && (
        <div className="modal-overlay" onClick={closeUpdateModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-modal" onClick={closeUpdateModal}>
              x
            </button>
            <PostUpdate
              shopId={shopId}
              postId={post.id}
              open={updateModalOpen}
              onClose={closeUpdateModal}
              onUpdateSuccess={closeUpdateModal} // Pass closeUpdateModal as success callback
            />
          </div>
        </div>
      )}

      {/*Share modal  */}
      {shareModalOpen && (
        <div className="share-modal-overlay" onClick={closeShareModal}>
          <div
            className="share-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
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
                    className={`friend-item ${
                      selectedFriends.includes(friend.id) ? "selected" : ""
                    }`}
                    onClick={() => toggleFriendSelection(friend.id)}
                  >
                    <div className="friend-details">
                      <img
                        src={
                          friend.profilePic
                            ? `/upload/${friend.profilePic}`
                            : "/upload/empty-profile-picture.jpg"
                        }
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
              onClick={handleShareAll} // Add the onClick handler here
            >
              Share with {selectedFriends.length} Friend
              {selectedFriends.length !== 1 && "s"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Post;
