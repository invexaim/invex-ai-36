
import { create } from 'zustand';
import { ProductState } from './types';
import { createBasicOperations } from './basicOperations';
import { createInventoryOperations } from './inventoryOperations';
import { createCsvImportOperation } from './csvImport';

export const createProductSlice = (set: any, get: any) => {
  // Combine all operations
  return {
    ...createBasicOperations(set, get),
    ...createInventoryOperations(set, get),
    ...createCsvImportOperation(set, get),
  };
};

// Create a standalone store for direct usage if needed
const useProductStore = create<ProductState>((set, get) => 
  createProductSlice(set, get)
);

export default useProductStore;
