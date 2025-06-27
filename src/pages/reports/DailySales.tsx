
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DataTable } from '@/components/ui/data-table';
import { BarChart } from '@/components/charts/BarChart';
import { Download, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { fetchReportData, getFilteredSales, calculateSalesMetrics } from '@/services/reportService';
import { Sale } from '@/types';

const DailySales = () => {
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [dailyData, setDailyData] = useState<Sale[]>([]);
  const [totalSales, setTotalSales] = useState(0);
  const [totalInvoices, setTotalInvoices] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const { sales } = await fetchReportData();
        
        // Filter sales by selected date
        const filteredSales = sales.filter(sale => 
          format(new Date(sale.sale_date), 'yyyy-MM-dd') === selectedDate
        );

        setDailyData(filteredSales);
        const metrics = calculateSalesMetrics(filteredSales);
        setTotalSales(metrics.totalSales);
        setTotalInvoices(metrics.totalInvoices);
      } catch (error) {
        console.error('Error loading daily sales data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [selectedDate]);

  const columns = [
    {
      accessorKey: 'sale_id',
      header: 'Sale ID',
    },
    {
      accessorKey: 'clientName',
      header: 'Customer',
      cell: ({ row }) => row.original.clientName || 'Walk-in Customer',
    },
    {
      accessorKey: 'selling_price',
      header: 'Amount',
      cell: ({ row }) => `₹${(row.getValue('selling_price') * row.original.quantity_sold).toLocaleString()}`,
    },
    {
      accessorKey: 'sale_date',
      header: 'Time',
      cell: ({ row }) => format(new Date(row.getValue('sale_date')), 'HH:mm'),
    },
  ];

  const chartData = dailyData.map((sale, index) => ({
    name: `Sale ${index + 1}`,
    amount: sale.selling_price * sale.quantity_sold,
  }));

  const exportToCSV = () => {
    const csvContent = [
      ['Sale ID', 'Customer', 'Amount', 'Time'],
      ...dailyData.map(sale => [
        sale.sale_id,
        sale.clientName || 'Walk-in Customer',
        sale.selling_price * sale.quantity_sold,
        format(new Date(sale.sale_date), 'HH:mm')
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `daily-sales-${selectedDate}.csv`;
    a.click();
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-center items-center h-64">
          <div className="text-lg">Loading daily sales data...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Daily Sales Report</h1>
          <p className="text-muted-foreground">Sales summary for {selectedDate}</p>
        </div>
        <Button onClick={exportToCSV} className="flex items-center gap-2">
          <Download className="w-4 h-4" />
          Export CSV
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <Label htmlFor="date">Select Date</Label>
            </div>
            <Input
              id="date"
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="mt-2"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl">₹{totalSales.toLocaleString()}</CardTitle>
            <CardDescription>Total Sales</CardDescription>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl">{totalInvoices}</CardTitle>
            <CardDescription>Total Sales</CardDescription>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl">₹{totalInvoices > 0 ? (totalSales / totalInvoices).toFixed(0) : 0}</CardTitle>
            <CardDescription>Average Sale</CardDescription>
          </CardHeader>
        </Card>
      </div>

      {chartData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Sales Visualization</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <BarChart
                data={chartData}
                dataKey="amount"
                xAxisDataKey="name"
                fill="#4f46e5"
              />
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Sales Details</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable columns={columns} data={dailyData} />
        </CardContent>
      </Card>
    </div>
  );
};

export default DailySales;
