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
    Avatar,
    CircularProgress,
    Link,
    TextField, // Import TextField for search input
} from "@mui/material";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Edit, Delete, Visibility } from "@mui/icons-material";
import { makeRequest } from "../../../axios";
import "./users-management.scss";
import { useNavigate } from "react-router-dom"; 


const ManageUsers = () => {
    const [currentTab, setCurrentTab] = useState(0);
    const [searchQuery, setSearchQuery] = useState(""); // State to manage search input
    const queryClient = useQueryClient();
  const navigate = useNavigate(); 


    // Fetch users data
    const { data: users = [], isLoading } = useQuery({
        queryKey: ["users"],
        queryFn: () => makeRequest.get("/admin/users").then((res) => res.data),
    });

    // Mutation to update user status
    const updateStatusMutation = useMutation({
        mutationFn: ({ userId, status }) =>
            makeRequest.put(`/admin/users?userId=${userId}&status=${status}`),
        onSuccess: () => queryClient.invalidateQueries(["users"]),
    });

    // Handle status change
    const handleStatusChange = (userId, status) => {
        updateStatusMutation.mutate({ userId, status });
    };

    // Filter users based on status and search query
    const filteredUsers = (status) =>
        users
            .filter((user) => (status ? user.status === status : true)) // Filter by status if provided
            .filter(
                (user) =>
                    user.name.toLowerCase().includes(searchQuery.toLowerCase()) || // Match name
                    user.email.toLowerCase().includes(searchQuery.toLowerCase()) || // Match email
                    user.role.toLowerCase().includes(searchQuery.toLowerCase())    // Match role
            );

    // Function to render documents
    const renderDocuments = (documents) => {
        if (!documents) return <Typography variant="body2">No documents uploaded</Typography>;

        return documents.split(",").map((document, index) => {
            const fileExtension = document.split(".").pop().toLowerCase();
            const isImage = ["png", "jpg", "jpeg", "gif"].includes(fileExtension);
            const filePath = document.startsWith("http")
                ? document
                : `/document/${document}`;

            return (
                <Box key={index} display="flex" alignItems="center" mt={1}>
                    {isImage ? (
                        <img
                            src={filePath}
                            alt={`Document ${index + 1}`}
                            style={{ width: "100px", height: "100px", objectFit: "cover", marginRight: "8px" }}
                        />
                    ) : (
                        <Link href={filePath} target="_blank" rel="noopener noreferrer">
                            <Button
                                variant="outlined"
                                startIcon={<Visibility />}
                                style={{ marginRight: "8px" }}
                            >
                                View {fileExtension.toUpperCase()}
                            </Button>
                        </Link>
                    )}
                </Box>
            );
        });
    };

    // Render users
    const renderUsers = (users) =>
        users.map((user) => (
            <Grid item xs={12} md={6} key={user.id}>
                <Card className="user-card">
                    <CardContent>
                        <Box display="flex" alignItems="center">
                            <Avatar
                                src={user.profilePic || "/default-profile.png"}
                                alt={user.name}
                                sx={{ marginRight: "16px" }}
                            />
                            <Box>
                                {/* Underlined clickable username */}
                                <Link
                                    component="button"
                                    onClick={() => navigate(`/admin/check-user-profile/${user.id}`)} // Navigate to /user/profile/:id
                                    underline="always"
                                    style={{
                                        cursor: "pointer",
                                        fontWeight: "bold",
                                    }}
                                >
                                    <Typography variant="h6">{user.username}</Typography>
                                </Link>
                                <Typography variant="body2" color="textSecondary">
                                    {user.email}
                                </Typography>
                                <Typography variant="body2" color="textSecondary">
                                    Role: {user.role}
                                </Typography>
                            </Box>
                        </Box>
                        <Box mt={2}>
                            <Typography variant="body2" color="textSecondary">
                                Uploaded Documents:
                            </Typography>
                            {renderDocuments(user.Documents)}
                        </Box>
                    </CardContent>
                    <div className="card-actions">
                        {user.status === "pending" && (
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={() => handleStatusChange(user.id, "active")}
                            >
                                Verify
                            </Button>
                        )}
                        {user.status !== "suspended" ? (
                            <Button
                                variant="outlined"
                                color="error"
                                onClick={() => handleStatusChange(user.id, "suspended")}
                            >
                                Suspend
                            </Button>
                        ) : (
                            <Button
                                variant="outlined"
                                onClick={() => handleStatusChange(user.id, "active")}
                            >
                                Reactivate
                            </Button>
                        )}
                    </div>
                </Card>
            </Grid>
        ));
    

    // Get users based on current tab
    const getUsersByTab = () => {
        switch (currentTab) {
            case 1:
                return renderUsers(filteredUsers("pending"));
            case 2:
                return renderUsers(filteredUsers("active"));
            case 3:
                return renderUsers(filteredUsers("suspended"));
            default:
                return renderUsers(filteredUsers(null)); // No status filtering for "All Users"
        }
    };

    return (
        <Box className="manage-users">
            <Typography variant="h4" className="page-title">
                Manage Users
            </Typography>

            {/* Search Bar */}
            <Box mb={3}>
                <TextField
                    fullWidth
                    placeholder="Search by username, email or type"
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
                <Tab label="All Users" />
                <Tab label="Pending Verification" />
                <Tab label="Active Users" />
                <Tab label="Suspended Users" />
            </Tabs>

            {isLoading ? (
                <CircularProgress className="loading" />
            ) : (
                <Grid container spacing={3} className="users-container">
                    {getUsersByTab()}
                </Grid>
            )}
        </Box>
    );
};

export default ManageUsers;
