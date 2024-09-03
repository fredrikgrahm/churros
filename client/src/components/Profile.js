import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import UpdateTeamName from './UpdateTeamName';
import axios from 'axios'; // Import axios to make HTTP requests

const Profile = ({ username }) => {
  const [teamName, setTeamName] = useState('');

  // Fetch the team name when the component mounts
  useEffect(() => {
    const fetchTeamName = async () => {
      try {
        const response = await axios.get('http://localhost:5000/team_info', { withCredentials: true });
        if (response.data.team_name) {
          setTeamName(response.data.team_name);
        } else {
          setTeamName('No team'); // If the user is not part of any team
        }
      } catch (err) {
        console.error('Error fetching team name:', err);
      }
    };

    fetchTeamName();
  }, []);

  return (
    <div className="profile-container">
      <h2>Profile</h2>
      <p>Welcome, {username}!</p>
      {/* Display the team name */}
      {teamName && <p>Team: {teamName}</p>}
      <Link to="/team">View Team Members</Link> {/* Add this link */}

      <h3>Account Links</h3>
      <ul className="profile-links">
        <li><Link to="/dashboard">Dashboard</Link></li>
        <li><Link to="/stats">Stats</Link></li>
        <li><Link to="/add_chore">Add Chore</Link></li>
        <li><Link to="/invite">Invite People</Link></li>
        <li><Link to="/notifications">Notifications</Link></li>
      </ul>

      {/* Include the UpdateTeamName Component */}
      <UpdateTeamName />
    </div>
  );
};

export default Profile;





