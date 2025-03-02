'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import React from 'react';

// Enhanced security features
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION = 30 * 60 * 1000; // 30 minutes in milliseconds
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes in milliseconds

interface User {
  id: string;
  email: string;
  name: string;
  lastActive: number;
  twoFactorEnabled: boolean;
  securityQuestion?: string;
}

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterCredentials {
  email: string;
  password: string;
  name: string;
  securityQuestion?: string;
  securityAnswer?: string;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  loginAttempts: number;
  accountLocked: boolean;
  lockoutUntil: number | null;
  requiresTwoFactor: boolean;
  error: string | null;
}

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  register: (credentials: RegisterCredentials) => Promise<void>;
  verifyTwoFactorCode: (code: string) => Promise<boolean>;
  resetPassword: (email: string, securityAnswer: string, newPassword: string) => Promise<boolean>;
  updateLastActive: () => void;
  validatePassword: (password: string) => boolean;
  isSessionExpired: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const { t } = useTranslation('auth');
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
    loginAttempts: 0,
    accountLocked: false,
    lockoutUntil: null,
    requiresTwoFactor: false,
    error: null,
  });

  const updateLastActive = React.useCallback(() => {
    if (state.user) {
      const updatedUser = {
        ...state.user,
        lastActive: Date.now(),
      };
      setState(prev => ({ ...prev, user: updatedUser }));
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
  }, [state.user]);

  const isSessionExpired = React.useCallback(() => {
    if (!state.user) return true;
    
    const now = Date.now();
    return now - state.user.lastActive > SESSION_TIMEOUT;
  }, [state.user]);

  const handleActivity = React.useCallback(() => {
    if (state.isAuthenticated && state.user) {
      updateLastActive();
    }
  }, [state.isAuthenticated, state.user, updateLastActive]);

  const checkAuth = React.useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      const storedAuth = localStorage.getItem('authToken');
      const storedUser = localStorage.getItem('user');
      if (storedAuth && storedUser) {
        const parsedUser = JSON.parse(storedUser) as User;
        setState(prev => ({
          ...prev,
          user: parsedUser,
          isAuthenticated: true,
          isLoading: false,
        }));
        updateLastActive();
      } else {
        setState(prev => ({ ...prev, isLoading: false, isAuthenticated: false }));
      }
    } catch (error) {
      console.error('Authentication check failed:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Failed to check authentication status.',
        isAuthenticated: false,
      }));
    }
  }, [updateLastActive]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (state.isAuthenticated) {
      handleActivity();
      const intervalId = setInterval(handleActivity, 60000); // Update every minute

      return () => clearInterval(intervalId);
    }
  }, [state.isAuthenticated, handleActivity]);

  useEffect(() => {
    if (state.isAuthenticated) {
      if (isSessionExpired()) {
        logout();
        // Optionally redirect to login or show a message
      }
    }
  }, [state.isAuthenticated, logout, isSessionExpired]);

  const login = async (credentials: LoginCredentials) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      // Check if account is locked
      if (state.accountLocked) {
        if (state.lockoutUntil && Date.now() < state.lockoutUntil) {
          const remainingMinutes = Math.ceil((state.lockoutUntil - Date.now()) / 60000);
          throw new Error(`Account is locked. Try again in ${remainingMinutes} minutes.`);
        } else {
          // Lockout period is over
          setState(prev => ({
            ...prev,
            accountLocked: false,
            lockoutUntil: null,
            loginAttempts: 0,
          }));
          localStorage.removeItem('lockoutUntil');
          localStorage.removeItem('loginAttempts');
        }
      }

      // This would be an API call in a real app
      // Simulating API call with timeout
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // For demo purposes, we'll accept any email with a password that matches our pattern
      // In a real app, this would validate against a backend
      if (!validatePassword(credentials.password)) {
        // Increment login attempts
        const newAttempts = state.loginAttempts + 1;
        localStorage.setItem('loginAttempts', newAttempts.toString());
        
        // Check if max attempts reached
        if (newAttempts >= MAX_LOGIN_ATTEMPTS) {
          const lockoutUntil = Date.now() + LOCKOUT_DURATION;
          localStorage.setItem('lockoutUntil', lockoutUntil.toString());
          
          setState(prev => ({
            ...prev,
            loginAttempts: newAttempts,
            accountLocked: true,
            lockoutUntil,
            isLoading: false,
            error: t('account_locked'),
          }));
          
          throw new Error(t('account_locked'));
        }
        
        setState(prev => ({
          ...prev,
          loginAttempts: newAttempts,
          isLoading: false,
          error: 'Invalid email or password',
        }));
        
        throw new Error('Invalid email or password');
      }
      
      // Reset login attempts on successful login
      localStorage.removeItem('loginAttempts');
      
      // Check if 2FA is enabled (for demo, we'll enable it for specific emails)
      const requiresTwoFactor = credentials.email.includes('secure');
      
      if (requiresTwoFactor) {
        setState(prev => ({
          ...prev,
          requiresTwoFactor: true,
          isLoading: false,
          // Store email temporarily for 2FA verification
          user: {
            id: '',
            email: credentials.email,
            name: '',
            lastActive: Date.now(),
            twoFactorEnabled: true,
          },
        }));
        
        // In a real app, this would send a 2FA code to the user's phone or email
        console.log('2FA code sent to user');
        return;
      }
      
      // Mock user for demo purposes
      const mockUser = {
        id: '1',
        email: credentials.email,
        name: credentials.email.split('@')[0],
        lastActive: Date.now(),
        twoFactorEnabled: false,
      };
      
      setState(prev => ({
        ...prev,
        user: mockUser,
        isAuthenticated: true,
        isLoading: false,
        loginAttempts: 0,
      }));
      
      localStorage.setItem('user', JSON.stringify(mockUser));
    } catch (error) {
      console.error('Login error:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Login failed',
      }));
      throw error;
    }
  };

  const verifyTwoFactorCode = async (code: string): Promise<boolean> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      // This would be an API call in a real app
      // For demo purposes, we'll accept any 6-digit code
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (code.length !== 6 || !/^\d+$/.test(code)) {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: 'Invalid verification code',
        }));
        return false;
      }
      
      // 2FA successful, complete login
      if (state.user) {
        const verifiedUser = {
          ...state.user,
          id: '1',
          name: state.user.email.split('@')[0],
          lastActive: Date.now(),
        };
        
        setState(prev => ({
          ...prev,
          user: verifiedUser,
          isAuthenticated: true,
          requiresTwoFactor: false,
          isLoading: false,
        }));
        
        localStorage.setItem('user', JSON.stringify(verifiedUser));
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('2FA verification error:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Verification failed',
      }));
      return false;
    }
  };

  const logout = React.useCallback(() => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    setState(prev => ({
      ...prev,
      user: null,
      isAuthenticated: false,
      requiresTwoFactor: false,
    }));
  }, []);

  const register = async (credentials: RegisterCredentials) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      // Validate password
      if (!validatePassword(credentials.password)) {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: t('password_requirements'),
        }));
        throw new Error(t('password_requirements'));
      }
      
      // This would be an API call in a real app
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock user for demo purposes
      const mockUser = {
        id: '1',
        email: credentials.email,
        name: credentials.name,
        lastActive: Date.now(),
        twoFactorEnabled: false,
        securityQuestion: credentials.securityQuestion,
      };
      
      setState(prev => ({
        ...prev,
        user: mockUser,
        isAuthenticated: true,
        isLoading: false,
      }));
      
      localStorage.setItem('user', JSON.stringify(mockUser));
      
      // In a real app, we would also store the security question and answer (hashed) in the backend
      if (credentials.securityQuestion && credentials.securityAnswer) {
        localStorage.setItem(`security_${credentials.email}`, JSON.stringify({
          question: credentials.securityQuestion,
          answer: credentials.securityAnswer, // In a real app, this would be hashed
        }));
      }
    } catch (error) {
      console.error('Registration error:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Registration failed',
      }));
      throw error;
    }
  };

  const resetPassword = async (
    email: string,
    securityAnswer: string,
    newPassword: string
  ): Promise<boolean> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      // Validate new password
      if (!validatePassword(newPassword)) {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: t('password_requirements'),
        }));
        return false;
      }
      
      // This would be an API call in a real app
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // For demo purposes, check if security answer matches
      const securityData = localStorage.getItem(`security_${email}`);
      if (!securityData) {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: 'Security question not found for this account',
        }));
        return false;
      }
      
      const { answer } = JSON.parse(securityData);
      if (answer !== securityAnswer) {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: 'Incorrect security answer',
        }));
        return false;
      }
      
      // In a real app, we would update the password in the backend
      setState(prev => ({ ...prev, isLoading: false }));
      return true;
    } catch (error) {
      console.error('Password reset error:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Password reset failed',
      }));
      return false;
    }
  };

  const validatePassword = (password: string): boolean => {
    return PASSWORD_REGEX.test(password);
  };

  const value = {
    ...state,
    login,
    logout,
    register,
    verifyTwoFactorCode,
    resetPassword,
    updateLastActive,
    validatePassword,
    isSessionExpired,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
