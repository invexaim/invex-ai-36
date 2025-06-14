
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
}

const EstimateItemDisplay = ({ estimateInfo, selectedProduct }: EstimateItemDisplayProps) => {
  if (!estimateInfo) return null;

  const currentItem = estimateInfo.items[estimateInfo.currentIndex];

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm">Product from Estimate</CardTitle>
          <Badge variant="secondary">
            Item {estimateInfo.currentIndex + 1} of {estimateInfo.totalItems}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium text-gray-600">Product</p>
            <p className="text-sm font-semibold">
              {selectedProduct?.product_name || currentItem?.product_name || 'Unknown Product'}
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
            <p className="text-sm font-semibold">
              {currentItem?.quantity || 1}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">Available Stock</p>
            <p className="text-sm font-semibold">
              {selectedProduct ? parseInt(selectedProduct.units as string) : 'N/A'}
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
      </CardContent>
    </Card>
  );
};

export default EstimateItemDisplay;
