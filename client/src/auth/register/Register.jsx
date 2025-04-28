import { Link, useNavigate } from "react-router-dom"; 
import "./register.scss";
import React, { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import {useMutation} from '@tanstack/react-query';
import { makeRequest } from "../../axios";
import Snackbar from "@mui/material/Snackbar";
import MuiAlert from "@mui/material/Alert";
const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

const Register = ({ toggleLoginModal  }) => {
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [generatedCode, setGeneratedCode] = useState("");
  const [err, setErr] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [userType, setUserType] = useState('Regular User');
  const navigate = useNavigate();
  const [files, setFiles] = useState([]); // for multiple files
  const [snackbarOpen, setSnackbarOpen] = useState(false); // State for Snackbar


  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };


  const upload = async (username, userType) => {
    try {
      const formData = new FormData();
      let i = 1;
  
      files.forEach((file) => {
        // Extract original file extension and rename using username and userType
        const fileExtension = file.name.split('.').pop(); // Get the file extension
        const newFileName = `${username}-${userType}${i}.${fileExtension}`; // Rename the file
  
        const renamedFile = new File([file], newFileName, { type: file.type });
        formData.append("files", renamedFile); // Append renamed file to formData
        i++;
      });
  
      const res = await makeRequest.post("/upload-documents", formData);
      return res.data; // Return the uploaded file URLs
    } catch (err) {
      console.error("Error uploading files:", err);
    }
  };
  
  

  const registerMutation = useMutation({
    mutationFn: (formData) => makeRequest.post("/auth/register", formData),
    onSuccess: () => {
      setSnackbarOpen(true);
      formik.resetForm(); // Reset form fields
      setFiles([]); // Clear uploaded files
      setGeneratedCode(""); // Clear the verification code
      setIsCodeSent(false); 
      setSuccessMsg(null);
    },
    onError: (err)=> {
      setErr(err?.message || "Something went wrong");
    }
  })

  const validationSchema = Yup.object({
    username: Yup.string().required("Username is required"),
    email: Yup.string()
      .email("Invalid email format")
      .required("Email is required"),
    password: Yup.string()
      .min(8, "Password must be at least 8 characters")
      .matches(/[A-Z]/, "Password must contain at least one uppercase letter")
      .matches(/[a-z]/, "Password must contain at least one lowercase letter")
      .matches(/[0-9]/, "Password must contain at least one number")
      .required("Password is required"),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref("password"), null], "Passwords must match")
      .required("Confirm your password"), 
    name: Yup.string().required("Name is required"),
    type: Yup.string().required("Please select a user type"),
    verificationCode: Yup.string().required("Verification code is required"),
  });

  const formik = useFormik({
    initialValues: {
      username: "",
      name: "",
      password: "",
      confirmPassword: "",
      email: "",
      verificationCode: "",
      documents: null,
      type: "Regular User",
    },
    validationSchema,
    onSubmit: async (values) => {
      if (values.verificationCode !== generatedCode) {
        setErr("Wrong verification code");
        return;
      }

      let modifiedValues = { ...values };
      if (modifiedValues.type === "Regular User") {
        modifiedValues.type = "regular";
      } else if (modifiedValues.type === "Coffee Shop Owner") {
        modifiedValues.type = "owner";
      } else if (modifiedValues.type === "Coffee Expert") {
        modifiedValues.type = "expert";
      }

      let docUrls = [];
      if(files && files.length > 0){
        docUrls = await upload(values.username, modifiedValues.type); // Pass username and type
        modifiedValues.documents = docUrls;
      }
      registerMutation.mutate(modifiedValues);
    },
  });


  const handleFileChange = (e) => {
    setFiles(Array.from(e.target.files));
    console.log(files) // Store multiple files as an array
  };

  const [canResend, setCanResend] = useState(true);
  const [timer, setTimer] = useState(30);

  const startResendCountdown = () => {
    setCanResend(false);
    const countdown = setInterval(() => {
      setTimer((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(countdown);
          setCanResend(true);
          return 30;
        }
        return prevTime - 1;
      });
    }, 1000);
  };

  const handleGetCode = async () => {
    setSuccessMsg(null);
    setErr(null);

    try {
      const response = await makeRequest.post("/auth/send-code",
        {
          email: formik.values.email,
        }
      );
      if (response.status === 200) {
        setGeneratedCode(response.data.code);
        setIsCodeSent(true);
        setSuccessMsg("Verification code has been sent to your email.");
        startResendCountdown();
      }
    } catch (err) {
      setErr("Failed to send verification code.");
      setSuccessMsg(null);
    }
  };

  return (
    <div className="register">
      <form onSubmit={formik.handleSubmit}>
        <h1>I Like That Coffee</h1>

        {/* Username */}
        <input
          type="text"
          placeholder="Username"
          name="username"
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          value={formik.values.username}
        />
        {formik.touched.username && formik.errors.username ? (
          <div className="error-message">{formik.errors.username}</div>
        ) : null}

        {/* Name */}
        <input
          type="text"
          placeholder="Display Name"
          name="name"
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          value={formik.values.name}
        />
        {formik.touched.name && formik.errors.name ? (
          <div className="error-message">{formik.errors.name}</div>
        ) : null}

        {/* Password */}
        <input
          type="password"
          placeholder="Password"
          name="password"
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          value={formik.values.password}
        />
        {formik.touched.password && formik.errors.password ? (
          <div className="error-message">{formik.errors.password}</div>
        ) : null}

        <input
          type="password"
          placeholder="Confirm Password"
          name="confirmPassword"
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          value={formik.values.confirmPassword}
        />
        {formik.touched.confirmPassword && formik.errors.confirmPassword ? (
          <div className="error-message">{formik.errors.confirmPassword}</div>
        ) : null}

        {/* Email */}
        <input
          type="email"
          placeholder="Email"
          name="email"
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          value={formik.values.email}
        />
        {formik.touched.email && formik.errors.email ? (
          <div className="error-message">{formik.errors.email}</div>
        ) : null}

        {/* Verification Code and Get Code Button */}
        <div className="code-input-row">
          <input
            type="text"
            placeholder="Enter verification code"
            name="verificationCode"
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.verificationCode}
          />
          <button
            type="button"
            onClick={handleGetCode}
            disabled={!canResend}
            className="code-btn"
          >
            {canResend ? (isCodeSent ? "Resend Code" : "Get Code") : `Resend in ${timer}s`}
          </button>
        </div>

        {formik.touched.verificationCode && formik.errors.verificationCode ? (
          <div className="error-message">{formik.errors.verificationCode}</div>
        ) : null}
        {err && <span className="error-message">{err}</span>}
        {successMsg && <span className="success-message">{successMsg}</span>}

        {/* User Type */}
        <select
          name="type"
          value={formik.values.type}
          onChange={(e) => {
            formik.handleChange(e);
            setUserType(e.target.value);
          }}
          onBlur={formik.handleBlur}
        >
          <option value="Regular User">Regular User</option>
          <option value="Coffee Shop Owner">Coffee Shop Owner</option>
          <option value="Coffee Expert">Coffee Expert</option>
        </select>
        {formik.touched.type && formik.errors.type ? (
          <div className="error-message">{formik.errors.type}</div>
        ) : null}

    {(userType === "Coffee Shop Owner" || userType === "Coffee Expert") && (
          <div className="upload-section">
            <label htmlFor="documents">Upload Document:</label>
            <input
              type="file"
              id="documents"
              name="documents"
              multiple
              onChange={handleFileChange}
            />
          </div>
        )}

        <button type="submit">Register</button>
        {/* Snackbar for success message */}
        <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleSnackbarClose}>
          <Alert onClose={handleSnackbarClose} severity="success">
            User has been successfully registered!
          </Alert>
        </Snackbar>

        <div className="login-link">
          <span>Already have an account? </span>
          <span className="login-text" onClick={toggleLoginModal}>
            Login
          </span>
        </div>
      </form>
    </div>
  );
};

export default Register;