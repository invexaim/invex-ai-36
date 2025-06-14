
import React from 'react';
import useCompanyStore from '@/store/slices/companySlice';

export function EstimatePrintHeader() {
  const { details, address, logo } = useCompanyStore();
  
  return (
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
  );
}
