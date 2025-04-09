
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormSectionProps } from "./types";
import { subDays, addDays, format } from "date-fns";

export const PredictionForm: React.FC<FormSectionProps> = ({
  predictionData,
  setPredictionData,
  products,
}) => {
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

  // Get current date in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0];
  
  // Get dates for past 30 days and future 30 days for analysis flexibility
  const thirtyDaysAgo = format(subDays(new Date(), 30), 'yyyy-MM-dd');
  const thirtyDaysFromNow = format(addDays(new Date(), 30), 'yyyy-MM-dd');

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-2">
        <Label htmlFor="date">Analysis Date</Label>
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

      <div className="space-y-2">
        <Label htmlFor="start_date">Prediction Start Date</Label>
        <Input
          id="start_date"
          type="date"
          value={predictionData.start_date || today}
          min={thirtyDaysAgo} 
          max={thirtyDaysFromNow}
          onChange={(e) =>
            setPredictionData({ 
              ...predictionData, 
              start_date: e.target.value 
            })
          }
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="end_date">Prediction End Date</Label>
        <Input
          id="end_date"
          type="date"
          value={predictionData.end_date || thirtyDaysFromNow}
          min={predictionData.start_date || today}
          max={format(addDays(new Date(), 90), 'yyyy-MM-dd')} // Allow up to 90 days in the future
          onChange={(e) =>
            setPredictionData({ 
              ...predictionData, 
              end_date: e.target.value 
            })
          }
        />
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
  );
};
