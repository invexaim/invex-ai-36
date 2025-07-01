
import React, { useEffect, useState } from "react";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { DashboardStats } from "@/components/dashboard/DashboardStats";
import { AlertsSection } from "@/components/dashboard/AlertsSection";
import { ChartsSection } from "@/components/dashboard/ChartsSection";
import { RecentActivitySection } from "@/components/dashboard/RecentActivitySection";
import { InsightsSection } from "@/components/products/InsightsSection";
import { fetchReportData } from "@/services/reportService";
import { Sale, Product, Client, Payment } from "@/types";

const Dashboard = () => {
  // State for real data from Supabase
  const [dashboardData, setDashboardData] = useState<{
    sales: Sale[];
    products: Product[];
    clients: Client[];
    payments: Payment[];
  }>({
    sales: [],
    products: [],
    clients: [],
    payments: []
  });
  const [loading, setLoading] = useState(true);

  // Fetch real data from Supabase
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const data = await fetchReportData();
        setDashboardData(data);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  // Mock purchase data for now (will be replaced when purchase functionality is fully implemented)
  const mockPurchases = [
    { id: 1, date: new Date().toISOString(), amount: 15000, supplier: "ABC Suppliers" },
    { id: 2, date: new Date().toISOString(), amount: 8500, supplier: "XYZ Corp" }
  ];
  
  const today = new Date().toDateString();
  const todaysPurchases = mockPurchases
    .filter(purchase => new Date(purchase.date).toDateString() === today)
    .reduce((sum, purchase) => sum + purchase.amount, 0);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-center items-center h-64">
          <div className="text-lg">Loading dashboard data...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <DashboardHeader />

      {/* Main Business Stats */}
      <DashboardStats 
        sales={dashboardData.sales}
        products={dashboardData.products}
        clients={dashboardData.clients}
        todaysPurchases={todaysPurchases}
      />

      {/* Alerts & Notifications */}
      <AlertsSection 
        products={dashboardData.products}
        payments={dashboardData.payments}
      />

      {/* Real-time Data Visualization */}
      <ChartsSection 
        sales={dashboardData.sales}
        products={dashboardData.products}
        todaysPurchases={todaysPurchases}
      />

      {/* Recent Activity */}
      <RecentActivitySection 
        sales={dashboardData.sales}
        products={dashboardData.products}
      />

      {/* AI Insights Section */}
      <div>
        <h2 className="text-2xl font-bold mb-4">AI Insights</h2>
        <InsightsSection />
      </div>
    </div>
  );
};

export default Dashboard;
