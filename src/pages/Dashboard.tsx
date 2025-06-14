import React from "react";
import { Package, Users, CreditCard, TrendingUp, Calendar } from "lucide-react";
import { CardStat } from "@/components/ui/card-stat";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart } from "@/components/charts/LineChart";
import { BarChart } from "@/components/charts/BarChart";
import { InsightsSection } from "@/components/products/InsightsSection";
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

  // Prepare Daily Sales Trend data (last 7 days)
  const prepareDailySalesData = () => {
    const last7Days = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const dayRevenue = sales
        .filter(sale => new Date(sale.sale_date).toDateString() === date.toDateString())
        .reduce((sum, sale) => sum + (sale.selling_price * sale.quantity_sold), 0);
      
      last7Days.push({
        name: date.toLocaleDateString('en-US', { weekday: 'short' }),
        sales: dayRevenue
      });
    }
    
    return last7Days;
  };

  // Updated: Prepare Revenue by Category data - show ALL categories with sales
  const prepareRevenueByCategory = () => {
    const categoryRevenue = new Map();
    
    sales.forEach(sale => {
      const product = products.find(p => p.product_id === sale.product_id);
      const category = product?.category || 'Unknown';
      const revenue = sale.selling_price * sale.quantity_sold;
      
      categoryRevenue.set(category, (categoryRevenue.get(category) || 0) + revenue);
    });
    
    // Return ALL categories with sales (not just top 5), sorted by revenue
    return Array.from(categoryRevenue.entries())
      .filter(([name, sales]) => sales > 0) // Only include categories with actual sales
      .sort((a, b) => b[1] - a[1]) // Sort by revenue (highest first)
      .map(([name, sales]) => ({ name, sales }));
  };

  // Prepare Weekly Analysis data
  const prepareWeeklyAnalysis = () => {
    const totalInventoryValue = products.reduce((sum, product) => 
      sum + (product.price * parseInt(product.units as string)), 0
    );
    
    const averageStockLevel = products.length > 0 
      ? products.reduce((sum, product) => sum + parseInt(product.units as string), 0) / products.length
      : 0;
    
    const categoriesCount = [...new Set(products.map(p => p.category))].length;
    
    return {
      totalInventoryValue,
      averageStockLevel: Math.round(averageStockLevel),
      categoriesCount,
      totalProducts: products.length
    };
  };

  const dailySalesData = prepareDailySalesData();
  const revenueByCategoryData = prepareRevenueByCategory();
  const weeklyAnalysis = prepareWeeklyAnalysis();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back! Here's what's happening with your business today.
        </p>
      </div>

      {/* Stats Grid - matching the layout from your image */}
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

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Daily Sales Trend</CardTitle>
          </CardHeader>
          <CardContent className="px-2 pb-4">
            <div className="h-[300px]">
              <LineChart 
                data={dailySalesData} 
                xAxisDataKey="name" 
                dataKey="sales"
                stroke="#4f46e5"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Revenue by Category</CardTitle>
          </CardHeader>
          <CardContent className="px-2 pb-4">
            <div className="h-[300px]">
              <BarChart 
                data={revenueByCategoryData} 
                xAxisDataKey="name" 
                dataKey="sales"
                fill="#10b981"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Insights Section */}
      <div>
        <h2 className="text-2xl font-bold mb-4">AI Insights</h2>
        <InsightsSection />
      </div>

      {/* Weekly Analysis Section */}
      <Card>
        <CardHeader>
          <CardTitle>Weekly Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-primary">₹{weeklyAnalysis.totalInventoryValue.toFixed(2)}</h3>
              <p className="text-sm text-muted-foreground">Total Inventory Value</p>
            </div>
            <div className="text-center">
              <h3 className="text-2xl font-bold text-info">{weeklyAnalysis.averageStockLevel}</h3>
              <p className="text-sm text-muted-foreground">Average Stock Level</p>
            </div>
            <div className="text-center">
              <h3 className="text-2xl font-bold text-success">{weeklyAnalysis.categoriesCount}</h3>
              <p className="text-sm text-muted-foreground">Product Categories</p>
            </div>
            <div className="text-center">
              <h3 className="text-2xl font-bold text-warning">{weeklyAnalysis.totalProducts}</h3>
              <p className="text-sm text-muted-foreground">Total Products</p>
            </div>
          </div>
          <div className="mt-4 p-4 bg-muted/50 rounded-lg">
            <h4 className="font-semibold mb-2">Inventory Health Recommendation</h4>
            <p className="text-sm text-muted-foreground">
              {lowStockItems > 0 
                ? `You have ${lowStockItems} products below reorder level. Consider restocking to maintain optimal inventory levels.`
                : "Your inventory levels are healthy. Continue monitoring stock levels for optimal performance."
              }
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
