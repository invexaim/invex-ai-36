
import React, { useState } from 'react';
import { Truck, PlusCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import useAppStore from '@/store/appStore';

const Delivery = () => {
  const [challans, setChallans] = useState<any[]>([]);
  const products = useAppStore((state) => state.products);

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
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Create New Challan
        </Button>
      </div>

      {/* Main Content */}
      <Card className="p-6">
        <div className="text-center py-16">
          <Truck className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">No Delivery Challans Yet</h2>
          <p className="text-muted-foreground mb-6">
            Create delivery challans to track product shipments to your customers.
          </p>
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Create Your First Delivery Challan
          </Button>
        </div>
      </Card>

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
    </div>
  );
};

export default Delivery;
