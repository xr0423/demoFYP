import React, { useContext, useEffect, useState } from "react";
import { Grid, Card, Typography, Box, useTheme, useMediaQuery } from "@mui/material";
import CustomChart from "./CustomChart";
import { BarChart, Star, Favorite, RateReview, Store, ThumbUp, Visibility, StarBorder, ArrowDownward } from '@mui/icons-material';

import { AuthContext } from "../../context/authContext";
import { makeRequest } from "../../axios";

const OwnerDashboard = () => {
     const [overviewMetrics, setOverviewMetrics] = useState({});
     const [performanceComparison, setPerformanceComparison] = useState({});
     const [comparisonAcrossShops, setComparisonAcrossShops] = useState({});
     const { currentUser } = useContext(AuthContext);
     const theme = useTheme(); // Access the current theme
     const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm")); // Detect small screens

     useEffect(() => {
          fetchOverviewMetrics();
          fetchPerformanceComparison();
          fetchComparisonAcrossShops();
     }, []);

     const fetchOverviewMetrics = async () => {
          const response = await makeRequest.get(
               `/owner/metrics/overview?ownerId=${currentUser.id}`
          );
          setOverviewMetrics(response.data);
     };

     const fetchPerformanceComparison = async () => {
          const response = await makeRequest.get(
               `/owner/metrics/performance-comparison?ownerId=${currentUser.id}`
          );
          setPerformanceComparison(response.data);
     };

     const fetchComparisonAcrossShops = async () => {
          const response = await makeRequest.get(
               `/owner/metrics/comparison?ownerId=${currentUser.id}`
          );
          setComparisonAcrossShops(response.data);
     };

     // Line Chart Data for Monthly Trends
     const monthlyTrendsData = {
          labels:
               overviewMetrics.monthlyTrends?.reviews.map((trend) => trend.month) || [],
          datasets: [
               {
                    label: "Reviews",
                    data:
                         overviewMetrics.monthlyTrends?.reviews.map((trend) => trend.count) ||
                         [],
                    borderColor: "#3f51b5",
                    fill: false,
               },
               {
                    label: "Ratings",
                    data:
                         overviewMetrics.monthlyTrends?.ratings.map(
                              (trend) => trend.averageRating
                         ) || [],
                    borderColor: "#ff9800",
                    fill: false,
               },
               {
                    label: "Favorites",
                    data:
                         overviewMetrics.monthlyTrends?.favorites.map(
                              (trend) => trend.count
                         ) || [],
                    borderColor: "#4caf50",
                    fill: false,
               },
          ],
     };

     // Bar Chart Data for Ratings Comparison
     const ratingsBarData = {
          labels:
               comparisonAcrossShops.barChartRatings?.map((shop) => shop.shopName) || [],
          datasets: [
               {
                    label: "Average Rating",
                    data:
                         comparisonAcrossShops.barChartRatings?.map(
                              (shop) => shop.averageRating
                         ) || [],
                    backgroundColor: "#3f51b5",
               },
          ],
     };

     // Pie Chart Data for Favorites Distribution
     const favoritesPieData = {
          labels:
               comparisonAcrossShops.pieChartFavorites?.map((shop) => shop.shopName) ||
               [],
          datasets: [
               {
                    label: "Favorites",
                    data:
                         comparisonAcrossShops.pieChartFavorites?.map(
                              (shop) => shop.totalFavorites
                         ) || [],
                    backgroundColor: ["#4caf50", "#ff9800", "#f44336"],
               },
          ],
     };
     const metricCards = [
          { label: "Total Shops Managed", value: overviewMetrics.totalShopsManaged || 0, icon: <Store fontSize="large" /> },
          { label: "Average Rating", value: overviewMetrics.aggregateAverageRating || 0, icon: <Star fontSize="large" /> },
          { label: "Total Reviews", value: overviewMetrics.totalReviews || 0, icon: <RateReview fontSize="large" /> },
          { label: "Total Favorites", value: overviewMetrics.totalFavorites || 0, icon: <Favorite fontSize="large" color="error" /> }
     ];

     return (
          <Box sx={{ padding: 4, backgroundColor: "#f5f5f5", minHeight: "100vh" }}>
               <Typography variant="h4" gutterBottom align="center">
                    Owner Dashboard
               </Typography>
               <Grid container spacing={3}>

                    {metricCards.map((card, index) => (
                         <Grid key={index} item xs={12} sm={6} md={3}>
                              <Card
                                   sx={{
                                        padding: 2,
                                        textAlign: "center",
                                        backgroundColor: "#fff",
                                        display: "flex",
                                        flexDirection: "column",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        gap: 1,
                                   }}
                              >
                                   {card.icon}
                                   <Typography variant="h6">{card.label}</Typography>
                                   <Typography variant="h4">{card.value}</Typography>
                              </Card>
                         </Grid>
                    ))}




                    {/* Monthly Trends Section */}
                    <Grid item xs={12}>
                         <Card sx={{ padding: 2 }}>
                              <Typography variant="h6" gutterBottom>
                                   Monthly Trends
                              </Typography>
                              <CustomChart type="line" data={monthlyTrendsData} options={{ responsive: true }} />
                         </Card>
                    </Grid>

                    {/* Shop Ratings Comparison */}
                    <Grid item xs={12} md={6}>
                         <Card sx={{ padding: 2 }}>
                              <Typography variant="h6" gutterBottom>
                                   Shop Ratings Comparison
                              </Typography>
                              <CustomChart type="bar" data={ratingsBarData} options={{ responsive: true }} />
                              <hr style={{ marginTop: 30 }} />
                              {/* Performance Highlights Section */}
                              <Grid item xs={12} marginTop={5} >
                                   <Typography variant="h6" gutterBottom>
                                        Performance Highlights
                                   </Typography>
                                   <Grid container spacing={2}>
                                        <Grid item xs={12} md={6}>
                                             <Box display="flex" alignItems="center" gap={1}>
                                                  <ThumbUp fontSize="large" color="primary" />
                                                  <Typography variant="subtitle1">
                                                       <strong>Highest Rated Shop:</strong> <br />
                                                       {performanceComparison.highestRatedShop?.shopName
                                                            ? `${performanceComparison.highestRatedShop.shopName} (${performanceComparison.highestRatedShop.averageRating})`
                                                            : "No data available"}
                                                  </Typography>
                                             </Box>
                                        </Grid>
                                        <Grid item xs={12} md={6}>
                                             <Box display="flex" alignItems="center" gap={1}>
                                                  <RateReview fontSize="large" color="secondary" />
                                                  <Typography variant="subtitle1">
                                                       <strong>Most Reviewed Shop:</strong> <br />
                                                       {performanceComparison.mostReviewedShop?.shopName
                                                            ? `${performanceComparison.mostReviewedShop.shopName} (${performanceComparison.mostReviewedShop.totalReviews} reviews)`
                                                            : "No data available"}
                                                  </Typography>
                                             </Box>
                                        </Grid>
                                        <Grid item xs={12} md={6}>
                                             <Box display="flex" alignItems="center" gap={1}>
                                                  <Favorite fontSize="large" color="error" />
                                                  <Typography variant="subtitle1">
                                                       <strong>Most Favorite Shop:</strong> <br />
                                                       {performanceComparison.mostFavoriteShop?.shopName
                                                            ? `${performanceComparison.mostFavoriteShop.shopName} (${performanceComparison.mostFavoriteShop.totalFavorites} favorites)`
                                                            : "No data available"}
                                                  </Typography>
                                             </Box>
                                        </Grid>
                                        <Grid item xs={12} md={6}>
                                             <Box display="flex" alignItems="center" gap={1}>
                                                  <ArrowDownward fontSize="large" color="action" />
                                                  <Typography variant="subtitle1">
                                                       <strong>Least Performing Shop:</strong> <br />
                                                       {performanceComparison.leastPerformingShop?.shopName
                                                            ? `${performanceComparison.leastPerformingShop.shopName} (${performanceComparison.leastPerformingShop.averageRating ?? 0})`
                                                            : "No data available"}
                                                  </Typography>
                                             </Box>
                                        </Grid>

                                   </Grid>
                              </Grid>
                         </Card>
                    </Grid>

                    {/* Favorites Distribution */}
                    <Grid item xs={12} md={6}>
                         <Card sx={{ padding: 2 }}>
                              <Typography variant="h6" gutterBottom>
                                   Favorites Distribution
                              </Typography>
                              <CustomChart type="pie" data={favoritesPieData} options={{ responsive: true }} />
                         </Card>
                    </Grid>


               </Grid>
          </Box>
     );
};

export default OwnerDashboard;