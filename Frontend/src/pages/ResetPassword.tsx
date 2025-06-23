import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/hooks/useAuth';

const ResetPassword = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { changePassword, logout } = useAuth();

  console.log('[RESET PASSWORD] Component mounted with location.state:', location.state);

  // Get state with proper defaults
  const locationState = location.state as any;
  const flow = locationState?.flow || 'first-time';
  const userType = locationState?.userType || 'admin'; // <--- This 'userType' is critical
  const fromLogin = locationState?.fromLogin || false;

  console.log('[RESET PASSWORD] Parsed state:', { flow, userType, fromLogin });

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Redirect if accessing without proper context
  useEffect(() => {
    // If we expect to be here from a login (fromLogin = true),
    // then locationState doesn't have to be present initially if
    // a refresh happened, as long as the user object is in AuthContext
    // and indicates isInitialPassword.
    // However, the current check (locationState && !fromLogin) is a bit strict.
    // Let's ensure 'fromLogin' is the primary trigger for being here after a login.
    // If not from login flow, then it needs specific state for other flows.
    if (!fromLogin && (!locationState || !locationState.userType)) { // Ensure userType is present for non-login flows
        console.log('[RESET PASSWORD] Invalid access, redirecting to login');
        // You might want to check auth.isAuthenticated here and user.isInitialPassword
        // if you want to allow direct access to /reset-password if already logged in
        // and needs password change, without navigating from /login specifically.
        // For now, keeping your existing redirect logic.
        navigate('/login');
    }
  }, [locationState, fromLogin, navigate]);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('[RESET PASSWORD] Form submitted with flow:', flow);
    console.log('[RESET PASSWORD] Attempting password change for userType:', userType); // <--- Log this for confirmation

    if (newPassword !== confirmPassword) {
      toast({ title: "Error", description: "Passwords do not match.", variant: "destructive" });
      return;
    }
    if (newPassword.length < 6) {
      toast({ title: "Error", description: "Password must be at least 6 characters long.", variant: "destructive" });
      return;
    }

    setIsLoading(true);

    try {
      if (flow === 'first-time') {
        console.log('[RESET PASSWORD] First time password change, calling changePassword with userType:', userType);
        await changePassword(currentPassword, newPassword, userType); // <--- FIX IS HERE: Pass userType
      } else {
        // Handle other flows if needed (forgot password, etc.)
        toast({
          title: "Error",
          description: "This flow is not yet implemented.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error('[RESET PASSWORD] Error:', error);
      // Error is already handled in changePassword function
    } finally {
      setIsLoading(false);
    }
  };

  // If redirected in useEffect, return null temporarily to avoid rendering
  if (!fromLogin && (!locationState || !locationState.userType)) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center p-4">
      <motion.div
        className="w-full max-w-md"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="text-center mb-8">
          <img
            src="/lovable-uploads/b3787bd3-143a-4cb2-9fdf-8228781e5bf4.png"
            alt="Bites Space Logo"
            className="w-24 h-24 mx-auto mb-4"
          />
          <h1 className="text-3xl font-bold text-gray-800">Bites Space</h1>
        </div>

        <Card className="shadow-xl border-0">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-2xl font-bold text-gray-800">
              Change Your Password
            </CardTitle>
            <p className="text-gray-600 text-sm">
              {flow === 'first-time'
                ? 'Please change your initial password to secure your account.'
                : 'Enter your current password and choose a new one.'
              }
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordChange} className="space-y-6">
              <div>
                <Label htmlFor="currentPassword">Current Password</Label>
                <div className="relative mt-2">
                  <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <Input
                    id="currentPassword"
                    type={showPasswords ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="pl-10 pr-10 h-12"
                    placeholder="Enter current password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords(!showPasswords)}
                    className="absolute right-3 top-3 text-gray-400"
                  >
                    {showPasswords ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <div>
                <Label htmlFor="newPassword">New Password</Label>
                <div className="relative mt-2">
                  <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <Input
                    id="newPassword"
                    type={showPasswords ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="pl-10 h-12"
                    placeholder="Enter new password"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <div className="relative mt-2">
                  <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <Input
                    id="confirmPassword"
                    type={showPasswords ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-10 h-12"
                    placeholder="Confirm new password"
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-12 bg-blue-600 hover:bg-blue-700"
                disabled={isLoading}
              >
                {isLoading ? 'Changing Password...' : 'Change Password'}
              </Button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => {
                    logout();
                    navigate('/login');
                  }}
                  className="text-sm font-medium text-blue-600 hover:underline"
                >
                  Back to Login
                </button>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default ResetPassword;