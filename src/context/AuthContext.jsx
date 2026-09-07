import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase/firebaseConfig';
import userService from '../services/user/userService';
import authService from '../services/auth/authService';
import locationManager from '../services/tracking/locationManager';
import { DEFAULT_ROLE, USER_ROLES } from '../constants/collections';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Single centralized Firebase Auth State Observer
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        try {
          let userProfile = await userService.getUserProfile(firebaseUser.uid);
          if (!userProfile) {
            // Self-healing fallback if profile doc wasn't found
            userProfile = await userService.createUserProfile(firebaseUser.uid, {
              fullName: firebaseUser.displayName || 'RouteWise User',
              email: firebaseUser.email,
              role: DEFAULT_ROLE,
            });
          }
          setProfile(userProfile);
        } catch (err) {
          console.warn("Profile fetch error in auth listener:", err.message);
          setProfile({
            uid: firebaseUser.uid,
            fullName: firebaseUser.displayName || 'RouteWise User',
            email: firebaseUser.email,
            role: DEFAULT_ROLE,
          });
        }
      } else {
        setUser(null);
        setProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email, password) => {
    const res = await authService.login(email, password);
    setUser(res.user);
    setProfile(res.profile);
    return res;
  };

  const register = async (userData) => {
    const res = await authService.register(userData);
    setUser(res.user);
    setProfile(res.profile);
    return res;
  };

  const logout = async () => {
    try {
      // Teardown any background browser GPS watchers immediately
      locationManager.stopWatching();
    } catch (e) {
      console.warn('Geolocation teardown non-fatal warning:', e);
    }
    await authService.logout();
    setUser(null);
    setProfile(null);
  };

  const resetPassword = async (email) => {
    return authService.resetPassword(email);
  };

  const updateProfileData = async (updates) => {
    if (!user?.uid) throw new Error('No authenticated user session.');
    await userService.updateUserProfile(user.uid, updates);
    setProfile((prev) => ({
      ...(prev || {}),
      ...updates,
    }));
  };

  const currentRole = profile?.role || DEFAULT_ROLE;
  const isAuthenticated = !!user;

  // Development convenience helper to test roles safely in local sessions
  const switchRole = (newRole) => {
    setProfile((prev) => ({
      ...(prev || {}),
      role: newRole,
      fullName: prev?.fullName || `${newRole} Demo User`,
    }));
  };

  const value = {
    user,
    profile,
    role: currentRole,
    loading,
    isAuthenticated,
    login,
    register,
    logout,
    resetPassword,
    updateProfileData,
    switchRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

export default AuthContext;
