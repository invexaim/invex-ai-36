
import { useState } from "react";
import { ClientsHeader } from "@/components/clients/ClientsHeader";
import { StatsCards } from "@/components/clients/StatsCards";
import { ClientList } from "@/components/clients/ClientList";
import { AddClientDialog } from "@/components/clients/AddClientDialog";
import useAppStore from "@/store/appStore";

const Clients = () => {
  const { clients, addClient, deleteClient } = useAppStore();
  const [isAddClientOpen, setIsAddClientOpen] = useState(false);

  const handleAddClientClick = () => {
    setIsAddClientOpen(true);
  };

  return (
    <div className="space-y-8 animate-fade-in smooth-scroll">
      <ClientsHeader onAddClientClick={handleAddClientClick} />
      <StatsCards clients={clients} />
      <ClientList 
        clients={clients} 
        onDeleteClient={deleteClient}
        onAddClientClick={handleAddClientClick}
      />
      <AddClientDialog 
        isOpen={isAddClientOpen}
        onOpenChange={setIsAddClientOpen}
        onAddClient={addClient}
      />
    </div>
  );
};

export default Clients;
