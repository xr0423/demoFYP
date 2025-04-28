import React, { useState } from "react";
import {
    Box,
    Typography,
    Grid,
    CircularProgress,
    Card,
    CardContent,
    Avatar,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    TextField,
    Snackbar,
    Alert,
} from "@mui/material";

import DeleteIcon from "@mui/icons-material/Delete";
import ReplyIcon from "@mui/icons-material/Reply";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { makeRequest } from "../../../axios";
import "./contactus.scss";

const ContactUs = () => {
    const queryClient = useQueryClient();

    // State for filtering
    const [selectedSubject, setSelectedSubject] = useState("");
    const [selectedOption, setSelectedOption] = useState("");

    // State for reply dialog
    const [openReplyDialog, setOpenReplyDialog] = useState(false);
    const [currentSubmission, setCurrentSubmission] = useState(null);
    const [replySubject, setReplySubject] = useState("");
    const [replyMessage, setReplyMessage] = useState("");

    // State for Snackbar notifications
    const [openSnackbar, setOpenSnackbar] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState("");
    const [snackbarSeverity, setSnackbarSeverity] = useState("success");

    // Fetch all contact submissions
    const {
        data: submissions = [],
        isLoading: submissionsLoading,
        isError: submissionsError,
        error: submissionsErrorMsg,
    } = useQuery({
        queryKey: ["contactusSubmissions"],
        queryFn: () =>
            makeRequest
                .get("/admin/contactus")
                .then((res) => res.data),
    });

    // Fetch all subjects
    const {
        data: subjects = [],
        isLoading: subjectsLoading,
        isError: subjectsError,
        error: subjectsErrorMsg,
    } = useQuery({
        queryKey: ["contactusSubjects"],
        queryFn: () =>
            makeRequest.get("/admin/contactus/subjects").then((res) => res.data),
    });

    // Fetch options based on selected subject
    const {
        data: options = [],
        isLoading: optionsLoading,
        isError: optionsError,
        error: optionsErrorMsg,
    } = useQuery({
        queryKey: ["contactusOptions", selectedSubject],
        queryFn: () =>
            selectedSubject
                ? makeRequest
                    .get(`/admin/contactus/subjects/${selectedSubject}/options`)
                    .then((res) => res.data)
                : [],
        enabled: !!selectedSubject, // Only fetch options if a subject is selected
    });

    // Mutation to delete a submission (optional)
    const deleteMutation = useMutation({
        mutationFn: (submissionId) =>
            makeRequest.delete(`/admin/contactus/submissions/${submissionId}`),
        onSuccess: () => {
            queryClient.invalidateQueries(["contactusSubmissions"]);
            setSnackbarMessage("Submission deleted successfully.");
            setSnackbarSeverity("success");
            setOpenSnackbar(true);
        },
        onError: () => {
            setSnackbarMessage("Failed to delete submission.");
            setSnackbarSeverity("error");
            setOpenSnackbar(true);
        },
    });

    const replyMutation = useMutation({
        mutationFn: ({ submissionId, subject, message }) =>
            makeRequest.post(`/admin/contactus/reply/${submissionId}`, {
                subject,
                message,
            }),
        onSuccess: () => {
            queryClient.invalidateQueries(["contactusSubmissions"]);
            setSnackbarMessage("Reply sent successfully.");
            setSnackbarSeverity("success");
            setOpenSnackbar(true);
            handleCloseReplyDialog();
        },
        onError: () => {
            setSnackbarMessage("Failed to send reply.");
            setSnackbarSeverity("error");
            setOpenSnackbar(true);
        },
    });

    // Handle deletion
    const handleDelete = (submissionId) => {
        if (window.confirm("Are you sure you want to delete this submission?")) {
            deleteMutation.mutate(submissionId);
        }
    };

    // Handle opening reply dialog
    const handleOpenReplyDialog = (submission) => {
        setCurrentSubmission(submission);
        setReplySubject(`Re: ${submission.subject_name}`);
        setReplyMessage("");
        setOpenReplyDialog(true);
    };

    // Handle closing reply dialog
    const handleCloseReplyDialog = () => {
        setOpenReplyDialog(false);
        setCurrentSubmission(null);
        setReplySubject("");
        setReplyMessage("");
    };

    // Handle sending reply
    const handleSendReply = () => {
        if (!replySubject || !replyMessage) {
            setSnackbarMessage("Please fill in all fields.");
            setSnackbarSeverity("warning");
            setOpenSnackbar(true);
            return;
        }
        replyMutation.mutate({
            submissionId: currentSubmission.id,
            subject: replySubject,
            message: replyMessage,
        });
    };

    // Handle filtering
    const handleSubjectChange = (event) => {
        console.log(event.target.valur);
        setSelectedSubject(event.target.value);
        setSelectedOption("");
    };

    const handleOptionChange = (event) => {
        setSelectedOption(event.target.value);
    };

    // Filter submissions based on selected subject and option
    const filteredSubmissions = submissions.filter((submission) => {
        const matchesSubject = selectedSubject
            ? submission.subject_id === selectedSubject
            : true;
        const matchesOption = selectedOption
            ? submission.option_id === selectedOption
            : true;
        return matchesSubject && matchesOption;
    });

    // Handle Snackbar close
    const handleCloseSnackbar = (event, reason) => {
        if (reason === "clickaway") {
            return;
        }
        setOpenSnackbar(false);
    };

    if (submissionsLoading || subjectsLoading || optionsLoading) {
        return (
            <Box className="contactus">
                <Typography variant="h4" className="page-title">
                    Contact Us Submissions
                </Typography>
                <CircularProgress className="loading" />
            </Box>
        );
    }

    if (submissionsError) {
        return (
            <Box className="contactus">
                <Typography variant="h4" className="page-title">
                    Contact Us Submissions
                </Typography>
                <Typography color="error">
                    Error fetching submissions: {submissionsErrorMsg.message}
                </Typography>
            </Box>
        );
    }

    if (subjectsError) {
        return (
            <Box className="contactus">
                <Typography variant="h4" className="page-title">
                    Contact Us Submissions
                </Typography>
                <Typography color="error">
                    Error fetching subjects: {subjectsErrorMsg.message}
                </Typography>
            </Box>
        );
    }

    if (optionsError) {
        return (
            <Box className="contactus">
                <Typography variant="h4" className="page-title">
                    Contact Us Submissions
                </Typography>
                <Typography color="error">
                    Error fetching options: {optionsErrorMsg.message}
                </Typography>
            </Box>
        );
    }

    return (
        <Box className="contactus">
            <Typography variant="h4" className="page-title">
                Contact Us Submissions
            </Typography>

            {/* Filters */}
            <Box className="filters">
                <FormControl variant="outlined" className="filter-control">
                    <InputLabel id="subject-label">Subject</InputLabel>
                    <Select
                        labelId="subject-label"
                        value={selectedSubject}
                        onChange={handleSubjectChange}
                        label="Subject"
                    >
                        <MenuItem value="">
                            <em>All Subjects</em>
                        </MenuItem>
                        {subjects.map((subject) => (
                            <MenuItem key={subject.id} value={subject.id}>
                                {subject.subject_name}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

                {selectedSubject && (
                    <FormControl variant="outlined" className="filter-control">
                        <InputLabel id="option-label">Option</InputLabel>
                        <Select
                            labelId="option-label"
                            value={selectedOption}
                            onChange={handleOptionChange}
                            label="Option"
                        >
                            <MenuItem value="">
                                <em>All Options</em>
                            </MenuItem>
                            {options.map((option) => (
                                <MenuItem key={option.id} value={option.id}>
                                    {option.option_name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                )}
            </Box>

            {/* Submissions Grid */}
            <Grid container spacing={3} className="submissions-container">
                {filteredSubmissions.length && filteredSubmissions.length > 0 ? (
                    filteredSubmissions.map((submission) => (
                        <Grid item xs={12} md={6} key={submission.id}>
                            <Card className="submission-card">
                                <CardContent>
                                    <Box display="flex" alignItems="center" mb={2}>
                                        <Avatar
                                            src={
                                                submission.profilePic
                                                    ? submission.profilePic.startsWith("http")
                                                        ? submission.profilePic
                                                        : `/upload/${submission.profilePic}`
                                                    : "/default-profile.png"
                                            }
                                            alt={submission.name}
                                            sx={{ width: 56, height: 56, marginRight: 2 }}
                                        />
                                        <Box>
                                            <Typography variant="h6">{submission.name}</Typography>
                                            <Typography variant="body2" color="textSecondary">
                                                {submission.email}
                                            </Typography>
                                        </Box>
                                    </Box>

                                    <Typography variant="subtitle1" gutterBottom>
                                        Subject:{" "}
                                        {submission.subject_name}
                                    </Typography>

                                    {submission.option_id && (
                                        <Typography variant="subtitle2" gutterBottom>
                                            Option:{" "}
                                            {submission.option_name}
                                        </Typography>
                                    )}

                                    <Typography variant="body1" gutterBottom>
                                        Message: {submission.message}
                                    </Typography>

                                    <Typography variant="caption" color="textSecondary">
                                        Submitted on:{" "}
                                        {new Date(submission.created_at).toLocaleString()}
                                    </Typography>
                                </CardContent>
                                <Box className="card-actions">
                                    {!submission.replied ? (
                                        <Button
                                            variant="contained"
                                            color="primary"
                                            startIcon={<ReplyIcon />}
                                            onClick={() => handleOpenReplyDialog(submission)}
                                        >
                                            Reply
                                        </Button>
                                    ) : (
                                        <Typography variant="body2" color="success.main">
                                            Replied
                                        </Typography>
                                    )}
                                    <Button
                                        variant="outlined"
                                        color="error"
                                        startIcon={<DeleteIcon />}
                                        onClick={() => handleDelete(submission.id)}
                                    >
                                        Delete
                                    </Button>
                                </Box>
                            </Card>
                        </Grid>
                    ))
                ) : (
                    <Typography variant="h6">No submissions found.</Typography>
                )}
            </Grid>

 {/* Reply Dialog */}
 <Dialog
        open={openReplyDialog}
        onClose={handleCloseReplyDialog}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Reply to {currentSubmission?.name}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Compose your reply below. The email will be sent to{" "}
            <strong>{currentSubmission?.email}</strong>.
          </DialogContentText>
          <Box mt={2}>
            <TextField
              label="Subject"
              variant="outlined"
              fullWidth
              value={replySubject}
              onChange={(e) => setReplySubject(e.target.value)}
              margin="normal"
            />
            <TextField
              label="Message"
              variant="outlined"
              fullWidth
              multiline
              rows={6}
              value={replyMessage}
              onChange={(e) => setReplyMessage(e.target.value)}
              margin="normal"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseReplyDialog} color="secondary">
            Cancel
          </Button>
          <Button
            onClick={handleSendReply}
            color="primary"
            variant="contained"
            disabled={replyMutation.isLoading}
          >
            {replyMutation.isLoading ? "Sending..." : "Send Reply"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar Notifications */}
      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbarSeverity}
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>

        </Box>
    );
};

export default ContactUs;
