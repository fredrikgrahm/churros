import React from 'react';
import { Link } from 'react-router-dom';

const Home = ({ isLoggedIn }) => {
  return (
    <div className="container">
      <h2>Welcome to the Chore App</h2>
      {isLoggedIn ? (
        <p>You are logged in and ready to use the app!</p>
      ) : (
        <p>
          <Link to="/register">Register</Link> or <Link to="/login">Login</Link> to get started.
        </p>
      )}
    </div>
  );
};

export default Home;
