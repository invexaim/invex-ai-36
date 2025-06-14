
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface EstimateInfoCardProps {
  pendingEstimateForSale: {
    id: string;
    referenceNo: string;
    clientName: string;
    totalAmount: number;
    items: any[];
  };
  estimateInfo: {
    currentIndex: number;
    totalItems: number;
  } | null;
}

const EstimateInfoCard = ({ pendingEstimateForSale, estimateInfo }: EstimateInfoCardProps) => {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm">Recording Sale from Estimate</CardTitle>
          <Badge variant="outline">{pendingEstimateForSale.referenceNo}</Badge>
        </div>
        <CardDescription>
          Client: {pendingEstimateForSale.clientName} | 
          Total: ₹{pendingEstimateForSale.totalAmount.toLocaleString()}
          {estimateInfo && (
            <span className="ml-2">
              Item {estimateInfo.currentIndex + 1} of {estimateInfo.totalItems}
            </span>
          )}
        </CardDescription>
      </CardHeader>
    </Card>
  );
};

export default EstimateInfoCard;
