import React, { useEffect, useState } from 'react';
import UpdateTeamName from './UpdateTeamName';
import { Link } from 'react-router-dom'; // Import Link from react-router-dom
import axios from 'axios';

const Team = () => {
  const [teamMembers, setTeamMembers] = useState([]);
  const [teamName, setTeamName] = useState('');
  const [isOwner, setIsOwner] = useState(false);
  const [teamId, setTeamId] = useState(null);
  const [isInTeam, setIsInTeam] = useState(true); // State to check if the user is in a team

  useEffect(() => {
    const fetchTeamData = async () => {
      try {
        // Fetch team members
        const membersResult = await axios.get('http://localhost:5000/team_members', { withCredentials: true });
        setTeamMembers(membersResult.data);

        // Fetch team information to check if the current user is the owner
        const teamResult = await axios.get('http://localhost:5000/team_name', { withCredentials: true });

        // Check if teamResult.data contains the expected structure
        if (teamResult.data && teamResult.data.name) {
          setTeamName(teamResult.data.name);
        }

        if (teamResult.data && teamResult.data.isOwner !== undefined) {
          setIsOwner(teamResult.data.isOwner);
        }

        if (teamResult.data && teamResult.data.id) {
          setTeamId(teamResult.data.id);
        } else {
          console.error('Team ID is missing from the response:', teamResult.data);
        }
      } catch (err) {
        console.error('Error fetching team data:', err);
        setIsInTeam(false); // If fetching team data fails, assume user is not in a team
      }
    };

    fetchTeamData();
  }, []);

  const handleDeleteTeam = async () => {
    if (!teamId) {
      alert('Invalid team or missing team ID.');
      return;
    }

    if (window.confirm('Are you sure you want to delete this team? This action cannot be undone.')) {
      try {
        const response = await axios.delete(`http://localhost:5000/delete_team/${teamId}`, { withCredentials: true });
        alert(response.data.message);
      } catch (err) {
        console.error('Error deleting team:', err);
        alert('Failed to delete the team.');
      }
    } else {
      alert('You have cancelled the deletion.');
    }
  };

  return (
    <div className="container">
      {isInTeam ? (
        <>
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
            <>
              <button onClick={handleDeleteTeam} className="delete-button">
                Delete Team
              </button>
              <UpdateTeamName />
            </>
          )}
        </>
      ) : (
        <div>
          <h2>You are not part of a team</h2>
          <p>
            You can start a team by inviting people.{' '}
            <Link to="/invite">Click here to invite people</Link>.
          </p>
        </div>
      )}
    </div>
  );
};

export default Team;

