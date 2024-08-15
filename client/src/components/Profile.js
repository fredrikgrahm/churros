import React from 'react';
import { Link } from 'react-router-dom';

const Profile = ({ username }) => {
  return (
    <div className="profile-container">
      <h2>Profile</h2>
      <p>Welcome, {username}!</p>
      
      <h3>Account Links</h3>
      <ul className="profile-links">
        <li><Link to="/dashboard">Dashboard</Link></li>
        <li><Link to="/stats">Stats</Link></li>
        <li><Link to="/add_chore">Add Chore</Link></li>
        <li><Link to="/invite">Invite People</Link></li>
        <li><Link to="/notifications">Notifications</Link></li>
      </ul>
    </div>
    //forth push
  );
};

export default Profile;



