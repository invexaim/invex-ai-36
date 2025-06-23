
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search, RotateCcw, Eye, FileText } from "lucide-react";
import useAppStore from "@/store/appStore";
import { SalesReturnDialog } from "./SalesReturnDialog";

interface SalesReturn {
  id: number;
  originalSaleId: number;
  productName: string;
  clientName: string;
  returnQuantity: number;
  returnAmount: number;
  returnReason: string;
  refundType: string;
  returnDate: string;
  status: "pending" | "approved" | "completed";
}

export function SalesReturnList() {
  const { sales } = useAppStore();
  const [returns, setReturns] = useState<SalesReturn[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isReturnDialogOpen, setIsReturnDialogOpen] = useState(false);
  const [selectedSale, setSelectedSale] = useState<any>(null);

  const filteredReturns = returns.filter((returnItem) =>
    returnItem.productName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    returnItem.clientName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateReturn = (sale: any) => {
    setSelectedSale(sale);
    setIsReturnDialogOpen(true);
  };

  const handleReturnCreated = (returnData: any) => {
    setReturns(prev => [returnData, ...prev]);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-green-100 text-green-800";
      case "approved": return "bg-blue-100 text-blue-800";
      case "pending": return "bg-yellow-100 text-yellow-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      {/* Available Sales for Return */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Available Sales for Return
          </CardTitle>
          <CardDescription>
            Select a sale to create a return
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sales.slice(0, 10).map((sale) => (
                  <TableRow key={sale.sale_id}>
                    <TableCell>
                      {new Date(sale.sale_date).toLocaleDateString()}
                    </TableCell>
                    <TableCell>{sale.product?.product_name}</TableCell>
                    <TableCell>{sale.clientName || "No client"}</TableCell>
                    <TableCell>{sale.quantity_sold}</TableCell>
                    <TableCell>₹{(sale.quantity_sold * sale.selling_price).toFixed(2)}</TableCell>
                    <TableCell className="text-right">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleCreateReturn(sale)}
                      >
                        <RotateCcw className="h-4 w-4 mr-2" />
                        Return
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Returns List */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <RotateCcw className="h-5 w-5" />
                Sales Returns
              </CardTitle>
              <CardDescription>
                Track all sales returns and refunds
              </CardDescription>
            </div>
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
              <p className="text-gray-500">
                {returns.length === 0 
                  ? "No sales returns have been created yet" 
                  : "No returns match your search criteria"
                }
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Return Date</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredReturns.map((returnItem) => (
                    <TableRow key={returnItem.id}>
                      <TableCell>
                        {new Date(returnItem.returnDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell>{returnItem.productName}</TableCell>
                      <TableCell>{returnItem.clientName || "No client"}</TableCell>
                      <TableCell>{returnItem.returnQuantity}</TableCell>
                      <TableCell>₹{returnItem.returnAmount.toFixed(2)}</TableCell>
                      <TableCell>{returnItem.returnReason}</TableCell>
                      <TableCell className="capitalize">{returnItem.refundType}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(returnItem.status)}>
                          {returnItem.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4" />
                        </Button>
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
