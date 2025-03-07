
import React from "react";
import { Package, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Sale, Product } from "@/types";
import { format } from "date-fns";

interface TransactionListProps {
  filteredTransactions: Sale[];
  onDeleteTransaction: (id: number) => void;
  productsExist: boolean;
}

export const TransactionList = ({ 
  filteredTransactions, 
  onDeleteTransaction,
  productsExist
}: TransactionListProps) => {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Product</TableHead>
            <TableHead>Quantity</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Total</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredTransactions.length > 0 ? (
            filteredTransactions.map((sale) => {
              const total = sale.quantity_sold * sale.selling_price;

              return (
                <TableRow key={sale.sale_id}>
                  <TableCell>
                    {format(new Date(sale.sale_date), "yyyy-MM-dd")}
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                      sale
                    </span>
                  </TableCell>
                  <TableCell className="font-medium">
                    {sale.product?.product_name}
                  </TableCell>
                  <TableCell>{sale.quantity_sold}</TableCell>
                  <TableCell>₹{sale.selling_price.toFixed(2)}</TableCell>
                  <TableCell>
                    ₹{total.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDeleteTransaction(sale.sale_id)}
                      className="text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })
          ) : (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-12">
                <div className="flex flex-col items-center justify-center">
                  <Package className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No transactions found</h3>
                  <p className="text-muted-foreground">
                    {productsExist 
                      ? "Record sales to view transaction history" 
                      : "Add products and record sales to view transaction history"}
                  </p>
                </div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};
