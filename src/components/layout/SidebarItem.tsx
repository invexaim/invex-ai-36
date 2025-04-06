
import React from "react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  href: string;
  isActive: boolean;
}

const SidebarItem = ({ icon, label, href, isActive }: SidebarItemProps) => {
  return (
    <Link
      to={href}
      className={cn(
        "flex items-center space-x-3 px-4 py-3 rounded-md transition-all",
        isActive
          ? "bg-slate-900 text-white dark:bg-white dark:text-black"
          : "hover:bg-gray-100 text-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
      )}
    >
      {icon}
      <span className="font-medium">{label}</span>
    </Link>
  );
};

export default SidebarItem;
