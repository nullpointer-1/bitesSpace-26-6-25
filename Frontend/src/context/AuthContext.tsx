// src/contexts/AuthContext.tsx
import React, { createContext, useState, useEffect, ReactNode, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '@/api/axiosInstance'; // Make sure this path is correct
import { useToast } from "@/components/ui/use-toast"; // Make sure this path is correct
import { useQueryClient } from '@tanstack/react-query'; // Import useQueryClient

// Define the User type based on your backend response
export interface User { // Export User interface so other files can use it
  id: number; // User's ID (Admin ID or Vendor ID)
  username: string; // This will be the username used for login
  isInitialPassword: boolean;
  name?: string; // Display name, fallback to username if not provided
  role: 'Administrator' | 'Vendor'; // Explicitly define user roles, not optional
  lastLogin?: string; // Last login timestamp
  shopId?: number | null; // Add shopId for Vendor users (can be null if not a vendor)
  // If you need more user-specific fields like `isOnline` for the user object itself, add them here.
  // However, `isOnline` is usually a property of the *shop*, not the user.
}

interface AuthContextType {
  isAuthenticated: boolean;
  token: string | null;
  user: User | null;
  login: (credentials: { username: string, password: string }, userType: 'admin' | 'vendor') => Promise<void>;
  logout: () => void;
  changePassword: (oldPassword: string, newPassword: string, userType: 'admin' | 'vendor') => Promise<void>;
  isLoading: boolean; // Global loading state for auth operations
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Custom hook to use the AuthContext, adding a check for its presence
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Manages initial loading and async operations
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient(); // Get react-query client instance

  // Define localStorage keys - IMPORTANT: Consistent casing and clear purpose
  const ADMIN_TOKEN_KEY = 'adminAuthToken';
  const VENDOR_TOKEN_KEY = 'vendorAuthToken';
  const CURRENT_USER_KEY = 'currentUser'; // Unified key for storing the user object

  // Effect to load authentication state from localStorage on component mount
  useEffect(() => {
    console.log('[AUTH] AuthProvider useEffect running');
    const storedAdminToken = localStorage.getItem(ADMIN_TOKEN_KEY);
    const storedVendorToken = localStorage.getItem(VENDOR_TOKEN_KEY);
    const storedUser = localStorage.getItem(CURRENT_USER_KEY);

    let activeToken: string | null = null; // Variable to hold the token that's actually found

    // Prioritize admin token if present, otherwise check for vendor token
    if (storedAdminToken) {
      activeToken = storedAdminToken;
    } else if (storedVendorToken) {
      activeToken = storedVendorToken;
    }

    if (activeToken && storedUser) {
      try {
        const parsedUser: User = JSON.parse(storedUser);
        setToken(activeToken);
        setUser(parsedUser);
        console.log('[AUTH] Restored session for user:', parsedUser.username, 'Role:', parsedUser.role);
      } catch (e) {
        console.error("[AUTH] Failed to parse stored user data, clearing storage:", e);
        // Clear invalid data if parsing fails to prevent errors
        localStorage.removeItem(ADMIN_TOKEN_KEY);
        localStorage.removeItem(VENDOR_TOKEN_KEY);
        localStorage.removeItem(CURRENT_USER_KEY);
      }
    } else {
      console.log('[AUTH] No valid session found in localStorage.');
    }
    setIsLoading(false); // Authentication state loaded
  }, []); // Empty dependency array means this runs once on mount

  // Centralized login function for both admin and vendor
  const login = async (credentials: { username: string, password: string }, userType: 'admin' | 'vendor') => {
    console.log('[LOGIN] Starting login process for userType:', userType);
    setIsLoading(true); // Set global loading state

    // Determine the correct login URL based on user type
    const loginUrl = userType === 'admin' ? '/admin/auth/login' : '/vendors/login';
    const requestBody = { username: credentials.username, password: credentials.password };

    try {
      console.log('[LOGIN] Attempting login to', loginUrl, 'with payload:', requestBody);
      const response = await axiosInstance.post(loginUrl, requestBody); // Use the pre-configured axiosInstance

      console.log('[LOGIN] Full server response:', response.data);

      let jwt: string;
      let username: string;
      let isInitialPassword: boolean;
      let name: string | undefined;
      let shopId: number | null | undefined = null; // Initialize shopId, specifically for vendors
      let userId: number; // User's ID is expected to be a number

      // Adapt to backend response structure for admin vs. vendor
      if (userType === 'admin') {
        jwt = response.data.jwt;
        username = response.data.username;
        isInitialPassword = response.data.isInitialPassword;
        name = username; // For admin, name can be username
        userId = response.data.id; // Assuming admin DTO returns ID directly
      } else { // userType === 'vendor'
        jwt = response.data.jwt;
        const vendorData = response.data.vendor; // Vendor specific data is nested
        username = vendorData.username;
        // isInitialPassword is still at the top level of response.data for vendor as per your VendorService.login() response
        isInitialPassword = response.data.isInitialPassword;
        name = vendorData.name || vendorData.username;
        shopId = vendorData.shopId; // Extract shopId from vendorData
        userId = vendorData.id; // Extract vendor's ID from vendorData
      }

      if (!jwt) {
        console.error('[LOGIN] No JWT received in response. response.data:', response.data);
        throw new Error('No authentication token received');
      }

      // Construct the User object
      const newUser: User = {
        id: userId, // Ensure ID is set
        username: username,
        isInitialPassword: isInitialPassword,
        name: name,
        role: userType === 'admin' ? 'Administrator' : 'Vendor', // Assign explicit role
        lastLogin: new Date().toLocaleString(),
        shopId: shopId, // Assign shopId
      };

      // --- CRUCIAL: Clear React Query cache on successful login ---
      // This forces all components using react-query to refetch data for the new user.
      queryClient.clear();

      // Store token and user data using the correct, type-specific keys
      // Also, clear the other token type to ensure only one session is active
      if (userType === 'admin') {
        localStorage.setItem(ADMIN_TOKEN_KEY, jwt);
        localStorage.removeItem(VENDOR_TOKEN_KEY);
      } else { // userType === 'vendor'
        localStorage.setItem(VENDOR_TOKEN_KEY, jwt);
        localStorage.removeItem(ADMIN_TOKEN_KEY);
      }
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(newUser)); // Store the comprehensive user object

      setToken(jwt);
      setUser(newUser);
      console.log('[LOGIN] Token stored, user set, React Query cache cleared.');

      // Handle initial password change flow
      if (newUser.isInitialPassword) {
        console.log('[LOGIN] Initial password detected, navigating to change password');
        navigate('/reset-password', {
          state: {
            flow: 'first-time',
            userType,
            fromLogin: true
          }
        });
        toast({ title: "Setup Your Account", description: "Please change your initial password to continue." });
      } else {
        // Navigate to the appropriate dashboard based on user type
        const dashboardUrl = userType === 'admin' ? '/admin-dashboard' : '/vendor-dashboard';
        console.log('[LOGIN] Navigating to dashboard:', dashboardUrl);
        navigate(dashboardUrl);

        toast({ title: "Login Successful", description: `Welcome back, ${newUser.name || newUser.username}!` });
      }
    } catch (error: any) {
      console.error("[LOGIN] Login failed with error:", error);

      // Clear all related stored items on login failure
      localStorage.removeItem(ADMIN_TOKEN_KEY);
      localStorage.removeItem(VENDOR_TOKEN_KEY);
      localStorage.removeItem(CURRENT_USER_KEY);
      setToken(null);
      setUser(null);
      // --- CRUCIAL: Also clear React Query cache on failed login attempt ---
      queryClient.clear();

      const errorMessage = error.response?.data?.message || error.message || 'Invalid username or password.';
      toast({
        title: "Login Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false); // Always reset loading state
    }
  };

  // Centralized password change function
  const changePassword = async (oldPassword: string, newPassword: string, userType: 'admin' | 'vendor') => {
    console.log('[CHANGE PASSWORD] Starting password change for userType:', userType);
    setIsLoading(true);
    const changePasswordUrl = userType === 'admin'
      ? '/admin/auth/change-password'
      : '/vendors/change-password';

    try {
      const response = await axiosInstance.post(changePasswordUrl, {
        oldPassword,
        newPassword
      });

      console.log('[CHANGE PASSWORD] Password change response:', response.data);

      let jwt: string;
      let username: string;
      let isInitialPassword: boolean;
      let name: string | undefined;
      let shopId: number | null | undefined = null;
      let userId: number;

      if (userType === 'admin') {
        jwt = response.data.jwt;
        username = response.data.username;
        isInitialPassword = response.data.isInitialPassword;
        name = username;
        userId = response.data.id;
      } else { // userType === 'vendor'
        jwt = response.data.jwt;
        const vendorData = response.data.vendor;
        username = vendorData.username;
        isInitialPassword = response.data.isInitialPassword;
        name = vendorData.name || vendorData.username;
        shopId = vendorData.shopId;
        userId = vendorData.id;
      }

      const newUser: User = {
        id: userId,
        username: username,
        isInitialPassword: isInitialPassword,
        name: name,
        role: userType === 'admin' ? 'Administrator' : 'Vendor',
        lastLogin: new Date().toLocaleString(),
        shopId: shopId,
      };

      // --- CRUCIAL: Clear React Query cache after password change ---
      queryClient.clear();

      if (userType === 'admin') {
        localStorage.setItem(ADMIN_TOKEN_KEY, jwt);
        localStorage.removeItem(VENDOR_TOKEN_KEY);
      } else {
        localStorage.setItem(VENDOR_TOKEN_KEY, jwt);
        localStorage.removeItem(ADMIN_TOKEN_KEY);
      }
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(newUser));

      setToken(jwt);
      setUser(newUser);

      toast({ title: "Password Changed", description: "Your password has been successfully updated." });

      const dashboardUrl = userType === 'admin' ? '/admin-dashboard' : '/vendor-dashboard';
      navigate(dashboardUrl);

    } catch (error: any) {
      console.error("[CHANGE PASSWORD] Password change failed:", error);
      const errorMessage = error.response?.data?.message || 'Failed to change password.';
      toast({ title: "Password Change Failed", description: errorMessage, variant: "destructive" });
      throw error; // Re-throw to allow component to handle `isError` or `isLoading`
    } finally {
      setIsLoading(false);
    }
  };

  // Centralized logout function
  const logout = () => {
    console.log('[AUTH] Logging out user');
    localStorage.removeItem(ADMIN_TOKEN_KEY);
    localStorage.removeItem(VENDOR_TOKEN_KEY);
    localStorage.removeItem(CURRENT_USER_KEY); // Clear user data on logout
    setToken(null);
    setUser(null);
    // --- CRUCIAL: Clear React Query cache on logout ---
    queryClient.clear();
    navigate('/login'); // Redirect to general login page
    toast({ title: "Logged Out", description: "You have been successfully logged out." });
  };

  // Value provided by the AuthContext to its consumers
  const value = {
    isAuthenticated: !!token, // True if a token exists
    token,
    user,
    login,
    logout,
    changePassword,
    isLoading, // Provide global loading state to consuming components
  };

  console.log('[AUTH] AuthProvider render state:', {
    loading: isLoading,
    hasToken: !!token,
    hasUser: !!user,
    isAuthenticated: !!token,
    username: user?.username,
    role: user?.role,
    userId: user?.id, // Log user ID for debugging
    userShopId: user?.shopId // Log user shop ID for debugging
  });

  return (
    <AuthContext.Provider value={value}>
      {/* Show a loading spinner or message if authentication is still loading initially */}
      {!isLoading ? children : (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p>Loading authentication...</p>
          </div>
        </div>
      )}
    </AuthContext.Provider>
  );
};
