import "./profile.scss";
import FacebookTwoToneIcon from "@mui/icons-material/FacebookTwoTone";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import InstagramIcon from "@mui/icons-material/Instagram";
import PinterestIcon from "@mui/icons-material/Pinterest";
import TwitterIcon from "@mui/icons-material/Twitter";
import PlaceIcon from "@mui/icons-material/Place";
import LanguageIcon from "@mui/icons-material/Language";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { makeRequest } from "../../axios";
import { useLocation } from "react-router-dom";
import { AuthContext } from "../../context/authContext";
import {useContext} from 'react';

const Profile = () => {

  const { currentUser } = useContext(AuthContext);
  const location = useLocation();
  const userId = parseInt(location.pathname.split("/")[3]);

  const { isLoading, error, data } = useQuery({
    queryKey: ["user"],
    queryFn: () =>
      makeRequest.get("/users/find/" + userId).then((res) => res.data),
  });

  const { isLoading:relationshipLoading, data:relationshipData } = useQuery({
    queryKey: ["relationship"],
    queryFn: () =>
      makeRequest.get("/relationships/followers?followedUserId="+ userId).then((res) => res.data),
  });

  

  const queryClient = useQueryClient();
  
  const mutation = useMutation({
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
  });
  
  const handleFollow = () => {
    const followed = relationshipData.includes(currentUser.id);
    mutation.mutate(followed);
  };

  if (isLoading) {
    return <div>Loading...</div>; // Show loading state while fetching data
  }

  if (error) {
    return <div>Error: {error.message}</div>; // Handle potential errors
  }

  if (relationshipLoading) {
    return <div>Loading...relationship</div>; // Show loading state while fetching data
  }

  return (
    <div className="profile">
      <div className="images">
        <img
          src={data.coverPic} // Accessing coverPic now that data is defined
          alt=""
          className="cover"
        />
        <img
          src={data.profilePic} // Access profilePic
          alt=""
          className="profilePic"
        />
      </div>
      <div className="profileContainer">
        <div className="uInfo">
          <div className="left">
            <a href="http://facebook.com">
              <FacebookTwoToneIcon fontSize="large" />
            </a>
            <a href="http://instagram.com">
              <InstagramIcon fontSize="large" />
            </a>
            <a href="http://twitter.com">
              <TwitterIcon fontSize="large" />
            </a>
            <a href="http://linkedin.com">
              <LinkedInIcon fontSize="large" />
            </a>
            <a href="http://pinterest.com">
              <PinterestIcon fontSize="large" />
            </a>
          </div>
          <div className="center">
            <span>{data.name}</span> {/* Use the name from the data */}
            <div className="info">
              <div className="item">
                <PlaceIcon />
                <span>{data.city}</span> {/* Use the city from the data */}
              </div>
              <div className="item">
                <LanguageIcon />
                <span>{data.website}</span> {/* Use the website from the data */}
              </div>
            </div>
            {userId == currentUser.id
              ? <button>update</button>
              : <button onClick={handleFollow}>
                {relationshipData && relationshipData.includes(currentUser.id)? "Following": "Follow"}</button>
            }
          </div>
          <div className="right">
            <EmailOutlinedIcon />
            <MoreVertIcon />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
