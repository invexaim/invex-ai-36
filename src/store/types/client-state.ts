
import { Client } from '@/types';

export interface ClientState {
  clients: Client[];
  setClients: (clients: Client[]) => void;
  addClient: (client: Omit<Client, 'id' | 'totalPurchases' | 'totalSpent' | 'lastPurchase' | 'joinDate' | 'openInvoices'>) => void;
  updateClientPurchase: (clientName: string, amount: number) => void;
  deleteClient: (clientId: number) => void;
  removeClient: (clientId: number) => void;
}
