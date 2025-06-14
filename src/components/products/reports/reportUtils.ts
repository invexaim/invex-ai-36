
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format, isWithinInterval, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';
import { Product, Sale, Payment } from '@/types';
import useCompanyStore from '@/store/slices/companySlice';

export type ReportType = "all" | "inventory" | "sales" | "payments";
export type TimeRange = "daily" | "weekly" | "monthly" | "custom";

const getCompanyInfo = () => {
  const { details, address, logo } = useCompanyStore.getState();
  return { details, address, logo };
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
  const { details, address, logo } = getCompanyInfo();
  
  // Company Header Section
  let yPosition = 20;
  
  // Add logo if available
  if (logo.logoUrl) {
    try {
      // Note: In a real implementation, you'd need to convert the image to base64
      // For now, we'll skip the logo in PDF but include space for it
      yPosition += 20;
    } catch (error) {
      console.log('Could not add logo to PDF');
    }
  }
  
  // Company Name
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text(details.companyName || 'Your Company Name', 20, yPosition);
  yPosition += 10;
  
  // Company Contact Info
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  
  if (details.phone) {
    doc.text(`Phone: ${details.phone}`, 20, yPosition);
    yPosition += 5;
  }
  
  if (details.email) {
    doc.text(`Email: ${details.email}`, 20, yPosition);
    yPosition += 5;
  }
  
  if (details.taxId) {
    doc.text(`GSTIN: ${details.taxId}`, 20, yPosition);
    yPosition += 5;
  }
  
  // Company Address
  if (address.street || address.city) {
    const addressLine = [];
    if (address.street) addressLine.push(address.street);
    if (address.aptSuite) addressLine.push(address.aptSuite);
    
    if (addressLine.length > 0) {
      doc.text(addressLine.join(', '), 20, yPosition);
      yPosition += 5;
    }
    
    const cityLine = [];
    if (address.city) cityLine.push(address.city);
    if (address.state) cityLine.push(address.state);
    if (address.postalCode) cityLine.push(address.postalCode);
    
    if (cityLine.length > 0) {
      doc.text(cityLine.join(', '), 20, yPosition);
      yPosition += 5;
    }
    
    if (address.country) {
      doc.text(address.country, 20, yPosition);
      yPosition += 5;
    }
  }
  
  // Add separator line
  yPosition += 5;
  doc.setLineWidth(0.5);
  doc.line(20, yPosition, 190, yPosition);
  yPosition += 15;
  
  // Report Title and Date
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(`${reportType.toUpperCase()} Report`, 20, yPosition);
  yPosition += 10;
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(`Generated on: ${format(new Date(), 'PPP')}`, 20, yPosition);
  yPosition += 15;
  
  // Filter data based on time range
  const filteredSales = filterSalesByTimeRange(sales, timeRange, customDateFrom, customDateTo);
  const filteredPayments = filterPaymentsByTimeRange(payments, timeRange, customDateFrom, customDateTo);
  
  if (reportType === "all" || reportType === "inventory") {
    // Inventory Section
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
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
    doc.setFont('helvetica', 'bold');
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
    doc.setFont('helvetica', 'bold');
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
