import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Notification.css';

const Login = ({ setIsLoggedIn }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [notification, setNotification] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/login', { username, password }, { withCredentials: true });
      if (response.status === 200) {
        setNotification({ type: 'success', message: 'Login successful!' });
        setIsLoggedIn(true);
        setTimeout(() => {
          navigate('/dashboard');
        }, 1000); // Redirect after 1 second
      }
    } catch (err) {
      setNotification({ type: 'error', message: 'Login failed. Please check your credentials and try again.' });
    }
  };
  // this is a comment to see if it gets pushed
  return (
    <div className="container">
      <h2>Login</h2>
      {notification && (
        <div className={`notification ${notification.type}`}>
          {notification.message}
        </div>
      )}
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Username"
          required
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          required
        />
        <button type="submit">Login</button>
      </form>
    </div>
  );
};

export default Login;

