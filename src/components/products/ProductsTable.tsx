
import { useState } from "react";
import { Search, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Product } from "@/types";
import { toast } from "sonner";

interface ProductsTableProps {
  products: Product[];
  searchTerm: string;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const ProductsTable = ({
  products: initialProducts,
  searchTerm,
  onSearchChange,
}: ProductsTableProps) => {
  const [products, setProducts] = useState(initialProducts);

  const handleDeleteProduct = (productId: number) => {
    setProducts(products.filter(product => product.product_id !== productId));
    toast.success("Product deleted successfully");
  };

  const filteredProducts = products.filter((product) => {
    return product.product_name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
  });

  return (
    <div className="bg-card rounded-lg border shadow-sm">
      <div className="p-6 border-b">
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          <h2 className="text-xl font-semibold">Product Inventory</h2>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              value={searchTerm}
              onChange={onSearchChange}
              className="pl-10"
            />
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProducts.length > 0 ? (
              filteredProducts.map((product) => (
                <TableRow key={product.product_id}>
                  <TableCell className="font-medium">
                    {product.product_name}
                  </TableCell>
                  <TableCell>{product.category}</TableCell>
                  <TableCell>{product.stock_quantity}</TableCell>
                  <TableCell>₹{product.price.toFixed(2)}</TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        product.stock_quantity > 10
                          ? "bg-green-100 text-green-800"
                          : product.stock_quantity > 0
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {product.stock_quantity > 10
                        ? "In Stock"
                        : product.stock_quantity > 0
                        ? "Low Stock"
                        : "Out of Stock"}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteProduct(product.product_id)}
                      className="text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-4">
                  No products found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
