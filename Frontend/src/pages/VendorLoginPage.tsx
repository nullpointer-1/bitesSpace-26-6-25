// src/pages/vendor/login.tsx
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Store, Eye, EyeOff } from "lucide-react";
// Import the useAuth hook from your centralized context
import { useAuth } from '@/context/AuthContext'; // Ensure this path is correct

const VendorLoginPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState(""); // This is a mock for UI, not backend integrated

  // Use the useAuth hook to access the login function and global loading state
  const { login, isLoading: isAuthLoading } = useAuth(); // `isAuthLoading` indicates if *any* auth operation is ongoing

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    // Call the centralized login function from AuthContext
    // Pass 'vendor' as the userType argument
    await login({ username, password }, 'vendor');
    // Navigation and toast messages are handled internally by the AuthProvider after login
  };

  const handleForgotPassword = (e: React.FormEvent) => { // This is a simulated flow
    e.preventDefault();
    if (!forgotEmail) {
      alert("Please enter your email."); // Consider replacing with your toast component for consistency
      return;
    }
    // Simulate API call for forgot password (frontend only)
    alert("Password reset email sent (simulated). Check your email for instructions.");
    setShowForgotPassword(false);
    setForgotEmail("");
  };

  // Render the Forgot Password form if `showForgotPassword` is true
  if (showForgotPassword) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <Store className="h-12 w-12 text-primary" />
            </div>
            <CardTitle className="text-2xl font-bold">Reset Password</CardTitle>
            <p className="text-muted-foreground">
              Enter your email to receive reset instructions
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="vendor@example.com"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  required
                />
              </div>

              <Button type="submit" className="w-full" disabled={isAuthLoading}> {/* Use global auth loading */}
                {isAuthLoading ? "Sending..." : "Send Reset Link"}
              </Button>

              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={() => setShowForgotPassword(false)}
              >
                Back to Login
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Render the main Login form
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Store className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">Vendor Login</CardTitle>
          <p className="text-muted-foreground">
            Access your vendor dashboard
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={isAuthLoading}>
              {isAuthLoading ? "Signing In..." : "Sign In"}
            </Button>

            <div className="text-center">
              <Button
                type="button"
                variant="link"
                className="text-sm"
                onClick={() => setShowForgotPassword(true)}
              >
                Forgot Password?
              </Button>
            </div>
          </form>

          <Separator className="my-6" />

          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              Don't have an account?{" "}
              <Button variant="link" className="p-0 text-sm">
                Contact Support
              </Button>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VendorLoginPage;
