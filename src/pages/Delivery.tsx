
import React, { useState, useEffect } from 'react';
import { Truck, PlusCircle, Download, Pencil, Trash2, CheckCircle2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import useAppStore from '@/store/appStore';
import { CreateChallanDialog } from '@/components/delivery/CreateChallanDialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface DeliveryChallan {
  id: string;
  clientName: string;
  date: string;
  challanNo: string;
  itemsCount: number;
  status: "delivered" | "pending" | "received";
  createdAt: string;
}

const Delivery = () => {
  const [challans, setChallans] = useState<DeliveryChallan[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const products = useAppStore((state) => state.products);

  // Mock delivery challans data
  useEffect(() => {
    const storedChallans = localStorage.getItem('deliveryChallans');
    if (storedChallans) {
      try {
        const parsed = JSON.parse(storedChallans);
        if (Array.isArray(parsed)) {
          setChallans(parsed);
          return;
        }
      } catch (e) {
        console.error("Error parsing stored challans:", e);
      }
    }
    
    // Default to empty array
    setChallans([]);
  }, []);

  const handleCreateChallan = (challanData: any) => {
    const newChallan = {
      id: challanData.challanNo || `DC-${Date.now().toString().slice(-6)}`,
      clientName: challanData.clientName,
      date: challanData.date,
      challanNo: challanData.challanNo || `DC-${Date.now().toString().slice(-6)}`,
      itemsCount: challanData.items.length,
      status: challanData.status || "delivered",
      createdAt: challanData.createdAt || new Date().toISOString(),
    };
    
    const updatedChallans = [newChallan, ...challans];
    setChallans(updatedChallans);
    
    // Store locally for now
    localStorage.setItem('deliveryChallans', JSON.stringify(updatedChallans));
  };

  const deleteChallan = (id: string) => {
    const updatedChallans = challans.filter(ch => ch.id !== id);
    setChallans(updatedChallans);
    localStorage.setItem('deliveryChallans', JSON.stringify(updatedChallans));
  };

  function getStatusColor(status: string) {
    switch (status) {
      case "delivered":
        return "bg-green-100 text-green-800 border-green-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "received":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Truck className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold tracking-tight">
            Delivery Challans
          </h1>
        </div>
        <Button onClick={() => setIsDialogOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Create New Challan
        </Button>
      </div>

      {/* Main Content */}
      {challans.length === 0 ? (
        <Card className="p-6">
          <div className="text-center py-16">
            <Truck className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">No Delivery Challans Yet</h2>
            <p className="text-muted-foreground mb-6">
              Create delivery challans to track product shipments to your customers.
            </p>
            <Button onClick={() => setIsDialogOpen(true)}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Create Your First Delivery Challan
            </Button>
          </div>
        </Card>
      ) : (
        <Card className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Challan No.</TableHead>
                <TableHead>Client</TableHead>
                <TableHead className="text-center">Items</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {challans.map((challan) => (
                <TableRow key={challan.id}>
                  <TableCell>
                    {new Date(challan.date).toLocaleDateString()}
                  </TableCell>
                  <TableCell>{challan.challanNo}</TableCell>
                  <TableCell>{challan.clientName}</TableCell>
                  <TableCell className="text-center">{challan.itemsCount}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`${getStatusColor(challan.status)}`}>
                      {challan.status.charAt(0).toUpperCase() + challan.status.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon">
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <CheckCircle2 className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-destructive"
                        onClick={() => deleteChallan(challan.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      <div className="rounded-lg border bg-card p-6">
        <h2 className="text-lg font-semibold mb-4">About Delivery Challans</h2>
        <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
          <li>Create delivery challans for customer orders</li>
          <li>Track products being shipped to customers</li>
          <li>Record delivery status and confirmation</li>
          <li>Convert challans to invoices whenever needed</li>
          <li>Print delivery receipts for your delivery team</li>
        </ul>
      </div>
      
      {/* Create Challan Dialog */}
      <CreateChallanDialog 
        open={isDialogOpen} 
        onOpenChange={setIsDialogOpen}
        onChallanCreated={handleCreateChallan}
      />
    </div>
  );
};

export default Delivery;
