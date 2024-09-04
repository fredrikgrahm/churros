import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import ChurrosIcon from './ChurrosIcon';

const NavBar = ({ isLoggedIn, setIsLoggedIn, username, setUsername }) => {
  const [notificationCount, setNotificationCount] = useState(0); // New state for notification count
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get('http://localhost:5000/user', { withCredentials: true });
        if (response.status === 200) {
          setUsername(response.data.username);
          fetchNotifications(); // Fetch notifications after user data is loaded
        }
      } catch (err) {
        console.error(err);
      }
    };

    const fetchNotifications = async () => {
      try {
        const response = await axios.get('http://localhost:5000/notifications', { withCredentials: true });
        setNotificationCount(response.data.length); // Update the notification count
      } catch (err) {
        console.error('Error fetching notifications:', err);
      }
    };

    if (isLoggedIn) {
      fetchUser();
    }
  }, [isLoggedIn, setUsername]);

  const handleLogout = async () => {
    try {
      await axios.post('http://localhost:5000/logout', {}, { withCredentials: true });
      setIsLoggedIn(false);
      setUsername('');
      setNotificationCount(0); // Reset notifications on logout
      navigate('/');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <nav>
      <button>
        <Link to="/">
          <ChurrosIcon width={24} height={24} fill="#333" />
        </Link>
      </button>
      {isLoggedIn ? (
        <>
          <button>
            <Link to="/profile">Welcome, {username}</Link>
          </button>
          <button>
            <Link to="/dashboard">Dashboard</Link>
          </button>
          <button>
            <Link to="/stats">Stats</Link>
          </button>
          <button>
            <Link to="/add_chore">Add Chore</Link>
          </button>
          <button>
            <Link to="/invite">Invite People</Link>
          </button>
          <button className="notification-icon">
            <Link to="/notifications">Notifications</Link>
            {notificationCount > 0 && (
              <span className="notification-badge">{notificationCount}</span> // Notification badge
            )}
          </button>
          <button onClick={handleLogout}>Logout</button>
        </>
      ) : (
        <>
          <Link to="/register">Register</Link>
          <Link to="/login">Login</Link>
        </>
      )}
    </nav>
  );
};

export default NavBar;



