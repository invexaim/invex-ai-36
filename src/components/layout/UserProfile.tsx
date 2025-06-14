
import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";

const UserProfile = () => {
  const { user } = useAuth();

  if (!user) return null;

  // Get user initials for fallback
  const getInitials = (email: string) => {
    const parts = email.split('@')[0].split('.');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return email.substring(0, 2).toUpperCase();
  };

  return (
    <div className="flex items-center gap-3 px-4 py-2">
      <div className="text-right">
        <p className="text-sm font-medium text-foreground">{user.email}</p>
        <p className="text-xs text-muted-foreground">Signed in</p>
      </div>
      <Avatar className="h-10 w-10">
        <AvatarImage 
          src={user.user_metadata?.avatar_url} 
          alt={user.email || 'User'} 
        />
        <AvatarFallback className="bg-primary text-primary-foreground">
          {getInitials(user.email || 'US')}
        </AvatarFallback>
      </Avatar>
    </div>
  );
};

export default UserProfile;
