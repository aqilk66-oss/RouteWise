import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase/firebaseConfig';
import userService from '../services/user/userService';
import authService from '../services/auth/authService';
import locationManager from '../services/tracking/locationManager';
import { DEFAULT_ROLE, USER_ROLES, ROLE_LABELS } from '../constants/collections';

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
        // If not logged in via Firebase Auth, check if a demo role is active in localStorage
        try {
          const storedDemoRole = localStorage.getItem('routewise_demo_role');
          if (storedDemoRole && USER_ROLES[storedDemoRole.toUpperCase()] || Object.values(USER_ROLES).includes(storedDemoRole)) {
            const validRole = USER_ROLES[storedDemoRole.toUpperCase()] || storedDemoRole;
            const mockUid = `demo_${validRole}_uid`;
            const mockEmail = `${validRole.toLowerCase()}@routewise.school`;
            const mockDisplayName = ROLE_LABELS[validRole] || `${validRole} Demo User`;
            const mockProfile = {
              uid: mockUid,
              fullName: mockDisplayName,
              name: mockDisplayName,
              email: mockEmail,
              role: validRole,
              status: 'active',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };
            setUser({
              uid: mockUid,
              email: mockEmail,
              displayName: mockDisplayName,
              emailVerified: true,
              isAnonymous: false,
            });
            setProfile(mockProfile);
            setLoading(false);
            return;
          }
        } catch (e) {
          console.warn('Demo session hydration check failed:', e);
        }

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

  // Development & demonstration helper to test roles safely in local sessions
  const switchRole = (newRole) => {
    const mockUid = `demo_${newRole}_uid`;
    const mockEmail = `${newRole.toLowerCase()}@routewise.school`;
    const mockDisplayName = ROLE_LABELS[newRole] || `${newRole} Demo User`;

    const mockUser = {
      uid: mockUid,
      email: mockEmail,
      displayName: mockDisplayName,
      emailVerified: true,
      isAnonymous: false,
    };

    const mockProfile = {
      uid: mockUid,
      fullName: mockDisplayName,
      name: mockDisplayName,
      email: mockEmail,
      role: newRole,
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      localStorage.setItem('routewise_demo_role', newRole);
      localStorage.setItem(`routewise_user_${mockUid}`, JSON.stringify(mockProfile));
    } catch (e) {}

    setUser(mockUser);
    setProfile(mockProfile);
    setLoading(false);
  };

  const currentRole = profile?.role || DEFAULT_ROLE;
  const isAuthenticated = !!user;

  const value = {
    user,
    profile,
    role: currentRole,
    loading,
    isAuthenticated,
    login,
    register,
    logout: async () => {
      try {
        localStorage.removeItem('routewise_demo_role');
      } catch (e) {}
      return logout();
    },
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
