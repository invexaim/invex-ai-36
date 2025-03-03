
import { CardStat } from "@/components/ui/card-stat";
import { BarChart } from "@/components/charts/BarChart";
import { LineChart } from "@/components/charts/LineChart";
import { AIInsightCard } from "@/components/ai/AIInsightCard";
import {
  AlertCircle,
  Calendar,
  ChartPieIcon,
  TrendingUp,
} from "lucide-react";
import { mockAIInsights, mockMonthlySalesData, mockWeeklyDemandData } from "@/data/mockData";
import { useEffect } from "react";
import { toast } from "sonner";

const Dashboard = () => {
  useEffect(() => {
    // Welcome toast on first load
    toast.success("Welcome to Invex AI", {
      description: "Your intelligent inventory management system",
      duration: 5000,
    });
  }, []);

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Overview of your inventory system with AI-powered insights
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <CardStat
          title="AI Predictions"
          value="92%"
          icon={<ChartPieIcon className="w-5 h-5 text-primary" />}
          className="bg-blue-50"
        />
        <CardStat
          title="Sales Growth"
          value="24%"
          icon={<TrendingUp className="w-5 h-5 text-primary" />}
          className="bg-green-50"
        />
        <CardStat
          title="Seasonal Peak"
          value="Winter"
          icon={<Calendar className="w-5 h-5 text-primary" />}
          className="bg-purple-50"
        />
        <CardStat
          title="Low Stock Items"
          value="5"
          icon={<AlertCircle className="w-5 h-5 text-destructive" />}
          className="bg-red-50"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card p-6 rounded-lg border shadow-sm">
          <LineChart 
            title="Monthly Sales Trend"
            data={mockMonthlySalesData} 
            dataKey="value" 
            stroke="#38bdf8"
          />
        </div>
        <div className="bg-card p-6 rounded-lg border shadow-sm">
          <BarChart
            title="Weekly Demand Analysis"
            data={mockWeeklyDemandData}
            dataKey="value"
            fill="#38bdf8"
          />
        </div>
      </div>

      {/* AI Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card p-6 rounded-lg border shadow-sm">
          <h3 className="text-xl font-semibold mb-4">AI Insights</h3>
          <div className="space-y-4">
            {mockAIInsights.slice(0, 2).map((insight, index) => (
              <AIInsightCard key={index} insight={insight} />
            ))}
          </div>
        </div>
        <div className="bg-card p-6 rounded-lg border shadow-sm">
          <h3 className="text-xl font-semibold mb-4">Weekly Analysis</h3>
          <div className="space-y-4">
            {mockAIInsights.slice(2, 4).map((insight, index) => (
              <AIInsightCard key={index} insight={insight} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
