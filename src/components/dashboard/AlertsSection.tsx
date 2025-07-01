
import { Bell, AlertTriangle, Calendar, CreditCard } from "lucide-react";
import { CardStat } from "@/components/ui/card-stat";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { Product, Payment } from "@/types";
import useAppStore from "@/store/appStore";

interface AlertsSectionProps {
  products: Product[];
  payments: Payment[];
}

export const AlertsSection = ({ products, payments }: AlertsSectionProps) => {
  const navigate = useNavigate();
  const { getExpiringProducts, getExpiredProducts } = useAppStore();

  const lowStockItems = products.filter(product => 
    parseInt(product.units as string) < product.reorder_level
  ).length;

  const expiringSoonItems = getExpiringProducts(7).length;
  const expiredItems = getExpiredProducts().length;
  const creditDues = payments.filter(payment => payment.status === 'pending').length;

  const alertStats = [
    {
      title: "Low Stock Alert",
      value: lowStockItems,
      icon: <AlertTriangle className="h-5 w-5 text-warning" />,
      onClick: () => navigate("/products"),
      urgent: lowStockItems > 0,
    },
    {
      title: "Expiring Soon",
      value: expiringSoonItems,
      icon: <Calendar className="h-5 w-5 text-orange-500" />,
      onClick: () => navigate("/expiry?filter=expiring"),
      urgent: expiringSoonItems > 0,
    },
    {
      title: "Expired Items",
      value: expiredItems,
      icon: <AlertTriangle className="h-5 w-5 text-destructive" />,
      onClick: () => navigate("/expiry?filter=expired"),
      urgent: expiredItems > 0,
    },
    {
      title: "Credit Dues",
      value: creditDues,
      icon: <CreditCard className="h-5 w-5 text-red-500" />,
      onClick: () => navigate("/payments"),
      urgent: creditDues > 0,
    },
  ];

  const totalAlerts = lowStockItems + expiringSoonItems + expiredItems + creditDues;

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <Bell className="h-5 w-5 text-warning" />
        <h2 className="text-xl font-semibold">Alerts & Notifications</h2>
        {totalAlerts > 0 && (
          <Badge variant="destructive" className="ml-2">
            {totalAlerts} alerts
          </Badge>
        )}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {alertStats.map((stat, index) => (
          <CardStat
            key={index}
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
            onClick={stat.onClick}
            className={`cursor-pointer hover:shadow-md transition-shadow ${
              stat.urgent ? 'border-red-200 bg-red-50 dark:bg-red-950/20' : ''
            }`}
          />
        ))}
      </div>
    </div>
  );
};
