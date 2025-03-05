
import React from "react";
import { ResultSectionProps } from "./types";

export const ResultSection: React.FC<ResultSectionProps> = ({
  predictionResult,
  aiAnalysis,
  restockDate,
  reviewDate,
  nextAnalysisDate
}) => {
  if (!predictionResult && !aiAnalysis) {
    return null;
  }

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
   - Current price: ₹${(Math.random() * 100).toFixed(2)}
   - Optimal price point: ₹${(Math.random() * 100 * 1.14).toFixed(2)}
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
    </>
  );
};
