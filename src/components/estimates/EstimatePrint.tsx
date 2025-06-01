
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";

interface EstimatePrintProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  estimate: any;
  companyName: string;
}

export function EstimatePrint({ 
  open, 
  onOpenChange, 
  estimate, 
  companyName 
}: EstimatePrintProps) {
  
  const handlePrint = () => {
    window.print();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Print Estimate</DialogTitle>
            <Button onClick={handlePrint} className="flex items-center gap-2">
              <Printer className="h-4 w-4" />
              Print
            </Button>
          </div>
        </DialogHeader>
        
        <div className="print:p-0 p-6 bg-white" id="estimate-print">
          {/* Header */}
          <div className="text-center mb-6 border-b pb-4">
            <h1 className="text-2xl font-bold text-gray-800">{companyName || 'Your Company Name'}</h1>
            <h2 className="text-lg font-semibold text-gray-600 mt-2">ESTIMATE</h2>
          </div>
          
          {/* Estimate Details */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <p><strong>Reference No:</strong> {estimate.referenceNo}</p>
              <p><strong>Date:</strong> {new Date(estimate.date).toLocaleDateString()}</p>
              <p><strong>Valid Until:</strong> {new Date(estimate.validUntil).toLocaleDateString()}</p>
            </div>
            <div>
              <p><strong>Client:</strong> {estimate.clientName}</p>
              <p><strong>Status:</strong> {estimate.status}</p>
              <p><strong>Total Amount:</strong> ₹{estimate.totalAmount?.toLocaleString() || '0'}</p>
            </div>
          </div>
          
          {/* Items Table */}
          <div className="mb-6">
            <h3 className="font-semibold mb-2">Items:</h3>
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 p-2 text-left">Item</th>
                  <th className="border border-gray-300 p-2 text-center">Quantity</th>
                  <th className="border border-gray-300 p-2 text-center">Price</th>
                  <th className="border border-gray-300 p-2 text-center">Total</th>
                </tr>
              </thead>
              <tbody>
                {estimate.items?.map((item: any, index: number) => (
                  <tr key={index}>
                    <td className="border border-gray-300 p-2">{item.name}</td>
                    <td className="border border-gray-300 p-2 text-center">{item.quantity}</td>
                    <td className="border border-gray-300 p-2 text-center">₹{item.price?.toLocaleString()}</td>
                    <td className="border border-gray-300 p-2 text-center">₹{(item.quantity * item.price)?.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-gray-50">
                  <td colSpan={3} className="border border-gray-300 p-2 text-right font-semibold">Total:</td>
                  <td className="border border-gray-300 p-2 text-center font-semibold">₹{estimate.totalAmount?.toLocaleString()}</td>
                </tr>
              </tfoot>
            </table>
          </div>
          
          {/* Notes */}
          {estimate.notes && (
            <div className="mb-6">
              <h3 className="font-semibold mb-2">Notes:</h3>
              <p className="text-gray-700">{estimate.notes}</p>
            </div>
          )}
          
          {/* Terms */}
          {estimate.terms && (
            <div className="mb-6">
              <h3 className="font-semibold mb-2">Terms & Conditions:</h3>
              <p className="text-gray-700">{estimate.terms}</p>
            </div>
          )}
          
          {/* Signature Section */}
          <div className="mt-12">
            <div className="float-right">
              <div className="border-t border-gray-400 pt-2 w-48">
                <p className="text-center text-sm">Authorized Signature</p>
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
            #estimate-print, #estimate-print * {
              visibility: visible;
            }
            #estimate-print {
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
