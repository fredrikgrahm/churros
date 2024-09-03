import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Team = () => {
  const [teamMembers, setTeamMembers] = useState([]);
  const [teamName, setTeamName] = useState('');
  const [isOwner, setIsOwner] = useState(false); 
  const [teamId, setTeamId] = useState(null);

  useEffect(() => {
    const fetchTeamData = async () => {
      try {
        // Fetch team members
        const membersResult = await axios.get('http://localhost:5000/team_members', { withCredentials: true });
        setTeamMembers(membersResult.data);

        // Fetch team information to check if the current user is the owner
        const teamResult = await axios.get('http://localhost:5000/team_name', { withCredentials: true });
        setTeamName(teamResult.data.name);
        setIsOwner(teamResult.data.isOwner);
        setTeamId(teamResult.data.id);
      } catch (err) {
        console.error('Error fetching team data:', err);
      }
    };

    fetchTeamData();
  }, []);

  const handleDeleteTeam = async () => {
    if (teamId && window.confirm('Are you sure you want to delete this team? This action cannot be undone.')) {
      try {
        const response = await axios.delete(`http://localhost:5000/delete_team/${teamId}`, { withCredentials: true });
        alert(response.data.message);
      } catch (err) {
        console.error('Error deleting team:', err);
        alert('Failed to delete the team.');
      }
    } else {
      alert('Invalid team or missing team ID.');
    }
  };

  return (
    <div className="container">
      <h2>Team Members</h2>
      <p>Team Name: {teamName}</p>
      <ul>
        {teamMembers.map((member, index) => (
          <li key={index}>
            {member.username} - {member.rank ? member.rank.charAt(0).toUpperCase() + member.rank.slice(1) : 'Member'}
          </li>
        ))}
      </ul>
      {isOwner && (
        <button onClick={handleDeleteTeam} className="delete-button">
          Delete Team
        </button>
      )}
    </div>
  );
};

export default Team;

