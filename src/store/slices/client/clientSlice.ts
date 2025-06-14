
import { create } from 'zustand';
import { Client } from '@/types';
import { toast } from 'sonner';
import { ClientState } from './types';
import { createNewClient } from './utils';
import { updateClientPurchaseOperation, recalculateClientTotalsOperation } from './operations';

export const createClientSlice = (set: any, get: any) => ({
  clients: [],
  processedTransactions: new Set<string>(),
  
  setClients: (clients: Client[]) => {
    console.log("CLIENT SET: Setting clients:", clients.length);
    set({ clients });
  },
  
  addClient: (clientData) => set((state: ClientState) => {
    const newClient = createNewClient(clientData, state.clients);
    
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
  
  updateClientPurchase: (clientName, amount, productName, quantity, transactionId) => set((state: ClientState) => 
    updateClientPurchaseOperation(state, clientName, amount, productName, quantity, transactionId)
  ),
  
  recalculateClientTotals: (clientId) => set((state: ClientState) => 
    recalculateClientTotalsOperation(state, clientId)
  ),
  
  clearProcessedTransactions: () => {
    console.log("CLIENT CLEAR: Clearing all processed transactions");
    set({ processedTransactions: new Set() });
  }
});

export const useClientStore = create<ClientState>((set, get) => 
  createClientSlice(set, get)
);
