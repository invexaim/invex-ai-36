
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Calendar, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import SidebarItem from "./SidebarItem";
import { SidebarItemType } from "./types";
import { cn } from "@/lib/utils";

interface MobileNavigationProps {
  sidebarItems: SidebarItemType[];
  currentPath: string;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

const MobileNavigation = ({ sidebarItems, currentPath, theme, toggleTheme }: MobileNavigationProps) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  // Function to handle navigation with extra slow, smoother scrolling
  const handleNavigation = (href: string) => {
    setIsMobileMenuOpen(false);
    
    // Wait longer for menu to close before navigating
    setTimeout(() => {
      navigate(href);
      
      // Scroll to top with slower, smoother animation
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }, 700); // Increased from 500ms to 700ms for an even slower transition
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Handle body scrolling when menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  return (
    <div className="md:hidden bg-white text-gray-800 dark:bg-slate-900 dark:text-white border-b border-border/20 dark:border-gray-700 fixed top-0 left-0 right-0 z-30">
      <div className="h-16 flex items-center justify-between px-4">
        <div className="flex items-center space-x-2">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleMobileMenu} 
            className="text-gray-700 dark:text-gray-300"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              {isMobileMenuOpen ? (
                <>
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </>
              ) : (
                <>
                  <line x1="4" y1="12" x2="20" y2="12"></line>
                  <line x1="4" y1="6" x2="20" y2="6"></line>
                  <line x1="4" y1="18" x2="20" y2="18"></line>
                </>
              )}
            </svg>
          </Button>
          
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-[#9b6ee7]/20 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-[#9b6ee7]" />
            </div>
            <span className="text-xl font-semibold text-[#9b6ee7]">Invex AI</span>
          </Link>
        </div>
        
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={toggleTheme} 
          className="rounded-full text-gray-700 dark:text-gray-300"
        >
          {theme === 'light' ? 
            <Moon className="h-5 w-5" /> : 
            <Sun className="h-5 w-5" />
          }
        </Button>
      </div>
      
      {/* Mobile menu with super slow slide animation */}
      <div 
        className={cn(
          "fixed inset-0 bg-black/20 dark:bg-black/50 z-40 transition-opacity duration-700", // Increased from 500ms to 700ms
          isMobileMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={toggleMobileMenu}
      >
        <div 
          className={cn(
            "absolute left-0 top-16 h-[calc(100vh-4rem)] w-64 bg-white dark:bg-slate-900 p-4 transition-all duration-700 ease-in-out", // Increased from 500ms to 700ms
            isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
          )}
          onClick={(e) => e.stopPropagation()}
        >
          <nav className="space-y-1">
            {sidebarItems.map((item) => (
              <div 
                key={item.href}
                onClick={() => handleNavigation(item.href)}
                className="cursor-pointer transition-all duration-500"
              >
                <SidebarItem
                  icon={item.icon}
                  label={item.label}
                  href={item.href}
                  isActive={
                    currentPath === item.href ||
                    (item.href !== "/" && currentPath.startsWith(item.href))
                  }
                />
              </div>
            ))}
          </nav>
        </div>
      </div>
    </div>
  );
};

export default MobileNavigation;
