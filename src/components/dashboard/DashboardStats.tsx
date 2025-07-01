
import { TrendingUp, ShoppingCart, Package, Users } from "lucide-react";
import { CardStat } from "@/components/ui/card-stat";
import { useNavigate } from "react-router-dom";
import { Sale, Product, Client } from "@/types";

interface DashboardStatsProps {
  sales: Sale[];
  products: Product[];
  clients: Client[];
  todaysPurchases: number;
}

export const DashboardStats = ({ 
  sales, 
  products, 
  clients, 
  todaysPurchases 
}: DashboardStatsProps) => {
  const navigate = useNavigate();
  
  // Calculate today's revenue from real data
  const today = new Date().toDateString();
  const todaysRevenue = sales
    .filter(sale => new Date(sale.sale_date).toDateString() === today)
    .reduce((sum, sale) => sum + (sale.selling_price * sale.quantity_sold), 0);

  const mainStats = [
    {
      title: "Today's Sales",
      value: `₹${todaysRevenue.toFixed(2)}`,
      icon: <TrendingUp className="h-5 w-5 text-success" />,
      onClick: () => navigate("/sales"),
    },
    {
      title: "Today's Purchases",
      value: `₹${todaysPurchases.toFixed(2)}`,
      icon: <ShoppingCart className="h-5 w-5 text-info" />,
      onClick: () => navigate("/purchases"),
    },
    {
      title: "Total Products",
      value: products.length,
      icon: <Package className="h-5 w-5 text-primary" />,
      onClick: () => navigate("/products"),
    },
    {
      title: "Total Clients",
      value: clients.length,
      icon: <Users className="h-5 w-5 text-purple-500" />,
      onClick: () => navigate("/clients"),
    },
  ];

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Business Summary</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {mainStats.map((stat, index) => (
          <CardStat
            key={index}
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
            onClick={stat.onClick}
            className="cursor-pointer hover:shadow-md transition-shadow"
          />
        ))}
      </div>
    </div>
  );
};
