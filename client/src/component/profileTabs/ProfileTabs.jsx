import React, { useContext, useState } from 'react';
import { Tabs, Tab, Box, Typography, Grid } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { makeRequest } from '../../axios'; 
import { AuthContext } from '../../context/authContext';
import Posts from "../../user/components/posts/Posts";
import Articles from "../../expert/components/myArticles/Myarticles";
import Shoplisting from "../../owner/components/shoplisting/Shoplisting";
import MyReviews from '../../user/components/myreviews/MyReviews';
import Activities from '../../user/components/activities/Activities'; 

const ProfileTabs = ({ userId, userType }) => {
  const [activeTab, setActiveTab] = useState(0);
  const { currentUser } = useContext(AuthContext);

 
  const { data: shops, isLoading, error } = useQuery({
    queryKey: ['shops', userId],
    queryFn: () => makeRequest.get(`/shoplistings/find?userId=${userId}`).then((res) => res.data),
    enabled: userType === 'owner' && activeTab === 0, 
  });

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const renderTabContent = () => {
    if (userType === 'regular') {
      switch (activeTab) {
        case 0:
          return <Posts userId={userId} />;
        case 1:
          return <MyReviews userId={userId} />;
        case 2:
          return <Activities userId={userId} />;
        default:
          return null;
      }
    } else if (userType === 'owner') {
      switch (activeTab) {
        case 0:
          if (isLoading) {
            return <Typography>Loading shops...</Typography>;
          }
          if (error) {
            return <Typography>Error fetching shops: {error.message}</Typography>;
          }
          return (
            <div>
              <h3>My Shops</h3>
              {shops && shops.length > 0 ? (
                <Grid container spacing={2}>
                  {shops.map((shoplisting) => (
                    <Grid item xs={12} sm={6} md={6} key={shoplisting.shop_id}>
                      <Shoplisting shoplisting={shoplisting} />
                    </Grid>
                  ))}
                </Grid>
              ) : (
                <p>No shops created yet.</p>
              )}
            </div>
          );
        case 1:
          return <Activities userId={userId} />; 
        default:
          return null;
      }
    }
    else {
      switch (activeTab) {
        case 0:
          return <Articles userId={userId} />;
        case 1:
          return <Activities userId={userId}/>;
        default:
          return null;
      }
    }
  };
  return (
    <Box sx={{ width: '100%', bgcolor: 'background.paper', borderRadius: 2, boxShadow: 1, overflow: 'hidden' }}>
      {/* MUI Tabs */}
      {userType === 'regular' && (
      <>
        <Tabs 
          value={activeTab} 
          onChange={handleTabChange} 
          textColor="primary"
          variant="fullWidth" 
          centered
          sx={{
            '& .MuiTabs-indicator': {
              backgroundColor: '#6f4a12', 
            }
          }}
        >
          <Tab 
            label={currentUser.id === userId ? "My Posts" : "Posts"} 
            sx={{
              '&:hover': { backgroundColor: '#6f4a12' , color: 'white' }, 
              '&.Mui-selected': { backgroundColor: '#6f4a12', color: 'white' }, 
            }} 
          />
          <Tab 
            label={currentUser.id === userId ? "My Reviews" : "Reviews"} 
            sx={{
              '&:hover': { backgroundColor: '#6f4a12', color: 'white'},
              '&.Mui-selected': { backgroundColor: '#6f4a12', color: 'white' },
            }} 
          />

          <Tab 
            label={currentUser.id === userId ? "My Activities" : "Activities"} 
            sx={{
              '&:hover': { backgroundColor: '#6f4a12', color: 'white'},
              '&.Mui-selected': { backgroundColor: '#6f4a12', color: 'white' },
            }} 
          />
        </Tabs>
        </> )}

      {userType === 'owner' && (
        <>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          textColor="primary"
          variant="fullWidth"
          centered
          sx={{
            '& .MuiTabs-indicator': {
              backgroundColor: '#6f4a12', 
            },
          }}
        >
          <Tab
            label={currentUser.id === userId ? "My Shops" : "Shops"}
            sx={{
              '&:hover': { backgroundColor: '#6f4a12', color: 'white' },
              '&.Mui-selected': { backgroundColor: '#6f4a12', color: 'white' },
            }}
          />
          <Tab
            label={currentUser.id === userId ? "My Activities" : "Activities"}
            sx={{
              '&:hover': { backgroundColor: '#6f4a12', color: 'white' },
              '&.Mui-selected': { backgroundColor: '#6f4a12', color: 'white' },
            }}
          />
        </Tabs>
        </> )}
        {userType === 'expert' && (
            <>
              <Tabs 
                value={activeTab} 
                onChange={handleTabChange} 
                textColor="primary"
                variant="fullWidth" 
                centered
                sx={{
                  '& .MuiTabs-indicator': {
                    backgroundColor: '#6f4a12', 
                  }
                }}
              >
                <Tab 
                  label={currentUser.id === userId ? "My Articles" : "Articles"} 
                  sx={{
                    '&:hover': { backgroundColor: '#6f4a12' , color: 'white' }, 
                    '&.Mui-selected': { backgroundColor: '#6f4a12', color: 'white' }, 
                  }} 
                />
                <Tab 
                  label={currentUser.id === userId ? "My Activities" : "Activities"} 
                  sx={{
                    '&:hover': { backgroundColor: '#6f4a12', color: 'white'},
                    '&.Mui-selected': { backgroundColor: '#6f4a12', color: 'white' },
                  }} 
                />
              </Tabs>
            </>
         )}
      {/* Content below the Tabs */}
      <Box sx={{ p: 0, m: 2 }}>
        {renderTabContent()}
      </Box>
    </Box>
  );
};

export default ProfileTabs;
