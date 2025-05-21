
import { useState, useEffect } from "react";
import { ClientsHeader } from "@/components/clients/ClientsHeader";
import { StatsCards } from "@/components/clients/StatsCards";
import { ClientList } from "@/components/clients/ClientList";
import { AddClientDialog } from "@/components/clients/AddClientDialog";
import useAppStore from "@/store/appStore";
import usePersistData from "@/hooks/usePersistData";

const Clients = () => {
  // Use the persist data hook to ensure data is saved during navigation
  usePersistData();
  
  const { clients, addClient, deleteClient, saveDataToSupabase } = useAppStore();
  const [isAddClientOpen, setIsAddClientOpen] = useState(false);

  const handleAddClientClick = () => {
    setIsAddClientOpen(true);
  };

  const handleAddClient = (clientData) => {
    addClient(clientData);
    
    // Explicitly save data after adding a client
    saveDataToSupabase().catch(err => 
      console.error("Error saving after adding client:", err)
    );
  };

  const handleDeleteClient = (clientId) => {
    deleteClient(clientId);
    
    // Explicitly save data after deleting a client
    saveDataToSupabase().catch(err => 
      console.error("Error saving after client deletion:", err)
    );
  };

  return (
    <div className="space-y-8 animate-fade-in smooth-scroll">
      <ClientsHeader onAddClientClick={handleAddClientClick} />
      <StatsCards clients={clients} />
      <ClientList 
        clients={clients} 
        onDeleteClient={handleDeleteClient}
        onAddClientClick={handleAddClientClick}
      />
      <AddClientDialog 
        isOpen={isAddClientOpen}
        onOpenChange={setIsAddClientOpen}
        onAddClient={handleAddClient}
      />
    </div>
  );
};

export default Clients;
