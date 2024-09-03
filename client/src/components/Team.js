import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Team = () => {
  const [teamMembers, setTeamMembers] = useState([]);

  useEffect(() => {
    const fetchTeamMembers = async () => {
      try {
        const result = await axios.get('http://localhost:5000/team_members', { withCredentials: true });
        setTeamMembers(result.data);
      } catch (err) {
        console.error('Error fetching team members:', err);
      }
    };

    fetchTeamMembers();
  }, []);

  return (
    <div className="container">
      <h2>Team Members</h2>
      <ul>
        {teamMembers.map((member, index) => (
          <li key={index}>
            {member.username} - {member.rank ? member.rank.charAt(0).toUpperCase() + member.rank.slice(1) : 'Member'}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Team;
