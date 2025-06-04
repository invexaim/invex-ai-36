
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
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Print Delivery Challan</DialogTitle>
            <Button onClick={handlePrint} className="flex items-center gap-2">
              <Printer className="h-4 w-4" />
              Print
            </Button>
          </div>
        </DialogHeader>
        
        <div className="print-content bg-white" id="challan-print">
          {/* Header with Company Name */}
          <div className="text-center mb-8 pb-4 border-b-2 border-gray-800">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">{companyName || 'Your Company Name'}</h1>
            <h2 className="text-xl font-semibold text-gray-600">DELIVERY CHALLAN</h2>
          </div>
          
          {/* Challan Information Section */}
          <div className="grid grid-cols-2 gap-8 mb-8">
            <div>
              <h3 className="font-semibold text-lg mb-4 text-blue-600">Challan Details</h3>
              <div className="space-y-2">
                <p><span className="font-semibold">Challan No:</span> {challan.challanNo}</p>
                <p><span className="font-semibold">Date:</span> {new Date(challan.date).toLocaleDateString()}</p>
                <p><span className="font-semibold">Vehicle No:</span> {challan.vehicleNo || 'N/A'}</p>
                <p><span className="font-semibold">Status:</span> {challan.status}</p>
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-4 text-blue-600">Client Information</h3>
              <div className="space-y-2">
                <p><span className="font-semibold">Client:</span> {challan.clientName}</p>
                {challan.deliveryAddress && (
                  <div>
                    <p className="font-semibold">Delivery Address:</p>
                    <p className="text-gray-700 ml-4">{challan.deliveryAddress}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Items Table */}
          <div className="mb-8">
            <h3 className="font-semibold text-lg mb-4 text-blue-600">Items for Delivery</h3>
            <table className="w-full border-collapse border-2 border-gray-400">
              <thead>
                <tr className="bg-blue-100">
                  <th className="border border-gray-400 p-3 text-left font-semibold">#</th>
                  <th className="border border-gray-400 p-3 text-left font-semibold">Item Name</th>
                  <th className="border border-gray-400 p-3 text-center font-semibold">Quantity</th>
                  <th className="border border-gray-400 p-3 text-center font-semibold">Remarks</th>
                </tr>
              </thead>
              <tbody>
                {challan.items?.map((item: any, index: number) => (
                  <tr key={index} className={index % 2 === 0 ? "bg-gray-50" : "bg-white"}>
                    <td className="border border-gray-400 p-3 text-center">{index + 1}</td>
                    <td className="border border-gray-400 p-3">{item.name}</td>
                    <td className="border border-gray-400 p-3 text-center">{item.quantity}</td>
                    <td className="border border-gray-400 p-3 text-center">-</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Notes */}
          {challan.notes && (
            <div className="mb-8">
              <h3 className="font-semibold text-lg mb-2 text-blue-600">Special Instructions</h3>
              <div className="bg-gray-50 p-4 rounded border">
                <p className="text-gray-700">{challan.notes}</p>
              </div>
            </div>
          )}
          
          {/* Signature Section */}
          <div className="mt-16 pt-8">
            <div className="grid grid-cols-2 gap-16">
              <div className="text-center">
                <div className="border-t-2 border-gray-800 pt-2">
                  <p className="font-semibold">Delivered By</p>
                  <p className="text-sm text-gray-600 mt-1">Name & Signature</p>
                </div>
              </div>
              <div className="text-center">
                <div className="border-t-2 border-gray-800 pt-2">
                  <p className="font-semibold">Received By</p>
                  <p className="text-sm text-gray-600 mt-1">Name & Signature</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <style>{`
          @media print {
            @page {
              margin: 20mm;
              size: A4;
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
              background: white !important;
              color: black !important;
            }
            
            .print-content {
              padding: 0 !important;
              margin: 0 !important;
              font-size: 12px !important;
              line-height: 1.4 !important;
            }
            
            .print-content h1 {
              font-size: 24px !important;
              margin-bottom: 8px !important;
            }
            
            .print-content h2 {
              font-size: 18px !important;
            }
            
            .print-content h3 {
              font-size: 14px !important;
            }
            
            .print-content table {
              font-size: 11px !important;
            }
            
            .print-content th,
            .print-content td {
              padding: 8px !important;
            }
          }
        `}</style>
      </DialogContent>
    </Dialog>
  );
}
