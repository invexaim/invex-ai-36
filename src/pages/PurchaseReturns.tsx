
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Package, Calendar, User, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { usePurchaseReturns } from "@/components/purchases/hooks/usePurchaseReturns";

const PurchaseReturns = () => {
  const navigate = useNavigate();
  const { returns, loading, updateReturnStatus } = usePurchaseReturns();

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "approved":
        return "bg-blue-100 text-blue-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleStatusUpdate = (returnId: string, newStatus: any) => {
    updateReturnStatus(returnId, newStatus);
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex justify-center items-center h-64">
          <div className="text-lg">Loading purchase returns...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Purchase Returns</h1>
          <p className="text-gray-600">Manage your purchase return requests</p>
        </div>
        <Button onClick={() => navigate("/purchases/returns/create")}>
          <Plus className="h-4 w-4 mr-2" />
          New Return
        </Button>
      </div>

      {returns.length === 0 ? (
        <div className="text-center py-12">
          <Package className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No purchase returns</h3>
          <p className="mt-1 text-sm text-gray-500">Get started by creating a new purchase return.</p>
          <div className="mt-6">
            <Button onClick={() => navigate("/purchases/returns/create")}>
              <Plus className="h-4 w-4 mr-2" />
              New Return
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {returns.map((returnItem) => (
            <Card key={returnItem.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{returnItem.returnNo}</CardTitle>
                    <div className="flex items-center gap-2 mt-2">
                      <User className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-600">{returnItem.supplierName}</span>
                    </div>
                  </div>
                  <Badge className={getStatusColor(returnItem.status)}>
                    {returnItem.status.charAt(0).toUpperCase() + returnItem.status.slice(1)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">PO: {returnItem.purchaseOrderNo}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">{returnItem.productName}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">{new Date(returnItem.returnDate).toLocaleDateString()}</span>
                  </div>
                  <div className="text-sm">
                    Qty: {returnItem.returnQuantity}
                  </div>
                </div>
                
                <div className="mb-4">
                  <div className="text-sm font-medium text-gray-700 mb-1">Return Reason:</div>
                  <div className="text-sm text-gray-600">{returnItem.returnReason}</div>
                </div>
                
                {returnItem.notes && (
                  <div className="mb-4">
                    <div className="text-sm font-medium text-gray-700 mb-1">Notes:</div>
                    <div className="text-sm text-gray-600">{returnItem.notes}</div>
                  </div>
                )}
                
                {returnItem.status === "pending" && (
                  <div className="flex gap-2 justify-end">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleStatusUpdate(returnItem.id, "rejected")}
                    >
                      Reject
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleStatusUpdate(returnItem.id, "approved")}
                    >
                      Approve
                    </Button>
                  </div>
                )}
                
                {returnItem.status === "approved" && (
                  <div className="flex justify-end">
                    <Button
                      size="sm"
                      onClick={() => handleStatusUpdate(returnItem.id, "completed")}
                    >
                      Mark Completed
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default PurchaseReturns;
