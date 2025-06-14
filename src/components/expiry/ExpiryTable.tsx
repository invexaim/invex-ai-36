
import React, { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Calendar, Package, Search, Trash2 } from "lucide-react";
import useAppStore from "@/store/appStore";
import { toast } from "sonner";

const ExpiryTable = () => {
  const { productExpiries, updateProductExpiryStatus, deleteProductExpiry } = useAppStore();
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");

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
        {filteredExpiries.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No expiry records found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product Name</TableHead>
                  <TableHead>Batch Number</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Expiry Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Notes</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredExpiries.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.product_name}</TableCell>
                    <TableCell>{item.batch_number || "-"}</TableCell>
                    <TableCell>{item.quantity}</TableCell>
                    <TableCell>{new Date(item.expiry_date).toLocaleDateString()}</TableCell>
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
        )}
      </CardContent>
    </Card>
  );
};

export default ExpiryTable;
