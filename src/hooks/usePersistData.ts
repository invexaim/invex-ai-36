
import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import useAppStore from "@/store/appStore";

/**
 * Custom hook to ensure data is persisted when navigating between pages
 */
export const usePersistData = () => {
  const location = useLocation();
  const { saveDataToSupabase, currentUser } = useAppStore();
  
  useEffect(() => {
    // Save data when component mounts (page loads)
    if (currentUser) {
      console.log("Saving data on route change/page mount");
      saveDataToSupabase().catch(err => 
        console.error("Error saving data on route change:", err)
      );
    }
    
    // Return cleanup function to save data when component unmounts (navigating away)
    return () => {
      if (currentUser) {
        console.log("Saving data before page unmount");
        saveDataToSupabase().catch(err => 
          console.error("Error saving data before unmount:", err)
        );
      }
    };
  }, [location.pathname, currentUser]); // Re-run when route changes
};

export default usePersistData;
