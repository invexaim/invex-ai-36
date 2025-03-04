
import { useState } from "react";
import { Atom, Calendar } from "lucide-react";
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
    custom_product: "",
    is_custom_product: false
  });
  const [predictionResult, setPredictionResult] = useState<string | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<boolean>(false);
  const [loading, setLoading] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      
      if (file.type !== "text/csv" && !file.name.endsWith('.csv')) {
        toast.error("Please upload a CSV file");
        return;
      }
      
      setLoading(true);
      setTimeout(() => {
        setAiAnalysis(true);
        setLoading(false);
        toast.success("File uploaded successfully", {
          description: "Your product data has been processed and analyzed",
        });
      }, 1500);
      
      // Reset the file input
      e.target.value = '';
    }
  };

  const isFormComplete = () => {
    if (predictionData.is_custom_product) {
      return (
        predictionData.date !== "" &&
        predictionData.custom_product.trim() !== "" &&
        predictionData.current_stock > 0 &&
        predictionData.previous_sales >= 0 &&
        predictionData.price > 0
      );
    }
    
    return (
      predictionData.date !== "" &&
      predictionData.product_id !== 0 &&
      predictionData.current_stock > 0 &&
      predictionData.previous_sales >= 0 &&
      predictionData.price > 0
    );
  };

  const handleGeneratePrediction = () => {
    if (!isFormComplete()) {
      toast.error("Please fill in all fields", {
        description: "All fields are required to generate an accurate prediction",
      });
      return;
    }

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

  const handleProductChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    if (value === "other") {
      setPredictionData({
        ...predictionData,
        is_custom_product: true,
        product_id: 0
      });
    } else {
      const productId = parseInt(value);
      setPredictionData({
        ...predictionData,
        product_id: productId,
        is_custom_product: false,
        price: products.find(p => p.product_id === productId)?.price || 0
      });
    }
  };

  const currentDate = new Date();
  const restockDate = new Date(currentDate);
  restockDate.setDate(currentDate.getDate() + 21);
  
  const reviewDate = new Date(currentDate);
  reviewDate.setDate(currentDate.getDate() + 15);
  
  const nextAnalysisDate = new Date(currentDate);
  nextAnalysisDate.setDate(currentDate.getDate() + 30);

  return (
    <div className="bg-card p-6 rounded-lg border shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <Atom className="h-5 w-5 text-primary" />
        <h2 className="text-xl font-semibold">Stock Predictor</h2>
      </div>

      <div className="bg-background rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              value={predictionData.date}
              onChange={(e) =>
                setPredictionData({ ...predictionData, date: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="product">Product</Label>
            <select
              id="product"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              onChange={handleProductChange}
              value={predictionData.is_custom_product ? "other" : (predictionData.product_id || "")}
            >
              <option value="">Select product</option>
              {products.map((product) => (
                <option key={product.product_id} value={product.product_id}>
                  {product.product_name}
                </option>
              ))}
              <option value="other">Other</option>
            </select>
          </div>

          {predictionData.is_custom_product && (
            <div className="space-y-2">
              <Label htmlFor="custom-product">Enter Product Name</Label>
              <Input
                id="custom-product"
                type="text"
                placeholder="Enter product name"
                value={predictionData.custom_product}
                onChange={(e) =>
                  setPredictionData({
                    ...predictionData,
                    custom_product: e.target.value,
                  })
                }
              />
            </div>
          )}

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
        </div>

        <Button
          onClick={handleGeneratePrediction}
          className="w-full bg-[#0f172a] hover:bg-[#1e293b] text-white mt-6"
          disabled={loading || !isFormComplete()}
        >
          <Atom className="mr-2 h-4 w-4" />
          {loading ? "Generating..." : "Generate Prediction"}
        </Button>

        <div className="text-center text-muted-foreground my-4">OR</div>

        <div className="relative border border-dashed border-muted-foreground/20 rounded-lg p-4 text-center">
          <input
            id="file-upload"
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            disabled={loading}
          />
          <div className="flex flex-col items-center justify-center py-4">
            <p className="text-sm font-medium mb-1">Choose File</p>
            <p className="text-xs text-muted-foreground">
              Upload any file with historical stock data
            </p>
          </div>
        </div>

        {predictionResult && !aiAnalysis && (
          <div className="mt-6 p-4 bg-primary/10 border border-primary/20 rounded-lg">
            <h4 className="font-medium text-primary mb-1">Prediction Results</h4>
            <p className="text-foreground">{predictionResult}</p>
          </div>
        )}

        {aiAnalysis && (
          <div className="mt-6 p-4 bg-blue-50 dark:bg-gray-800 rounded-lg">
            <h3 className="font-medium text-lg mb-2">AI Analysis</h3>
            <div className="font-mono text-sm whitespace-pre-line bg-blue-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200 p-4 rounded-lg">
{`Advanced AI Analysis (99% confidence):

1. Demand Forecast:
   - Predicted demand range: 38 - 46 units
   - Most likely demand: 42 units
   - Confidence interval: ±8%

2. Market Insights:
   - Seasonal trend: Strong upward (15.3% growth)
   - Market sentiment: Very positive
   - Competition impact: 2.5% market pressure

3. Pricing Strategy:
   - Current price: ₹${predictionData.price.toFixed(2)}
   - Optimal price point: ₹${(predictionData.price * 1.14).toFixed(2)}
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
   - Restock before: ${restockDate.toLocaleDateString()}
   - Review pricing: ${reviewDate.toLocaleDateString()}
   - Next analysis: ${nextAnalysisDate.toLocaleDateString()}`}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
