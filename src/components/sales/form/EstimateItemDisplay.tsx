
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Product {
  product_id: number;
  product_name: string;
  price: number;
  units: string | number;
}

interface EstimateItemDisplayProps {
  estimateInfo: {
    items: any[];
    currentIndex: number;
    totalItems: number;
    hasMoreItems: boolean;
  } | null;
  selectedProduct?: Product;
  products: Product[];
}

const EstimateItemDisplay = ({ estimateInfo, selectedProduct, products }: EstimateItemDisplayProps) => {
  if (!estimateInfo) return null;

  const currentItem = estimateInfo.items[estimateInfo.currentIndex];
  
  // Enhanced product matching - try ID first, then name
  const findProductFromItem = (item: any) => {
    if (!products) return null;
    
    // Try matching by product_id first (for new estimates)
    if (item.product_id) {
      const productById = products.find(p => p.product_id === item.product_id);
      if (productById) return productById;
    }
    
    // Fallback to name matching (for older estimates)
    const productName = item.name || item.product_name;
    if (productName) {
      return products.find(p => p.product_name === productName);
    }
    
    return null;
  };
  
  const productFromEstimate = findProductFromItem(currentItem);
  const displayProduct = selectedProduct || productFromEstimate;
  const productName = displayProduct?.product_name || currentItem?.name || currentItem?.product_name || 'Unknown Product';
  
  // Check if product exists in current inventory
  const productExists = !!productFromEstimate;
  const availableStock = displayProduct ? parseInt(displayProduct.units as string) : 0;
  const requestedQuantity = currentItem?.quantity || 1;
  const hasInsufficientStock = availableStock < requestedQuantity;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm">Product from Estimate</CardTitle>
          <Badge variant="secondary">
            Item {estimateInfo.currentIndex + 1} of {estimateInfo.totalItems}
          </Badge>
        </div>
        {!productExists && (
          <CardDescription className="text-red-600">
            ⚠️ This product is no longer available in your inventory
          </CardDescription>
        )}
        {productExists && hasInsufficientStock && (
          <CardDescription className="text-orange-600">
            ⚠️ Insufficient stock: {availableStock} available, {requestedQuantity} requested
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium text-gray-600">Product</p>
            <p className={`text-sm font-semibold ${!productExists ? 'text-red-600' : ''}`}>
              {productName}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">Estimated Price</p>
            <p className="text-sm font-semibold">
              ₹{currentItem?.price?.toFixed(2) || '0.00'}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">Quantity</p>
            <p className={`text-sm font-semibold ${hasInsufficientStock ? 'text-orange-600' : ''}`}>
              {currentItem?.quantity || 1}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">Available Stock</p>
            <p className={`text-sm font-semibold ${hasInsufficientStock ? 'text-orange-600' : ''}`}>
              {productExists ? availableStock : 'N/A'}
            </p>
          </div>
        </div>
        
        {estimateInfo.hasMoreItems && (
          <div className="mt-3 p-2 bg-blue-50 rounded-md">
            <p className="text-xs text-blue-600">
              After recording this item, you'll proceed to the next item in the estimate.
            </p>
          </div>
        )}
        
        {!productExists && (
          <div className="mt-3 p-2 bg-red-50 rounded-md">
            <p className="text-xs text-red-600">
              This product was removed from your inventory. You may need to add it back or skip this item.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EstimateItemDisplay;
