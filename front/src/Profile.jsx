import React, { useEffect, useState } from "react";
import "./profile.css";

function Profile() {
  const [userData, setUserData] = useState(null);
  const [userType, setUserType] = useState(null);
  const [requests, setRequests] = useState([]);
  const [codes, setCodes] = useState([]);
  const [offers, setOffers] = useState([]);
  const [collectors, setCollectors] = useState([]);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("greenovation_user"));
    const storedUserType = localStorage.getItem("greenovation_user_type");
    setUserData(storedUser);
    setUserType(storedUserType);

    // Fetch related data based on user type
    if (storedUser) {
      fetchUserData(storedUser, storedUserType);
    }
  }, []);

  const fetchUserData = async (user, type) => {
    try {
      if (type === "user") {
        // For now, we'll show basic user info since the requests/codes endpoints don't exist yet
        console.log("User data loaded:", user);
      } else if (type === "seller") {
        // Show basic seller info
        console.log("Seller data loaded:", user);
      } else if (type === "collector") {
        // Show basic collector info  
        console.log("Collector data loaded:", user);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  if (!userData) return <h2>Please login first.</h2>;

  return (
    <div className="profile-container">
      <h1>My Profile</h1>
      
      <div className="profile-card">
        {userType === "user" && (
          <>
            <div className="profile-info">
              <h2>User Information</h2>
              <p><b>ID:</b> {userData.id}</p>
              <p><b>Name:</b> {userData.name || 'Not set'}</p>
              <p><b>Email:</b> {userData.email}</p>
              <p><b>Phone:</b> {userData.phone || 'Not set'}</p>
              <p><b>Balance:</b> {userData.balance || 0} EGP</p>
              <p><b>Points:</b> {userData.points || 0}</p>
              <p><b>Member Since:</b> {new Date(userData.created_at).toLocaleDateString()}</p>
            </div>

            <div className="requests-section">
              <h3>My Requests</h3>
              <p style={{color: '#666', fontStyle: 'italic'}}>No requests yet. Feature coming soon!</p>
            </div>

            <div className="codes-section">
              <h3>My Codes</h3>
              <p style={{color: '#666', fontStyle: 'italic'}}>No codes yet. Feature coming soon!</p>
            </div>
          </>
        )}

        {userType === "seller" && (
          <>
            <div className="profile-info">
              <h2>Seller Information</h2>
              <p><b>ID:</b> {userData.id}</p>
              <p><b>Name:</b> {userData.name || 'Not set'}</p>
              <p><b>Email:</b> {userData.email}</p>
              <p><b>Phone:</b> {userData.phone || 'Not set'}</p>
              <p><b>Registry:</b> {userData.registry || 'Not set'}</p>
              <p><b>GPS Location:</b> {userData.gps ? `${userData.gps.x}, ${userData.gps.y}` : 'Not set'}</p>
              <p><b>Points:</b> {userData.points || 0}</p>
              <p><b>Member Since:</b> {new Date(userData.created_at).toLocaleDateString()}</p>
            </div>

            <div className="collectors-section">
              <h3>My Collectors</h3>
              <p style={{color: '#666', fontStyle: 'italic'}}>No collectors assigned yet. Feature coming soon!</p>
            </div>
          </>
        )}

        {userType === "collector" && (
          <>
            <div className="profile-info">
              <h2>Collector Information</h2>
              <p><b>ID:</b> {userData.id}</p>
              <p><b>Name:</b> {userData.name || 'Not set'}</p>
              <p><b>Email:</b> {userData.email}</p>
              <p><b>Phone:</b> {userData.phone || 'Not set'}</p>
              <p><b>Registry:</b> {userData.registry || 'Not set'}</p>
              <p><b>GPS Location:</b> {userData.gps ? `${userData.gps.x}, ${userData.gps.y}` : 'Not set'}</p>
              <p><b>Points:</b> {userData.points || 0}</p>
              <p><b>Member Since:</b> {new Date(userData.created_at).toLocaleDateString()}</p>
            </div>

            <div className="offers-section">
              <h3>My Offers</h3>
              <p style={{color: '#666', fontStyle: 'italic'}}>No offers yet. Feature coming soon!</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Profile;