import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPersonalizedList } from '../services/PersonalizedList';
import { UserContext } from '../UserContext';

const ProtectedRoute = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const { user } = useContext(UserContext);
  const navigate = useNavigate();


  useEffect(() => {
    const verifyAuth = async () => {
      if (user && user.eid) {
        try {
          const response = await getPersonalizedList(user.eid);

          if (response && response.num_records) {
            setIsAuthenticated(true);
          } else {
            setIsAuthenticated(false);
            navigate('/login');
          }
        } catch (error) {
          console.error("Authentication failed:", error);
          setIsAuthenticated(false);
          navigate('/login');
        }
      } else {
        setIsAuthenticated(false);
        navigate('/login');
      }
    };

    verifyAuth();
  }, [user, navigate]);

  if (isAuthenticated === null) {
    return <div>Loading...</div>;
  }

  return isAuthenticated ? children : null;
};

export default ProtectedRoute;
