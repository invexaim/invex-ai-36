
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";

interface DeliveryChallanPrintProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  challan: any;
  companyName: string;
}

export function DeliveryChallanPrint({ 
  open, 
  onOpenChange, 
  challan, 
  companyName 
}: DeliveryChallanPrintProps) {
  
  const handlePrint = () => {
    window.print();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Print Delivery Challan</DialogTitle>
            <Button onClick={handlePrint} className="flex items-center gap-2">
              <Printer className="h-4 w-4" />
              Print
            </Button>
          </div>
        </DialogHeader>
        
        <div className="print:p-0 p-6 bg-white" id="challan-print">
          {/* Header */}
          <div className="text-center mb-6 border-b pb-4">
            <h1 className="text-2xl font-bold text-gray-800">{companyName || 'Your Company Name'}</h1>
            <h2 className="text-lg font-semibold text-gray-600 mt-2">DELIVERY CHALLAN</h2>
          </div>
          
          {/* Challan Details */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <p><strong>Challan No:</strong> {challan.challanNo}</p>
              <p><strong>Date:</strong> {new Date(challan.date).toLocaleDateString()}</p>
              <p><strong>Vehicle No:</strong> {challan.vehicleNo || 'N/A'}</p>
            </div>
            <div>
              <p><strong>Client:</strong> {challan.clientName}</p>
              <p><strong>Status:</strong> {challan.status}</p>
            </div>
          </div>
          
          {/* Delivery Address */}
          {challan.deliveryAddress && (
            <div className="mb-6">
              <h3 className="font-semibold mb-2">Delivery Address:</h3>
              <p className="text-gray-700">{challan.deliveryAddress}</p>
            </div>
          )}
          
          {/* Items Table */}
          <div className="mb-6">
            <h3 className="font-semibold mb-2">Items:</h3>
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 p-2 text-left">Item</th>
                  <th className="border border-gray-300 p-2 text-center">Quantity</th>
                </tr>
              </thead>
              <tbody>
                {challan.items?.map((item: any, index: number) => (
                  <tr key={index}>
                    <td className="border border-gray-300 p-2">{item.name}</td>
                    <td className="border border-gray-300 p-2 text-center">{item.quantity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Notes */}
          {challan.notes && (
            <div className="mb-6">
              <h3 className="font-semibold mb-2">Notes:</h3>
              <p className="text-gray-700">{challan.notes}</p>
            </div>
          )}
          
          {/* Signature Section */}
          <div className="grid grid-cols-2 gap-8 mt-12">
            <div>
              <div className="border-t border-gray-400 pt-2">
                <p className="text-center text-sm">Delivered By</p>
              </div>
            </div>
            <div>
              <div className="border-t border-gray-400 pt-2">
                <p className="text-center text-sm">Received By</p>
              </div>
            </div>
          </div>
        </div>
        
        <style jsx>{`
          @media print {
            .print\\:p-0 {
              padding: 0 !important;
            }
            body * {
              visibility: hidden;
            }
            #challan-print, #challan-print * {
              visibility: visible;
            }
            #challan-print {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
            }
          }
        `}</style>
      </DialogContent>
    </Dialog>
  );
}
