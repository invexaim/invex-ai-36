
import { NavigateFunction } from 'react-router-dom';

export const navigateToSalesFromEstimate = (
  navigate: NavigateFunction,
  estimateData: any
) => {
  // Navigate to sales with a flag indicating we're coming from estimate
  navigate('/sales?fromEstimate=true');
};

export const clearEstimateNavigationFlag = () => {
  // Clear the navigation flag from URL if present
  const url = new URL(window.location.href);
  if (url.searchParams.has('fromEstimate')) {
    url.searchParams.delete('fromEstimate');
    window.history.replaceState({}, '', url.toString());
  }
};
