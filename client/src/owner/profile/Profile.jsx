import "./profile.scss";
import {
  Place as PlaceIcon,
} from "@mui/icons-material";

import LocalCafeIcon from '@mui/icons-material/LocalCafe';
import LocalCoffeeMaker from '@mui/icons-material/CoffeeMaker';
import AllergyIcon from '@mui/icons-material/NoMeals';
import TagIcon from '@mui/icons-material/Tag';
import coffeeBean from '../../assets/coffee-beans.png';
import PersonIcon from '@mui/icons-material/Person';
import SchoolIcon from '@mui/icons-material/School';
import WorkIcon from '@mui/icons-material/Work';
import Update from "../components/update/Update";
import ProfileTabs from "../../component/profileTabs/ProfileTabs";
import Upgrade from "../components/plan/Upgrade"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { makeRequest } from "../../axios";
import { useParams } from "react-router-dom";
import { AuthContext } from "../../context/authContext";
import { useContext, useState, useEffect,  } from "react";


const Profile = () => {
  const [openUpdate, setOpenUpdate] = useState(false);
  const [openUpgrade, setOpenUpgrade] = useState(false);
  const { currentUser } = useContext(AuthContext);
  const { id } = useParams();
  const userId = parseInt(id);
  const queryClient = useQueryClient();

  const handleUpgradePlanModal = () => {
    setOpenUpgrade((prev) => !prev)
  }

  // Fetch user data
  const { data, isLoading, error } = useQuery({
    queryKey: ["user", userId],
    queryFn: () => makeRequest.get(`/users/find/${userId}`).then((res) => res.data),
  });

  // Fetch friend request status
  const { data: friendStatusData, refetch: refetchFriendStatus } = useQuery({
    queryKey: ["friendRequestStatus", userId],
    queryFn: () =>
      makeRequest
        .get(`/friendRequest/status?userId=${currentUser.id}&friendId=${userId}`)
        .then((res) => res.data),
    enabled: userId !== currentUser.id,
  });

  const { isLoading:relationshipLoading, data:relationshipData } = useQuery({
    queryKey: ["relationship"],
    queryFn: () =>
      makeRequest.get("relationships/followers?followedUserId="+ userId).then((res) => res.data),
  });

  const friendStatus = friendStatusData?.status
  const isSender = friendStatusData?.isSender;

  // Send friend request
  const sendRequestMutation = useMutation({
    mutationFn: () =>
      makeRequest
        .post(`/friendRequest/send?userId=${currentUser.id}&friendId=${userId}`)
        .then((res) => res.data),
    onSuccess: () => refetchFriendStatus(),
  });

  // Accept friend request
  const acceptRequestMutation = useMutation({
    mutationFn: () =>
      makeRequest
        .post(`/friendRequest/accept?userId=${currentUser.id}&friendId=${userId}`)
        .then((res) => res.data),
    onSuccess: () => queryClient.invalidateQueries(["friendRequestStatus", userId]),
  });

  // Cancel friend request
  const cancelRequestMutation = useMutation({
    mutationFn: () =>
      makeRequest
        .delete(`/friendRequest/cancel?userId=${currentUser.id}&friendId=${userId}`)
        .then((res) => res.data),
    onSuccess: () => queryClient.invalidateQueries(["friendRequestStatus", userId]),
  });

  // Unfollow logic
  const unfollowMutation = useMutation({
    mutationFn: () =>
      makeRequest
        .delete(`/friendRequest/remove?userId=${currentUser.id}&friendId=${userId}`)
        .then((res) => res.data),
    onSuccess: () => queryClient.invalidateQueries(["friendRequestStatus", userId]),
  });

  const followMutation = useMutation({
    mutationFn: (followed) => {
    if (followed) {
      return makeRequest.delete("/relationships?userId=" + userId);
    } else {
      return makeRequest.post("/relationships", { userId });
    }
  },
  onSuccess: () => {
    queryClient.invalidateQueries(['relationship']);
  },
  })

  const following = () => {
    const followed = relationshipData.includes(currentUser.id);
    followMutation.mutate(followed);
  }

  const handleFollow = () => {
    switch (friendStatus) {
      case "not followed":
        sendRequestMutation.mutate();
        console.log("not followed " + isSender);
        break;
      case "pending": // Pending request
        console.log("pending " + isSender);
        if (!isSender) {
          acceptRequestMutation.mutate();
        } else {
          if (window.confirm("Cancel friend request?")) {
            cancelRequestMutation.mutate();
          }
        }
        break;
      case "accepted": // Following
        if (window.confirm("Unfollow?")) {
          unfollowMutation.mutate();
        }
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    queryClient.invalidateQueries(["user", userId]);
  }, [userId, queryClient]);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  
  return (
    <div className="user-profile">
      <div className="user-profile-header">
      <img 
        src={data.coverPic ? `/upload/${data.coverPic}` : '/upload/empty-cover-picture.jpg'} 
        alt="Cover" 
        className="owner-cover-photo" 
      />
    </div>

      <div className="user-profile-content">
        <div className="profile-info-column">
          <div className="user-info">
            <div className="left">
              <img 
                src={data.profilePic ? `/upload/${data.profilePic}` : '/upload/empty-profile-picture.jpg'} 
                alt="Cover" 
                className="profile-photo" 
              />
            </div>
            <div className="right">
              <h2>{data.name}</h2>
              <div className="location-website">
                <PlaceIcon className="iconBtn" /> <span>{data.city_name}</span>
              </div>
              <div className="profile-stats">
                {data.user_type === 'regular' && (
                    <>
                      <span><strong>{data.posts ? data.posts : 0}</strong> posts </span>
                      <span><strong>{data.followers ? data.followers : 0}</strong> followers </span>
                      <span><strong>{data.reviews ? data.reviews : 0}</strong> reviews </span>
                    </>
                  )}
                  
                  {data.user_type === 'owner' && (
                    <>
                      <span><strong>{data.shoplistings ? data.shoplistings : 0}</strong> shops </span>
                      <span><strong>{data.followers ? data.followers : 0}</strong> followers </span>
                    </>
                  )}
                  
                  {data.user_type === 'expert' && (
                    <>
                      <span><strong>{data.articles ? data.articles : 0}</strong> articles </span>
                      <span><strong>{data.followers ? data.followers : 0}</strong> followers </span>
                      <span><strong>{data.reviews ? data.reviews : 0}</strong> reviews </span>
                    </>
                  )}
              </div>
              {userId === currentUser.id ? (
                <div className="user-profile-action-btn-grp">
                  <button className="user-profile-update-button" onClick={() => setOpenUpdate(true)}>
                    Edit Profile
                  </button>
                  {data.user_type !== 'owner' && ( // Only show the upgrade button if not owner
                    <button className="user-profile-update-button" onClick={handleUpgradePlanModal}>
                      Upgrade Plan
                    </button>
                  )}
                </div>
              ) : data.user_type === 'owner' ? (
                <button
                  className={`user-profile-update-button ${friendStatus}`}
                  onClick={handleFollow}
                >

                  {friendStatus === "not followed"
                    ? "Follow"
                    : friendStatus === "pending" && isSender
                    ? "Cancel Request"
                    : friendStatus === "pending" && !isSender
                    ? "Accept Friend Request"
                    : "Following"}
                </button>
              ) : (
                <button
                className={`user-profile-update-button ${friendStatus}`}
                onClick={following}
              >
                {relationshipData && relationshipData.includes(currentUser.id)? "Following": "Follow"}
              </button>
              )}
            </div>
          </div>

          <div className="user-profile-info">
            <ProfileSection title="Bio" content={data.bio} icon={PersonIcon} />
            {data.highest_education && <ProfileSection title="Highest Education" content={data.highest_education} icon={SchoolIcon} />}
            <ProfileBadges title="Favorite Beans" badges={data.fav_beans} imageSrc={coffeeBean} />
            <ProfileBadges title="Favorite Brewing Methods" badges={data.fav_brewing_methods} icon={LocalCoffeeMaker} />
            <ProfileBadges title="Favorite Coffee Type" badges={data.fav_coffee_type} icon={LocalCafeIcon} />
            <ProfileBadges title="Allergies" badges={data.allergies} icon={AllergyIcon} />
            <ProfileBadges title="Tags" badges={data.tags} icon={TagIcon} />
            {data.specialization && <ProfileBadges title="Specialization" badges={data.specialization} icon={WorkIcon} />}
          </div>
        </div>

        <div className="owner-my-posts-column">
          {/* ProfileTabs Component */}
          <ProfileTabs userId={userId} userType={data.user_type} />
        </div>
      </div>

      {openUpdate && (
        <Update openUpdate={openUpdate} setOpenUpdate={setOpenUpdate} user={data} />
      )}

      {openUpgrade && (
        <Upgrade open={openUpgrade} onClose={handleUpgradePlanModal} />
      )}
    </div>
  );
  
};

const ProfileSection = ({ title, content, icon: Icon }) => (
  <div className="profile-section">
    <h3>
      <Icon className="icon" /> {title}
    </h3>
    <p style={{ fontSize: "12px" }}>{content || "None available"}</p>
  </div>
);


const ProfileBadges = ({ title, badges, icon: Icon, imageSrc }) => (
  <div className="profile-section">
    <h3>
      {imageSrc ? (
        <img src={imageSrc} alt={`${title} Icon`} className="icon" />
      ) : (
        <Icon className="icon" />
      )}
      {title}
    </h3>
    <div className="badges">
      {badges
        ? badges.split(",").map((badge, index) => (
            <span key={index} className="badge">
              {badge}
            </span>
          ))
        : <span className="badge">None</span>}
    </div>
  </div>
);

export default Profile;
