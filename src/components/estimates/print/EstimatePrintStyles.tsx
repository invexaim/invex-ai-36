
import React from 'react';

export function EstimatePrintStyles() {
  return (
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
  );
}
