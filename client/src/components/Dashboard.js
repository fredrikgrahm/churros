import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import '../App.css';  // Ensure CSS file is imported

const Dashboard = () => {
  const [chores, setChores] = useState([]);
  const [defaultChores, setDefaultChores] = useState({});
  const [points, setPoints] = useState(0);
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    fetchChores();
  }, []);

  const fetchChores = async () => {
    try {
      const result = await axios.get('http://localhost:5000/dashboard', { withCredentials: true });
      console.log('User Chores:', result.data);
      setChores(result.data);

      const user = await axios.get('http://localhost:5000/user', { withCredentials: true });
      console.log('User Data:', user.data);
      setPoints(user.data.points);

      const defaultChoresResult = await axios.get('http://localhost:5000/default_chores', { withCredentials: true });
      console.log('Default Chores:', defaultChoresResult.data);
      setDefaultChores(defaultChoresResult.data);
    } catch (err) {
      console.error(err);
    }
  };

  const completeChore = async (id, chorePoints) => {
    try {
      await axios.post(`http://localhost:5000/complete_chore/${id}`, {}, { withCredentials: true });
      setChores(chores.filter(chore => chore.id !== id));
      setPoints(points + chorePoints);  // Update points state immediately
    } catch (err) {
      console.error(err);
    }
  };

  const completeDefaultChore = async (choreTitle, chorePoints, category) => {
    try {
      await axios.post('http://localhost:5000/complete_default_chore', {
        title: choreTitle,
        points: chorePoints
      }, { withCredentials: true });
      setDefaultChores({
        ...defaultChores,
        [category]: defaultChores[category].filter(chore => chore.title !== choreTitle)
      });
      setPoints(points + chorePoints);  // Update points state immediately
    } catch (err) {
      console.error(err);
    }
  };

  const resetPoints = async () => {
    try {
      await axios.post('http://localhost:5000/reset_points', {}, { withCredentials: true });
      setPoints(0);
      setShowPopup(false);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="container">
      <h2>Dashboard</h2>
      <p>Points: {points}</p>
      <button onClick={() => setShowPopup(true)}>Reset Points</button>

      {showPopup && (
        <div className="popup">
          <div className="popup-inner">
            <h3>Are you sure you want to reset your points?</h3>
            <button onClick={resetPoints}>Yes</button>
            <button onClick={() => setShowPopup(false)}>No</button>
          </div>
        </div>
      )}

      <h3>Your Chores</h3>
      <Link to="/add_chore" className="add-chore-button">Add New Chore</Link>
      <ul>
        {chores.map(chore => (
          <li key={chore.id}>
            <span>{chore.title} - {chore.points} Churros</span>
            <button onClick={() => completeChore(chore.id, chore.points)}>Complete</button>
          </li>
        ))}
      </ul>

      <h3>Default Chores</h3>
      <button onClick={fetchChores}>Refresh Default Chores</button> {/* Add refresh button */}
      <div className="default-chores-container">
        {Object.keys(defaultChores).map(category => (
          <div key={category}>
            <h4>{category}</h4>
            <ul>
              {defaultChores[category].map((chore, index) => (
                <li key={index} className="default-chore">
                  <span>{chore.title} - {chore.description} - {chore.points} Churros</span>
                  <button onClick={() => completeDefaultChore(chore.title, chore.points, category)}>Complete</button>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
