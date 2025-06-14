
import React from "react";
import { Package, Users, CreditCard, TrendingUp, Calendar } from "lucide-react";
import { CardStat } from "@/components/ui/card-stat";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import useAppStore from "@/store/appStore";

const Dashboard = () => {
  const navigate = useNavigate();
  const { 
    products, 
    clients, 
    sales, 
    payments,
    productExpiries 
  } = useAppStore();

  // Calculate today's revenue
  const today = new Date().toDateString();
  const todaysRevenue = sales
    .filter(sale => new Date(sale.sale_date).toDateString() === today)
    .reduce((sum, sale) => sum + (sale.selling_price * sale.quantity_sold), 0);

  // Calculate expiring products (next 30 days)
  const next30Days = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  const expiringProducts = productExpiries.filter(item => 
    new Date(item.expiry_date) <= next30Days && 
    new Date(item.expiry_date) >= new Date() &&
    item.status === 'active'
  ).length;

  // Calculate low stock items
  const lowStockItems = products.filter(product => 
    parseInt(product.units as string) < product.reorder_level
  ).length;

  const stats = [
    {
      title: "Total Products",
      value: products.length,
      icon: <Package className="h-5 w-5 text-primary" />,
      onClick: () => navigate("/products"),
    },
    {
      title: "Total Clients",
      value: clients.length,
      icon: <Users className="h-5 w-5 text-info" />,
      onClick: () => navigate("/clients"),
    },
    {
      title: "Today's Revenue",
      value: `₹${todaysRevenue.toFixed(2)}`,
      icon: <TrendingUp className="h-5 w-5 text-success" />,
      onClick: () => navigate("/sales"),
    },
    {
      title: "Low Stock Items",
      value: lowStockItems,
      icon: <CreditCard className="h-5 w-5 text-warning" />,
      onClick: () => navigate("/products/low-stock"),
    },
    {
      title: "Expiring Products",
      value: expiringProducts,
      icon: <Calendar className="h-5 w-5 text-orange-500" />,
      onClick: () => navigate("/expiry"),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back! Here's what's happening with your business today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {stats.map((stat, index) => (
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

      {/* Additional Dashboard Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Recent sales, payments, and other activities will be displayed here.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <button 
                onClick={() => navigate("/sales")}
                className="block w-full text-left p-2 rounded hover:bg-muted"
              >
                Record New Sale
              </button>
              <button 
                onClick={() => navigate("/products")}
                className="block w-full text-left p-2 rounded hover:bg-muted"
              >
                Add New Product
              </button>
              <button 
                onClick={() => navigate("/clients")}
                className="block w-full text-left p-2 rounded hover:bg-muted"
              >
                Add New Client
              </button>
              <button 
                onClick={() => navigate("/expiry")}
                className="block w-full text-left p-2 rounded hover:bg-muted"
              >
                Add Expiry Date
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
