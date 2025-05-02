
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    // Check if user is authenticated
    const checkAuth = async () => {
      try {
        // Always direct to auth page first
        // The Auth page will redirect to dashboard if already authenticated
        navigate("/auth");
      } catch (error) {
        console.error("Error checking authentication:", error);
        navigate("/auth");
      }
    };
    
    checkAuth();
  }, [navigate]);
  
  return null;
};

export default Index;
