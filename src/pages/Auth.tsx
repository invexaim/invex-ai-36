
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { BackgroundBeamsWithCollision } from "@/components/ui/background-beams-with-collision";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        // Login
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;
        toast.success("Logged in successfully");
        navigate("/dashboard");
      } else {
        // Sign up
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });

        if (error) throw error;
        toast.success("Account created successfully. Please check your email to verify your account.");
        setIsLogin(true);
      }
    } catch (error: any) {
      toast.error(error.message || "An error occurred during authentication");
    } finally {
      setLoading(false);
    }
  };

  return (
    <BackgroundBeamsWithCollision>
      <div className="relative z-10 w-full max-w-md px-4 text-center">
        <h1 className="text-4xl font-bold mb-8 text-[#9b6ee7]">Invex AI</h1>
        <p className="text-gray-800 mb-8 text-lg">Your AI-powered investment assistant</p>
        
        <Card className="backdrop-blur-sm bg-white/20 dark:bg-black/20 border-none shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
              {isLogin ? "Welcome Back" : "Create an Account"}
            </CardTitle>
            <CardDescription className="text-gray-700 dark:text-gray-300">
              {isLogin
                ? "Sign in to access your account"
                : "Sign up to get started with Invex AI"}
            </CardDescription>
          </CardHeader>
          
          <form onSubmit={handleAuth}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-900 dark:text-white">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-white/50 dark:bg-gray-800/50 border-gray-300 dark:border-gray-700"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-900 dark:text-white">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="bg-white/50 dark:bg-gray-800/50 border-gray-300 dark:border-gray-700"
                />
              </div>
            </CardContent>
            
            <CardFooter className="flex flex-col space-y-3">
              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-[#9b6ee7] to-[#b57af0] hover:from-[#8f61de] hover:to-[#a46be0]"
                disabled={loading}
              >
                {loading ? "Processing..." : isLogin ? "Sign In" : "Sign Up"}
              </Button>
              
              <p className="text-center text-sm text-gray-800 dark:text-gray-200">
                {isLogin ? "Don't have an account?" : "Already have an account?"}
                <button
                  type="button"
                  onClick={() => setIsLogin(!isLogin)}
                  className="ml-1 font-medium text-[#9b6ee7] hover:text-[#8a5ad3] dark:text-[#b57af0] dark:hover:text-[#a46be0]"
                >
                  {isLogin ? "Sign Up" : "Sign In"}
                </button>
              </p>
            </CardFooter>
          </form>
        </Card>
      </div>
    </BackgroundBeamsWithCollision>
  );
};

export default Auth;
