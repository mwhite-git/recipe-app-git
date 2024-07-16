import React, { useState, useEffect } from 'react';
import { Route, Navigate } from 'react-router-dom';
import { auth } from '../../firebase';
import { isAdmin } from '../../utils/authUtils';

const AdminRoute = ({ element: Element, ...rest }) => {
  const [admin, setAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAdmin = async () => {
      const user = auth.currentUser;
      if (user) {
        const adminStatus = await isAdmin(user);
        setAdmin(adminStatus);
      }
      setLoading(false);
    };

    checkAdmin();
  }, []);

  if (loading) {
    return <div>Loading...</div>; // Or a loading spinner
  }

  return (
    <Route
      {...rest}
      element={admin ? <Element {...rest} /> : <Navigate to="/signin" />}
    />
  );
};

export default AdminRoute;
