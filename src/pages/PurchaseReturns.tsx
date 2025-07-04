
import MainLayout from "@/components/layout/MainLayout";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Package, Search, Calendar, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";

interface PurchaseReturn {
  id: string;
  return_no: string;
  supplier_name: string;
  return_date: string;
  status: string;
  items?: any[];
  total_amount: number;
  reason: string;
}

const PurchaseReturns = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");

  const { data: returnsData, isLoading } = useQuery({
    queryKey: ['purchase-returns'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_data')
        .select('purchase_returns')
        .single();
      
      if (error) throw error;
      return data?.purchase_returns || [];
    }
  });

  // Safely convert the data to an array of returns with proper type casting
  const returns: PurchaseReturn[] = Array.isArray(returnsData) 
    ? (returnsData as any[]).filter(item => 
        typeof item === 'object' && 
        item !== null && 
        typeof item.return_no === 'string' &&
        typeof item.supplier_name === 'string'
      ).map(item => ({
        id: item.id || '',
        return_no: item.return_no || '',
        supplier_name: item.supplier_name || '',
        return_date: item.return_date || '',
        status: item.status || 'pending',
        items: item.items || [],
        total_amount: item.total_amount || 0,
        reason: item.reason || ''
      }))
    : [];

  const filteredReturns = returns.filter((returnItem: PurchaseReturn) =>
    returnItem.supplier_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    returnItem.return_no?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Purchase Returns</h1>
            <p className="text-muted-foreground">View and manage all your purchase returns</p>
          </div>
          <Button onClick={() => navigate("/purchases/returns/create")}>
            <Plus className="h-4 w-4 mr-2" />
            New Return
          </Button>
        </div>

        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
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
            <Package className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No returns found</h3>
            <p className="mt-1 text-sm text-gray-500">You haven't created any purchase returns yet.</p>
            <div className="mt-6">
              <Button onClick={() => navigate("/purchases/returns/create")}>
                <Plus className="h-4 w-4 mr-2" />
                New Return
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredReturns.map((returnItem: PurchaseReturn) => (
              <Card key={returnItem.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{returnItem.return_no}</CardTitle>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant={returnItem.status === "completed" ? "default" : "secondary"}>
                          {returnItem.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-600">{returnItem.supplier_name}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-600">
                        {returnItem.return_date ? format(new Date(returnItem.return_date), 'MMM dd, yyyy') : 'N/A'}
                      </span>
                    </div>
                    
                    <div className="text-sm text-gray-600">
                      <strong>Items:</strong> {returnItem.items?.length || 0}
                    </div>
                    
                    <div className="text-sm text-gray-600">
                      <strong>Reason:</strong> {returnItem.reason}
                    </div>
                    
                    <div className="text-lg font-semibold pt-2 border-t">
                      Total: ₹{returnItem.total_amount?.toFixed(2) || '0.00'}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default PurchaseReturns;
