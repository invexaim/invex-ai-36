
import React from "react";
import { RefreshCw, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { Product } from "@/types";

interface ProductInventoryProps {
  title: string;
  description: string;
  products: Product[];
  onRestock: (product: Product) => void;
  onDelete: (productId: number) => void;
}

export const ProductInventory: React.FC<ProductInventoryProps> = ({
  title,
  description,
  products,
  onRestock,
  onDelete,
}) => {
  const columns = [
    {
      accessorKey: "product_name",
      header: "Product Name",
    },
    {
      accessorKey: "category",
      header: "Category",
    },
    {
      accessorKey: "units",
      header: "Available Units",
    },
    {
      accessorKey: "price",
      header: "Price",
      cell: ({ row }) => {
        const price = parseFloat(row.getValue("price"));
        return <div>₹{price.toFixed(2)}</div>;
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const product = row.original;
        return (
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => onRestock(product)}
              className="text-blue-500"
            >
              <RefreshCw className="h-4 w-4 mr-1" />
              Restock
            </Button>
            <Button 
              variant="destructive" 
              size="sm"
              onClick={() => onDelete(product.product_id)}
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Delete
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <DataTable columns={columns} data={products} />
      </CardContent>
    </Card>
  );
};
