
import { supabase } from '@/integrations/supabase/client';
import { Sale, Product, Client, Payment } from '@/types';

export interface ReportData {
  sales: Sale[];
  products: Product[];
  clients: Client[];
  payments: Payment[];
}

export const fetchReportData = async (): Promise<ReportData> => {
  try {
    const { data: userData, error } = await supabase
      .from('user_data')
      .select('*')
      .single();

    if (error) {
      console.error('Error fetching user data:', error);
      return { sales: [], products: [], clients: [], payments: [] };
    }

    return {
      sales: (userData?.sales as Sale[]) || [],
      products: (userData?.products as Product[]) || [],
      clients: (userData?.clients as Client[]) || [],
      payments: (userData?.payments as Payment[]) || []
    };
  } catch (error) {
    console.error('Error in fetchReportData:', error);
    return { sales: [], products: [], clients: [], payments: [] };
  }
};

export const getFilteredSales = (sales: Sale[], dateFilter: { start?: Date; end?: Date }) => {
  if (!dateFilter.start && !dateFilter.end) return sales;
  
  return sales.filter(sale => {
    const saleDate = new Date(sale.sale_date);
    if (dateFilter.start && saleDate < dateFilter.start) return false;
    if (dateFilter.end && saleDate > dateFilter.end) return false;
    return true;
  });
};

export const calculateSalesMetrics = (sales: Sale[]) => {
  const totalSales = sales.reduce((sum, sale) => sum + (sale.selling_price * sale.quantity_sold), 0);
  const totalInvoices = sales.length;
  const averageSale = totalInvoices > 0 ? totalSales / totalInvoices : 0;

  return {
    totalSales,
    totalInvoices,
    averageSale
  };
};

export const getTopProducts = (sales: Sale[], products: Product[], limit = 10) => {
  const productSales: Record<number, { name: string; quantity: number; revenue: number }> = {};
  
  sales.forEach(sale => {
    if (productSales[sale.product_id]) {
      productSales[sale.product_id].quantity += sale.quantity_sold;
      productSales[sale.product_id].revenue += sale.quantity_sold * sale.selling_price;
    } else {
      const product = products.find(p => p.product_id === sale.product_id);
      productSales[sale.product_id] = {
        name: product?.product_name || 'Unknown Product',
        quantity: sale.quantity_sold,
        revenue: sale.quantity_sold * sale.selling_price
      };
    }
  });

  return Object.values(productSales)
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, limit);
};
