
import MainLayout from "@/components/layout/MainLayout";
import { InvoiceList } from "@/components/sales/InvoiceList";
import useAppStore from "@/store/appStore";

const SalesInvoices = () => {
  const { sales, products, clients } = useAppStore();

  // Convert sales data to invoice format for the component
  const invoices = sales.map(sale => ({
    id: sale.sale_id.toString(),
    invoiceNumber: `INV-${sale.sale_id}`,
    clientName: clients.find(c => c.client_id === sale.client_id)?.client_name || 'Unknown Client',
    date: sale.sale_date,
    amount: sale.selling_price * sale.quantity_sold,
    status: 'paid' as const,
    items: [{
      productName: products.find(p => p.product_id === sale.product_id)?.product_name || 'Unknown Product',
      quantity: sale.quantity_sold,
      price: sale.selling_price,
      total: sale.selling_price * sale.quantity_sold
    }]
  }));

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Invoice List</h1>
          <p className="text-muted-foreground">Manage and view all your sales invoices</p>
        </div>
        <InvoiceList invoices={invoices} />
      </div>
    </MainLayout>
  );
};

export default SalesInvoices;
