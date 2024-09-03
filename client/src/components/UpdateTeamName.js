// src/UpdateTeamName.js

import React, { useState } from 'react';
import axios from 'axios';

const UpdateTeamName = () => {
  const [newName, setNewName] = useState('');
  const [message, setMessage] = useState('');

  const handleUpdateTeamName = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        'http://localhost:5000/update_team_name',
        { name: newName },
        { withCredentials: true }
      );
      setMessage(response.data.message);
    } catch (err) {
      setMessage(err.response.data.error || 'Failed to update team name');
    }
  };

  return (
    <div className="update-team-name">
      <h3>Update Team Name</h3>
      <form onSubmit={handleUpdateTeamName}>
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="Enter new team name"
          required
        />
        <button type="submit">Update Team Name</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
};

export default UpdateTeamName;
