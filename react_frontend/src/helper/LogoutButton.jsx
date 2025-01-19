import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { logout } from '../services/logout';
import { UserContext } from '../UserContext'; 
import Button from "react-bootstrap/Button";
const LogoutButton = () => {
  const { setUser } = useContext(UserContext);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      // Call the logout function from logout.js
      const response = await logout();
      if (response && response.message === "Successfully logged out") {
        setUser(null);

        navigate('/login');
      }
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <Button variant="danger" onClick={handleLogout}>Logout</Button>
  );
};

export default LogoutButton;
