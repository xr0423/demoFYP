// src/pages/Home/Home.jsx

import React from "react";
import "./home.scss";
import {
  Card,
  CardContent,
  Typography,
  Grid,
  CircularProgress,
  Button,
  Box,
} from "@mui/material";
import { useQuery } from "@tanstack/react-query"; // React Query for fetching data
import { useNavigate } from "react-router-dom";
import { makeRequest } from "../../axios";

// charts
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell,
} from "recharts";

const Home = () => {
  const navigate = useNavigate(); // Navigation hook

  // Data fetching with React Query
  const { data: userStats = {}, isLoading: usersLoading } = useQuery({
    queryKey: ["userStats"],
    queryFn: () =>
      makeRequest.get("/admin/users/stats").then((res) => res.data),
  });

  const { data: shopStats = {}, isLoading: shopsLoading } = useQuery({
    queryKey: ["shopStats"],
    queryFn: () =>
      makeRequest.get("/admin/shoplistings/stats").then((res) => res.data),
  });

  if (usersLoading || shopsLoading) {
    return <CircularProgress className="loading" />;
  }

  const {
    totalUsers,
    activeUsers,
    inactiveUsers,
    suspendedUsers,
    newUsers,
    pendingUsers,
  } = userStats;
  const { totalShops, activeShops, suspendedShops, pendingShops, newShops } =
    shopStats;

  // Prepare data for Bar Charts
  const userData = [
    { name: "Active Users", count: activeUsers },
    { name: "Inactive Users", count: inactiveUsers },
    { name: "Suspended Users", count: suspendedUsers },
    { name: "Pending Users", count: pendingUsers },
  ];

  const shopData = [
    { name: "Active Shops", count: activeShops },
    { name: "Suspended Shops", count: suspendedShops },
    { name: "Pending Shops", count: pendingShops },
    { name: "New Shops", count: newShops },
  ];

  // Define colors for the bars
  const userColors = ["#4caf50", "#ff9800", "#f44336", "#9c27b0"];
  const shopColors = ["#2196f3", "#ff5722", "#9c27b0", "#00bcd4"];

  return (
    <div className="home">

      <Grid container spacing={3} className="dashboard-cards">
        {/* User Statistics Card */}
        <Grid item xs={12} md={6}>
          <Card className="dashboard-card">
            <CardContent>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                mb={2}
              >
                <Typography variant="h5">User Statistics</Typography>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => navigate("/admin/users-management")}
                >
                  Manage Users
                </Button>
              </Box>
              <Typography variant="subtitle1" gutterBottom>
                Total Users: {totalUsers || 0}
              </Typography>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart
                  data={userData}
                  margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" name="Users">
                    {userData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={userColors[index % userColors.length]}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Shop Statistics Card */}
        <Grid item xs={12} md={6}>
          <Card className="dashboard-card">
            <CardContent>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                mb={2}
              >
                <Typography variant="h5">Shop Statistics</Typography>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => navigate("/admin/shoplistings-management")}
                >
                  Manage Shop Listings
                </Button>
              </Box>
              <Typography variant="subtitle1" gutterBottom>
                Total Listings: {totalShops || 0}
              </Typography>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart
                  data={shopData}
                  margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" name="Shops">
                    {shopData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={shopColors[index % shopColors.length]}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Activity Log */}
    
      </Grid>
    </div>
  );
};

export default Home;
