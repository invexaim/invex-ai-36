
import { create } from 'zustand';
import { Client } from '@/types';
import { toast } from 'sonner';
import { ClientState } from '../types';

export const createClientSlice = (set: any, get: any) => ({
  clients: [],
  processedTransactions: new Set<string>(), // Track processed transactions
  
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
      gstNumber: clientData.gstNumber,
      companyName: clientData.companyName,
      address: clientData.address,
      city: clientData.city,
      state: clientData.state,
      pincode: clientData.pincode,
    };
    
    console.log("CLIENT ADD: Adding new client:", newClient.name);
    toast.success("Client added successfully");
    return { clients: [...state.clients, newClient] };
  }),
  
  deleteClient: (clientId) => set((state: ClientState) => {
    console.log("CLIENT DELETE: Deleting client:", clientId);
    toast.success("Client deleted successfully");
    return { clients: state.clients.filter(client => client.id !== clientId) };
  }),
  
  removeClient: (clientId) => set((state: ClientState) => {
    console.log("CLIENT REMOVE: Removing client:", clientId);
    toast.success("Client deleted successfully");
    return { clients: state.clients.filter(client => client.id !== clientId) };
  }),
  
  // This is the ONLY function that should update client purchase data
  updateClientPurchase: (clientName, amount, productName, quantity, transactionId) => set((state: ClientState) => {
    // Generate transaction ID if not provided
    const txId = transactionId || `${clientName}-${productName}-${quantity}-${amount}-${Date.now()}`;
    
    console.log("CLIENT UPDATE: Processing transaction:", { 
      txId, 
      clientName, 
      amount, 
      productName, 
      quantity,
      alreadyProcessed: state.processedTransactions?.has(txId)
    });
    
    // Skip if no client name
    if (!clientName || !clientName.trim()) {
      console.log("CLIENT UPDATE: Skipping - no client name provided");
      return { clients: state.clients };
    }
    
    // Check if this transaction has already been processed
    if (state.processedTransactions?.has(txId)) {
      console.log("CLIENT UPDATE: Skipping - transaction already processed:", txId);
      return { clients: state.clients };
    }
    
    // Check if the client exists
    const clientExists = state.clients.some(client => client.name === clientName);
    
    if (!clientExists) {
      console.log("CLIENT UPDATE: Skipping - client does not exist:", clientName);
      return { clients: state.clients };
    }
    
    console.log("CLIENT UPDATE: Processing purchase update:", { clientName, amount, productName, quantity, txId });
    
    // Update the client
    const updatedClients = state.clients.map(client => {
      if (client.name === clientName) {
        const newPurchase = {
          productName,
          quantity,
          amount,
          purchaseDate: new Date().toISOString(),
          transactionId: txId, // Add transaction ID to purchase history
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
    
    // Mark transaction as processed
    const newProcessedTransactions = new Set(state.processedTransactions || []);
    newProcessedTransactions.add(txId);
    
    return { 
      clients: updatedClients,
      processedTransactions: newProcessedTransactions
    };
  }),
  
  // Utility function to recalculate client totals from purchase history
  recalculateClientTotals: (clientId) => set((state: ClientState) => {
    console.log("CLIENT RECALCULATE: Recalculating totals for client:", clientId);
    
    const updatedClients = state.clients.map(client => {
      if (client.id === clientId) {
        const totalPurchases = (client.purchaseHistory || []).reduce((sum, purchase) => sum + purchase.quantity, 0);
        const totalSpent = (client.purchaseHistory || []).reduce((sum, purchase) => sum + purchase.amount, 0);
        
        console.log("CLIENT RECALCULATE: New totals:", { totalPurchases, totalSpent });
        
        return {
          ...client,
          totalPurchases,
          totalSpent
        };
      }
      return client;
    });
    
    return { clients: updatedClients };
  }),
  
  // Clear processed transactions (useful for debugging)
  clearProcessedTransactions: () => set({ processedTransactions: new Set() })
});

export const useClientStore = create<ClientState>((set, get) => 
  createClientSlice(set, get)
);

export default useClientStore;
