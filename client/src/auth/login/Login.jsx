import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/authContext";
import { ModalContext } from "../../context/ModalContext";
import { useFormik } from "formik";
import * as Yup from "yup";
import "./login.scss";

const Login = ({ toggleRegisterModal }) => {
  const { login, currentUser } = useContext(AuthContext);
  const [err, setErr] = useState(null);
  const navigate = useNavigate();
  const {toggleLoginModal} = useContext(ModalContext);

  // Define the validation schema
  const validationSchema = Yup.object({
    username: Yup.string().required("Username is required"),
    password: Yup.string().required("Password is required"),
  });

  // Initialize Formik
  const formik = useFormik({
    initialValues: {
      username: "",
      password: "",
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        await login(values);
        if (currentUser.type === "regular") {
          toggleLoginModal();
          navigate("/user");
        } else if (currentUser.type === "owner") {
          toggleLoginModal();
          navigate("/owner");
        } else if (currentUser.type === "expert") {
          toggleLoginModal();
          navigate("/expert");
        } else if (currentUser.type === "admin") {
          toggleLoginModal();
          navigate("/admin");
        }
      } catch (error) {
        setErr("Invalid credentials"); // Set a generic error message
      }
    },
  });

  // Reset error when user starts typing in either field
  const handleFocus = () => {
    setErr(null);
  };

  return (
    <div className="login">
      <form onSubmit={formik.handleSubmit}>
        <h1>I Like That Coffee</h1>

        <input
          type="text"
          placeholder="Username"
          name="username"
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          onFocus={handleFocus}  // Reset error on focus
          value={formik.values.username}
        />
        {formik.touched.username && formik.errors.username ? (
          <div className="error-message">{formik.errors.username}</div>
        ) : null}

        <input
          type="password"
          placeholder="Password"
          name="password"
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          onFocus={handleFocus}  // Reset error on focus
          value={formik.values.password}
        />
        {formik.touched.password && formik.errors.password ? (
          <div className="error-message">{formik.errors.password}</div>
        ) : null}

        {err && <div className="error-message">{err}</div>}

        <button className="loginbtn">Login</button>

        <div className="register-link">
          <span>Don't have an account? </span>
          <span className="register-text" onClick={toggleRegisterModal}>
            Register
          </span>
        </div>
      </form>
    </div>
  );
};

export default Login;
