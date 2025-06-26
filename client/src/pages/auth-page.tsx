import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertUserSchema, type InsertUser } from "@shared/schema";
import { z } from "zod";
import { Compass, MapPin, Plane, Camera } from "lucide-react";

const loginSchema = insertUserSchema.pick({ email: true, password: true });
type LoginData = z.infer<typeof loginSchema>;

export default function AuthPage() {
  const [, setLocation] = useLocation();
  const { user, loginMutation, registerMutation } = useAuth();
  const [activeTab, setActiveTab] = useState("login");

  // Redirect if already logged in
  if (user) {
    setLocation("/");
    return null;
  }

  const loginForm = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const registerForm = useForm<InsertUser>({
    resolver: zodResolver(insertUserSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
    },
  });

  const handleLogin = (data: LoginData) => {
    loginMutation.mutate(data);
  };

  const handleRegister = (data: InsertUser) => {
    registerMutation.mutate(data);
  };

  return (
    <div className="min-h-screen travel-gradient flex items-center justify-center px-4">
      {/* Background Image */}
      <div className="absolute inset-0 opacity-20">
        <img 
          src="https://images.unsplash.com/photo-1559827260-dc66d52bef19?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&h=1080" 
          alt="Tropical paradise aerial view" 
          className="w-full h-full object-cover" 
        />
      </div>

      <div className="relative z-10 w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        {/* Hero Section */}
        <div className="text-center lg:text-left text-white">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-full mb-6 shadow-2xl">
            <Compass className="h-10 w-10 text-primary" />
          </div>
          <h1 className="text-5xl lg:text-6xl font-bold mb-4">Wanderlust</h1>
          <p className="text-xl lg:text-2xl text-white/90 mb-8">AI-Powered Travel Planning</p>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-lg mx-auto lg:mx-0">
            <div className="flex items-center space-x-2">
              <MapPin className="h-5 w-5 text-accent" />
              <span className="text-sm">Discover Amazing Places</span>
            </div>
            <div className="flex items-center space-x-2">
              <Plane className="h-5 w-5 text-accent" />
              <span className="text-sm">Plan Perfect Trips</span>
            </div>
            <div className="flex items-center space-x-2">
              <Camera className="h-5 w-5 text-accent" />
              <span className="text-sm">Create Memories</span>
            </div>
          </div>
        </div>

        {/* Auth Forms */}
        <div className="w-full max-w-md mx-auto">
          <Card className="shadow-2xl">
            <CardHeader className="text-center pb-2">
              <CardTitle className="text-2xl font-bold text-slate-800">
                Welcome to Your Journey
              </CardTitle>
              <p className="text-slate-600">Sign in or create an account to start planning</p>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="login">Sign In</TabsTrigger>
                  <TabsTrigger value="register">Sign Up</TabsTrigger>
                </TabsList>

                <TabsContent value="login" className="mt-6">
                  <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-4">
                    <div>
                      <Label htmlFor="login-email">Email</Label>
                      <Input
                        id="login-email"
                        type="email"
                        placeholder="Enter your email"
                        {...loginForm.register("email")}
                        className="mt-1"
                      />
                      {loginForm.formState.errors.email && (
                        <p className="text-sm text-destructive mt-1">
                          {loginForm.formState.errors.email.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="login-password">Password</Label>
                      <Input
                        id="login-password"
                        type="password"
                        placeholder="Enter your password"
                        {...loginForm.register("password")}
                        className="mt-1"
                      />
                      {loginForm.formState.errors.password && (
                        <p className="text-sm text-destructive mt-1">
                          {loginForm.formState.errors.password.message}
                        </p>
                      )}
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full bg-primary hover:bg-primary/90 text-white"
                      disabled={loginMutation.isPending}
                    >
                      {loginMutation.isPending ? "Signing In..." : "Sign In"}
                    </Button>
                  </form>
                </TabsContent>

                <TabsContent value="register" className="mt-6">
                  <form onSubmit={registerForm.handleSubmit(handleRegister)} className="space-y-4">
                    <div>
                      <Label htmlFor="register-username">Username</Label>
                      <Input
                        id="register-username"
                        type="text"
                        placeholder="Choose a username"
                        {...registerForm.register("username")}
                        className="mt-1"
                      />
                      {registerForm.formState.errors.username && (
                        <p className="text-sm text-destructive mt-1">
                          {registerForm.formState.errors.username.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="register-email">Email</Label>
                      <Input
                        id="register-email"
                        type="email"
                        placeholder="Enter your email"
                        {...registerForm.register("email")}
                        className="mt-1"
                      />
                      {registerForm.formState.errors.email && (
                        <p className="text-sm text-destructive mt-1">
                          {registerForm.formState.errors.email.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="register-password">Password</Label>
                      <Input
                        id="register-password"
                        type="password"
                        placeholder="Create a password"
                        {...registerForm.register("password")}
                        className="mt-1"
                      />
                      {registerForm.formState.errors.password && (
                        <p className="text-sm text-destructive mt-1">
                          {registerForm.formState.errors.password.message}
                        </p>
                      )}
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full bg-primary hover:bg-primary/90 text-white"
                      disabled={registerMutation.isPending}
                    >
                      {registerMutation.isPending ? "Creating Account..." : "Create Account"}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
