
import React from "react";
import { Package, Users, CreditCard, TrendingUp, Calendar, AlertTriangle, ShoppingCart, Bell } from "lucide-react";
import { CardStat } from "@/components/ui/card-stat";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MultiLineChart } from "@/components/charts/MultiLineChart";
import { BarChart } from "@/components/charts/BarChart";
import { InsightsSection } from "@/components/products/InsightsSection";
import { useNavigate } from "react-router-dom";
import useAppStore from "@/store/appStore";
import UserProfile from "@/components/layout/UserProfile";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const Dashboard = () => {
  const navigate = useNavigate();
  const { 
    products, 
    clients, 
    sales, 
    payments,
    productExpiries,
    getExpiringProducts,
    getExpiredProducts
  } = useAppStore();

  // Calculate today's revenue and purchases
  const today = new Date().toDateString();
  const todaysRevenue = sales
    .filter(sale => new Date(sale.sale_date).toDateString() === today)
    .reduce((sum, sale) => sum + (sale.selling_price * sale.quantity_sold), 0);

  // Mock purchase data for now (will be replaced when purchase functionality is fully implemented)
  const mockPurchases = [
    { id: 1, date: new Date().toISOString(), amount: 15000, supplier: "ABC Suppliers" },
    { id: 2, date: new Date().toISOString(), amount: 8500, supplier: "XYZ Corp" }
  ];
  
  const todaysPurchases = mockPurchases
    .filter(purchase => new Date(purchase.date).toDateString() === today)
    .reduce((sum, purchase) => sum + purchase.amount, 0);

  const lowStockItems = products.filter(product => 
    parseInt(product.units as string) < product.reorder_level
  ).length;

  const expiringSoonItems = getExpiringProducts(7).length;
  const expiredItems = getExpiredProducts().length;

  // Calculate pending returns and credit dues
  const pendingReturns = 3; // Mock data - will be replaced with actual returns data
  const creditDues = payments.filter(payment => payment.status === 'pending').length;

  // Main stats for the dashboard
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

  // Alert stats
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

  const prepareDailySalesData = () => {
    const last7Days = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      const dayRevenue = sales
        .filter(sale => new Date(sale.sale_date).toDateString() === date.toDateString())
        .reduce((sum, sale) => sum + (sale.selling_price * sale.quantity_sold), 0);
      
      // Mock purchase data for visualization
      const dayPurchases = i === 0 ? todaysPurchases : Math.random() * 20000;
      
      last7Days.push({
        name: date.toLocaleDateString('en-US', { weekday: 'short' }),
        sales: dayRevenue,
        purchases: dayPurchases
      });
    }
    
    return last7Days;
  };

  const prepareRecentActivity = () => {
    const recentSales = sales
      .sort((a, b) => new Date(b.sale_date).getTime() - new Date(a.sale_date).getTime())
      .slice(0, 5);
    
    // Mock recent purchases
    const recentPurchases = mockPurchases.slice(0, 3);
    
    return { recentSales, recentPurchases };
  };

  const dailyData = prepareDailySalesData();
  const { recentSales, recentPurchases } = prepareRecentActivity();

  const revenueByCategoryData = (() => {
    const categoryRevenue = new Map();
    
    sales.forEach(sale => {
      const product = products.find(p => p.product_id === sale.product_id);
      const category = product?.category || 'Unknown';
      const revenue = sale.selling_price * sale.quantity_sold;
      
      categoryRevenue.set(category, (categoryRevenue.get(category) || 0) + revenue);
    });
    
    return Array.from(categoryRevenue.entries())
      .filter(([name, sales]) => sales > 0)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, sales]) => ({ name, sales }));
  })();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Real-time overview of your business performance
          </p>
        </div>
        <div className="hidden md:block">
          <UserProfile />
        </div>
      </div>

      {/* Main Business Stats */}
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

      {/* Alerts & Notifications */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Bell className="h-5 w-5 text-warning" />
          <h2 className="text-xl font-semibold">Alerts & Notifications</h2>
          {(lowStockItems > 0 || expiringSoonItems > 0 || expiredItems > 0 || creditDues > 0) && (
            <Badge variant="destructive" className="ml-2">
              {lowStockItems + expiringSoonItems + expiredItems + creditDues} alerts
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

      {/* Comprehensive Notification Panel */}
      {(pendingReturns > 0 || creditDues > 0 || expiringSoonItems > 0 || expiredItems > 0) && (
        <Card className="border-orange-200 bg-orange-50 dark:bg-orange-950/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-800 dark:text-orange-200">
              <Bell className="h-5 w-5" />
              Notifications Center
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {pendingReturns > 0 && (
              <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <span className="text-sm">
                    <strong>{pendingReturns}</strong> pending returns require attention
                  </span>
                </div>
                <Button size="sm" variant="outline" onClick={() => navigate("/purchases/returns")}>
                  View Returns
                </Button>
              </div>
            )}
            
            {creditDues > 0 && (
              <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <span className="text-sm">
                    <strong>{creditDues}</strong> credit dues pending collection
                  </span>
                </div>
                <Button size="sm" variant="outline" onClick={() => navigate("/payments")}>
                  View Payments
                </Button>
              </div>
            )}
            
            {expiringSoonItems > 0 && (
              <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  <span className="text-sm">
                    <strong>{expiringSoonItems}</strong> products expiring within 7 days
                  </span>
                </div>
                <Button size="sm" variant="outline" onClick={() => navigate("/expiry?filter=expiring")}>
                  View Expiring
                </Button>
              </div>
            )}
            
            {expiredItems > 0 && (
              <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-red-600 rounded-full"></div>
                  <span className="text-sm">
                    <strong>{expiredItems}</strong> products have already expired
                  </span>
                </div>
                <Button size="sm" variant="outline" onClick={() => navigate("/expiry?filter=expired")}>
                  View Expired
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Real-time Data Visualization */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Real-time Data Visualization</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Sales vs Purchases Trend (Last 7 Days)</CardTitle>
            </CardHeader>
            <CardContent className="px-2 pb-4">
              <div className="h-[300px]">
                <MultiLineChart 
                  data={dailyData} 
                  xAxisDataKey="name" 
                  lines={[
                    { dataKey: "sales", stroke: "#4f46e5", name: "Sales" },
                    { dataKey: "purchases", stroke: "#ef4444", name: "Purchases" }
                  ]}
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
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Sales Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentSales.length > 0 ? (
                recentSales.map((sale, index) => {
                  const product = products.find(p => p.product_id === sale.product_id);
                  return (
                    <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div>
                        <p className="font-medium">{product?.product_name || 'Unknown Product'}</p>
                        <p className="text-sm text-muted-foreground">
                          Qty: {sale.quantity_sold} • {new Date(sale.sale_date).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">₹{(sale.selling_price * sale.quantity_sold).toFixed(2)}</p>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-muted-foreground text-center py-4">No recent sales</p>
              )}
              <Button variant="outline" className="w-full" onClick={() => navigate("/sales")}>
                View All Sales
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Purchase Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentPurchases.map((purchase, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div>
                    <p className="font-medium">{purchase.supplier}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(purchase.date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">₹{purchase.amount.toFixed(2)}</p>
                  </div>
                </div>
              ))}
              <Button variant="outline" className="w-full" onClick={() => navigate("/purchases")}>
                View All Purchases
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Insights Section */}
      <div>
        <h2 className="text-2xl font-bold mb-4">AI Insights</h2>
        <InsightsSection />
      </div>
    </div>
  );
};

export default Dashboard;
