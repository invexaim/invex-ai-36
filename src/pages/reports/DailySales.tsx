
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DataTable } from '@/components/ui/data-table';
import { BarChart } from '@/components/charts/BarChart';
import { Download, Calendar } from 'lucide-react';
import useAppStore from '@/store/appStore';
import { format } from 'date-fns';

const DailySales = () => {
  const { sales } = useAppStore();
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [dailyData, setDailyData] = useState([]);
  const [totalSales, setTotalSales] = useState(0);
  const [totalInvoices, setTotalInvoices] = useState(0);

  useEffect(() => {
    // Filter sales by selected date
    const filteredSales = sales.filter(sale => 
      format(new Date(sale.date), 'yyyy-MM-dd') === selectedDate
    );

    setDailyData(filteredSales);
    setTotalSales(filteredSales.reduce((sum, sale) => sum + sale.totalAmount, 0));
    setTotalInvoices(filteredSales.length);
  }, [sales, selectedDate]);

  const columns = [
    {
      accessorKey: 'invoiceNumber',
      header: 'Invoice #',
    },
    {
      accessorKey: 'clientName',
      header: 'Customer',
    },
    {
      accessorKey: 'totalAmount',
      header: 'Amount',
      cell: ({ row }) => `₹${row.getValue('totalAmount').toLocaleString()}`,
    },
    {
      accessorKey: 'date',
      header: 'Time',
      cell: ({ row }) => format(new Date(row.getValue('date')), 'HH:mm'),
    },
  ];

  const chartData = dailyData.map((sale, index) => ({
    name: `Invoice ${index + 1}`,
    amount: sale.totalAmount,
  }));

  const exportToCSV = () => {
    const csvContent = [
      ['Invoice Number', 'Customer', 'Amount', 'Time'],
      ...dailyData.map(sale => [
        sale.invoiceNumber,
        sale.clientName,
        sale.totalAmount,
        format(new Date(sale.date), 'HH:mm')
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `daily-sales-${selectedDate}.csv`;
    a.click();
  };

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
            <CardDescription>Total Invoices</CardDescription>
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
