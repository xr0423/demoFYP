import React, { useState, useEffect, useRef, useContext } from "react";
import NotificationsOutlinedIcon from "@mui/icons-material/NotificationsOutlined";
import { makeRequest } from "../../../axios";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../../../context/authContext";
import Post from "../post/Post"; // Assume you have a post detail component
import "./allNotification.scss";
import moment from "moment";


const NotificationDropdown = () => {
  const { currentUser } = useContext(AuthContext); // Get currentUser from AuthContext
  const [isNotificationPanelOpen, setIsNotificationPanelOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const notificationPanelRef = useRef(null);
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState(null);
  const [page, setPage] = useState(1); // Tracks current page
  const [hasMore, setHasMore] = useState(true); // Tracks if more notifications exist

  // Toggle notification dropdown
  const toggleNotificationPanel = () =>
    setIsNotificationPanelOpen((prev) => !prev);

  // Infinite scroll handler
  const handleScroll = () => {
    if (
      notificationPanelRef.current &&
      notificationPanelRef.current.scrollTop + notificationPanelRef.current.clientHeight >=
        notificationPanelRef.current.scrollHeight
    ) {
      if (hasMore && !loading) {
        setPage((prevPage) => prevPage + 1); // Load the next page
      }
    }
  };

  // Attach scroll event listener
  useEffect(() => {
    if (isNotificationPanelOpen) {
      notificationPanelRef.current.addEventListener("scroll", handleScroll);
    }
    return () => {
      if (notificationPanelRef.current) {
        notificationPanelRef.current.removeEventListener("scroll", handleScroll);
      }
    };
  }, [isNotificationPanelOpen, notifications, hasMore, loading]);

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await makeRequest.get(`/users/allNotifications?page=${page}`);
      setNotifications((prev) => [...prev, ...res.data.notifications || []]);
      setHasMore(res.data.notifications.length > 0); // Stop if no more notifications
      setLoading(false);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      setLoading(false);
    }
  };

  // Handle click to open modal or navigate, and mark as read
  const handleNotificationClick = (notification) => {
    // Mark the notification as read
    if (notification.isread === "unread") {
      markNotificationAsRead(notification.id);
    }

    // Handle modal or navigation based on notification type
    switch (notification.type) {
      case "add post":
      case "share post":
      case "like post":
      case "save post":
        openModal(notification.post_id); // Open modal for these cases
        break;
      default:
        handleNavigation(notification); // Navigate for other cases
    }
  };

  // Open modal
  const openModal = async (postId) => {
    try {
      const res = await makeRequest.get(`/posts/${postId}`); // Fetch post details using the ID
      setModalContent(res.data); // Set the fetched post/shop data
      setIsModalOpen(true); // Show the modal
    } catch (error) {
      console.error("Error fetching post details:", error);
    }
  };

  // Handle navigation
  const handleNavigation = (notification) => {
    const path = getNotificationPath(notification);
    if (path) {
      navigate(path);
    }
  };

  // mark as read
  const markNotificationAsRead = async (notificationId) => {
    try {
      await makeRequest.put(`/users/notification/${notificationId}/markAsRead`);
      // Update the notification state locally to reflect the read status
      setNotifications((prevNotifications) =>
        prevNotifications.map((notification) =>
          notification.id === notificationId
            ? { ...notification, isread: "read" }
            : notification
        )
      );
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  // Get path for navigation
  const getNotificationPath = (notification) => {
    switch (notification.type) {
      case "meetup deleted":
      case "meetup updated":
      case "meetup request":
      case "meetup accepted":
      case "suspend account meetup receiver":
      case "suspend account meetup creator":
      case "suspend shop meetup receiver":
      case "suspend shop meetup creator":
        return "/user/meetup";

      case "suspend shop event":
      case "suspend account event":
      case "owner delete event":
      case "owner update event":
        if (currentUser.type === "expert") {
          return `/expert/meetup`;
        } else {
          return `/user/meetup`;
        }

      case "add review":
      case "save shop":
        return `/owner/shoplisting/${notification.shop_id}/overview`;

      case "create listing":
        return currentUser?.type === "regular"
          ? `/user/shoplisting/${notification.shop_id}/overview`
          : `/expert/shoplisting/${notification.shop_id}/overview`;

      case "follow request":
      case "friend request":
      case "friend request accepted":
        return currentUser.type === "regular"
          ? "/user/friends"
          : "/expert/friends";

      case "article collab":
        return `/expert/articlestab`;

      case "like article":
      case "save article":
      case "share article":
        if (currentUser.type === "expert") {
          return `/expert/articledetails/${notification.article_id}`;
        } else {
          return `/user/articledetails/${notification.article_id}`;
        }
      default:
        return "";
    }
  };

  // Handle click outside to close dropdown
  const handleClickOutside = (e) => {
    if (
      isNotificationPanelOpen &&
      notificationPanelRef.current &&
      !notificationPanelRef.current.contains(e.target)
    ) {
      setIsNotificationPanelOpen(false);
    }
  };

  // Fetch notifications on mount and attach outside click handler
  useEffect(() => {
    fetchNotifications();
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isNotificationPanelOpen]);

  // Get dynamic profile path
  const getProfilePath = (fromId) => {
    if (!currentUser?.type) return "/"; // Default fallback path
    if (currentUser.type === "expert") return `/expert/profile/${fromId}`;
    if (currentUser.type === "owner") return `/owner/profile/${fromId}`;
    return `/user/profile/${fromId}`;
  };

  // Calculate unread notifications count
  const unreadNotificationsCount = notifications.filter(
    (notification) => notification.isread === "unread"
  ).length;

  // mark all as read
  const markAllNotificationsAsRead = async () => {
    try {
      await makeRequest.put("/users/markAllNotificationsAsRead");
      setNotifications((prevNotifications) =>
        prevNotifications.map((notification) => ({
          ...notification,
          isread: "read", // Mark all notifications as read
        }))
      );
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  };

  return (
    <div className="user-notification" ref={notificationPanelRef}>
      <NotificationsOutlinedIcon
        onClick={toggleNotificationPanel}
        style={{ color: "white" }}
      />
      {/* Show unread notification count */}
      {unreadNotificationsCount > 0 && (
        <span
          className="notification-count"
          style={{
            position: "absolute",
            backgroundColor: "white", // Or any other color
            left: "-10px",
            top: "-10px",
            color: "black",
            fontWeight: "bold",
            borderRadius: "50%",
            padding: "2px 4px",
            border: "1px solid white", // White border
            fontSize: "12px",
            display: "inline-flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {unreadNotificationsCount}
        </span>
      )}
      {isNotificationPanelOpen && (
        <div className="user-notification-panel">
          <div className="user-notification-header">
            <h4>Notifications</h4>
            <button
              className="read-all-btn"
              onClick={markAllNotificationsAsRead}
              style={{
                backgroundColor: "rgb(81, 66, 66)",
                color: "white",
                padding: "5px",
                borderRadius: "10px",
                cursor: "pointer",
              }}
            >
              Read All
            </button>
          </div>
          <ul className="user-notification-list">
            {loading ? (
              <li>Loading...</li>
            ) : notifications.length > 0 ? (
              notifications.map((notification, index) => {
                // Skip rendering for specific notifications
                if (
                  notification.type === "add post" &&
                  notification.user_type_id == 3
                ) {
                  return null; // Skip this item
                }

                return (
                  <li
                    key={index}
                    className="user-notification-item"
                    onClick={() => handleNotificationClick(notification)}
                    style={{
                      cursor: "pointer",
                      backgroundColor:
                        notification.isread === "unread"
                          ? "#B89C87"
                          : "#f6f3f3", // darker color for unread
                    }}
                  >
                    {/* Conditionally render the profile picture */}
                    {![
                      "suspend account event",
                      "suspend account meetup receiver",
                      "suspend account meetup creator",
                      "suspend shop meetup receiver",
                      "suspend shop meetup creator",
                      "suspend shop event",
                    ].includes(notification.type) && (
                      <img
                        src={
                          notification.profilePic
                            ? `/upload/${notification.profilePic}`
                            : `/upload/empty-profile-picture.jpg`
                        }
                        alt="Profile"
                        className="user-notification-avatar"
                      />
                    )}
                    <div className="user-notification-content">
                      <p>
                        <strong>
                          <u>
                            {![
                              "suspend account event",
                              "suspend account meetup receiver",
                              "suspend account meetup creator",
                              "suspend shop meetup receiver",
                              "suspend shop meetup creator",
                              "suspend shop event",
                            ].includes(notification.type) && (
                              <Link
                                to={getProfilePath(notification.from_id)}
                                onClick={(e) => e.stopPropagation()}
                                style={{
                                  color: "black",
                                  textDecoration: "none",
                                }}
                              >
                                {notification.from_name}
                              </Link>
                            )}
                          </u>
                        </strong>
                        {notification.type === "meetup deleted" &&
                          " has deleted a meetup you are participating."}
                        {notification.type === "meetup updated" &&
                          " has updated a meetup you are participating."}

                        {notification.type === "add post" &&
                          " added a new post."}
                        {notification.type === "add review" &&
                          " reviewed your shop."}
                        {notification.type === "share post" &&
                          " shared a post."}
                        {notification.type === "follow request" &&
                          " has followed you."}
                        {notification.type === "meetup request" &&
                          " has sent you a meetup request."}
                        {notification.type === "meetup accepted" &&
                          " has accepted your meetup request."}
                        {notification.type === "friend request" &&
                          " has sent you a friend request."}
                        {notification.type === "friend request accepted" &&
                          " has accepted your friend request."}
                        {notification.type === "like post" &&
                          " has liked your post."}
                        {notification.type === "like article" &&
                          " has liked your article."}
                        {notification.type === "save article" &&
                          " has saved your article."}
                        {notification.type === "save post" &&
                          " has saved your post."}
                        {notification.type === "save shop" &&
                          " has saved your shop."}
                        {notification.type === "article collab" &&
                          " has invited you to collab on an article."}
                        {notification.type === "share article" &&
                          " shared an article."}
                        {notification.type === "create listing" &&
                          " has a new shop."}

                        {notification.type === "owner update event" && (
                          <p>
                            {`has updated an event that you are participating. `}
                            <Link
                              to={`/${
                                currentUser?.type === "expert"
                                  ? "expert"
                                  : "user"
                              }/shoplisting/${notification.shop_id}/overview`}
                              onClick={(e) => e.stopPropagation()}
                              style={{
                                color: "black",
                                textDecoration: "underline",
                              }}
                            >
                              <b>View shop</b>
                            </Link>
                            {`.`}
                          </p>
                        )}

                        {notification.type === "owner delete event" && (
                          <p>
                            {`has deleted an event that you are participating. `}
                              <b>{`${notification.refund} has been refunded. `}</b>
                            <Link
                              to={`/${
                                currentUser?.type === "expert"
                                  ? "expert"
                                  : "user"
                              }/shoplisting/${notification.shop_id}/overview`}
                              onClick={(e) => e.stopPropagation()} // Prevent parent <li>'s onClick
                              style={{
                                color: "black",
                                textDecoration: "underline",
                                cursor: "pointer",
                              }}
                            >
                              <b>View Shop</b>
                            </Link>
                            
                          </p>
                        )}

                        {notification.type === "suspend account event" &&
                          `An owner has their account suspended, an event you joined is removed. ${notification.refund} has been refunded.`}
                        {notification.type ===
                          "suspend account meetup receiver" &&
                          "An owner has their account suspended, a meetup you joined is removed."}
                        {notification.type ===
                          "suspend account meetup creator" &&
                          " An owner has their account suspended, a meetup you created is removed."}
                        {notification.type === "suspend shop meetup receiver" &&
                          " A shop has been suspended, a meetup you joined is removed."}
                        {notification.type === "suspend shop meetup creator" &&
                          " A shop has been suspended, a meetup you created is removed."}
                        {notification.type === "suspend shop event" && (
                          <>
                            A shop has been suspended, an event you joined is
                            removed.{" "}
                            <b>{notification.refund} has been refunded.</b>
                          </>
                        )}
                      </p>
                      <p className="notification-timestamp" style={{ fontSize: "12px", color: "gray" }}>
                        {moment(notification.created_on).format("MMM DD, YYYY [at] h:mm A")}
                      </p>
                    </div>
                  </li>
                );
              })
            ) : (
              <li className="user-no-notifications">No new notifications</li>
            )}
          </ul>
        </div>
      )}
      {/* Post Modal */}
      {isModalOpen && modalContent && (
        <div className="post-notification-modal-overlay">
          <div className="post-notfication-modal-content">
            <button
              className="close-button"
              onClick={() => setIsModalOpen(false)}
            >
              x
            </button>
            <Post post={modalContent} />
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
