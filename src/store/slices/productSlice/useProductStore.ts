
import { create } from 'zustand';
import { ProductState } from '@/store/types';
import { createProductSlice } from './createProductSlice';

// Create a standalone store for direct usage if needed
const useProductStore = create<ProductState>((set, get) => 
  createProductSlice(set, get)
);

export default useProductStore;
