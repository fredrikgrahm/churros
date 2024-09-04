import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './components/Home';
import Register from './components/Register';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import AddChore from './components/AddChore';
import Stats from './components/Stats';
import Invite from './components/Invite';
import Notifications from './components/Notifications';
import NavBar from './components/NavBar';
import Profile from './components/Profile';
import axios from 'axios';
import './App.css';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const response = await axios.get('http://localhost:5000/user', { withCredentials: true });
        if (response.status === 200) {
          setIsLoggedIn(true);
          setUsername(response.data.username); // Set username if user is logged in
        }
      } catch (err) {
        setIsLoggedIn(false);
        setUsername(''); // Clear username on error or if not logged in
      }
    };

    checkLoginStatus();
  }, []);

  return (
    <Router>
      <NavBar
        isLoggedIn={isLoggedIn}
        setIsLoggedIn={setIsLoggedIn}
        username={username}
        setUsername={setUsername} // Pass setUsername prop
      />
      <div className="container">
        <Routes>
          <Route path="/" element={<Home isLoggedIn={isLoggedIn} />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login setIsLoggedIn={setIsLoggedIn} />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/add_chore" element={<AddChore />} />
          <Route path="/stats" element={<Stats />} />
          <Route path="/invite" element={<Invite />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/profile" element={<Profile username={username} />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;


