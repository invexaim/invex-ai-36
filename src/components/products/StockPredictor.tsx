
import { useState } from "react";
import { Calendar, Package, FileUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Product } from "@/types";
import { toast } from "sonner";

interface StockPredictorProps {
  products: Product[];
}

export const StockPredictor = ({ products }: StockPredictorProps) => {
  const [predictionData, setPredictionData] = useState({
    date: "",
    product_id: 0,
    current_stock: 0,
    previous_sales: 0,
    price: 0,
  });
  const [predictionResult, setPredictionResult] = useState<string | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<boolean>(false);
  const [loading, setLoading] = useState(false);

  const handleFileUpload = () => {
    setLoading(true);
    setTimeout(() => {
      setAiAnalysis(true);
      setLoading(false);
      toast.success("File uploaded successfully", {
        description: "Your product data has been processed and analyzed",
      });
    }, 1500);
  };

  const handleGeneratePrediction = () => {
    // Mock prediction logic
    setLoading(true);
    setTimeout(() => {
      setPredictionResult(
        "Based on historical data and current trends, we predict sales of 12 units in the next 30 days. Consider stocking at least 15 units to maintain optimal inventory levels."
      );
      setAiAnalysis(true);
      setLoading(false);
      toast.success("Prediction generated", {
        description: "AI has analyzed your data and provided predictions",
      });
    }, 1500);
  };

  return (
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
            <div className="relative">
              <Input
                id="file-upload"
                type="file"
                onChange={() => handleFileUpload()}
                className="pl-10"
              />
              <FileUp className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            </div>
          </div>
        </div>

        <Button
          onClick={handleGeneratePrediction}
          className="w-full"
          disabled={loading}
        >
          {loading ? "Generating..." : "Generate Prediction"}
        </Button>

        {predictionResult && !aiAnalysis && (
          <div className="mt-6 p-4 bg-primary/10 border border-primary/20 rounded-lg">
            <h4 className="font-medium text-primary mb-1">Prediction Results</h4>
            <p className="text-foreground">{predictionResult}</p>
          </div>
        )}

        {aiAnalysis && (
          <div className="mt-6 p-4 bg-muted rounded-lg">
            <h4 className="font-medium text-lg mb-3">AI Analysis</h4>
            <div className="font-mono text-sm whitespace-pre-line">
              Advanced AI Analysis (99% confidence):
              
              1. Demand Forecast:
              - Predicted demand range: 38 - 46 units
              - Most likely demand: 42 units
              - Confidence interval: ±8%
              
              2. Market Insights:
              - Seasonal trend: Strong upward (15.3% growth)
              - Market sentiment: Very positive
              - Competition impact: 2.5% market pressure
              
              3. Pricing Strategy:
              - Current price: $500.00
              - Optimal price point: $570.58
              - Price elasticity: 1.03
              
              4. Inventory Optimization:
              - Recommended safety stock: 8 units
              - Optimal reorder point: 12 units
              - Inventory turnover rate: 5.5x per year
              
              5. Growth Indicators:
              - YoY growth potential: 12.1%
              - Market penetration: Strong
              - Economic multiplier: 1.08
              
              6. Action Items:
              - Restock before: 3/14/2025
              - Review pricing: 3/9/2025
              - Next analysis: 4/1/2025
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
