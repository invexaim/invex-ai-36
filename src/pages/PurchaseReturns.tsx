
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search, RotateCcw, Plus, Eye, Edit, Trash2 } from "lucide-react";
import { PurchaseReturnDialog } from "@/components/purchases/PurchaseReturnDialog";

interface PurchaseReturn {
  id: string;
  returnNo: string;
  purchaseOrderNo: string;
  supplierName: string;
  returnDate: string;
  totalAmount: number;
  status: "pending" | "approved" | "completed";
  reason: string;
}

const PurchaseReturns = () => {
  const [purchaseReturns, setPurchaseReturns] = useState<PurchaseReturn[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isReturnDialogOpen, setIsReturnDialogOpen] = useState(false);

  const filteredReturns = purchaseReturns.filter((returnItem) =>
    returnItem.returnNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    returnItem.supplierName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    returnItem.purchaseOrderNo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleReturnCreated = (returnData: any) => {
    setPurchaseReturns(prev => [returnData, ...prev]);
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
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold">Purchase Returns</h1>
        <p className="text-muted-foreground">Manage returns to suppliers and track refund status</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <RotateCcw className="h-5 w-5" />
                Purchase Returns
              </CardTitle>
              <CardDescription>
                Track and manage all returns to suppliers
              </CardDescription>
            </div>
            <Button onClick={() => setIsReturnDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
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
              <h3 className="text-lg font-medium text-gray-900 mb-2">No purchase returns found</h3>
              <p className="text-gray-500 mb-4">
                {purchaseReturns.length === 0 
                  ? "Create your first purchase return to get started" 
                  : "No returns match your search criteria"
                }
              </p>
              {purchaseReturns.length === 0 && (
                <Button onClick={() => setIsReturnDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Return
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Return No</TableHead>
                    <TableHead>PO No</TableHead>
                    <TableHead>Supplier</TableHead>
                    <TableHead>Return Date</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredReturns.map((returnItem) => (
                    <TableRow key={returnItem.id}>
                      <TableCell className="font-medium">
                        {returnItem.returnNo}
                      </TableCell>
                      <TableCell>{returnItem.purchaseOrderNo}</TableCell>
                      <TableCell>{returnItem.supplierName}</TableCell>
                      <TableCell>
                        {new Date(returnItem.returnDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell>₹{returnItem.totalAmount.toFixed(2)}</TableCell>
                      <TableCell>{returnItem.reason}</TableCell>
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
                          <Button size="sm" variant="outline">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline">
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

      <PurchaseReturnDialog
        open={isReturnDialogOpen}
        onOpenChange={setIsReturnDialogOpen}
        onReturnCreated={handleReturnCreated}
      />
    </div>
  );
};

export default PurchaseReturns;
