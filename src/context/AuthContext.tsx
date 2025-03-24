
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid'; // Import the `v4` method from `uuid`

// Types
interface User {
  id: string;
  email: string;
  name?: string;
  createdAt: string;
}

interface AuthContextType {
  currentUser: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
}

// Create the context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider component
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing user session on initial load
  useEffect(() => {
    const storedUser = localStorage.getItem('budgetTrackerUser');
    if (storedUser) {
      try {
        setCurrentUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('budgetTrackerUser');
      }
    }
    setIsLoading(false);
  }, []);

  // Login function
  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);

      // This is a mock implementation for demo purposes
      // In a real app, this would call an API endpoint

      // Get users from localStorage
      const usersStr = localStorage.getItem('budgetTrackerUsers') || '[]';
      const users = JSON.parse(usersStr);

      // Find user by email
      const user = users.find((u: any) => u.email.toLowerCase() === email.toLowerCase());

      if (!user) {
        throw new Error('User not found');
      }

      // Check password
      if (user.password !== password) {
        throw new Error('Invalid password');
      }

      // Remove password before storing in state/localStorage
      const { password: _, ...userWithoutPassword } = user;

      // Update state and localStorage for current user
      setCurrentUser(userWithoutPassword);
      localStorage.setItem('budgetTrackerUser', JSON.stringify(userWithoutPassword));

      toast.success('Login successful');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Login failed');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Register function
  const register = async (email: string, password: string, name: string) => {
    try {
      setIsLoading(true);

      // This is a mock implementation for demo purposes
      // In a real app, this would call an API endpoint

      // Simple validation
      if (!email || !password) {
        throw new Error('Email and password are required');
      }

      // Get existing users or initialize empty array
      const usersStr = localStorage.getItem('budgetTrackerUsers') || '[]';
      const users = JSON.parse(usersStr);

      // Check if user already exists
      if (users.some((u: any) => u.email.toLowerCase() === email.toLowerCase())) {
        throw new Error('User with this email already exists');
      }

      // Create new user using uuidv4
      const newUser = {
        id: uuidv4(), // Use uuidv4 instead of crypto.randomUUID
        email,
        password, // In a real app, NEVER store plain text passwords
        name,
        createdAt: new Date().toISOString()
      };

      // Save to "database" (localStorage)
      users.push(newUser);
      localStorage.setItem('budgetTrackerUsers', JSON.stringify(users));

      // Remove password before storing in state/localStorage
      const { password: _, ...userWithoutPassword } = newUser;

      // Update state and localStorage for current user
      setCurrentUser(userWithoutPassword);
      localStorage.setItem('budgetTrackerUser', JSON.stringify(userWithoutPassword));

      toast.success('Registration successful');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Registration failed');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('budgetTrackerUser');
    toast.success('Logged out successfully');
  };

  // Provide context value
  const value = {
    currentUser,
    isLoading,
    login,
    register,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook for accessing context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
