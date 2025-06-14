
import React from "react";
import { CardStat } from "@/components/ui/card-stat";
import { Calendar, AlertTriangle, Package, Trash2 } from "lucide-react";
import useAppStore from "@/store/appStore";

const ExpiryStats = () => {
  const { productExpiries } = useAppStore();

  const today = new Date();
  const next7Days = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
  const next30Days = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);

  const expired = productExpiries.filter(item => 
    new Date(item.expiry_date) < today && item.status === 'active'
  ).length;

  const expiringSoon = productExpiries.filter(item => 
    new Date(item.expiry_date) >= today && 
    new Date(item.expiry_date) <= next7Days && 
    item.status === 'active'
  ).length;

  const expiringThisMonth = productExpiries.filter(item => 
    new Date(item.expiry_date) >= today && 
    new Date(item.expiry_date) <= next30Days && 
    item.status === 'active'
  ).length;

  const disposed = productExpiries.filter(item => 
    item.status === 'disposed'
  ).length;

  const stats = [
    {
      title: "Expired Products",
      value: expired,
      icon: <AlertTriangle className="h-5 w-5 text-red-500" />,
    },
    {
      title: "Expiring in 7 Days",
      value: expiringSoon,
      icon: <Calendar className="h-5 w-5 text-orange-500" />,
    },
    {
      title: "Expiring in 30 Days",
      value: expiringThisMonth,
      icon: <Package className="h-5 w-5 text-yellow-500" />,
    },
    {
      title: "Disposed Items",
      value: disposed,
      icon: <Trash2 className="h-5 w-5 text-gray-500" />,
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <CardStat
          key={index}
          title={stat.title}
          value={stat.value}
          icon={stat.icon}
        />
      ))}
    </div>
  );
};

export default ExpiryStats;
