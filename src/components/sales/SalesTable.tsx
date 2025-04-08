
import { ChartLineIcon, Trash2, User } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Sale } from "@/types";

interface SalesTableProps {
  sales: Sale[];
  onDeleteSale: (saleId: number) => void;
}

const SalesTable = ({ sales, onDeleteSale }: SalesTableProps) => {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>
              <div className="flex items-center space-x-1">
                <span>Date</span>
                <ChartLineIcon className="h-4 w-4" />
              </div>
            </TableHead>
            <TableHead>Product</TableHead>
            <TableHead>Client</TableHead>
            <TableHead>Quantity</TableHead>
            <TableHead>Unit Price</TableHead>
            <TableHead>Total</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sales.length > 0 ? (
            sales.map((sale) => (
              <TableRow key={sale.sale_id}>
                <TableCell className="font-medium">
                  {new Date(sale.sale_date).toLocaleDateString()}
                </TableCell>
                <TableCell>{sale.product?.product_name}</TableCell>
                <TableCell>
                  {sale.clientName ? (
                    <div className="flex items-center gap-1">
                      <User className="h-3 w-3 text-muted-foreground" />
                      {sale.clientName}
                    </div>
                  ) : (
                    <span className="text-muted-foreground text-sm">No client</span>
                  )}
                </TableCell>
                <TableCell>{sale.quantity_sold}</TableCell>
                <TableCell>₹{sale.selling_price.toFixed(2)}</TableCell>
                <TableCell>
                  ₹{(sale.quantity_sold * sale.selling_price).toFixed(2)}
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDeleteSale(sale.sale_id)}
                    className="text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-4">
                No sales found matching your search.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default SalesTable;
