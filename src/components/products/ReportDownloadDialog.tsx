
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon, Download } from "lucide-react";
import { cn } from "@/lib/utils";
import jsPDF from "jspdf";
import "jspdf-autotable";
import useAppStore from "@/store/appStore";

interface ReportDownloadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type ReportType = "local" | "warehouse" | "sales" | "payments";
type TimeRange = "daily" | "thisMonth" | "lastMonth" | "thisQuarter" | "thisYear" | "custom";

const ReportDownloadDialog = ({ open, onOpenChange }: ReportDownloadDialogProps) => {
  const [reportType, setReportType] = useState<ReportType>("local");
  const [timeRange, setTimeRange] = useState<TimeRange>("daily");
  const [customDateFrom, setCustomDateFrom] = useState<Date | undefined>(new Date());
  const [customDateTo, setCustomDateTo] = useState<Date | undefined>(new Date());
  
  const { products, sales, payments } = useAppStore();

  const handleDownload = () => {
    // Create new PDF document
    const doc = new jsPDF();
    
    // Title
    const title = `${getReportTypeTitle(reportType)} Report - ${getTimeRangeTitle(timeRange)}`;
    doc.setFontSize(16);
    doc.text(title, 15, 15);
    
    // Date range info
    const dateRange = getDateRangeText();
    doc.setFontSize(10);
    doc.text(`Period: ${dateRange}`, 15, 25);
    doc.text(`Generated on: ${format(new Date(), "PPP")}`, 15, 30);
    
    // Add a line separator
    doc.line(15, 35, 195, 35);
    
    // Generate report content based on type
    doc.setFontSize(12);
    
    switch (reportType) {
      case "local":
        generateProductsReport(doc, products.filter(p => !p.product_name.includes("(Warehouse)")));
        break;
      case "warehouse":
        generateProductsReport(doc, products.filter(p => p.product_name.includes("(Warehouse)")));
        break;
      case "sales":
        generateSalesReport(doc, sales);
        break;
      case "payments":
        generatePaymentsReport(doc, payments);
        break;
    }
    
    // Save PDF
    doc.save(`${reportType}-report-${format(new Date(), "yyyy-MM-dd")}.pdf`);
    
    // Close dialog
    onOpenChange(false);
  };
  
  const getReportTypeTitle = (type: ReportType): string => {
    switch (type) {
      case "local": return "Local Stock";
      case "warehouse": return "Warehouse Stock";
      case "sales": return "Sales";
      case "payments": return "Payments";
    }
  };
  
  const getTimeRangeTitle = (range: TimeRange): string => {
    switch (range) {
      case "daily": return "Daily";
      case "thisMonth": return "This Month";
      case "lastMonth": return "Last Month";
      case "thisQuarter": return "This Quarter";
      case "thisYear": return "This Year";
      case "custom": return "Custom Range";
    }
  };
  
  const getDateRangeText = (): string => {
    const now = new Date();
    
    switch (timeRange) {
      case "daily":
        return format(now, "PPP");
      case "thisMonth":
        return `${format(new Date(now.getFullYear(), now.getMonth(), 1), "PPP")} - ${format(new Date(now.getFullYear(), now.getMonth() + 1, 0), "PPP")}`;
      case "lastMonth":
        return `${format(new Date(now.getFullYear(), now.getMonth() - 1, 1), "PPP")} - ${format(new Date(now.getFullYear(), now.getMonth(), 0), "PPP")}`;
      case "thisQuarter":
        const quarterStart = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
        const quarterEnd = new Date(quarterStart.getFullYear(), quarterStart.getMonth() + 3, 0);
        return `${format(quarterStart, "PPP")} - ${format(quarterEnd, "PPP")}`;
      case "thisYear":
        return `${format(new Date(now.getFullYear(), 0, 1), "PPP")} - ${format(new Date(now.getFullYear(), 11, 31), "PPP")}`;
      case "custom":
        if (customDateFrom && customDateTo) {
          return `${format(customDateFrom, "PPP")} - ${format(customDateTo, "PPP")}`;
        }
        return "Custom range";
      default:
        return "";
    }
  };
  
  const generateProductsReport = (doc: any, items: any[]) => {
    // @ts-ignore - jspdf-autotable adds this method
    doc.autoTable({
      startY: 40,
      head: [['ID', 'Product Name', 'Category', 'Price (₹)', 'Available Units', 'Status']],
      body: items.map(product => [
        product.product_id,
        product.product_name,
        product.category,
        product.price.toFixed(2),
        product.units,
        parseInt(product.units) > 10 ? 'In Stock' : parseInt(product.units) > 0 ? 'Low Stock' : 'Out of Stock'
      ])
    });
    
    // Summary
    const totalValue = items.reduce((sum, product) => sum + (product.price * parseInt(product.units)), 0);
    const totalItems = items.length;
    const outOfStock = items.filter(product => parseInt(product.units) === 0).length;
    const lowStock = items.filter(product => parseInt(product.units) > 0 && parseInt(product.units) <= 10).length;
    
    doc.setFontSize(12);
    doc.text(`Summary:`, 15, doc.lastAutoTable.finalY + 10);
    doc.text(`Total Products: ${totalItems}`, 15, doc.lastAutoTable.finalY + 20);
    doc.text(`Out of Stock: ${outOfStock}`, 15, doc.lastAutoTable.finalY + 30);
    doc.text(`Low Stock: ${lowStock}`, 15, doc.lastAutoTable.finalY + 40);
    doc.text(`Total Inventory Value: ₹${totalValue.toFixed(2)}`, 15, doc.lastAutoTable.finalY + 50);
  };
  
  const generateSalesReport = (doc: any, items: any[]) => {
    // Filter sales based on time range
    const filteredSales = filterByDateRange(items, 'sale_date');
    
    // @ts-ignore - jspdf-autotable adds this method
    doc.autoTable({
      startY: 40,
      head: [['ID', 'Product', 'Client', 'Quantity', 'Price (₹)', 'Total (₹)', 'Date']],
      body: filteredSales.map(sale => [
        sale.sale_id,
        sale.product?.product_name || 'Unknown',
        sale.clientName || 'General',
        sale.quantity_sold,
        sale.selling_price.toFixed(2),
        (sale.quantity_sold * sale.selling_price).toFixed(2),
        format(new Date(sale.sale_date), 'PPP')
      ])
    });
    
    // Summary
    const totalSales = filteredSales.length;
    const totalRevenue = filteredSales.reduce((sum, sale) => sum + (sale.quantity_sold * sale.selling_price), 0);
    const totalQuantity = filteredSales.reduce((sum, sale) => sum + sale.quantity_sold, 0);
    
    doc.setFontSize(12);
    doc.text(`Summary:`, 15, doc.lastAutoTable.finalY + 10);
    doc.text(`Total Sales: ${totalSales}`, 15, doc.lastAutoTable.finalY + 20);
    doc.text(`Total Quantity Sold: ${totalQuantity}`, 15, doc.lastAutoTable.finalY + 30);
    doc.text(`Total Revenue: ₹${totalRevenue.toFixed(2)}`, 15, doc.lastAutoTable.finalY + 40);
  };
  
  const generatePaymentsReport = (doc: any, items: any[]) => {
    // Filter payments based on time range
    const filteredPayments = filterByDateRange(items, 'date');
    
    // @ts-ignore - jspdf-autotable adds this method
    doc.autoTable({
      startY: 40,
      head: [['ID', 'Client', 'Amount (₹)', 'Method', 'Description', 'Status', 'Date']],
      body: filteredPayments.map(payment => [
        payment.id,
        payment.clientName || 'General',
        payment.amount.toFixed(2),
        payment.method,
        payment.description,
        payment.status,
        format(new Date(payment.date), 'PPP')
      ])
    });
    
    // Summary
    const totalPayments = filteredPayments.length;
    const totalAmount = filteredPayments.reduce((sum, payment) => sum + payment.amount, 0);
    const paidAmount = filteredPayments.filter(p => p.status === 'paid').reduce((sum, payment) => sum + payment.amount, 0);
    const pendingAmount = filteredPayments.filter(p => p.status === 'pending').reduce((sum, payment) => sum + payment.amount, 0);
    
    doc.setFontSize(12);
    doc.text(`Summary:`, 15, doc.lastAutoTable.finalY + 10);
    doc.text(`Total Payments: ${totalPayments}`, 15, doc.lastAutoTable.finalY + 20);
    doc.text(`Total Amount: ₹${totalAmount.toFixed(2)}`, 15, doc.lastAutoTable.finalY + 30);
    doc.text(`Paid Amount: ₹${paidAmount.toFixed(2)}`, 15, doc.lastAutoTable.finalY + 40);
    doc.text(`Pending Amount: ₹${pendingAmount.toFixed(2)}`, 15, doc.lastAutoTable.finalY + 50);
  };
  
  const filterByDateRange = (items: any[], dateField: string) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    let startDate: Date, endDate: Date;
    
    switch (timeRange) {
      case "daily":
        startDate = today;
        endDate = new Date(today);
        endDate.setDate(endDate.getDate() + 1);
        break;
      case "thisMonth":
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        break;
      case "lastMonth":
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        endDate = new Date(now.getFullYear(), now.getMonth(), 0);
        break;
      case "thisQuarter":
        const quarter = Math.floor(now.getMonth() / 3);
        startDate = new Date(now.getFullYear(), quarter * 3, 1);
        endDate = new Date(now.getFullYear(), (quarter + 1) * 3, 0);
        break;
      case "thisYear":
        startDate = new Date(now.getFullYear(), 0, 1);
        endDate = new Date(now.getFullYear(), 11, 31);
        break;
      case "custom":
        startDate = customDateFrom || today;
        endDate = customDateTo || today;
        break;
      default:
        startDate = today;
        endDate = today;
    }
    
    // Ensure end date includes the full day
    endDate.setHours(23, 59, 59, 999);
    
    return items.filter(item => {
      const itemDate = new Date(item[dateField]);
      return itemDate >= startDate && itemDate <= endDate;
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Download Report</DialogTitle>
          <DialogDescription>
            Select the type of report and time range you want to download.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label>Report Type</Label>
            <RadioGroup 
              value={reportType} 
              onValueChange={(v) => setReportType(v as ReportType)}
              className="flex flex-col space-y-1"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="local" id="local" />
                <Label htmlFor="local">Local Stock</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="warehouse" id="warehouse" />
                <Label htmlFor="warehouse">Warehouse Stock</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="sales" id="sales" />
                <Label htmlFor="sales">Sales Report</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="payments" id="payments" />
                <Label htmlFor="payments">Payment Report</Label>
              </div>
            </RadioGroup>
          </div>
          
          <div className="space-y-2">
            <Label>Time Range</Label>
            <RadioGroup 
              value={timeRange} 
              onValueChange={(v) => setTimeRange(v as TimeRange)}
              className="flex flex-col space-y-1"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="daily" id="daily" />
                <Label htmlFor="daily">Today</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="thisMonth" id="thisMonth" />
                <Label htmlFor="thisMonth">This Month</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="lastMonth" id="lastMonth" />
                <Label htmlFor="lastMonth">Last Month</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="thisQuarter" id="thisQuarter" />
                <Label htmlFor="thisQuarter">This Quarter</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="thisYear" id="thisYear" />
                <Label htmlFor="thisYear">This Year</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="custom" id="custom" />
                <Label htmlFor="custom">Custom Range</Label>
              </div>
            </RadioGroup>
          </div>
          
          {timeRange === "custom" && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>From</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !customDateFrom && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {customDateFrom ? format(customDateFrom, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={customDateFrom}
                      onSelect={setCustomDateFrom}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              <div className="space-y-2">
                <Label>To</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !customDateTo && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {customDateTo ? format(customDateTo, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={customDateTo}
                      onSelect={setCustomDateTo}
                      initialFocus
                      disabled={(date) => 
                        (customDateFrom ? date < customDateFrom : false) || date > new Date()
                      }
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          )}
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleDownload}>
            <Download className="mr-2 h-4 w-4" /> Download Report
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ReportDownloadDialog;
