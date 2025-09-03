import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, ChartLine, User, Bus, Crown } from "lucide-react";

export default function LoginPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [selectedRole, setSelectedRole] = useState("user");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { login, register, user } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  // Redirect to dashboard when user is authenticated
  useEffect(() => {
    if (user) {
      // Navigate to the appropriate dashboard based on role
      if (user.role === "superadmin") {
        setLocation("/super-admin");
      } else if (user.role === "admin") {
        setLocation("/admin");
      } else {
        setLocation("/");
      }
    }
  }, [user, setLocation]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isSignUp) {
        await register(email, password, name, selectedRole);
        toast({
          title: "Account created successfully!",
          description: "Welcome to DataViz Pro",
        });
      } else {
        await login(email, password);
        toast({
          title: "Welcome back!",
          description: "Successfully logged in",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Authentication failed",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const roleConfigs = {
    user: {
      color: "text-blue-600",
      bgColor: "bg-blue-100",
      borderColor: "border-blue-600",
      gradient: "from-blue-600 to-blue-700",
      icon: User,
      title: "Normal User",
      description: "Upload Excel files and create visualizations"
    },
    admin: {
      color: "text-green-600",
      bgColor: "bg-green-100", 
      borderColor: "border-green-600",
      gradient: "from-green-600 to-green-700",
      icon: Bus,
      title: "Admin",
      description: "Manage users and oversee data analytics"
    },
    superadmin: {
      color: "text-orange-600",
      bgColor: "bg-orange-100",
      borderColor: "border-orange-600", 
      gradient: "from-orange-600 to-orange-700",
      icon: Crown,
      title: "Super Admin",
      description: "Full platform control and user approvals"
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <div className="max-w-md w-full">
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-green-600 rounded-2xl mx-auto mb-4 flex items-center justify-center">
            <ChartLine className="text-white text-2xl" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">DataViz Pro</h1>
          <p className="text-gray-600">Excel Analytics & Visualization Platform</p>
        </div>

        {/* Login Form */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-semibold text-gray-900">
              {isSignUp ? "Create Account" : "Sign In"}
            </CardTitle>
            <p className="text-gray-600">
              {isSignUp ? "Join DataViz Pro today" : "Choose your role and access your dashboard"}
            </p>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Role Selection */}
              <div>
                <Label className="block text-sm font-medium text-gray-700 mb-3">
                  {isSignUp ? "Select Your Role" : "Login As"}
                </Label>
                <div className="space-y-3">
                  {Object.entries(roleConfigs).map(([role, config]) => {
                    const IconComponent = config.icon;
                    const isSelected = selectedRole === role;
                    
                    return (
                      <label 
                        key={role}
                        className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all hover:${config.borderColor} ${
                          isSelected 
                            ? `${config.borderColor} ${config.bgColor}` 
                            : "border-gray-200"
                        }`}
                        data-testid={`role-${role}`}
                      >
                        <input
                          type="radio"
                          name="role"
                          value={role}
                          checked={selectedRole === role}
                          onChange={(e) => setSelectedRole(e.target.value)}
                          className="sr-only"
                        />
                        <div className={`w-4 h-4 border-2 ${config.borderColor} rounded-full mr-3 flex items-center justify-center`}>
                          <div className={`w-2 h-2 ${isSelected ? config.color.replace('text-', 'bg-') : 'opacity-0'} rounded-full`} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center">
                            <IconComponent className={`${config.color} mr-2`} size={18} />
                            <span className="font-medium text-gray-900">{config.title}</span>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">{config.description}</p>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Name Input (Sign Up Only) */}
              {isSignUp && (
                <div>
                  <Label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your full name"
                    required
                    data-testid="input-name"
                  />
                </div>
              )}

              {/* Email Input */}
              <div>
                <Label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  data-testid="input-email"
                />
              </div>

              {/* Password Input */}
              <div>
                <Label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                    data-testid="input-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    data-testid="button-toggle-password"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <div className="space-y-3">
                <Button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full bg-gradient-to-r ${roleConfigs[selectedRole as keyof typeof roleConfigs].gradient} text-white py-3 px-6 rounded-lg font-medium hover:shadow-lg transition-all transform hover:scale-105 focus:ring-4 focus:ring-opacity-25`}
                  data-testid="button-submit"
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      {isSignUp ? "Creating Account..." : "Signing In..."}
                    </div>
                  ) : (
                    <div className="flex items-center">
                      {selectedRole === "user" && <User className="mr-2" size={18} />}
                      {selectedRole === "admin" && <Bus className="mr-2" size={18} />}
                      {selectedRole === "superadmin" && <Crown className="mr-2" size={18} />}
                      {isSignUp ? "Create Account" : `Sign In as ${roleConfigs[selectedRole as keyof typeof roleConfigs].title}`}
                    </div>
                  )}
                </Button>
              </div>

              {/* Sign Up/Login Toggle */}
              <div className="text-center">
                <p className="text-gray-600">
                  {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
                  <button
                    type="button"
                    onClick={() => setIsSignUp(!isSignUp)}
                    className="text-blue-600 font-medium hover:underline"
                    data-testid="button-toggle-signup"
                  >
                    {isSignUp ? "Sign in here" : "Sign up here"}
                  </button>
                </p>
              </div>

              {/* Demo Credentials */}
              {!isSignUp && (
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium text-gray-700 mb-2">Demo Credentials:</p>
                  <div className="space-y-1 text-xs text-gray-600">
                    <p>User: user@datavizpro.com / admin123</p>
                    <p>Admin: admin@datavizpro.com / admin123</p>  
                    <p>Super Admin: superadmin@datavizpro.com / admin123</p>
                  </div>
                </div>
              )}
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
