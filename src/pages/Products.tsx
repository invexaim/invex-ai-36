
import { useState } from "react";
import { mockProducts } from "@/data/mockData";
import { Button } from "@/components/ui/button";
import { Calendar, ChartBarIcon, FileText, Package, Plus, Search, TrendingUp } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Product } from "@/types";
import { CardStat } from "@/components/ui/card-stat";
import { AIInsightCard } from "@/components/ai/AIInsightCard";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const Products = () => {
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const [searchTerm, setSearchTerm] = useState("");
  const [openStockPredictor, setOpenStockPredictor] = useState(false);
  const [predictionData, setPredictionData] = useState({
    date: "",
    product_id: 0,
    current_stock: 0,
    previous_sales: 0,
    price: 0,
  });
  const [predictionResult, setPredictionResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleAddProduct = () => {
    toast.success("Product added successfully", {
      description: "Your new product has been added to the inventory",
    });
  };

  const handleFileUpload = () => {
    toast.success("File uploaded successfully", {
      description: "Your product data has been processed",
    });
  };

  const handleGeneratePrediction = () => {
    // Mock prediction logic
    setLoading(true);
    setTimeout(() => {
      setPredictionResult(
        "Based on historical data and current trends, we predict sales of 12 units in the next 30 days. Consider stocking at least 15 units to maintain optimal inventory levels."
      );
      setLoading(false);
      toast.success("Prediction generated", {
        description: "AI has analyzed your data and provided predictions",
      });
    }, 1500);
  };

  const filteredProducts = products.filter((product) =>
    product.product_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Stats for the top cards
  const stats = [
    {
      title: "Total Products",
      value: products.length,
      icon: <Package className="h-5 w-5 text-primary" />,
    },
    {
      title: "Low Stock Items",
      value: products.filter(p => p.units < p.reorder_level).length,
      icon: <ChartBarIcon className="h-5 w-5 text-warning" />,
    },
    {
      title: "Categories",
      value: [...new Set(products.map(p => p.category))].length,
      icon: <FileText className="h-5 w-5 text-info" />,
    },
    {
      title: "Value",
      value: `$${products.reduce((sum, p) => sum + p.price, 0).toFixed(2)}`,
      icon: <TrendingUp className="h-5 w-5 text-success" />,
    }
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Products</h1>
          <p className="text-muted-foreground mt-1">
            Manage your products and inventory
          </p>
        </div>
        <Button
          onClick={handleAddProduct}
          className="self-start sm:self-auto"
        >
          <Plus className="mr-2 h-4 w-4" /> Add Product
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <CardStat
            key={index}
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
          />
        ))}
      </div>

      {/* AI Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <AIInsightCard 
          insight={{
            title: "Stock Optimization",
            description: "Your inventory has 5 products below reorder levels. Consider restocking soon to avoid stockouts.",
            type: "warning"
          }}
        />
        <AIInsightCard 
          insight={{
            title: "Seasonal Trend",
            description: "Based on historical data, you may need to increase stock of 'Office Supplies' for the upcoming back-to-school season.",
            type: "info"
          }}
        />
      </div>

      {/* Stock Predictor Section */}
      <div className="bg-card p-6 rounded-lg border shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Package className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold">Stock Predictor</h2>
        </div>

        <div className="bg-muted/50 p-6 rounded-lg">
          <h3 className="text-lg font-medium mb-6">Manual Stock Prediction</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <div className="relative">
                <Input
                  id="date"
                  type="date"
                  value={predictionData.date}
                  onChange={(e) =>
                    setPredictionData({ ...predictionData, date: e.target.value })
                  }
                  className="pl-10"
                />
                <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="product">Product</Label>
              <div className="relative">
                <select
                  id="product"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  onChange={(e) =>
                    setPredictionData({
                      ...predictionData,
                      product_id: parseInt(e.target.value),
                    })
                  }
                >
                  <option value="">Select a product</option>
                  {products.map((product) => (
                    <option key={product.product_id} value={product.product_id}>
                      {product.product_name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="current-stock">Current Stock</Label>
              <Input
                id="current-stock"
                type="number"
                min="0"
                value={predictionData.current_stock || ""}
                onChange={(e) =>
                  setPredictionData({
                    ...predictionData,
                    current_stock: parseInt(e.target.value) || 0,
                  })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">Price</Label>
              <Input
                id="price"
                type="number"
                min="0"
                step="0.01"
                value={predictionData.price || ""}
                onChange={(e) =>
                  setPredictionData({
                    ...predictionData,
                    price: parseFloat(e.target.value) || 0,
                  })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="previous-sales">Previous Sales</Label>
              <Input
                id="previous-sales"
                type="number"
                min="0"
                value={predictionData.previous_sales || ""}
                onChange={(e) =>
                  setPredictionData({
                    ...predictionData,
                    previous_sales: parseInt(e.target.value) || 0,
                  })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="file-upload">Upload Historical Data (Optional)</Label>
              <Input
                id="file-upload"
                type="file"
                onChange={() => handleFileUpload()}
              />
            </div>
          </div>

          <Button
            onClick={handleGeneratePrediction}
            className="w-full"
            disabled={loading}
          >
            {loading ? "Generating..." : "Generate Prediction"}
          </Button>

          {predictionResult && (
            <div className="mt-6 p-4 bg-primary/10 border border-primary/20 rounded-lg">
              <h4 className="font-medium text-primary mb-1">Prediction Results</h4>
              <p className="text-foreground">{predictionResult}</p>
            </div>
          )}
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-card rounded-lg border shadow-sm">
        <div className="p-6 border-b">
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
            <h2 className="text-xl font-semibold">Product Inventory</h2>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="pl-10"
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Product Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Units</TableHead>
                <TableHead>Reorder Level</TableHead>
                <TableHead className="text-right">Created At</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.length > 0 ? (
                filteredProducts.map((product) => (
                  <TableRow key={product.product_id}>
                    <TableCell className="font-medium">
                      {product.product_id}
                    </TableCell>
                    <TableCell>{product.product_name}</TableCell>
                    <TableCell>{product.category}</TableCell>
                    <TableCell>${product.price.toFixed(2)}</TableCell>
                    <TableCell>{product.units}</TableCell>
                    <TableCell>{product.reorder_level}</TableCell>
                    <TableCell className="text-right">
                      {new Date(product.created_at).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-4">
                    No products found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default Products;
