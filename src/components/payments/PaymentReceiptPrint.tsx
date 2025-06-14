
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
import { Payment } from '@/types';

interface PaymentReceiptPrintProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  payment: Payment;
}

export function PaymentReceiptPrint({ 
  open, 
  onOpenChange, 
  payment
}: PaymentReceiptPrintProps) {
  
  const { details, address, logo } = useCompanyStore();
  
  const handlePrint = () => {
    window.print();
  };

  const numberToWords = (num: number): string => {
    const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
    const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    
    if (num === 0) return 'Zero';
    if (num < 10) return ones[num];
    if (num < 20) return teens[num - 10];
    if (num < 100) return tens[Math.floor(num / 10)] + (num % 10 ? ' ' + ones[num % 10] : '');
    if (num < 1000) return ones[Math.floor(num / 100)] + ' Hundred' + (num % 100 ? ' ' + numberToWords(num % 100) : '');
    if (num < 100000) return numberToWords(Math.floor(num / 1000)) + ' Thousand' + (num % 1000 ? ' ' + numberToWords(num % 1000) : '');
    
    return 'Amount too large';
  };

  const amountInWords = numberToWords(Math.floor(payment.amount)) + ' Rupees only';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Print Payment Receipt</DialogTitle>
            <Button onClick={handlePrint} className="flex items-center gap-2">
              <Printer className="h-4 w-4" />
              Print
            </Button>
          </div>
        </DialogHeader>
        
        <div className="print-content bg-white" id="payment-receipt-print">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex-shrink-0">
              {logo.logoUrl && (
                <img 
                  src={logo.logoUrl} 
                  alt="Company Logo" 
                  className="h-16 w-16 object-contain"
                />
              )}
            </div>
            
            <div className="flex-1 text-center">
              <h1 className="text-2xl font-bold text-gray-800 mb-1">
                {details.companyName || 'Your Company Name'}
              </h1>
            </div>
            
            <div className="text-right text-xs text-gray-600 space-y-1 flex-shrink-0 min-w-[300px]">
              {address.street && <p>{address.street}</p>}
              {address.city && (
                <p>
                  {address.city}
                  {address.state && `, ${address.state}`}
                </p>
              )}
              {details.phone && <p>Phone no.: {details.phone}</p>}
              {details.email && <p>Email: {details.email}</p>}
              {details.taxId && <p>GSTIN: {details.taxId}</p>}
            </div>
          </div>
          
          <div className="border-t-2 border-gray-800 mb-4"></div>
          
          <div className="text-center mb-6">
            <h2 className="text-xl font-bold">Payment Receipt</h2>
          </div>
          
          <div className="grid grid-cols-2 gap-8 mb-6">
            <div>
              <h3 className="font-bold text-lg mb-2">Bill To</h3>
              <p className="font-semibold">{payment.clientName}</p>
            </div>
            
            <div className="text-right">
              <h3 className="font-bold text-lg mb-2">Receipt Details</h3>
              <div className="space-y-1">
                <p><span className="font-semibold">Receipt No.:</span> {payment.id}</p>
                <p><span className="font-semibold">Date:</span> {new Date(payment.date).toLocaleDateString('en-IN')}</p>
              </div>
            </div>
          </div>
          
          <table className="w-full border-collapse border-2 border-gray-400 mb-6">
            <thead>
              <tr className="bg-blue-600 text-white">
                <th className="border border-gray-400 p-3 text-left font-semibold">#</th>
                <th className="border border-gray-400 p-3 text-left font-semibold">Description</th>
                <th className="border border-gray-400 p-3 text-center font-semibold">Method</th>
                <th className="border border-gray-400 p-3 text-center font-semibold">Status</th>
                <th className="border border-gray-400 p-3 text-right font-semibold">Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-gray-400 p-3 text-center">1</td>
                <td className="border border-gray-400 p-3">{payment.description || 'Payment received'}</td>
                <td className="border border-gray-400 p-3 text-center">{payment.method}</td>
                <td className="border border-gray-400 p-3 text-center capitalize">{payment.status}</td>
                <td className="border border-gray-400 p-3 text-right">₹ {payment.amount.toFixed(2)}</td>
              </tr>
              <tr>
                <td colSpan={4} className="border border-gray-400 p-3 text-right font-semibold">Total</td>
                <td className="border border-gray-400 p-3 text-right font-semibold">₹ {payment.amount.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>
          
          <div className="grid grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="font-bold text-sm mb-2 bg-blue-600 text-white p-2">Payment Amount In Words</h3>
              <div className="border border-gray-300 p-3 bg-gray-50">
                <p className="font-semibold">{amountInWords}</p>
              </div>
            </div>
            
            <div>
              <h3 className="font-bold text-sm mb-2 bg-blue-600 text-white p-2">Amounts</h3>
              <div className="border border-gray-300 p-3 bg-gray-50 space-y-2">
                <div className="flex justify-between">
                  <span>Sub Total</span>
                  <span>₹ {payment.amount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span>₹ {payment.amount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Received</span>
                  <span>₹ {payment.amount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-semibold">
                  <span>Balance</span>
                  <span>₹ 0.00</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="font-bold text-sm mb-2 bg-blue-600 text-white p-2">Terms and Conditions</h3>
              <div className="border border-gray-300 p-3 bg-gray-50">
                <p className="text-sm">Thanks for doing business with us!</p>
              </div>
            </div>
            
            <div className="text-center">
              <h3 className="font-bold text-sm mb-2">For: {details.companyName || 'Your Company Name'}</h3>
              <div className="mt-16">
                <div className="border-t border-gray-600 pt-2 mx-4">
                  <p className="text-sm font-semibold">Authorized Signatory</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="text-center text-xs text-gray-500 mt-8 pt-4 border-t border-gray-300">
            <p>This is a computer generated receipt and does not require physical signature.</p>
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
            
            #payment-receipt-print,
            #payment-receipt-print * {
              visibility: visible !important;
            }
            
            #payment-receipt-print {
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
            
            #payment-receipt-print h1 {
              font-size: 24px !important;
              margin-bottom: 8px !important;
              color: black !important;
            }
            
            #payment-receipt-print h2 {
              font-size: 18px !important;
              color: black !important;
            }
            
            #payment-receipt-print h3 {
              font-size: 14px !important;
              margin-bottom: 12px !important;
            }
            
            #payment-receipt-print table {
              width: 100% !important;
              border-collapse: collapse !important;
              font-size: 11px !important;
            }
            
            #payment-receipt-print th,
            #payment-receipt-print td {
              border: 1px solid #666 !important;
              padding: 8px !important;
            }
            
            #payment-receipt-print th {
              background-color: #2563eb !important;
              color: white !important;
              font-weight: bold !important;
            }
            
            #payment-receipt-print .bg-blue-600 {
              background-color: #2563eb !important;
              color: white !important;
            }
            
            #payment-receipt-print .bg-gray-50 {
              background-color: #f9fafb !important;
            }
            
            #payment-receipt-print .border-t-2 {
              border-top: 2px solid #374151 !important;
            }
          }
        `}</style>
      </DialogContent>
    </Dialog>
  );
}
