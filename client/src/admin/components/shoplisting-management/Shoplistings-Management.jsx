import React, { useState } from "react";
import {
  Tabs,
  Tab,
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  CircularProgress,
  Link as MuiLink,
  TextField,
} from "@mui/material";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Visibility } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { makeRequest } from "../../../axios";
import "./shoplisting-management.scss";

const ManageShopListing = () => {
  const [currentTab, setCurrentTab] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data: listings = [], isLoading, isError } = useQuery({
    queryKey: ["shoplistings"],
    queryFn: () =>
      makeRequest.get("/admin/shoplistings").then((res) => {
        console.log("API Response:", res.data);
        return Array.isArray(res.data) ? res.data : [];
      }),
    onError: (error) => {
      console.error("Error fetching shop listings:", error);
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ shopId, status }) =>
      makeRequest.put(`/admin/shoplistings?shopId=${shopId}&status=${status}`),
    onSuccess: () => queryClient.invalidateQueries(["shoplistings"]),
  });

  const handleStatusChange = (shopId, status) => {
    updateStatusMutation.mutate({ shopId, status });
  };

  const filteredListings = (status) => {
    if (!Array.isArray(listings)) return [];
    return listings
      .filter((listing) => listing.status === status)
      .filter((listing) =>
        [listing.name, listing.location, listing.owner_name]
          .join(" ")
          .toLowerCase()
          .includes(searchQuery.toLowerCase())
      );
  };

  const renderDocuments = (documents) => {
    if (!documents)
      return <Typography variant="body2">No documents uploaded</Typography>;

    return documents.split(",").map((document, index) => {
      const fileExtension = document.split(".").pop().toLowerCase();
      const filePath = document.startsWith("http")
        ? document
        : `/document/${document}`;

      return (
        <Box key={index} display="flex" alignItems="center" mt={1}>
          <MuiLink href={filePath} target="_blank" rel="noopener noreferrer">
            <Button
              variant="outlined"
              startIcon={<Visibility />}
              style={{ marginRight: "8px" }}
            >
              View {fileExtension.toUpperCase()}
            </Button>
          </MuiLink>
        </Box>
      );
    });
  };

  const renderListings = (listings) => {
    if (!listings || listings.length === 0) {
      return (
        <Typography variant="body2" color="textSecondary">
          No listings available.
        </Typography>
      );
    }

    return listings.map((listing) => (
      <Grid item xs={12} md={6} key={listing.shop_id}>
        <Card className="shop-card">
          <CardContent>
            <MuiLink
              component="button"
              onClick={() =>
                navigate(`/admin/shoplisting/${listing.shop_id}/overview`)
              }
              underline="always"
              style={{
                cursor: "pointer",
                fontWeight: "bold",
              }}
            >
              <Typography variant="h6">{listing.name}</Typography>
            </MuiLink>
            <Typography variant="body2" color="textSecondary">
              Location: {listing.location}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Type: {listing.type}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Owner: {listing.owner_name}
            </Typography>
            <Box mt={2}>
              <Typography variant="body2" color="textSecondary">
                Documents:
              </Typography>
              {renderDocuments(listing.Documents)}
            </Box>
            <Box className="card-actions">
              {listing.status === "pending" && (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => handleStatusChange(listing.shop_id, "active")}
                >
                  Verify
                </Button>
              )}
              {listing.status !== "suspended" ? (
                <Button
                  variant="outlined"
                  color="error"
                  onClick={() =>
                    handleStatusChange(listing.shop_id, "suspended")
                  }
                >
                  Suspend
                </Button>
              ) : (
                <Button
                  variant="outlined"
                  onClick={() => handleStatusChange(listing.shop_id, "active")}
                >
                  Reactivate
                </Button>
              )}
            </Box>
          </CardContent>
        </Card>
      </Grid>
    ));
  };

  const getListingsByTab = () => {
    if (!Array.isArray(listings)) return null;

    switch (currentTab) {
      case 1:
        return renderListings(filteredListings("pending"));
      case 2:
        return renderListings(filteredListings("active"));
      case 3:
        return renderListings(filteredListings("suspended"));
      default:
        return renderListings(
          listings.filter((listing) =>
            [listing.name, listing.location, listing.owner_name]
              .join(" ")
              .toLowerCase()
              .includes(searchQuery.toLowerCase())
          )
        );
    }
  };

  if (isError) {
    return (
      <Typography variant="h6" color="error">
        Failed to load shop listings. Please try again later.
      </Typography>
    );
  }

  return (
    <Box className="manage-shop-listing">
      <Typography variant="h4" className="page-title">
        Manage Shop Listings
      </Typography>

      <Box mb={3}>
        <TextField
          fullWidth
          placeholder="Search by name, location, or owner"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          variant="outlined"
        />
      </Box>

      <Tabs
        value={currentTab}
        onChange={(e, newValue) => setCurrentTab(newValue)}
        className="tabs"
        variant="scrollable"
        scrollButtons="auto"
      >
        <Tab label="All Listings" />
        <Tab label="Pending Verification" />
        <Tab label="Active Listings" />
        <Tab label="Suspended Listings" />
      </Tabs>

      {isLoading ? (
        <CircularProgress className="loading" />
      ) : (
        <Grid container spacing={3} className="listings-container">
          {getListingsByTab()}
        </Grid>
      )}
    </Box>
  );
};

export default ManageShopListing;
