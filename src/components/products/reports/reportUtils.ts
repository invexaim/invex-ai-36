
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format, isWithinInterval, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';
import { Product, Sale, Payment } from '@/types';
import useAppStore from '@/store/appStore';

export type ReportType = "all" | "inventory" | "sales" | "payments";
export type TimeRange = "daily" | "weekly" | "monthly" | "custom";

const getCompanyName = () => {
  const { companyName } = useAppStore.getState();
  return companyName || 'Your Company Name';
};

const filterSalesByTimeRange = (
  sales: Sale[],
  timeRange: TimeRange,
  customDateFrom?: Date,
  customDateTo?: Date
) => {
  const now = new Date();
  
  switch (timeRange) {
    case "daily":
      const startOfToday = new Date(now.setHours(0, 0, 0, 0));
      const endOfToday = new Date(now.setHours(23, 59, 59, 999));
      return sales.filter(sale => {
        const saleDate = new Date(sale.sale_date);
        return isWithinInterval(saleDate, { start: startOfToday, end: endOfToday });
      });
      
    case "weekly":
      const weekStart = startOfWeek(now);
      const weekEnd = endOfWeek(now);
      return sales.filter(sale => {
        const saleDate = new Date(sale.sale_date);
        return isWithinInterval(saleDate, { start: weekStart, end: weekEnd });
      });
      
    case "monthly":
      const monthStart = startOfMonth(now);
      const monthEnd = endOfMonth(now);
      return sales.filter(sale => {
        const saleDate = new Date(sale.sale_date);
        return isWithinInterval(saleDate, { start: monthStart, end: monthEnd });
      });
      
    case "custom":
      if (customDateFrom && customDateTo) {
        return sales.filter(sale => {
          const saleDate = new Date(sale.sale_date);
          return isWithinInterval(saleDate, { start: customDateFrom, end: customDateTo });
        });
      }
      return sales;
      
    default:
      return sales;
  }
};

const filterPaymentsByTimeRange = (
  payments: Payment[],
  timeRange: TimeRange,
  customDateFrom?: Date,
  customDateTo?: Date
) => {
  const now = new Date();
  
  switch (timeRange) {
    case "daily":
      const startOfToday = new Date(now.setHours(0, 0, 0, 0));
      const endOfToday = new Date(now.setHours(23, 59, 59, 999));
      return payments.filter(payment => {
        const paymentDate = new Date(payment.date);
        return isWithinInterval(paymentDate, { start: startOfToday, end: endOfToday });
      });
      
    case "weekly":
      const weekStart = startOfWeek(now);
      const weekEnd = endOfWeek(now);
      return payments.filter(payment => {
        const paymentDate = new Date(payment.date);
        return isWithinInterval(paymentDate, { start: weekStart, end: weekEnd });
      });
      
    case "monthly":
      const monthStart = startOfMonth(now);
      const monthEnd = endOfMonth(now);
      return payments.filter(payment => {
        const paymentDate = new Date(payment.date);
        return isWithinInterval(paymentDate, { start: monthStart, end: monthEnd });
      });
      
    case "custom":
      if (customDateFrom && customDateTo) {
        return payments.filter(payment => {
          const paymentDate = new Date(payment.date);
          return isWithinInterval(paymentDate, { start: customDateFrom, end: customDateTo });
        });
      }
      return payments;
      
    default:
      return payments;
  }
};

export const generateReport = (
  reportType: ReportType,
  timeRange: TimeRange,
  products: Product[],
  sales: Sale[],
  payments: Payment[],
  customDateFrom?: Date,
  customDateTo?: Date
) => {
  const doc = new jsPDF();
  const companyName = getCompanyName();
  
  // Header
  doc.setFontSize(20);
  doc.text(companyName, 20, 20);
  doc.setFontSize(16);
  doc.text(`${reportType.toUpperCase()} Report`, 20, 35);
  doc.setFontSize(12);
  doc.text(`Generated on: ${format(new Date(), 'PPP')}`, 20, 45);
  
  let yPosition = 60;
  
  // Filter data based on time range
  const filteredSales = filterSalesByTimeRange(sales, timeRange, customDateFrom, customDateTo);
  const filteredPayments = filterPaymentsByTimeRange(payments, timeRange, customDateFrom, customDateTo);
  
  if (reportType === "all" || reportType === "inventory") {
    // Inventory Section
    doc.setFontSize(14);
    doc.text("Inventory Summary", 20, yPosition);
    yPosition += 10;
    
    const inventoryData = products.map(product => [
      product.product_name,
      product.category,
      product.units.toString(),
      `₹${product.price.toFixed(2)}`,
      product.reorder_level.toString()
    ]);
    
    autoTable(doc, {
      startY: yPosition,
      head: [['Product Name', 'Category', 'Stock', 'Price', 'Reorder Level']],
      body: inventoryData,
      theme: 'grid',
      styles: { fontSize: 10 }
    });
    
    yPosition = (doc as any).lastAutoTable.finalY + 20;
  }
  
  if (reportType === "all" || reportType === "sales") {
    // Sales Section
    doc.setFontSize(14);
    doc.text("Sales Summary", 20, yPosition);
    yPosition += 10;
    
    const salesData = filteredSales.map(sale => [
      format(new Date(sale.sale_date), 'yyyy-MM-dd'),
      sale.product?.product_name || 'Unknown',
      sale.quantity_sold.toString(),
      `₹${sale.selling_price.toFixed(2)}`,
      `₹${(sale.quantity_sold * sale.selling_price).toFixed(2)}`,
      sale.clientName || 'Walk-in'
    ]);
    
    autoTable(doc, {
      startY: yPosition,
      head: [['Date', 'Product', 'Quantity', 'Unit Price', 'Total', 'Client']],
      body: salesData,
      theme: 'grid',
      styles: { fontSize: 10 }
    });
    
    yPosition = (doc as any).lastAutoTable.finalY + 20;
  }
  
  if (reportType === "all" || reportType === "payments") {
    // Payments Section
    doc.setFontSize(14);
    doc.text("Payments Summary", 20, yPosition);
    yPosition += 10;
    
    const paymentsData = filteredPayments.map(payment => [
      format(new Date(payment.date), 'yyyy-MM-dd'),
      payment.clientName,
      `₹${payment.amount.toFixed(2)}`,
      payment.status,
      payment.method,
      payment.description || '-'
    ]);
    
    autoTable(doc, {
      startY: yPosition,
      head: [['Date', 'Client', 'Amount', 'Status', 'Method', 'Description']],
      body: paymentsData,
      theme: 'grid',
      styles: { fontSize: 10 }
    });
  }
  
  return doc;
};
