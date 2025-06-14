
interface LoadingStateProps {
  hasProducts: boolean;
  hasRecordSale: boolean;
  isFromEstimate: boolean;
  hasPendingEstimate: boolean;
  isInitialized: boolean;
}

const LoadingState = ({
  hasProducts,
  hasRecordSale,
  isFromEstimate,
  hasPendingEstimate,
  isInitialized
}: LoadingStateProps) => {
  return (
    <div className="flex items-center justify-center py-8">
      <div className="text-center">
        <p className="text-muted-foreground">Preparing form...</p>
        {!hasProducts && (
          <p className="text-sm text-red-600 mt-2">No products available</p>
        )}
        {!hasRecordSale && (
          <p className="text-sm text-red-600 mt-2">Sales system not ready</p>
        )}
        {isFromEstimate && !hasPendingEstimate && (
          <p className="text-sm text-red-600 mt-2">No estimate data available</p>
        )}
        {!isInitialized && (
          <p className="text-sm text-yellow-600 mt-2">Initializing form...</p>
        )}
      </div>
    </div>
  );
};

export default LoadingState;
