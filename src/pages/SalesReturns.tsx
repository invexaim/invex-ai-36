
import MainLayout from "@/components/layout/MainLayout";
import { SalesReturnList } from "@/components/sales/SalesReturnList";
import useAppStore from "@/store/appStore";

const SalesReturns = () => {
  const { sales, products, clients } = useAppStore();

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Sales Returns</h1>
          <p className="text-muted-foreground">Manage product returns and refunds</p>
        </div>
        <SalesReturnList sales={sales} products={products} clients={clients} />
      </div>
    </MainLayout>
  );
};

export default SalesReturns;
