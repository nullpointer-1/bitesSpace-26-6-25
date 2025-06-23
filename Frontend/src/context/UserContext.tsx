import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Define the shape of a User object
interface User {
  id: number;
  name: string;
  mobileNumber: string;
  email?: string; // Added email as it's used in UserDashboard
  // Add other user properties like 'token' if your backend sends it
  // token?: string;
  isAuthenticated: boolean;                                                           
}

// Define the shape of the UserContext's value
interface UserContextType {
  user: User | null; // The current logged-in user, or null if not logged in
  login: (userData: User) => void; // Function to log in a user
  logout: () => void; // Function to log out a user
  isAuthenticated: boolean; // Convenience boolean to check if a user is logged in
  isLoading: boolean; // New: Indicates if the context is still loading user data from storage
}

// Create the context with an initial undefined value
const UserContext = createContext<UserContextType | undefined>(undefined);

// UserProvider component that wraps your application and provides the user context
export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Initially true, because we need to check localStorage

  // useEffect to load user data from localStorage when the component mounts
  useEffect(() => {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      try {
        // Attempt to parse the stored string into a User object
        const parsedUser: User = JSON.parse(storedUser);
        setUser(parsedUser); // Set the user state if successful
      } catch (error) {
        console.error("Failed to parse user data from localStorage:", error);
        // If parsing fails (e.g., corrupted data), clear it to prevent continuous errors
        localStorage.removeItem('currentUser');
      }
    }
    // After attempting to load from localStorage, set isLoading to false
    // This tells any consuming components that the initial check is complete.
    setIsLoading(false);
  }, []); // Empty dependency array ensures this effect runs only once on mount

  // Function to handle user login
  const login = (userData: User) => {
    setUser(userData); // Set the user state
    localStorage.setItem('currentUser', JSON.stringify(userData)); // Store user data in localStorage
  };

  // Function to handle user logout
  const logout = () => {
    setUser(null); // Clear the user state
    localStorage.removeItem('currentUser'); // Remove user data from localStorage
  };

  // Derived state: check if a user is currently authenticated
  const isAuthenticated = user !== null;

  return (
    <UserContext.Provider value={{ user, login, logout, isAuthenticated, isLoading }}>
      {children} {/* Render child components that will consume this context */}
    </UserContext.Provider>
  );
};

// Custom hook to easily consume the UserContext in functional components
export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    // This error helps ensure useUser is always used within a UserProvider
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};