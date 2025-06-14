
import React from 'react';

interface EstimateDetailsSectionProps {
  estimate: any;
}

export function EstimateDetailsSection({ estimate }: EstimateDetailsSectionProps) {
  return (
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
  );
}
