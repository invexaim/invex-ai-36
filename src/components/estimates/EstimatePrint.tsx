
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";
import useCompanyStore from '@/store/slices/companySlice';

interface EstimatePrintProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  estimate: any;
}

export function EstimatePrint({ 
  open, 
  onOpenChange, 
  estimate
}: EstimatePrintProps) {
  
  const { details, address, logo } = useCompanyStore();
  
  const handlePrint = () => {
    window.print();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Print Estimate</DialogTitle>
            <Button onClick={handlePrint} className="flex items-center gap-2">
              <Printer className="h-4 w-4" />
              Print
            </Button>
          </div>
        </DialogHeader>
        
        <div className="print-content bg-white" id="estimate-print">
          {/* Header with Company Logo and Details */}
          <div className="flex items-start justify-between mb-8 pb-6 border-b-2 border-gray-800">
            <div className="flex items-start gap-6">
              {logo.logoUrl && (
                <div className="flex-shrink-0">
                  <img 
                    src={logo.logoUrl} 
                    alt="Company Logo" 
                    className="h-20 w-20 object-contain"
                  />
                </div>
              )}
              <div>
                <h1 className="text-3xl font-bold text-gray-800 mb-2">
                  {details.companyName || 'Your Company Name'}
                </h1>
                {address.street && (
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>{address.street}</p>
                    {address.aptSuite && <p>{address.aptSuite}</p>}
                    <p>
                      {address.city}
                      {address.state && `, ${address.state}`}
                      {address.postalCode && ` ${address.postalCode}`}
                    </p>
                    {address.country && <p>{address.country}</p>}
                  </div>
                )}
                {details.email && (
                  <p className="text-sm text-gray-600 mt-2">Email: {details.email}</p>
                )}
                {details.phone && (
                  <p className="text-sm text-gray-600">Phone: {details.phone}</p>
                )}
              </div>
            </div>
            <div className="text-right">
              <h2 className="text-2xl font-bold text-blue-600">ESTIMATE</h2>
            </div>
          </div>
          
          {/* Estimate Information Section */}
          <div className="grid grid-cols-2 gap-8 mb-8">
            <div>
              <h3 className="font-semibold text-lg mb-4 text-blue-600">Estimate Details</h3>
              <div className="space-y-2">
                <p><span className="font-semibold">Reference No:</span> {estimate.referenceNo}</p>
                <p><span className="font-semibold">Date:</span> {new Date(estimate.date).toLocaleDateString()}</p>
                <p><span className="font-semibold">Valid Until:</span> {new Date(estimate.validUntil).toLocaleDateString()}</p>
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-4 text-blue-600">Client Information</h3>
              <div className="space-y-2">
                <p><span className="font-semibold">Client:</span> {estimate.clientName}</p>
                <p><span className="font-semibold">Status:</span> {estimate.status}</p>
                <p><span className="font-semibold">Total Amount:</span> ₹{estimate.totalAmount?.toLocaleString() || '0'}</p>
              </div>
            </div>
          </div>
          
          {/* Items Table */}
          <div className="mb-8">
            <h3 className="font-semibold text-lg mb-4 text-blue-600">Items</h3>
            <table className="w-full border-collapse border-2 border-gray-400">
              <thead>
                <tr className="bg-blue-100">
                  <th className="border border-gray-400 p-3 text-left font-semibold">#</th>
                  <th className="border border-gray-400 p-3 text-left font-semibold">Item Name</th>
                  <th className="border border-gray-400 p-3 text-center font-semibold">Quantity</th>
                  <th className="border border-gray-400 p-3 text-center font-semibold">Unit Price</th>
                  <th className="border border-gray-400 p-3 text-center font-semibold">Total</th>
                </tr>
              </thead>
              <tbody>
                {estimate.items?.map((item: any, index: number) => (
                  <tr key={index} className={index % 2 === 0 ? "bg-gray-50" : "bg-white"}>
                    <td className="border border-gray-400 p-3 text-center">{index + 1}</td>
                    <td className="border border-gray-400 p-3">{item.name}</td>
                    <td className="border border-gray-400 p-3 text-center">{item.quantity}</td>
                    <td className="border border-gray-400 p-3 text-center">₹{item.price?.toLocaleString()}</td>
                    <td className="border border-gray-400 p-3 text-center">₹{(item.quantity * item.price)?.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-blue-200">
                  <td colSpan={4} className="border border-gray-400 p-3 text-right font-bold text-lg">Grand Total:</td>
                  <td className="border border-gray-400 p-3 text-center font-bold text-lg">₹{estimate.totalAmount?.toLocaleString()}</td>
                </tr>
              </tfoot>
            </table>
          </div>
          
          {/* Terms & Conditions */}
          {estimate.terms && (
            <div className="mb-6">
              <h3 className="font-semibold text-lg mb-2 text-blue-600">Terms & Conditions</h3>
              <div className="bg-gray-50 p-4 rounded border">
                <p className="text-gray-700">{estimate.terms}</p>
              </div>
            </div>
          )}
          
          {/* Notes */}
          {estimate.notes && (
            <div className="mb-8">
              <h3 className="font-semibold text-lg mb-2 text-blue-600">Notes</h3>
              <div className="bg-gray-50 p-4 rounded border">
                <p className="text-gray-700">{estimate.notes}</p>
              </div>
            </div>
          )}
          
          {/* Signature Section */}
          <div className="mt-16 pt-8">
            <div className="flex justify-end">
              <div className="text-center">
                <div className="border-t-2 border-gray-800 pt-2 w-64">
                  <p className="font-semibold">Authorized Signature</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <style>{`
          @media print {
            @page {
              margin: 0 !important;
              size: A4 !important;
            }
            
            /* Hide browser headers and footers */
            html {
              -webkit-print-color-adjust: exact !important;
              color-adjust: exact !important;
            }
            
            body {
              font-family: Arial, sans-serif !important;
              line-height: 1.4 !important;
              color: black !important;
              background: white !important;
              margin: 15mm !important;
            }
            
            /* Hide everything except the print content */
            body * {
              visibility: hidden !important;
            }
            
            #estimate-print,
            #estimate-print * {
              visibility: visible !important;
            }
            
            #estimate-print {
              position: absolute !important;
              left: 0 !important;
              top: 0 !important;
              width: 100% !important;
              height: auto !important;
              background: white !important;
              color: black !important;
              font-size: 12px !important;
              padding: 0 !important;
              margin: 0 !important;
              transform: none !important;
            }
            
            /* Hide browser print headers and footers completely */
            @page {
              margin: 15mm !important;
              @top-left { content: '' !important; }
              @top-right { content: '' !important; }
              @bottom-left { content: '' !important; }
              @bottom-right { content: '' !important; }
            }
            
            #estimate-print h1 {
              font-size: 24px !important;
              margin-bottom: 8px !important;
              color: black !important;
            }
            
            #estimate-print h2 {
              font-size: 18px !important;
              color: #2563eb !important;
            }
            
            #estimate-print h3 {
              font-size: 14px !important;
              color: #2563eb !important;
              margin-bottom: 12px !important;
            }
            
            #estimate-print table {
              width: 100% !important;
              border-collapse: collapse !important;
              font-size: 11px !important;
              margin-bottom: 20px !important;
            }
            
            #estimate-print th,
            #estimate-print td {
              border: 1px solid #666 !important;
              padding: 8px !important;
              text-align: left !important;
            }
            
            #estimate-print th {
              background-color: #dbeafe !important;
              font-weight: bold !important;
            }
            
            #estimate-print tr:nth-child(even) {
              background-color: #f9fafb !important;
            }
            
            #estimate-print .bg-blue-200 {
              background-color: #bfdbfe !important;
            }
            
            #estimate-print .bg-gray-50 {
              background-color: #f9fafb !important;
            }
            
            #estimate-print .border-b-2 {
              border-bottom: 2px solid #374151 !important;
            }
            
            #estimate-print .border-t-2 {
              border-top: 2px solid #374151 !important;
            }
            
            #estimate-print .grid {
              display: grid !important;
              grid-template-columns: 1fr 1fr !important;
              gap: 32px !important;
              margin-bottom: 32px !important;
            }
            
            #estimate-print .space-y-2 > * + * {
              margin-top: 8px !important;
            }
            
            #estimate-print .mb-8 {
              margin-bottom: 32px !important;
            }
            
            #estimate-print .mb-6 {
              margin-bottom: 24px !important;
            }
            
            #estimate-print .mb-4 {
              margin-bottom: 16px !important;
            }
            
            #estimate-print .mt-16 {
              margin-top: 64px !important;
            }
            
            #estimate-print .pt-8 {
              padding-top: 32px !important;
            }
            
            #estimate-print .pb-6 {
              padding-bottom: 24px !important;
            }
            
            #estimate-print .p-4 {
              padding: 16px !important;
            }
            
            #estimate-print .text-center {
              text-align: center !important;
            }
            
            #estimate-print .text-right {
              text-align: right !important;
            }
            
            #estimate-print .font-bold {
              font-weight: bold !important;
            }
            
            #estimate-print .font-semibold {
              font-weight: 600 !important;
            }
            
            #estimate-print .flex {
              display: flex !important;
            }
            
            #estimate-print .items-start {
              align-items: flex-start !important;
            }
            
            #estimate-print .justify-between {
              justify-content: space-between !important;
            }
            
            #estimate-print .justify-end {
              justify-content: flex-end !important;
            }
            
            #estimate-print .gap-6 {
              gap: 24px !important;
            }
            
            #estimate-print .flex-shrink-0 {
              flex-shrink: 0 !important;
            }
            
            #estimate-print img {
              max-width: 80px !important;
              max-height: 80px !important;
              object-fit: contain !important;
            }
          }
        `}</style>
      </DialogContent>
    </Dialog>
  );
}
