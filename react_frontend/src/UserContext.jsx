import React, { createContext, useState, useEffect } from 'react';
import { getAccessToken } from './services/AccessToken';
export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await getAccessToken();
        if (response && response.user) {
          setUser({ eid: response.user.eid, name: response.user.name });
        }
      } catch (error) {
        console.error('Failed to verify access token:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};
