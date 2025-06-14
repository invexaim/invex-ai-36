
import ProductSelector from "./ProductSelector";
import ClientSelector from "./ClientSelector";
import SaleDetailsForm from "./SaleDetailsForm";
import EstimateItemDisplay from "./EstimateItemDisplay";

interface SaleFormContentProps {
  isFromEstimate: boolean;
  estimateInfo: {
    items: any[];
    currentIndex: number;
    totalItems: number;
    hasMoreItems: boolean;
  } | null;
  selectedProduct: any;
  products: any[];
  clients: any[];
  newSaleData: {
    product_id: number;
    quantity_sold: number;
    selling_price: number;
    clientId: number;
    clientName: string;
  };
  formErrors: {
    product_id: boolean;
    quantity_sold: boolean;
    selling_price: boolean;
    clientName: boolean;
  };
  isSubmitting: boolean;
  onProductChange: (productId: number, price: number) => void;
  onClientChange: (clientId: number, clientName: string) => void;
  onQuantityChange: (quantity: number) => void;
  onPriceChange: (price: number) => void;
  onAddClient: (clientData: { name: string; email: string; phone: string; joinDate: string; openInvoices: number }) => void;
}

const SaleFormContent = ({
  isFromEstimate,
  estimateInfo,
  selectedProduct,
  products,
  clients,
  newSaleData,
  formErrors,
  isSubmitting,
  onProductChange,
  onClientChange,
  onQuantityChange,
  onPriceChange,
  onAddClient
}: SaleFormContentProps) => {
  return (
    <>
      {/* Conditional rendering based on estimate presence */}
      {isFromEstimate ? (
        // Show read-only estimate item details
        <EstimateItemDisplay
          estimateInfo={estimateInfo}
          selectedProduct={selectedProduct}
        />
      ) : (
        // Show normal product selector for non-estimate sales
        <ProductSelector
          products={products || []}
          selectedProductId={newSaleData.product_id}
          onProductChange={onProductChange}
          error={formErrors.product_id}
          disabled={isSubmitting}
        />
      )}
      
      {/* Only show client selector for non-estimate sales */}
      {!isFromEstimate && (
        <ClientSelector
          clients={clients || []}
          selectedClientId={newSaleData.clientId}
          selectedClientName={newSaleData.clientName}
          onClientChange={onClientChange}
          onAddClient={onAddClient}
          error={formErrors.clientName}
          disabled={isSubmitting}
        />
      )}
      
      <SaleDetailsForm
        quantity={newSaleData.quantity_sold}
        price={newSaleData.selling_price}
        maxQuantity={selectedProduct ? parseInt(selectedProduct.units as string) : undefined}
        onQuantityChange={onQuantityChange}
        onPriceChange={onPriceChange}
        quantityError={formErrors.quantity_sold}
        priceError={formErrors.selling_price}
        disabled={isSubmitting}
      />
    </>
  );
};

export default SaleFormContent;
