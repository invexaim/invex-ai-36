
import { useState } from "react";
import { Link } from "react-router-dom";
import { RefreshCw, Search, Trash2, Users, Plus, Eye } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Client } from "@/types";

interface ClientListProps {
  clients: Client[];
  onDeleteClient: (id: number) => void;
  onAddClientClick: () => void;
}

export const ClientList = ({ clients, onDeleteClient, onAddClientClick }: ClientListProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const filteredClients = clients.filter((client) =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRecentPurchases = (client: Client) => {
    if (!client.purchaseHistory || client.purchaseHistory.length === 0) {
      return "No purchases yet";
    }
    
    const recent = client.purchaseHistory.slice(0, 3);
    return recent.map(p => `${p.quantity}x ${p.productName}`).join(", ");
  };

  return (
    <div className="bg-card rounded-lg border shadow-sm">
      <div className="p-6 border-b flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <h2 className="text-xl font-semibold flex items-center">
          Client List
          <Button variant="ghost" size="sm" className="ml-2 text-muted-foreground">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </h2>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-grow sm:w-64">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search clients..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="pl-10"
            />
          </div>
          <select 
            className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
          >
            <option>All Status</option>
            <option>Active</option>
            <option>Inactive</option>
          </select>
        </div>
      </div>

      {clients.length > 0 ? (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Purchases</TableHead>
                <TableHead>Total Spent</TableHead>
                <TableHead>Recent Products</TableHead>
                <TableHead>Last Purchase</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredClients.length > 0 ? (
                filteredClients.map((client) => (
                  <TableRow key={client.id}>
                    <TableCell className="font-medium">
                      <Link 
                        to={`/clients/${client.id}`}
                        className="hover:text-primary hover:underline transition-colors"
                      >
                        {client.name}
                      </Link>
                    </TableCell>
                    <TableCell>{client.email}</TableCell>
                    <TableCell>{client.phone}</TableCell>
                    <TableCell>{client.totalPurchases}</TableCell>
                    <TableCell>₹{client.totalSpent.toLocaleString()}</TableCell>
                    <TableCell className="max-w-xs">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="truncate text-sm text-muted-foreground cursor-help">
                              {getRecentPurchases(client)}
                            </div>
                          </TooltipTrigger>
                          <TooltipContent className="max-w-sm">
                            <div className="space-y-1">
                              <p className="font-semibold">Purchase History:</p>
                              {client.purchaseHistory && client.purchaseHistory.length > 0 ? (
                                client.purchaseHistory.slice(0, 5).map((purchase, index) => (
                                  <div key={index} className="text-xs">
                                    <span className="font-medium">{purchase.quantity}x {purchase.productName}</span>
                                    <span className="text-muted-foreground ml-2">
                                      ₹{purchase.amount} - {new Date(purchase.purchaseDate).toLocaleDateString()}
                                    </span>
                                  </div>
                                ))
                              ) : (
                                <p className="text-xs text-muted-foreground">No purchases yet</p>
                              )}
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </TableCell>
                    <TableCell>
                      {new Date(client.lastPurchase).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Link to={`/clients/${client.id}`}>
                          <Button variant="ghost" size="icon" className="text-muted-foreground">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onDeleteClient(client.id)}
                          className="text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-4">
                    No clients found matching your search.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center smooth-scroll">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
            <Users className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold">No Clients Yet</h3>
          <p className="text-muted-foreground mt-1 mb-6">Add your first client to get started</p>
          <Button onClick={onAddClientClick}>
            <Plus className="mr-2 h-4 w-4" /> Add Your First Client
          </Button>
        </div>
      )}
    </div>
  );
};
