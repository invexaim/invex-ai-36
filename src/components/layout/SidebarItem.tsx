
import { Link } from "react-router-dom";

interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  href: string;
  isActive: boolean;
  onClick?: () => void;
}

const SidebarItem = ({ icon, label, href, isActive, onClick }: SidebarItemProps) => {
  // Determine if this is a regular link or a button (for logout)
  const isButton = href === "#" && onClick;

  const ItemContent = () => (
    <div
      className={`flex items-center space-x-3 px-3 py-2 rounded-md transition-colors ${
        isActive
          ? "bg-primary/10 text-primary"
          : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
      }`}
    >
      <span className="text-current">{icon}</span>
      <span className="font-medium">{label}</span>
    </div>
  );

  if (isButton) {
    return (
      <button 
        onClick={onClick} 
        className="w-full text-left"
      >
        <ItemContent />
      </button>
    );
  }

  return (
    <Link to={href}>
      <ItemContent />
    </Link>
  );
};

export default SidebarItem;
