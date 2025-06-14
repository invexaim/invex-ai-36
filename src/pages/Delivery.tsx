
import React, { useState, useEffect } from 'react';
import useAppStore from '@/store/appStore';
import { CreateChallanDialog } from '@/components/delivery/CreateChallanDialog';
import { DeliveryChallanPrint } from '@/components/delivery/DeliveryChallanPrint';
import { DeliveryHeader } from '@/components/delivery/DeliveryHeader';
import { DeliveryEmptyState } from '@/components/delivery/DeliveryEmptyState';
import { DeliveryTable } from '@/components/delivery/DeliveryTable';
import { DeliveryAboutSection } from '@/components/delivery/DeliveryAboutSection';
import { toast } from 'sonner';

interface DeliveryChallan {
  id: string;
  clientName: string;
  date: string;
  challanNo: string;
  status: "pending" | "delivered" | "cancelled";
  vehicleNo?: string;
  deliveryAddress?: string;
  createdAt: string;
  items?: any[];
  itemsCount?: number;
  notes?: string;
}

const Delivery = () => {
  const [challans, setChallans] = useState<DeliveryChallan[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isPrintDialogOpen, setIsPrintDialogOpen] = useState(false);
  const [selectedChallan, setSelectedChallan] = useState<DeliveryChallan | null>(null);
  const [editingChallan, setEditingChallan] = useState<DeliveryChallan | null>(null);

  // Load challans from localStorage
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
    
    setChallans([]);
  }, []);

  const handleCreateChallan = (challanData: any) => {
    const itemsCount = challanData.items ? challanData.items.length : 0;
    
    const newChallan = {
      id: challanData.challanNo || `DC-${Date.now().toString().slice(-6)}`,
      clientName: challanData.clientName,
      date: challanData.date,
      challanNo: challanData.challanNo || `DC-${Date.now().toString().slice(-6)}`,
      status: challanData.status || "pending",
      vehicleNo: challanData.vehicleNo,
      deliveryAddress: challanData.deliveryAddress,
      createdAt: challanData.createdAt || new Date().toISOString(),
      items: challanData.items,
      itemsCount: itemsCount,
      notes: challanData.notes,
    };
    
    const updatedChallans = [newChallan, ...challans];
    setChallans(updatedChallans);
    
    localStorage.setItem('deliveryChallans', JSON.stringify(updatedChallans));
  };

  const handleUpdateChallan = (challanData: any) => {
    const itemsCount = challanData.items ? challanData.items.length : 0;
    
    const updatedChallan = {
      ...editingChallan,
      clientName: challanData.clientName,
      date: challanData.date,
      vehicleNo: challanData.vehicleNo,
      deliveryAddress: challanData.deliveryAddress,
      items: challanData.items,
      itemsCount: itemsCount,
      notes: challanData.notes,
      status: challanData.status || editingChallan?.status || "pending",
    };
    
    const updatedChallans = challans.map(challan => 
      challan.id === editingChallan?.id ? updatedChallan : challan
    );
    
    setChallans(updatedChallans);
    localStorage.setItem('deliveryChallans', JSON.stringify(updatedChallans));
    setEditingChallan(null);
  };

  const handleStatusChange = (id: string, newStatus: "delivered") => {
    const updatedChallans = challans.map(challan => 
      challan.id === id ? { ...challan, status: newStatus } : challan
    );
    
    setChallans(updatedChallans);
    localStorage.setItem('deliveryChallans', JSON.stringify(updatedChallans));
    
    toast.success("Delivery status updated to delivered");
  };

  const handleChallanAction = (challanData: any) => {
    if (editingChallan) {
      handleUpdateChallan(challanData);
    } else {
      handleCreateChallan(challanData);
    }
  };

  const handleEditChallan = (challan: DeliveryChallan) => {
    setEditingChallan(challan);
    setIsDialogOpen(true);
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setEditingChallan(null);
  };

  const deleteChallan = (id: string) => {
    const updatedChallans = challans.filter(challan => challan.id !== id);
    setChallans(updatedChallans);
    localStorage.setItem('deliveryChallans', JSON.stringify(updatedChallans));
  };

  const handlePrintChallan = (challan: DeliveryChallan) => {
    setSelectedChallan(challan);
    setIsPrintDialogOpen(true);
  };

  const openCreateDialog = () => {
    setIsDialogOpen(true);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <DeliveryHeader onCreateChallan={openCreateDialog} />

      {challans.length === 0 ? (
        <DeliveryEmptyState onCreateChallan={openCreateDialog} />
      ) : (
        <DeliveryTable 
          challans={challans}
          onEditChallan={handleEditChallan}
          onDeleteChallan={deleteChallan}
          onPrintChallan={handlePrintChallan}
          onStatusChange={handleStatusChange}
        />
      )}

      <DeliveryAboutSection />
      
      <CreateChallanDialog 
        open={isDialogOpen} 
        onOpenChange={handleDialogClose}
        onChallanCreated={handleChallanAction}
        editData={editingChallan}
      />
      
      {selectedChallan && (
        <DeliveryChallanPrint
          open={isPrintDialogOpen}
          onOpenChange={setIsPrintDialogOpen}
          challan={selectedChallan}
        />
      )}
    </div>
  );
};

export default Delivery;
