import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setClient } from '@/store/clientSlice';
import { API_URL } from '@/config/env';

export const useAuthInit = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('authToken');

      if (token) {
        try {
          // Verify token and get user data
          const response = await fetch(`${API_URL}auth/verify`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (response.ok) {
            const userData = await response.json();
            dispatch(setClient(userData));
          } else {
            // Invalid token, remove it
            localStorage.removeItem('authToken');
          }
        } catch (error) {
          console.error('Error verifying token:', error);
          localStorage.removeItem('authToken');
        }
      }
    };

    initializeAuth();
  }, [dispatch]);
};
