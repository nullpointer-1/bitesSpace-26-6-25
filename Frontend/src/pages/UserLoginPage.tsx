import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { User, Phone, Shield, Mail } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useUser } from '@/context/UserContext'; // Correct import for useUser hook
import axios from "axios";

type LoginStep = "mobile" | "otp" | "name";

const UserLoginPage = () => {
  const [currentStep, setCurrentStep] = useState<LoginStep>("mobile");
  const [mobileNumber, setMobileNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useUser(); // Use the login function from UserContext

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (mobileNumber.length !== 10) {
      toast({
        title: "Invalid Mobile Number",
        description: "Please enter a valid 10-digit mobile number.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    try {
      const response = await axios.post("http://localhost:8081/otp/send", { mobileNumber });

      if (response.data.success) {
        toast({
          title: "OTP Sent",
          description: response.data.message,
          variant: "default",
        });
        setCurrentStep("otp");
      } else {
        toast({
          title: "Failed to Send OTP",
          description: response.data.message || "Something went wrong.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("Error sending OTP:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to send OTP. Please check your network and try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (otp.length !== 6) {
      toast({
        title: "Invalid OTP",
        description: "Please enter the complete 6-digit OTP.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await axios.post("http://localhost:8081/otp/verify", { mobileNumber, otp });

      if (response.data.success) {
        if (response.data.isNewUser) {
          toast({
            title: "OTP Verified",
            description: "Welcome! Please enter your name and email to complete registration.",
            variant: "success",
          });
          // For new users, we will capture name and email in the next step.
          // The userId and mobileNumber are known from this step.
          // We call login here with partial data (empty name/email) because `useUser` needs to know
          // that a user session has started for the `ProtectedRoute` to work, even if data is incomplete.
          // The full user data will be updated in the 'name' step.
          login({
            id: response.data.userId,
            name: "", // Name will be set in next step
            mobileNumber: response.data.mobileNumber,
            email: "" // Email will be set in next step
          });
          setCurrentStep("name");
        } else {
          toast({
            title: "Login Successful",
            description: "Welcome back!",
            variant: "default",
          });
          // Log in the existing user with all their data
          login({
            id: response.data.userId,
            name: response.data.userName,
            mobileNumber: response.data.mobileNumber,
            email: response.data.userEmail // Ensure backend returns userEmail
          });
          navigate("/dashboard");
        }
      } else {
        toast({
          title: "OTP Verification Failed",
          description: response.data.message || "Invalid or expired OTP.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("Error verifying OTP:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to verify OTP. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCompleteRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (!userName.trim()) {
      toast({
        title: "Name Required",
        description: "Please enter your name.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    if (!userEmail.trim() || !userEmail.includes('@')) { // Basic email validation
      toast({
        title: "Valid Email Required",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    try {
      // Make API call to register user's name and email
      const response = await axios.post("http://localhost:8081/otp/register", {
        mobileNumber,
        name: userName,
        email: userEmail
      });

      if (response.data.success) {
        toast({
          title: "Registration Complete",
          description: response.data.message,
          variant: "default",
        });
        // Log in the newly registered user with their name and email
        login({
          id: response.data.userId,
          name: response.data.userName,
          mobileNumber: response.data.mobileNumber,
          email: response.data.userEmail
        });
        navigate("/dashboard"); // Navigate to the dashboard
      } else {
        toast({
          title: "Registration Failed",
          description: response.data.message || "Something went wrong during registration.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("Error completing registration:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to complete registration. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const renderMobileStep = () => (
    <form onSubmit={handleSendOTP} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="mobile">Mobile Number</Label>
        <div className="flex">
          <div className="flex items-center px-3 border border-r-0 border-input bg-muted text-muted-foreground rounded-l-md">
            +91
          </div>
          <Input
            id="mobile"
            type="tel"
            placeholder="Enter 10-digit mobile number"
            value={mobileNumber}
            onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, "").slice(0, 10))}
            className="rounded-l-none"
            required
            maxLength={10}
          />
        </div>
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Sending OTP..." : "Send OTP"}
      </Button>
    </form>
  );

  const renderOTPStep = () => (
    <div className="space-y-4">
      <div className="text-center space-y-2">
        <p className="text-sm text-muted-foreground">
          Enter the 6-digit code sent to
        </p>
        <p className="font-medium">+91 {mobileNumber}</p>
      </div>

      <div className="flex justify-center">
        <InputOTP maxLength={6} value={otp} onChange={setOtp}>
          <InputOTPGroup>
            <InputOTPSlot index={0} />
            <InputOTPSlot index={1} />
            <InputOTPSlot index={2} />
            <InputOTPSlot index={3} />
            <InputOTPSlot index={4} />
            <InputOTPSlot index={5} />
          </InputOTPGroup>
        </InputOTP>
      </div>

      <Button
        onClick={handleVerifyOTP}
        className="w-full"
        disabled={isLoading || otp.length !== 6}
      >
        {isLoading ? "Verifying..." : "Verify OTP"}
      </Button>

      <div className="text-center">
        <Button
          type="button"
          variant="link"
          className="text-sm"
          onClick={() => {
            setCurrentStep("mobile");
            setOtp(""); // Clear OTP when going back
            setIsLoading(false); // Reset loading state
          }}
          disabled={isLoading}
        >
          Change Mobile Number
        </Button>
      </div>

      <div className="text-center">
        <Button
          variant="link"
          className="text-sm"
          onClick={handleSendOTP} // Re-use handleSendOTP for resend
          disabled={isLoading}
        >
          Resend OTP
        </Button>
      </div>
    </div>
  );

  const renderNameStep = () => (
    <form onSubmit={handleCompleteRegistration} className="space-y-4">
      <div className="text-center space-y-2 mb-6">
        <h3 className="font-medium">Welcome to our platform!</h3>
        <p className="text-sm text-muted-foreground">
          Please enter your name and email to complete your registration
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="name">Full Name</Label>
        <Input
          id="name"
          type="text"
          placeholder="Enter your full name"
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
          required
        />
      </div>

      {/* EMAIL INPUT FIELD */}
      <div className="space-y-2">
        <Label htmlFor="email">Email Address</Label>
        <Input
          id="email"
          type="email"
          placeholder="Enter your email address"
          value={userEmail}
          onChange={(e) => setUserEmail(e.target.value)}
          required
        />
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Completing Registration..." : "Complete Registration"}
      </Button>
    </form>
  );

  const getStepIcon = () => {
    switch (currentStep) {
      case "mobile":
        return <Phone className="h-12 w-12 text-primary" />;
      case "otp":
        return <Shield className="h-12 w-12 text-primary" />;
      case "name":
        return <User className="h-12 w-12 text-primary" />;
    }
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case "mobile":
        return "Enter Mobile Number";
      case "otp":
        return "Verify OTP";
      case "name":
        return "Complete Registration";
    }
  };

  const getStepDescription = () => {
    switch (currentStep) {
      case "mobile":
        return "We'll send you a verification code";
      case "otp":
        return "Enter the code sent to your mobile";
      case "name":
        return "Tell us what to call you";
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            {getStepIcon()}
          </div>
          <CardTitle className="text-2xl font-bold">{getStepTitle()}</CardTitle>
          <p className="text-muted-foreground">{getStepDescription()}</p>
        </CardHeader>
        <CardContent>
          {currentStep === "mobile" && renderMobileStep()}
          {currentStep === "otp" && renderOTPStep()}
          {currentStep === "name" && renderNameStep()}
        </CardContent>
      </Card>
    </div>
  );
};

export default UserLoginPage;