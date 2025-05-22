
import React, { useMemo } from "react";
import { LineChart } from "@/components/charts/LineChart";
import { BarChart } from "@/components/charts/BarChart";
import { Sale } from "@/types";
import { format, parseISO, compareAsc, differenceInDays } from "date-fns";

interface HistoryChartsProps {
  sales: Sale[];
}

export const HistoryCharts = ({ sales }: HistoryChartsProps) => {
  // Generate sales trend data for all time
  const salesChartData = useMemo(() => {
    if (sales.length === 0) return [];
    
    // Sort sales by date
    const sortedSales = [...sales].sort((a, b) => 
      compareAsc(parseISO(a.sale_date), parseISO(b.sale_date))
    );
    
    // Get first and last sale dates
    const firstSaleDate = parseISO(sortedSales[0].sale_date);
    const lastSaleDate = parseISO(sortedSales[sortedSales.length - 1].sale_date);
    
    // Calculate total days between first and last sale
    const totalDays = differenceInDays(lastSaleDate, firstSaleDate);
    
    // Group sales by date
    const salesByDate = sortedSales.reduce((acc, sale) => {
      const formattedDate = format(parseISO(sale.sale_date), "MMM dd");
      
      if (!acc[formattedDate]) {
        acc[formattedDate] = 0;
      }
      
      acc[formattedDate] += sale.quantity_sold * sale.selling_price;
      return acc;
    }, {} as Record<string, number>);
    
    // Convert to chart data format (sorted chronologically)
    return Object.entries(salesByDate).map(([name, value]) => ({
      name,
      value
    }));
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
        <h3 className="text-lg font-semibold mb-4">Sales Trend (All Time)</h3>
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
