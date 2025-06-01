
import { create } from 'zustand';
import { toast } from 'sonner';

interface CompanyState {
  companyName: string;
  setCompanyName: (name: string) => void;
}

export const createCompanySlice = (set: any, get: any) => ({
  companyName: localStorage.getItem('companyName') || '',
  
  setCompanyName: (name: string) => {
    localStorage.setItem('companyName', name);
    set({ companyName: name });
    toast.success("Company name saved successfully");
  }
});

export const useCompanyStore = create<CompanyState>((set, get) => 
  createCompanySlice(set, get)
);

export default useCompanyStore;
