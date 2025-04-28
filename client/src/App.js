import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
  Outlet,
} from "react-router-dom";
import { useContext, useState } from "react";
import { AuthContext } from "./context/authContext";
import { DarkModeContext } from "./context/darkModeContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

// Import layouts and components
// User
import Navbar from "./user/components/navbar/Navbar";
import UserHome from "./user/home/Home";
import UserProfile from "./user/profile/Profile";
import UserMap from "./user/map/Map";
import UserShopEvent from "./user/shopevent/UserShopEvent";
import UserMeetUp from "./user/meetup/UserMeetUp";
import UserArticles from "./user/components/viewArticles/Viewarticles";
import UserArticleDetails from "./user/components/articleDetails/Articledetails";
import UserShopListings from "./user/shoplisting/UserShopListings";
import UserShopDetails from "./user/shopdetails/UserShopDetails";
import UserFavorites from "./user/components/favorites/Favorites";
import UserActivities from "./user/components/activities/Activities";
import UserMyRewards from "./user/myrewards/MyRewards";
import UserFriends from "./user/components/friend/Friend";

// Owner
import OwnerHome from "./owner/home/Home";
import OwnerProfile from "./owner/profile/Profile";
import OwnerShopEvent from "./owner/shopevent/ShopEvent";
import OwnerShopListings from "./owner/shoplistings/Shoplistings";
import OwnerShopDetails from "./owner/components/shopdetails/ShopDetails";
import OwnerNavBar from "./owner/components/navbar/Navbar";
import OwnerMap from "./owner/map/Map";
import OwnerActivities from "./owner/components/activities/Activities";
import OwnerDashboard from "./owner/dashboard/Dashboard";

// Expert
import ExpertHome from "./expert/home/Home";
import ExpertProfile from "./expert/profile/Profile";
import ExpertMap from "./expert/map/Map";
import ExpertNavBar from "./expert/components/navbar/Navbar";
import ExpertPosts from "./expert/components/posts/Posts";
import ExpertArticles from "./expert/components/articles/Articles";
import ExpertCreateArticle from "./expert/components/createArticle/Createarticle";
import ExpertArticleDetails from "./expert/components/articleDetails/Articledetails";
import ExpertFavorites from "./expert/components/favorites/Favorites";
import ExpertActivities from "./expert/components/activities/Activities";
import ExpertArticlesTab from "./expert/components/articlesTab/Articlestab.jsx";
import ExpertMyRewards from "./expert/myrewards/MyRewards";

//admin
import AdminHome from "./admin/home/Home";
import AdminProfile from "./admin/profile/Profile";
import AdminNavBar from "./admin/components/navbar/Navbar";
import AdminUser from "./admin/components/user-management/Users-Management";
import AdminContactUs from "./admin/components/contactus/ContactUs";
import AdminShoplisting from "./admin/components/shoplisting-management/Shoplistings-Management";
import AdminVariableControl from "./admin/components/variable-management/Variable-Management";
import AdminLandingControl from "./admin/components/landing-page-mangement/AdminLandingPageEditor.jsx";

// Landing
import LandingPage from "./landing/main/Main";
import LandingNavBar from "./landing/components/navbar/Navbar";

// Review
import Review from "./component/review form/ReviewForm.jsx";

