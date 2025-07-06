
import React, { useEffect, useState } from "react";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { DashboardStats } from "@/components/dashboard/DashboardStats";
import { AlertsSection } from "@/components/dashboard/AlertsSection";
import { ChartsSection } from "@/components/dashboard/ChartsSection";
import { RecentActivitySection } from "@/components/dashboard/RecentActivitySection";
import { InsightsSection } from "@/components/products/InsightsSection";
import { fetchReportData } from "@/services/reportService";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

const Dashboard = () => {
  // Fetch real data from Supabase using React Query
  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ['dashboard-data'],
    queryFn: fetchReportData,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // Fetch real purchase orders from Supabase
  const { data: purchaseOrders } = useQuery({
    queryKey: ['purchase-orders'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('purchase_orders')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    }
  });

  // Calculate today's purchases from real Supabase data
  const today = new Date().toDateString();
  const todaysPurchases = purchaseOrders
    ? purchaseOrders
        .filter(order => new Date(order.order_date).toDateString() === today)
        .reduce((sum, order) => sum + Number(order.total_amount), 0)
    : 0;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-center items-center h-64">
          <div className="text-lg">Loading dashboard data...</div>
        </div>
      </div>
    );
  }

  const data = dashboardData || {
    sales: [],
    products: [],
    clients: [],
    payments: []
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <DashboardHeader />

      {/* Main Business Stats */}
      <DashboardStats 
        sales={data.sales}
        products={data.products}
        clients={data.clients}
        todaysPurchases={todaysPurchases}
      />

      {/* Alerts & Notifications */}
      <AlertsSection 
        products={data.products}
        payments={data.payments}
      />

      {/* Real-time Data Visualization */}
      <ChartsSection 
        sales={data.sales}
        products={data.products}
        todaysPurchases={todaysPurchases}
      />

      {/* Recent Activity */}
      <RecentActivitySection 
        sales={data.sales}
        products={data.products}
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
