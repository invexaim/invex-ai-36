
import { format } from "date-fns";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import { Product, Sale, Payment } from "@/types";
import { TimeRange } from "./TimeRangeSelection";
import { ReportType } from "./ReportTypeSelection";

// Define the extended jsPDF type with autoTable
interface jsPDFWithAutoTable extends jsPDF {
  lastAutoTable: {
    finalY: number;
  };
  autoTable: (options: any) => void;
}

// Get report type title
export const getReportTypeTitle = (type: ReportType): string => {
  switch (type) {
    case "local": return "Local Stock";
    case "warehouse": return "Warehouse Stock";
    case "sales": return "Sales";
    case "payments": return "Payments";
  }
};

// Get time range title
export const getTimeRangeTitle = (range: TimeRange): string => {
  switch (range) {
    case "daily": return "Daily";
    case "thisMonth": return "This Month";
    case "lastMonth": return "Last Month";
    case "thisQuarter": return "This Quarter";
    case "thisYear": return "This Year";
    case "custom": return "Custom Range";
  }
};

// Get date range text
export const getDateRangeText = (
  timeRange: TimeRange, 
  customDateFrom?: Date, 
  customDateTo?: Date
): string => {
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

// Filter items by date range
export const filterByDateRange = <T extends { [key: string]: any }>(
  items: T[],
  dateField: string,
  timeRange: TimeRange,
  customDateFrom?: Date,
  customDateTo?: Date
): T[] => {
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

// Generate products report
export const generateProductsReport = (doc: jsPDF, items: Product[]): void => {
  // Cast to our custom type that includes the autoTable method
  const pdfDoc = doc as jsPDFWithAutoTable;
  
  pdfDoc.autoTable({
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
  
  pdfDoc.setFontSize(12);
  pdfDoc.text(`Summary:`, 15, pdfDoc.lastAutoTable.finalY + 10);
  pdfDoc.text(`Total Products: ${totalItems}`, 15, pdfDoc.lastAutoTable.finalY + 20);
  pdfDoc.text(`Out of Stock: ${outOfStock}`, 15, pdfDoc.lastAutoTable.finalY + 30);
  pdfDoc.text(`Low Stock: ${lowStock}`, 15, pdfDoc.lastAutoTable.finalY + 40);
  pdfDoc.text(`Total Inventory Value: ₹${totalValue.toFixed(2)}`, 15, pdfDoc.lastAutoTable.finalY + 50);
};

// Generate sales report
export const generateSalesReport = (
  doc: jsPDF, 
  items: Sale[], 
  timeRange: TimeRange,
  customDateFrom?: Date,
  customDateTo?: Date
): void => {
  // Cast to our custom type that includes the autoTable method
  const pdfDoc = doc as jsPDFWithAutoTable;
  
  // Filter sales based on time range
  const filteredSales = filterByDateRange(items, 'sale_date', timeRange, customDateFrom, customDateTo);
  
  pdfDoc.autoTable({
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
  
  pdfDoc.setFontSize(12);
  pdfDoc.text(`Summary:`, 15, pdfDoc.lastAutoTable.finalY + 10);
  pdfDoc.text(`Total Sales: ${totalSales}`, 15, pdfDoc.lastAutoTable.finalY + 20);
  pdfDoc.text(`Total Quantity Sold: ${totalQuantity}`, 15, pdfDoc.lastAutoTable.finalY + 30);
  pdfDoc.text(`Total Revenue: ₹${totalRevenue.toFixed(2)}`, 15, pdfDoc.lastAutoTable.finalY + 40);
};

// Generate payments report
export const generatePaymentsReport = (
  doc: jsPDF, 
  items: Payment[],
  timeRange: TimeRange,
  customDateFrom?: Date,
  customDateTo?: Date
): void => {
  // Cast to our custom type that includes the autoTable method
  const pdfDoc = doc as jsPDFWithAutoTable;
  
  // Filter payments based on time range
  const filteredPayments = filterByDateRange(items, 'date', timeRange, customDateFrom, customDateTo);
  
  pdfDoc.autoTable({
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
  
  pdfDoc.setFontSize(12);
  pdfDoc.text(`Summary:`, 15, pdfDoc.lastAutoTable.finalY + 10);
  pdfDoc.text(`Total Payments: ${totalPayments}`, 15, pdfDoc.lastAutoTable.finalY + 20);
  pdfDoc.text(`Total Amount: ₹${totalAmount.toFixed(2)}`, 15, pdfDoc.lastAutoTable.finalY + 30);
  pdfDoc.text(`Paid Amount: ₹${paidAmount.toFixed(2)}`, 15, pdfDoc.lastAutoTable.finalY + 40);
  pdfDoc.text(`Pending Amount: ₹${pendingAmount.toFixed(2)}`, 15, pdfDoc.lastAutoTable.finalY + 50);
};

// Generate report based on type
export const generateReport = (
  reportType: ReportType,
  timeRange: TimeRange,
  products: Product[],
  sales: Sale[],
  payments: Payment[],
  customDateFrom?: Date,
  customDateTo?: Date
): jsPDF => {
  // Create new PDF document
  const doc = new jsPDF();
  
  // Add title
  const title = `${getReportTypeTitle(reportType)} Report - ${getTimeRangeTitle(timeRange)}`;
  doc.setFontSize(16);
  doc.text(title, 15, 15);
  
  // Add date range info
  const dateRange = getDateRangeText(timeRange, customDateFrom, customDateTo);
  doc.setFontSize(10);
  doc.text(`Period: ${dateRange}`, 15, 25);
  doc.text(`Generated on: ${format(new Date(), "PPP")}`, 15, 30);
  
  // Add a line separator
  doc.line(15, 35, 195, 35);
  
  // Set font size for content
  doc.setFontSize(12);
  
  // Generate content based on report type
  switch (reportType) {
    case "local":
      generateProductsReport(doc, products.filter(p => !p.product_name.includes("(Warehouse)")));
      break;
    case "warehouse":
      generateProductsReport(doc, products.filter(p => p.product_name.includes("(Warehouse)")));
      break;
    case "sales":
      generateSalesReport(doc, sales, timeRange, customDateFrom, customDateTo);
      break;
    case "payments":
      generatePaymentsReport(doc, payments, timeRange, customDateFrom, customDateTo);
      break;
  }
  
  return doc;
};
