import { Navigation } from "@/components/ui/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Mail, Lock, Eye, EyeOff, Car } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle login logic here
    console.log("Login attempt:", { email, password });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative">
        <div className="hero-gradient-subtle min-h-[60vh] flex items-center">
          <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-16">
            <div className="max-w-md mx-auto w-full px-4 sm:px-0">
              <div className="text-center mb-6 sm:mb-8">
                <div className="flex items-center justify-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                  <Car className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
                  <h1 className="text-2xl sm:text-3xl font-bold">Welcome Back</h1>
                </div>
                <Badge variant="outline" className="w-fit text-xs sm:text-sm">
                  🚗 Sign in to your CapsuleCabs account
                </Badge>
              </div>

              <Card className="shadow-xl border-0">
                <CardHeader className="text-center pb-4 sm:pb-6 px-4 sm:px-6">
                  <CardTitle className="text-xl sm:text-2xl">Sign In</CardTitle>
                  <p className="text-muted-foreground text-sm sm:text-base">
                    Enter your credentials to access your account
                  </p>
                </CardHeader>
                <CardContent className="px-4 sm:px-6 pb-6">
                  <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="email"
                          type="email"
                          placeholder="Enter your email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="pl-10 h-11 sm:h-12 text-sm sm:text-base"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter your password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="pl-10 pr-10 h-11 sm:h-12 text-sm sm:text-base"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-smooth"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="remember"
                          className="rounded border-gray-300 text-primary focus:ring-primary"
                        />
                        <Label htmlFor="remember" className="text-sm">
                          Remember me
                        </Label>
                      </div>
                      <Link 
                        to="/forgot-password" 
                        className="text-sm text-primary hover:text-primary-hover transition-smooth"
                      >
                        Forgot password?
                      </Link>
                    </div>

                    <Button type="submit" className="w-full h-12 text-base sm:text-lg" size="lg">
                      Sign In
                    </Button>

                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">
                        Don't have an account?{" "}
                        <Link 
                          to="/signup" 
                          className="text-primary hover:text-primary-hover font-semibold transition-smooth"
                        >
                          Sign up here
                        </Link>
                      </p>
                    </div>
                  </form>
                </CardContent>
              </Card>

              {/* Additional Info */}
              {/* <div className="mt-6 sm:mt-8 text-center">
                <div className="grid grid-cols-3 gap-2 sm:gap-4 text-xs sm:text-sm">
                  <div className="text-center">
                    <div className="text-lg font-bold text-primary">10K+</div>
                    <div className="text-muted-foreground">Active Users</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-primary">4.9</div>
                    <div className="text-muted-foreground">User Rating</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-primary">24/7</div>
                    <div className="text-muted-foreground">Support</div>
                  </div>
                </div>
              </div> */}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Login; 