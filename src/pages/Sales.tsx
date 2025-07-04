
import MainLayout from "@/components/layout/MainLayout";
import { SalesHeader } from "@/components/sales/SalesHeader";
import { SalesListSection } from "@/components/sales/SalesListSection";
import useAppStore from "@/store/appStore";

const Sales = () => {
  const { sales, products, clients } = useAppStore();

  return (
    <MainLayout>
      <div className="space-y-6">
        <SalesHeader />
        <SalesListSection sales={sales} products={products} clients={clients} />
      </div>
    </MainLayout>
  );
};

export default Sales;
