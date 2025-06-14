
import React from 'react';

interface EstimateTermsSectionProps {
  estimate: any;
}

export function EstimateTermsSection({ estimate }: EstimateTermsSectionProps) {
  const calculateSubTotal = () => {
    return estimate.items?.reduce((sum: number, item: any) => sum + (item.quantity * item.price), 0) || 0;
  };

  const subTotal = calculateSubTotal();
  const taxAmount = subTotal * 0.18;
  const grandTotal = subTotal + taxAmount;

  // Convert number to words (simplified for Indian numbering)
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

  const amountInWords = numberToWords(Math.floor(grandTotal)) + ' Rupees Only';

  return (
    <>
      {/* Three-column summary section */}
      <div className="grid grid-cols-3 gap-6 mb-8">
        {/* Amount in Words */}
        <div>
          <h3 className="font-bold text-sm mb-2 text-blue-600">Estimate Amount In Words:</h3>
          <div className="border border-gray-300 p-3 min-h-[80px] bg-gray-50">
            <p className="text-sm font-semibold">{amountInWords}</p>
          </div>
        </div>
        
        {/* Terms & Conditions */}
        <div>
          <h3 className="font-bold text-sm mb-2 text-blue-600">Terms & Conditions:</h3>
          <div className="border border-gray-300 p-3 min-h-[80px] bg-gray-50">
            <div className="text-xs space-y-1">
              <p>1. Goods once sold will not be taken back.</p>
              <p>2. Interest @ 18% p.a. will be charged if the payment is not made within due date.</p>
              <p>3. Subject to jurisdiction only.</p>
              {estimate.terms && <p>4. {estimate.terms}</p>}
            </div>
          </div>
        </div>
        
        {/* Company Signature */}
        <div>
          <h3 className="font-bold text-sm mb-2 text-blue-600">For: {useCompanyStore.getState().details.companyName || 'Your Company Name'}</h3>
          <div className="border border-gray-300 p-3 min-h-[80px] bg-gray-50 flex flex-col justify-end">
            <div className="mt-8 text-center">
              <div className="border-t border-gray-600 pt-2 mx-4">
                <p className="text-xs font-semibold">Authorized Signatory</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Notes section if exists */}
      {estimate.notes && (
        <div className="mb-6">
          <h3 className="font-bold text-sm mb-2 text-blue-600">Additional Notes:</h3>
          <div className="border border-gray-300 p-3 bg-gray-50">
            <p className="text-sm">{estimate.notes}</p>
          </div>
        </div>
      )}
      
      {/* Footer */}
      <div className="text-center text-xs text-gray-500 mt-8 pt-4 border-t border-gray-300">
        <p>This is a computer generated estimate and does not require physical signature.</p>
      </div>
    </>
  );
}
