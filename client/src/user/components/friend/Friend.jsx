import './friend.scss'; // Include custom styles
import React, { useContext, useState, useEffect } from "react";
import { makeRequest } from '../../../axios';
import { AuthContext } from "../../../context/authContext";
import { useNavigate } from 'react-router-dom';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';

const FriendPage = () => {
  const [friends, setFriends] = useState([]);
  const [friendRequests, setFriendRequests] = useState([]);
  const [following, setFollowing] = useState([]); // New state for following list
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showFriendRequests, setShowFriendRequests] = useState(false);
  const [showFollowing, setShowFollowing] = useState(false); // New state for "Following" tab
  const [searchResults, setSearchResults] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const { currentUser } = useContext(AuthContext);
  const [request, setRequest] = useState([]);

  const userId = currentUser.id;
  const navigate = useNavigate();

  useEffect(() => {
    if (!searchQuery) {
      fetchFriends();
      fetchFriendRequests();
      fetchNotificationRequests();
      if (showFollowing) {
        fetchFollowing();
      }
    } else {
      handleSearch(); // Trigger search when searchQuery changes
    }
  }, [showFriendRequests, showFollowing, searchQuery]);

  // Fetch Friends API
  const fetchFriends = async () => {
    setLoading(true);
    try {
      const res = await makeRequest.get(`/friendRequest/getall?userId=${userId}`);
      setFriends(res.data.friendsInfo);
    } catch (err) {
      setError(err.response ? err.response.data.message : err.message);
    } finally {
      setLoading(false);
    }
  };


  const fetchNotificationRequests = async () => {
    try {
      const requests = await makeRequest.get(`/friendRequest/getRequest`);
      setRequest(requests.data);
    } catch (err) {
      console.error('Failed to load friend requests for notifications');
    }
  };

  // Fetch Friend Requests API
  const fetchFriendRequests = async () => {
    try {
      const res = await makeRequest.get(`/friendRequest/getFriendRequest?userId=${userId}&status=4`);
      setFriendRequests(res.data.requests);
    } catch (err) {
      setError(err.response ? err.response.data.message : err.message);
    }
  };

  // Fetch Following API
  const fetchFollowing = async () => {
    setLoading(true);
    try {
      // Pass the current user's ID as the followedUserId to get their followers
      const res = await makeRequest.get(`/relationships/following?followerUserId=${userId}`);
      setFollowing(res.data); // res.data will contain an array of followerUserIds
      console.log(res.data);
    } catch (err) {
      setError(err.response ? err.response.data.message : err.message);
    } finally {
      setLoading(false);
    }
  };



  // Search Users API
  const handleSearch = async () => {
    if (!searchQuery) {
      setSearchResults([]);
      return;
    }

    try {
      const res = await makeRequest.get(`/users/search?query=${searchQuery}&userId=${userId}`);
      setSearchResults(res.data.users);
    } catch (err) {
      setError("Error searching for users");
      console.error(err.message);
    }
  };

  const handleAcceptRequest = async (requestId) => {
    try {
      await makeRequest.post(`/friendRequest/accept?userId=${userId}&friendId=${requestId}`);
      setFriendRequests((prevRequests) => prevRequests.filter(request => request.id !== requestId));
      fetchNotificationRequests();
    } catch (err) {
      setError('Failed to accept the friend request.');
      console.error(err.message);
    }
  };

  const handleRejectRequest = async (requestId) => {
    const confirmReject = window.confirm("Are you sure you want to reject?");
    if (confirmReject) {
      try {
        await makeRequest.delete(`/friendRequest/cancel?userId=${userId}&friendId=${requestId}`);
        setFriendRequests((prevRequests) => prevRequests.filter(request => request.id !== requestId));
        fetchNotificationRequests();
      } catch (err) {
        setError('Failed to reject the friend request.');
        console.error(err.message);
      }
    }
  };

  const handleUnfriend = async (friend) => {
    const confirmUnfriend = window.confirm(`Are you sure you want to unfriend ${friend.name}?`);
    if (confirmUnfriend) {
      try {
        await makeRequest.delete(`/friendRequest/remove?userId=${userId}&friendId=${friend.id}`);
        setFriends((prevFriends) => prevFriends.filter(f => f.id !== friend.id));
      } catch (err) {
        setError('Failed to unfriend the user.');
        console.error(err.message);
      }
    }
  };

  const handleUnfollow = async (followedUser) => {
    const confirmUnfollow = window.confirm(`Are you sure you want to unfollow ${followedUser.name}?`);
    if (confirmUnfollow) {
      try {
        await makeRequest.delete(`/relationships?userId=${userId}&followId=${followedUser.id}`);
        setFollowing((prevFollowing) => prevFollowing.filter(f => f.id !== followedUser.id));
      } catch (err) {
        setError('Failed to unfollow the user.');
        console.error(err.message);
      }
    }
  };

  const handleNavigateToProfile = (friendId) => {
    if (currentUser?.type === "regular") {
        navigate(`/user/profile/${friendId}`);
    } else if (currentUser?.type === "expert") {
        navigate(`/expert/profile/${friendId}`);
    } else {
        console.error("Unknown user type");
        // Optionally navigate to a default or error page
    }
  };

  const handleSearchInputChange = (e) => {
    setSearchQuery(e.target.value);
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  const receivedRequests = request.filter(req => req.recipient_id === currentUser.id);

  // Check if a user is already a friend
  const isFriend = (userId) => friends.some(friend => friend.id === userId);

  return (
    <div className="whole-friend-page">
      <div className="friend-page">
        <div className="page-header">
          <button
            className={`toggle-btn ${!showFriendRequests && !showFollowing && !searchQuery ? 'active' : ''}`}
            onClick={() => {
              setShowFriendRequests(false);
              setShowFollowing(false);
              setSearchQuery(""); // Clear search when switching tabs
            }}
          >
            My Friends
          </button>
          <button
            className={`toggle-btn ${showFollowing ? 'active' : ''}`}
            onClick={() => {
              setShowFollowing(true);
              setShowFriendRequests(false);
              setSearchQuery(""); // Clear search when switching tabs
            }}
          >
            Following
          </button>
          <button
            className={`toggle-btn ${showFriendRequests ? 'active' : ''}`}
            onClick={() => {
              setShowFriendRequests(true);
              setShowFollowing(false);
              setSearchQuery(""); // Clear search when switching tabs
            }}
          >
            Friend Requests
            {receivedRequests.length > 0 && (
              <span className="notification-dot">{receivedRequests.length}</span>
            )}
          </button>
          <input
            type="text"
            placeholder="Search for users..."
            value={searchQuery}
            onChange={handleSearchInputChange}
            className="search-bar"
          />
        </div>

        <ul className="friend-list">
          {searchQuery ? (
            searchResults.length === 0 ? (
              <p>No users found.</p>
            ) : (
              searchResults.map((user) => (
                <li className="friend-item" key={user.id}>
                  <div className="friend-card" onClick={() => handleNavigateToProfile(user.id)}>
                    <img
                      src={user.profilePic ? `/upload/${user.profilePic}` : "/upload/empty-profile-picture.jpg"}
                      alt={`${user.name}'s profile`}
                      className="friend-profile-pic"
                    />
                    <div className="friend-info">
                      <h2>{user.name}</h2>
                      <p>{user.type_full_name}</p>
                    </div>
                    {isFriend(user.id) && (
                      <button
                        className="unfollow-btn"
                        onClick={(e) => { e.stopPropagation(); handleUnfriend(user); }}
                      >
                        Unfriend <DeleteOutlineIcon />
                      </button>
                    )}
                  </div>
                </li>
              ))
            )
          ) : showFriendRequests ? (
            friendRequests.length === 0 ? (
              <p>No friend requests found.</p>
            ) : (
              friendRequests.map((request) => (
                <li className="friend-item" key={request.id}>
                  <div className="friend-card" onClick={() => handleNavigateToProfile(request.id)}>
                    <img
                      src={request.profilePic ? `/upload/${request.profilePic}` : "/upload/empty-profile-picture.jpg"}
                      alt={`${request.name}'s profile`}
                      className="friend-profile-pic"
                    />
                    <div className="friend-info">
                      <h2>{request.name}</h2>
                      <p>{request.type_full_name}</p>
                    </div>
                    <div className="request-actions">
                      <button 
                        className="accept-btn" 
                        onClick={(e) => { e.stopPropagation(); handleAcceptRequest(request.id); }}>
                        Accept
                      </button>
                      <button 
                        className="reject-btn" 
                        onClick={(e) => { e.stopPropagation(); handleRejectRequest(request.id); }}>
                        Reject
                      </button>
                    </div>
                  </div>
                </li>
              ))
            )
          ) : showFollowing ? (
            following.length === 0 ? (
              <p>You are not following anyone yet.</p>
            ) : (
              following.map((followedUser) => (
                <li className="friend-item" key={followedUser.id}>
                  <div className="friend-card" onClick={() => handleNavigateToProfile(followedUser.id)}>
                    <img
                      src={followedUser.profilePic ? `/upload/${followedUser.profilePic}` : "/upload/empty-profile-picture.jpg"}
                      alt={`${followedUser.name}'s profile`}
                      className="friend-profile-pic"
                    />
                    <div className="friend-info">
                      <h2>{followedUser.name}</h2>
                      <p>{followedUser.type_full_name}</p>
                    </div>
                    <button className="unfollow-btn" 
                      onClick={(e) => { e.stopPropagation(); handleUnfollow(followedUser); }}>
                      Unfollow <DeleteOutlineIcon />
                    </button>
                  </div>
                </li>
              ))
            )
          ) : (
            friends.length === 0 ? (
              <p>You haven't added any friends yet.</p>
            ) : (
              friends.map((friend) => (
                <li className="friend-item" key={friend.id}>
                  <div className="friend-card" onClick={() => handleNavigateToProfile(friend.id)}>
                    <img
                      src={friend.profilePic ? `/upload/${friend.profilePic}` : "/upload/empty-profile-picture.jpg"}
                      alt={`${friend.name}'s profile`}
                      className="friend-profile-pic"
                    />
                    <div className="friend-info">
                      <h2>{friend.name}</h2>
                      <p>{friend.type_full_name}</p>
                    </div>
                    <button className="unfollow-btn" 
                      onClick={(e) => { e.stopPropagation(); handleUnfriend(friend); }}>
                      Unfriend <DeleteOutlineIcon />
                    </button>
                  </div>
                </li>
              ))
            )
          )}
        </ul>

      </div>
    </div>
  );
};

export default FriendPage;
