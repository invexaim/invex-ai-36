
import React from 'react';

interface EstimateItemsTableProps {
  estimate: any;
}

export function EstimateItemsTable({ estimate }: EstimateItemsTableProps) {
  return (
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
  );
}
