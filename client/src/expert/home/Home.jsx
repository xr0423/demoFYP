import Posts from "../components/posts/Posts"
import Share from "../components/share/Share"
import { AuthContext } from "../../context/authContext";
import MyArticle from "../components/myArticles/Myarticles";

import { trackLocation } from "../../utils/locationTracking"
import { useContext, useEffect, useState } from "react"
import "./home.scss"

const Home = () => {
  const [selectedTab, setSelectedTab] = useState("MyArticle");
  const { currentUser } = useContext(AuthContext);
  useEffect(() => {
    trackLocation(1);
  }, []);

  return (
    <div className="experthome">
      {/* Navigation Tabs */}
      <div className="experttab">
        <button
          className={selectedTab === "MyArticle" ? "active" : ""}
          onClick={() => setSelectedTab("MyArticle")}
        >
          My Articles
        </button>
      </div>

      {/* Content Container */}
      <div className="selectcontainer">

        {selectedTab === "MyArticle" && (
          <div className="articlecontent">
            <MyArticle userId={currentUser?.id} />
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;