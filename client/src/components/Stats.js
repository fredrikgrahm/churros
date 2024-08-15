import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';
import 'chart.js/auto';
import '../App.css';

const Stats = () => {
  const [userStats, setUserStats] = useState({ username: '', points: 0 });
  const [teamStats, setTeamStats] = useState([]);
  const [showTeamStats, setShowTeamStats] = useState(false);

  useEffect(() => {
    const fetchUserStats = async () => {
      try {
        const result = await axios.get('http://localhost:5000/user_stats', { withCredentials: true });
        setUserStats(result.data);
      } catch (err) {
        console.error(err);
      }
    };

    const fetchTeamStats = async () => {
      try {
        const result = await axios.get('http://localhost:5000/team_stats', { withCredentials: true });
        setTeamStats(result.data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchUserStats();
    if (showTeamStats) {
      fetchTeamStats();
    }
  }, [showTeamStats]);

  const data = {
    labels: showTeamStats ? teamStats.map(member => member.username) : [userStats.username],
    datasets: [
      {
        label: 'Points (Churros)',
        data: showTeamStats ? teamStats.map(member => member.points) : [userStats.points],
        backgroundColor: 'rgba(255, 204, 0, 0.8)',
        borderColor: 'rgba(255, 153, 0, 1)',
        borderWidth: 1,
      },
    ],
  };

  const options = {
    scales: {
      y: {
        beginAtZero: true,
        max: 1000,
      },
    },
  };

  return (
    <div className="container">
      <h2>Stats</h2>
      <div>
        <button onClick={() => setShowTeamStats(!showTeamStats)}>
          {showTeamStats ? 'Show My Stats' : 'Show Team Stats'}
        </button>
      </div>
      <Bar data={data} options={options} />
    </div>
  );
};

export default Stats;
