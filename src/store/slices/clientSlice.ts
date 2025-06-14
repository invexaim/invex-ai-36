import { create } from 'zustand';
import { Client } from '@/types';
import { toast } from 'sonner';
import { ClientState } from '../types';

export const createClientSlice = (set: any, get: any) => ({
  clients: [],
  processedTransactions: new Set<string>(), // Track processed transactions
  
  setClients: (clients: Client[]) => {
    console.log("CLIENT SET: Setting clients:", clients.length);
    set({ clients });
  },
  
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
  
  // ENHANCED: This is the ONLY function that should update client purchase data
  updateClientPurchase: (clientName, amount, productName, quantity, transactionId) => set((state: ClientState) => {
    // CRITICAL: Validate inputs first
    if (!clientName || !clientName.trim()) {
      console.log("CLIENT UPDATE: Skipping - no client name provided");
      return { clients: state.clients };
    }

    if (typeof amount !== 'number' || amount <= 0) {
      console.log("CLIENT UPDATE: Skipping - invalid amount:", amount);
      return { clients: state.clients };
    }

    if (typeof quantity !== 'number' || quantity <= 0) {
      console.log("CLIENT UPDATE: Skipping - invalid quantity:", quantity);
      return { clients: state.clients };
    }
    
    // Generate a robust transaction ID if not provided
    const txId = transactionId || `${clientName.trim()}-${productName}-${quantity}-${amount}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    console.log("CLIENT UPDATE: Processing transaction:", { 
      txId, 
      clientName: clientName.trim(), 
      amount, 
      productName, 
      quantity,
      alreadyProcessed: state.processedTransactions?.has(txId),
      processedCount: state.processedTransactions?.size || 0
    });
    
    // ENHANCED: Check if this transaction has already been processed
    if (state.processedTransactions?.has(txId)) {
      console.log("CLIENT UPDATE: DUPLICATE DETECTED - transaction already processed:", txId);
      return { clients: state.clients };
    }
    
    // Check if the client exists
    const clientExists = state.clients.some(client => client.name.trim() === clientName.trim());
    
    if (!clientExists) {
      console.log("CLIENT UPDATE: Skipping - client does not exist:", clientName.trim());
      console.log("CLIENT UPDATE: Available clients:", state.clients.map(c => c.name));
      return { clients: state.clients };
    }
    
    console.log("CLIENT UPDATE: Processing purchase update:", { 
      clientName: clientName.trim(), 
      amount, 
      productName, 
      quantity, 
      txId 
    });
    
    // Update the client with enhanced validation
    const updatedClients = state.clients.map(client => {
      if (client.name.trim() === clientName.trim()) {
        const newPurchase = {
          productName: productName || "Unknown Product",
          quantity: Number(quantity),
          amount: Number(amount),
          purchaseDate: new Date().toISOString(),
          transactionId: txId, // Add transaction ID to purchase history
        };
        
        // ENHANCED: Validate existing totals before updating
        const currentTotalPurchases = Number(client.totalPurchases) || 0;
        const currentTotalSpent = Number(client.totalSpent) || 0;
        
        const updatedClient = {
          ...client,
          totalPurchases: currentTotalPurchases + Number(quantity),
          totalSpent: currentTotalSpent + Number(amount),
          lastPurchase: new Date().toISOString(),
          purchaseHistory: [newPurchase, ...(client.purchaseHistory || [])],
        };
        
        console.log("CLIENT UPDATE: Updated client data:", {
          name: updatedClient.name,
          oldTotalPurchases: currentTotalPurchases,
          newTotalPurchases: updatedClient.totalPurchases,
          oldTotalSpent: currentTotalSpent,
          newTotalSpent: updatedClient.totalSpent,
          newPurchase
        });
        
        return updatedClient;
      }
      return client;
    });
    
    // ENHANCED: Mark transaction as processed with size limit
    const newProcessedTransactions = new Set(state.processedTransactions || []);
    
    // Prevent memory buildup by keeping only recent transactions (last 1000)
    if (newProcessedTransactions.size > 1000) {
      console.log("CLIENT UPDATE: Clearing old processed transactions to prevent memory buildup");
      newProcessedTransactions.clear();
    }
    
    newProcessedTransactions.add(txId);
    
    console.log("CLIENT UPDATE: Transaction marked as processed. Total processed:", newProcessedTransactions.size);
    
    return { 
      clients: updatedClients,
      processedTransactions: newProcessedTransactions
    };
  }),
  
  // ENHANCED: Utility function to recalculate client totals from purchase history
  recalculateClientTotals: (clientId) => set((state: ClientState) => {
    console.log("CLIENT RECALCULATE: Recalculating totals for client:", clientId);
    
    const updatedClients = state.clients.map(client => {
      if (client.id === clientId) {
        // ENHANCED: Validate purchase history before calculation
        const validPurchases = (client.purchaseHistory || []).filter(purchase => 
          purchase && 
          typeof purchase.quantity === 'number' && 
          typeof purchase.amount === 'number' &&
          purchase.quantity > 0 &&
          purchase.amount >= 0
        );
        
        const totalPurchases = validPurchases.reduce((sum, purchase) => sum + purchase.quantity, 0);
        const totalSpent = validPurchases.reduce((sum, purchase) => sum + purchase.amount, 0);
        
        console.log("CLIENT RECALCULATE: New totals:", { 
          clientId,
          validPurchasesCount: validPurchases.length,
          totalPurchases, 
          totalSpent 
        });
        
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
  
  // ENHANCED: Clear processed transactions with logging
  clearProcessedTransactions: () => {
    console.log("CLIENT CLEAR: Clearing all processed transactions");
    set({ processedTransactions: new Set() });
  }
});

export const useClientStore = create<ClientState>((set, get) => 
  createClientSlice(set, get)
);

export default useClientStore;
