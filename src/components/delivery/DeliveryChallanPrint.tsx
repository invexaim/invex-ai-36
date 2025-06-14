
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

interface DeliveryChallanPrintProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  challan: any;
}

export function DeliveryChallanPrint({ 
  open, 
  onOpenChange, 
  challan
}: DeliveryChallanPrintProps) {
  
  const { details, address, logo } = useCompanyStore();
  
  const handlePrint = () => {
    window.print();
  };

  const formatAddress = () => {
    const addressParts = [];
    if (address.street) addressParts.push(address.street);
    if (address.aptSuite) addressParts.push(address.aptSuite);
    if (address.city) addressParts.push(address.city);
    if (address.state) addressParts.push(address.state);
    if (address.postalCode) addressParts.push(address.postalCode);
    if (address.country) addressParts.push(address.country);
    return addressParts.join(', ');
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
          {/* Header with Company Logo and Name */}
          <div className="mb-6">
            {/* Top section with logo, company name, and contact details */}
            <div className="flex items-start justify-between mb-4">
              {/* Logo */}
              <div className="flex-shrink-0">
                {logo.logoUrl && (
                  <img 
                    src={logo.logoUrl} 
                    alt="Company Logo" 
                    className="h-16 w-16 object-contain"
                  />
                )}
              </div>
              
              {/* Company Name - Centered */}
              <div className="flex-1 text-center">
                <h1 className="text-2xl font-bold text-gray-800 mb-1">
                  {details.companyName || 'Your Company Name'}
                </h1>
              </div>
              
              {/* Contact Details - Right aligned */}
              <div className="text-right text-xs text-gray-600 space-y-1 flex-shrink-0 min-w-[200px]">
                {details.phone && <p>Mobile: {details.phone}</p>}
                {details.email && <p>Email: {details.email}</p>}
                {details.taxId && <p>GSTIN: {details.taxId}</p>}
                {address.street && (
                  <div className="mt-2">
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
              </div>
            </div>
            
            {/* Horizontal line */}
            <div className="border-t-2 border-gray-800 mb-4"></div>
            
            {/* DELIVERY CHALLAN title - centered */}
            <div className="text-center mb-4">
              <h2 className="text-xl font-bold text-blue-600">DELIVERY CHALLAN</h2>
            </div>
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
              margin: 15mm;
              size: A4;
            }
            
            * {
              -webkit-print-color-adjust: exact !important;
              color-adjust: exact !important;
            }
            
            body {
              font-family: Arial, sans-serif !important;
              line-height: 1.4 !important;
              color: black !important;
              background: white !important;
            }
            
            body * {
              visibility: hidden !important;
            }
            
            #challan-print,
            #challan-print * {
              visibility: visible !important;
            }
            
            #challan-print {
              position: static !important;
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
            
            /* Hide browser print headers and footers */
            @page {
              margin: 15mm;
              size: A4;
              /* Remove default browser headers/footers */
              @top-left { content: ""; }
              @top-center { content: ""; }
              @top-right { content: ""; }
              @bottom-left { content: ""; }
              @bottom-center { content: ""; }
              @bottom-right { content: ""; }
            }
            
            /* Additional styles to ensure clean printing */
            html, body {
              margin: 0 !important;
              padding: 0 !important;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            
            /* Hide any browser-generated content */
            body::before,
            body::after,
            html::before,
            html::after {
              content: none !important;
              display: none !important;
            }
            
            #challan-print h1 {
              font-size: 24px !important;
              margin-bottom: 8px !important;
              color: black !important;
            }
            
            #challan-print h2 {
              font-size: 18px !important;
              color: black !important;
            }
            
            #challan-print h3 {
              font-size: 14px !important;
              color: #2563eb !important;
              margin-bottom: 12px !important;
            }
            
            #challan-print img {
              max-width: 100px !important;
              height: auto !important;
              object-fit: contain !important;
            }
            
            #challan-print table {
              width: 100% !important;
              border-collapse: collapse !important;
              font-size: 11px !important;
              margin-bottom: 20px !important;
            }
            
            #challan-print th,
            #challan-print td {
              border: 1px solid #666 !important;
              padding: 8px !important;
              text-align: left !important;
            }
            
            #challan-print th {
              background-color: #dbeafe !important;
              font-weight: bold !important;
            }
            
            #challan-print tr:nth-child(even) {
              background-color: #f9fafb !important;
            }
            
            #challan-print .bg-blue-100 {
              background-color: #dbeafe !important;
            }
            
            #challan-print .bg-gray-50 {
              background-color: #f9fafb !important;
            }
            
            #challan-print .border-b-2 {
              border-bottom: 2px solid #374151 !important;
            }
            
            #challan-print .border-t-2 {
              border-top: 2px solid #374151 !important;
            }
            
            #challan-print .grid {
              display: grid !important;
              grid-template-columns: 1fr 1fr !important;
              gap: 32px !important;
              margin-bottom: 32px !important;
            }
            
            #challan-print .space-y-2 > * + * {
              margin-top: 8px !important;
            }
            
            #challan-print .mb-8 {
              margin-bottom: 32px !important;
            }
            
            #challan-print .mb-6 {
              margin-bottom: 24px !important;
            }
            
            #challan-print .mb-4 {
              margin-bottom: 16px !important;
            }
            
            #challan-print .mt-16 {
              margin-top: 64px !important;
            }
            
            #challan-print .pt-8 {
              padding-top: 32px !important;
            }
            
            #challan-print .p-4 {
              padding: 16px !important;
            }
            
            #challan-print .text-center {
              text-align: center !important;
            }
            
            #challan-print .text-right {
              text-align: right !important;
            }
            
            #challan-print .font-bold {
              font-weight: bold !important;
            }
            
            #challan-print .font-semibold {
              font-weight: 600 !important;
            }
            
            #challan-print .gap-16 {
              gap: 64px !important;
            }
          }
        `}</style>
      </DialogContent>
    </Dialog>
  );
}
