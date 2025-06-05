
import { create } from 'zustand';
import { Client } from '@/types';
import { toast } from 'sonner';
import { ClientState } from '../types';

export const createClientSlice = (set: any, get: any) => ({
  clients: [],
  
  setClients: (clients: Client[]) => set({ clients }),
  
  addClient: (clientData) => set((state: ClientState) => {
    const newClient: Client = {
      id: state.clients.length > 0 ? Math.max(...state.clients.map(c => c.id)) + 1 : 1,
      name: clientData.name,
      email: clientData.email,
      phone: clientData.phone,
      totalPurchases: 0,
      totalSpent: 0,
      lastPurchase: new Date().toISOString(),
      joinDate: clientData.joinDate || new Date().toISOString(),
      openInvoices: clientData.openInvoices || 0,
      purchaseHistory: [],
    };
    
    toast.success("Client added successfully");
    return { clients: [...state.clients, newClient] };
  }),
  
  deleteClient: (clientId) => set((state: ClientState) => {
    toast.success("Client deleted successfully");
    return { clients: state.clients.filter(client => client.id !== clientId) };
  }),
  
  removeClient: (clientId) => set((state: ClientState) => {
    toast.success("Client deleted successfully");
    return { clients: state.clients.filter(client => client.id !== clientId) };
  }),
  
  // This is the ONLY function that should update client purchase data
  updateClientPurchase: (clientName, amount, productName, quantity) => set((state: ClientState) => {
    // Skip if no client name
    if (!clientName || !clientName.trim()) {
      console.log("CLIENT UPDATE: Skipping - no client name provided");
      return { clients: state.clients };
    }
    
    // Check if the client exists
    const clientExists = state.clients.some(client => client.name === clientName);
    
    if (!clientExists) {
      console.log("CLIENT UPDATE: Skipping - client does not exist:", clientName);
      return { clients: state.clients };
    }
    
    console.log("CLIENT UPDATE: Processing purchase update:", { clientName, amount, productName, quantity });
    
    // Update the client
    const updatedClients = state.clients.map(client => {
      if (client.name === clientName) {
        const newPurchase = {
          productName,
          quantity,
          amount,
          purchaseDate: new Date().toISOString(),
        };
        
        const updatedClient = {
          ...client,
          totalPurchases: client.totalPurchases + quantity,
          totalSpent: client.totalSpent + amount,
          lastPurchase: new Date().toISOString(),
          purchaseHistory: [newPurchase, ...(client.purchaseHistory || [])],
        };
        
        console.log("CLIENT UPDATE: Updated client data:", {
          name: updatedClient.name,
          totalPurchases: updatedClient.totalPurchases,
          totalSpent: updatedClient.totalSpent,
          newPurchase
        });
        return updatedClient;
      }
      return client;
    });
    
    return { clients: updatedClients };
  })
});

export const useClientStore = create<ClientState>((set, get) => 
  createClientSlice(set, get)
);

export default useClientStore;