function App() {
  // Query Client Setup for React Query
  const queryClient = new QueryClient();

  const { darkMode } = useContext(DarkModeContext);

  // Layouts based on roles
  const UserLayout = () => (
    <QueryClientProvider client={queryClient}>
      <div className={`theme-${darkMode ? "dark" : "light"}`}>
        <Navbar />
        <div>
          <div style={{ flex: 6 }}>
            <Outlet />
          </div>
        </div>
      </div>
    </QueryClientProvider>
  );

  const OwnerLayout = () => (
    <QueryClientProvider client={queryClient}>
      <div className={`theme-${darkMode ? "dark" : "light"}`}>
        <OwnerNavBar />
        <div style={{ display: "flex" }}>
          <div style={{ flex: 6 }}>
            <Outlet />
          </div>
        </div>
      </div>
    </QueryClientProvider>
  );

  const ExpertLayout = () => (
    <QueryClientProvider client={queryClient}>
      <div className={`theme-${darkMode ? "dark" : "light"}`}>
        <ExpertNavBar />
        <div style={{ display: "flex" }}>
          <div style={{ flex: 6 }}>
            <Outlet />
          </div>
        </div>
      </div>
    </QueryClientProvider>
  );

  const AdminLayout = () => (
    <QueryClientProvider client={queryClient}>
      <div className={`theme-${darkMode ? "dark" : "light"}`}>
        <AdminNavBar />
        <div style={{ display: "flex" }}>
          <div style={{ flex: 6 }}>
            <Outlet />
          </div>
        </div>
      </div>
    </QueryClientProvider>
  );

  const LandingLayout = () => (
    <QueryClientProvider client={queryClient}>
      <div className={`theme-${darkMode ? "dark" : "light"}`}>
        <LandingNavBar />
        <div style={{ flex: 1 }}>
          <Outlet />
        </div>
      </div>
    </QueryClientProvider>
  );

  // Protected Route
  const ProtectedRoute = ({ children, type }) => {
    const { currentUser } = useContext(AuthContext);

    // Redirect if not authenticated or role doesn't match
    if (!currentUser) {
      return <Navigate to="/" />;
    }
    const role = currentUser.type;
    if (role !== type) {
      if (role === "regular") {
        return <Navigate to="/user" />;
      } else if (role === "owner") {
        return <Navigate to="/owner" />;
      } else if (role === "expert") {
        return <Navigate to="/expert" />;
      } else if (role === "admin") {
        return <Navigate to="/admin" />;
      }
    }

    return children;
  };

  // Router Configuration
  const router = createBrowserRouter([
    {
      path: "/user",
      element: (
        <ProtectedRoute type="regular">
          <UserLayout />
        </ProtectedRoute>
      ),
      children: [
        { path: "/user", element: <UserHome /> },
        { path: "/user/profile/:id", element: <UserProfile /> },
        { path: "/user/map", element: <UserMap /> },
        { path: "/user/events", element: <UserShopEvent /> },
        { path: "/user/meetup", element: <UserMeetUp /> },
        { path: "/user/viewarticles", element: <ExpertArticlesTab /> },
        {
          path: "/user/articledetails/:articleId",
          element: <ExpertArticleDetails />,
        },
        { path: "/user/shoplisting/:id/*", element: <OwnerShopDetails /> }, // single shop  details

        { path: "/user/shoplisting", element: <UserShopListings /> },
        { path: "/user/favorites", element: <UserFavorites /> },
        { path: "/user/activities", element: <UserActivities /> },
        { path: "/user/myRewards", element: <UserMyRewards /> },
        { path: "/user/friends", element: <UserFriends /> }, // using that as a component shared among all roles

        ,
      ],
    },
    {
      path: "/owner",
      element: (
        <ProtectedRoute type="owner">
          <OwnerLayout />
        </ProtectedRoute>
      ),
      children: [
        { path: "/owner", element: <OwnerHome /> },
        { path: "/owner/profile/:id", element: <OwnerProfile /> },
        { path: "/owner/shoplisting", element: <OwnerShopListings /> },
        { path: "/owner/shoplisting/:id/*", element: <OwnerShopDetails /> },
        { path: "/owner/map", element: <UserMap /> },
        { path: "/owner/events", element: <OwnerShopEvent /> },
        { path: "/owner/review", element: <Review /> },
        { path: "/owner/activities", element: <OwnerActivities /> },
        { path: "/owner/dashboard", element: <OwnerDashboard /> },
      ],
    },
    {
      path: "/expert",
      element: (
        <ProtectedRoute type="expert">
          <ExpertLayout />
        </ProtectedRoute>
      ),
      children: [
        { path: "/expert", element: <ExpertHome /> },
        { path: "/expert/map", element: <UserMap /> },
        { path: "/expert/profile/:id", element: <ExpertProfile /> },
        { path: "/expert/posts", element: <ExpertPosts /> },
        { path: "/expert/events", element: <UserShopEvent /> },
        { path: "/expert/myRewards", element: <ExpertMyRewards /> },
        { path: "/expert/articles", element: <ExpertArticles /> },
        {
          path: "/expert/articledetails/:articleId",
          element: <ExpertArticleDetails />,
        },
        // { path: "/expert/shoplisting", element: <ExpertShopListings /> },
        { path: "/expert/createarticle", element: <ExpertCreateArticle /> },
        { path: "/expert/favorites", element: <UserFavorites /> },
        { path: "/expert/coffeeshops", element: <UserShopListings /> }, // use the one that users use coz same
        { path: "/expert/shoplisting/:id/*", element: <OwnerShopDetails /> }, //using that as a component to share among all roles
        { path: "/expert/activities", element: <ExpertActivities /> },
        { path: "/expert/articlestab", element: <ExpertArticlesTab /> },
        { path: "/expert/friends", element: <UserFriends /> },
        { path: "/expert/meetup", element: <UserMeetUp /> },
      ],
    },
    {
      path: "/admin",
      element: (
        <ProtectedRoute type="admin">
          <AdminLayout />
        </ProtectedRoute>
      ),
      children: [
        { path: "/admin", element: <AdminHome /> },
        { path: "/admin/profile/:id", element: <AdminProfile /> },
        { path: "/admin/users-management", element: <AdminUser /> },
        {
          path: "/admin/shoplistings-management",
          element: <AdminShoplisting />,
        },
        { path: "/admin/contactus", element: <AdminContactUs /> },
        { path: "/admin/variable-control", element: <AdminVariableControl /> },
        { path: "/admin/landing-control", element: <AdminLandingControl /> },

        // Add route for viewing owner's shop details
        { path: "/admin/shoplisting/:id/*", element: <OwnerShopDetails /> }, //using that as a component to share among all roles
        { path: "/admin/check-user-profile/:id", element: <UserProfile /> },
        {
          path: "/admin/articledetails/:articleId",
          element: <ExpertArticleDetails />,
        },
      ],
    },
    {
      path: "/",
      element: <LandingLayout />,
      children: [{ path: "/", element: <LandingPage /> }],
    },
  ]);

  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  );
}

export default App;
