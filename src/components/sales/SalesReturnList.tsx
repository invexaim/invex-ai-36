
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search, RotateCcw, Eye, Trash2 } from "lucide-react";
import { SalesReturnDialog } from "./SalesReturnDialog";
import { useLocation } from "react-router-dom";
import useAppStore from "@/store/appStore";

interface SalesReturn {
  id: string;
  originalSaleId?: number;
  originalInvoiceId?: string;
  invoiceNo?: string;
  productId?: number;
  productName: string;
  clientName: string;
  returnQuantity: number;
  returnAmount: number;
  returnReason: string;
  refundType: string;
  notes: string;
  returnDate: string;
  status: "pending" | "approved" | "completed" | "rejected";
}

export function SalesReturnList() {
  const [returns, setReturns] = useState<SalesReturn[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isReturnDialogOpen, setIsReturnDialogOpen] = useState(false);
  const [selectedSale, setSelectedSale] = useState(null);
  
  const location = useLocation();
  const { sales } = useAppStore();

  // Handle invoice return from navigation state
  useEffect(() => {
    if (location.state?.returnData) {
      const { returnData } = location.state;
      
      // Create a return entry from invoice data
      const invoiceReturn: SalesReturn = {
        id: Date.now().toString(),
        originalInvoiceId: returnData.originalInvoiceId,
        invoiceNo: returnData.invoiceNo,
        productName: returnData.items?.map((item: any) => item.name).join(", ") || "Multiple Items",
        clientName: returnData.clientName,
        returnQuantity: returnData.items?.reduce((sum: number, item: any) => sum + item.quantity, 0) || 1,
        returnAmount: returnData.totalAmount,
        returnReason: "Invoice Return",
        refundType: "refund",
        notes: `Return for invoice ${returnData.invoiceNo}`,
        returnDate: new Date().toISOString(),
        status: "pending"
      };
      
      setReturns(prev => [invoiceReturn, ...prev]);
      
      // Clear the navigation state
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const filteredReturns = returns.filter((returnItem) =>
    returnItem.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    returnItem.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (returnItem.invoiceNo && returnItem.invoiceNo.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleCreateReturn = () => {
    setSelectedSale(null);
    setIsReturnDialogOpen(true);
  };

  const handleReturnCreated = (returnData: any) => {
    const newReturn: SalesReturn = {
      ...returnData,
      id: Date.now().toString(),
    };
    setReturns(prev => [newReturn, ...prev]);
  };

  const handleDeleteReturn = (returnId: string) => {
    if (confirm("Are you sure you want to delete this return?")) {
      setReturns(prev => prev.filter(returnItem => returnItem.id !== returnId));
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-green-100 text-green-800";
      case "approved": return "bg-blue-100 text-blue-800";
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "rejected": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getRefundTypeColor = (type: string) => {
    switch (type) {
      case "refund": return "bg-green-100 text-green-800";
      case "credit": return "bg-blue-100 text-blue-800";
      case "exchange": return "bg-purple-100 text-purple-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <RotateCcw className="h-5 w-5" />
                Sales Returns
              </CardTitle>
              <CardDescription>
                Manage product returns and refunds
              </CardDescription>
            </div>
            <Button onClick={handleCreateReturn}>
              Create Return
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search returns..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {filteredReturns.length === 0 ? (
            <div className="text-center py-12">
              <RotateCcw className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No returns found</h3>
              <p className="text-gray-500 mb-4">
                {returns.length === 0 
                  ? "No sales returns have been processed yet" 
                  : "No returns match your search criteria"
                }
              </p>
              {returns.length === 0 && (
                <Button onClick={handleCreateReturn}>
                  Create First Return
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product/Invoice</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Refund Type</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredReturns.map((returnItem) => (
                    <TableRow key={returnItem.id}>
                      <TableCell className="font-medium">
                        <div>
                          <div>{returnItem.productName}</div>
                          {returnItem.invoiceNo && (
                            <div className="text-sm text-gray-500">
                              Invoice: {returnItem.invoiceNo}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{returnItem.clientName}</TableCell>
                      <TableCell>{returnItem.returnQuantity}</TableCell>
                      <TableCell>₹{returnItem.returnAmount.toFixed(2)}</TableCell>
                      <TableCell>
                        <span className="text-sm">{returnItem.returnReason}</span>
                      </TableCell>
                      <TableCell>
                        <Badge className={getRefundTypeColor(returnItem.refundType)}>
                          {returnItem.refundType}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(returnItem.returnDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(returnItem.status)}>
                          {returnItem.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button size="sm" variant="outline">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleDeleteReturn(returnItem.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <SalesReturnDialog
        open={isReturnDialogOpen}
        onOpenChange={setIsReturnDialogOpen}
        sale={selectedSale}
        onReturnCreated={handleReturnCreated}
      />
    </div>
  );
}
