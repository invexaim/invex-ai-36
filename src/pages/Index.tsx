
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    // Check if user is authenticated
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      
      // If authenticated, go to dashboard, otherwise to auth
      if (data.session) {
        navigate("/dashboard");
      } else {
        navigate("/auth");
      }
    };
    
    checkAuth();
  }, [navigate]);
  
  return null;
};

export default Index;
