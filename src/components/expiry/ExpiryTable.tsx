
import React, { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Calendar, Package, Search, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import useAppStore from "@/store/appStore";
import { toast } from "sonner";

const ExpiryTable = () => {
  const { productExpiries, updateProductExpiryStatus, deleteProductExpiry } = useAppStore();
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const today = new Date();
  const next7Days = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

  const getExpiryStatus = (expiryDate: string) => {
    const expiry = new Date(expiryDate);
    if (expiry < today) return "expired";
    if (expiry <= next7Days) return "expiring-soon";
    return "active";
  };

  const getStatusBadge = (item: any) => {
    if (item.status === 'disposed') {
      return <Badge variant="secondary">Disposed</Badge>;
    }
    
    const status = getExpiryStatus(item.expiry_date);
    switch (status) {
      case "expired":
        return <Badge variant="destructive">Expired</Badge>;
      case "expiring-soon":
        return <Badge className="bg-orange-500 text-white">Expiring Soon</Badge>;
      default:
        return <Badge variant="default">Active</Badge>;
    }
  };

  const generateReferenceNumber = (expiryId: string, productName: string) => {
    const prefix = productName.substring(0, 3).toUpperCase();
    const shortId = expiryId.split('_')[1] || expiryId.slice(-6);
    return `${prefix}${shortId}`;
  };

  const filteredExpiries = productExpiries.filter(item => {
    const matchesSearch = item.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (item.batch_number && item.batch_number.toLowerCase().includes(searchTerm.toLowerCase()));
    
    if (filterStatus === "all") return matchesSearch;
    if (filterStatus === "disposed") return matchesSearch && item.status === 'disposed';
    if (filterStatus === "expired") return matchesSearch && item.status === 'active' && new Date(item.expiry_date) < today;
    if (filterStatus === "expiring-soon") return matchesSearch && item.status === 'active' && new Date(item.expiry_date) >= today && new Date(item.expiry_date) <= next7Days;
    if (filterStatus === "active") return matchesSearch && item.status === 'active' && new Date(item.expiry_date) > next7Days;
    
    return matchesSearch;
  });

  // Calculate pagination
  const totalPages = Math.ceil(filteredExpiries.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentExpiries = filteredExpiries.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleDispose = (id: string) => {
    updateProductExpiryStatus(id, 'disposed');
    toast.success("Item marked as disposed");
  };

  const handleDelete = (id: string) => {
    deleteProductExpiry(id);
    toast.success("Expiry record deleted");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          Product Expiry Records
        </CardTitle>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search products or batch numbers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Items</SelectItem>
              <SelectItem value="expired">Expired</SelectItem>
              <SelectItem value="expiring-soon">Expiring Soon</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="disposed">Disposed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      
      <CardContent>
        {currentExpiries.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No expiry records found</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>S.No</TableHead>
                    <TableHead>Ref No</TableHead>
                    <TableHead>Expiry Date</TableHead>
                    <TableHead>Product Name</TableHead>
                    <TableHead>Batch Number</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Notes</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentExpiries.map((item, index) => (
                    <TableRow key={item.id}>
                      <TableCell>{startIndex + index + 1}</TableCell>
                      <TableCell>
                        <div className="font-mono text-sm">
                          {generateReferenceNumber(item.id, item.product_name)}
                        </div>
                      </TableCell>
                      <TableCell>{new Date(item.expiry_date).toLocaleDateString()}</TableCell>
                      <TableCell className="font-medium">{item.product_name}</TableCell>
                      <TableCell>{item.batch_number || "-"}</TableCell>
                      <TableCell>{item.quantity}</TableCell>
                      <TableCell>{getStatusBadge(item)}</TableCell>
                      <TableCell className="max-w-48 truncate" title={item.notes}>
                        {item.notes || "-"}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {item.status === 'active' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDispose(item.id)}
                            >
                              Mark as Disposed
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDelete(item.id)}
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

            {/* Custom Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-muted-foreground">
                  Showing {startIndex + 1} to {Math.min(endIndex, filteredExpiries.length)} of {filteredExpiries.length} expiry records
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="flex items-center gap-1"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>
                  
                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <Button
                        key={page}
                        variant={currentPage === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => handlePageChange(page)}
                        className="w-8 h-8 p-0"
                      >
                        {page}
                      </Button>
                    ))}
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="flex items-center gap-1"
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default ExpiryTable;
