import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DataTable } from '@/components/ui/data-table';
import { BarChart } from '@/components/charts/BarChart';
import { Download, Tags, TrendingUp } from 'lucide-react';
import useAppStore from '@/store/appStore';
import { format, startOfMonth, endOfMonth } from 'date-fns';

const ExpenseReports = () => {
  const { expenses } = useAppStore();
  const [filteredExpenses, setFilteredExpenses] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDataTo] = useState('');
  const [categoryData, setCategoryData] = useState([]);
  const [trendData, setTrendData] = useState([]);

  // Mock expense data
  const mockExpenses = [
    { id: '1', description: 'Office Rent', amount: 15000, category: 'Rent', date: '2024-01-01', vendor: 'Property Owner' },
    { id: '2', description: 'Electricity Bill', amount: 3000, category: 'Utilities', date: '2024-01-05', vendor: 'Power Company' },
    { id: '3', description: 'Marketing Campaign', amount: 8000, category: 'Marketing', date: '2024-01-10', vendor: 'Ad Agency' },
    { id: '4', description: 'Office Supplies', amount: 2500, category: 'Office Expenses', date: '2024-01-15', vendor: 'Stationery Store' },
    { id: '5', description: 'Internet Bill', amount: 1500, category: 'Utilities', date: '2024-01-20', vendor: 'ISP Provider' },
    { id: '6', description: 'Travel Expense', amount: 4000, category: 'Travel', date: '2024-01-25', vendor: 'Travel Agency' }
  ];

  const expenseCategories = ['Rent', 'Utilities', 'Marketing', 'Office Expenses', 'Travel', 'Miscellaneous'];

  useEffect(() => {
    const expenseData = mockExpenses;
    let filtered = [...expenseData];

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(expense => expense.category === selectedCategory);
    }

    // Filter by date range
    if (dateFrom) {
      filtered = filtered.filter(expense => new Date(expense.date) >= new Date(dateFrom));
    }
    if (dateTo) {
      filtered = filtered.filter(expense => new Date(expense.date) <= new Date(dateTo));
    }

    setFilteredExpenses(filtered);

    // Calculate category-wise expenses
    const categoryTotals = expenseCategories.map(category => {
      const categoryExpenses = filtered.filter(expense => expense.category === category);
      const total = categoryExpenses.reduce((sum, expense) => sum + expense.amount, 0);
      return {
        category,
        total,
        count: categoryExpenses.length
      };
    }).filter(item => item.total > 0);

    setCategoryData(categoryTotals);

    // Calculate trend data based on selected period
    if (selectedPeriod === 'month') {
      // Group by month
      const monthlyData = {};
      filtered.forEach(expense => {
        const month = format(new Date(expense.date), 'MMM yyyy');
        if (!monthlyData[month]) {
          monthlyData[month] = 0;
        }
        monthlyData[month] += expense.amount;
      });
      
      const trendArray = Object.entries(monthlyData).map(([month, total]) => ({
        period: month,
        amount: total
      }));
      setTrendData(trendArray);
    } else if (selectedPeriod === 'quarter') {
      // Group by quarter
      const quarterlyData = {};
      filtered.forEach(expense => {
        const date = new Date(expense.date);
        const quarter = `Q${Math.ceil((date.getMonth() + 1) / 3)} ${date.getFullYear()}`;
        if (!quarterlyData[quarter]) {
          quarterlyData[quarter] = 0;
        }
        quarterlyData[quarter] += expense.amount;
      });
      
      const trendArray = Object.entries(quarterlyData).map(([quarter, total]) => ({
        period: quarter,
        amount: total
      }));
      setTrendData(trendArray);
    }
  }, [selectedCategory, selectedPeriod, dateFrom, dateTo]);

  const columns = [
    {
      accessorKey: 'description',
      header: 'Description',
    },
    {
      accessorKey: 'category',
      header: 'Category',
    },
    {
      accessorKey: 'amount',
      header: 'Amount',
      cell: ({ row }) => `₹${row.getValue('amount').toLocaleString()}`,
    },
    {
      accessorKey: 'vendor',
      header: 'Vendor',
    },
    {
      accessorKey: 'date',
      header: 'Date',
      cell: ({ row }) => format(new Date(row.getValue('date')), 'dd/MM/yyyy'),
    },
  ];

  const exportToCSV = () => {
    const csvContent = [
      ['Description', 'Category', 'Amount', 'Vendor', 'Date'],
      ...filteredExpenses.map(expense => [
        expense.description,
        expense.category,
        expense.amount,
        expense.vendor,
        format(new Date(expense.date), 'dd/MM/yyyy')
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'expense-reports.csv';
    a.click();
  };

  const totalExpenses = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  const averageExpense = filteredExpenses.length > 0 ? totalExpenses / filteredExpenses.length : 0;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Expense Reports</h1>
          <p className="text-muted-foreground">Expense trends and analysis by category</p>
        </div>
        <Button onClick={exportToCSV} className="flex items-center gap-2">
          <Download className="w-4 h-4" />
          Export CSV
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <Label>Category</Label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {expenseCategories.map(category => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Period</Label>
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="month">Monthly</SelectItem>
                  <SelectItem value="quarter">Quarterly</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="dateFrom">From Date</Label>
              <Input
                id="dateFrom"
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="dateTo">To Date</Label>
              <Input
                id="dateTo"
                type="date"
                value={dateTo}
                onChange={(e) => setDataTo(e.target.value)}
              />
            </div>
            <div className="flex items-end">
              <Button variant="outline" onClick={() => {
                setSelectedCategory('all');
                setDateFrom('');
                setDataTo('');
              }}>
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl">{filteredExpenses.length}</CardTitle>
            <CardDescription>Total Expenses</CardDescription>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl">₹{totalExpenses.toLocaleString()}</CardTitle>
            <CardDescription>Total Amount</CardDescription>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl">₹{averageExpense.toFixed(0)}</CardTitle>
            <CardDescription>Average Expense</CardDescription>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl">{categoryData.length}</CardTitle>
            <CardDescription>Active Categories</CardDescription>
          </CardHeader>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Tags className="w-5 h-5" />
              Category-wise Expenses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <BarChart
                data={categoryData}
                dataKey="total"
                xAxisDataKey="category"
                fill="#f59e0b"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Expense Trends
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <BarChart
                data={trendData}
                dataKey="amount"
                xAxisDataKey="period"
                fill="#ef4444"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Expense Details</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable columns={columns} data={filteredExpenses} />
        </CardContent>
      </Card>
    </div>
  );
};

export default ExpenseReports;
