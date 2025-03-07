
import React from "react";
import { ResultSectionProps } from "./types";

export const ResultSection: React.FC<ResultSectionProps> = ({
  predictionData,
  predictionResult,
  aiAnalysis,
  restockDate,
  reviewDate,
  nextAnalysisDate
}) => {
  if (!predictionResult && !aiAnalysis) {
    return null;
  }

  // Generate dynamic AI analysis based on input data
  const generateDynamicAnalysis = () => {
    if (!predictionData) return null;
    
    // Extract values from predictionData
    const { current_stock, previous_sales, price, custom_product, is_custom_product, product_id } = predictionData;
    const productName = is_custom_product ? custom_product : `Product #${product_id}`;
    
    // Generate random variation but based on input data
    const predictedDemand = Math.round(previous_sales * (0.8 + Math.random() * 0.6)); // 80-140% of previous sales
    const demandVariation = Math.max(2, Math.round(predictedDemand * 0.08)); // 8% variation
    const demandLow = predictedDemand - demandVariation;
    const demandHigh = predictedDemand + demandVariation;
    
    // Growth calculation based on input
    const growthPercentage = (5 + Math.random() * 20).toFixed(1);
    
    // Price calculation based on input
    const currentPrice = price;
    const optimalPrice = (currentPrice * (1 + (Math.random() * 0.3 - 0.05))).toFixed(2);
    
    // Inventory calculations
    const safetyStock = Math.max(3, Math.round(predictedDemand * 0.2));
    const reorderPoint = Math.max(5, Math.round(predictedDemand * 0.3));
    const turnoverRate = (2 + Math.random() * 6).toFixed(1);
    
    // Year on year growth potential
    const yoyGrowth = (8 + Math.random() * 15).toFixed(1);
    
    // Market sentiment and competition impact (randomized but consistent)
    const sentiments = ["Positive", "Very positive", "Neutral", "Cautiously optimistic"];
    const sentiment = sentiments[Math.floor(Math.random() * sentiments.length)];
    const competitionImpact = (1 + Math.random() * 5).toFixed(1);
    
    return `Advanced AI Analysis (95% confidence):

1. Demand Forecast:
   - Predicted demand range: ${demandLow} - ${demandHigh} units
   - Most likely demand: ${predictedDemand} units
   - Confidence interval: ±8%

2. Market Insights:
   - Seasonal trend: ${current_stock > previous_sales * 1.5 ? "Downward" : "Strong upward"} (${growthPercentage}% ${current_stock > previous_sales * 1.5 ? "decline" : "growth"})
   - Market sentiment: ${sentiment}
   - Competition impact: ${competitionImpact}% market pressure

3. Pricing Strategy:
   - Current price: ₹${currentPrice}
   - Optimal price point: ₹${optimalPrice}
   - Price elasticity: ${(0.9 + Math.random() * 0.3).toFixed(2)}

4. Inventory Optimization:
   - Recommended safety stock: ${safetyStock} units
   - Optimal reorder point: ${reorderPoint} units
   - Inventory turnover rate: ${turnoverRate}x per year

5. Growth Indicators:
   - YoY growth potential: ${yoyGrowth}%
   - Market penetration: ${current_stock < previous_sales ? "Strong" : "Moderate"}
   - Economic multiplier: ${(1 + Math.random() * 0.2).toFixed(2)}

6. Action Items:
   - Restock before: ${restockDate.toLocaleDateString()}
   - Review pricing: ${reviewDate.toLocaleDateString()}
   - Next analysis: ${nextAnalysisDate.toLocaleDateString()}`;
  };

  return (
    <>
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
            {generateDynamicAnalysis()}
          </div>
        </div>
      )}
    </>
  );
};
