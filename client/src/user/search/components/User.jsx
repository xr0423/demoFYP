import { Avatar, Card, CardContent, Typography } from "@mui/material"
import { useNavigate } from "react-router-dom";

const User = ({ user, onClose }) => {
     const navigate = useNavigate();

     const handleViewProfile = (user) => {
          onClose();
          navigate(`/user/profile/${user.id}`);
     };

     return (
     <Card
          key={user.id}
          className="result-card"
          onClick={() => handleViewProfile(user)}
     >
          <CardContent className="user-card-content">
               <Avatar
                    src={`/upload/${user.profilePic}`}
                    alt={user.username}
                    className="user-avatar" />
               <div className="user-details">
                    <Typography variant="h6">{user.name}</Typography>
                    <Typography variant="body2" color="textSecondary">
                         {user.city_name}
                    </Typography>
               </div>
          </CardContent>
     </Card>
     )
}

export default User;
