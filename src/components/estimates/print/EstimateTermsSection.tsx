
import React from 'react';

interface EstimateTermsSectionProps {
  estimate: any;
}

export function EstimateTermsSection({ estimate }: EstimateTermsSectionProps) {
  return (
    <>
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
    </>
  );
}
