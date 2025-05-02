
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    // Check if user is authenticated
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      
      // Always direct to auth page first regardless of authentication status
      // The Auth page will redirect to dashboard if already authenticated
      navigate("/auth");
    };
    
    checkAuth();
  }, [navigate]);
  
  return null;
};

export default Index;
