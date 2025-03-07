
import React, { useMemo } from "react";
import { LineChart } from "@/components/charts/LineChart";
import { BarChart } from "@/components/charts/BarChart";
import { Sale } from "@/types";
import { format, subDays, parseISO, isWithinInterval } from "date-fns";

interface HistoryChartsProps {
  sales: Sale[];
}

export const HistoryCharts = ({ sales }: HistoryChartsProps) => {
  // Generate sales trend data
  const salesChartData = useMemo(() => {
    // Generate data for the last 7 days
    return Array.from({ length: 7 }, (_, i) => {
      const date = subDays(new Date(), 6 - i);
      const formattedDate = format(date, "MMM dd");
      const dayStart = new Date(date.setHours(0, 0, 0, 0));
      const dayEnd = new Date(date.setHours(23, 59, 59, 999));
      
      // Filter sales for this day
      const daySales = sales.filter(sale => {
        const saleDate = parseISO(sale.sale_date);
        return isWithinInterval(saleDate, { start: dayStart, end: dayEnd });
      });
      
      // Calculate revenue for the day
      const revenue = daySales.reduce(
        (acc, sale) => acc + (sale.quantity_sold * sale.selling_price), 
        0
      );
      
      return {
        name: formattedDate,
        value: revenue
      };
    });
  }, [sales]);
  
  // Generate category data
  const categoryChartData = useMemo(() => {
    const categories = sales.reduce((acc, sale) => {
      const category = sale.product?.category || "Uncategorized";
      if (!acc[category]) {
        acc[category] = 0;
      }
      acc[category] += sale.quantity_sold * sale.selling_price;
      return acc;
    }, {} as Record<string, number>);
    
    return Object.entries(categories).map(([name, value]) => ({
      name,
      value
    }));
  }, [sales]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-card p-6 rounded-lg border shadow-sm h-[350px]">
        <h3 className="text-lg font-semibold mb-4">Sales Trend (Last 7 Days)</h3>
        <div className="h-[270px]">
          {sales.length > 0 ? (
            <LineChart 
              data={salesChartData} 
              dataKey="value" 
              xAxisDataKey="name"
              stroke="#4f46e5"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <p>No sales data available yet</p>
            </div>
          )}
        </div>
      </div>
      
      <div className="bg-card p-6 rounded-lg border shadow-sm h-[350px]">
        <h3 className="text-lg font-semibold mb-4">Revenue by Category</h3>
        <div className="h-[270px]">
          {sales.length > 0 ? (
            <BarChart 
              data={categoryChartData} 
              dataKey="value" 
              xAxisDataKey="name"
              fill="#22c55e"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <p>No category data available yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
