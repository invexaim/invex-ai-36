
import { useState } from "react";
import { ClientsHeader } from "@/components/clients/ClientsHeader";
import { StatsCards } from "@/components/clients/StatsCards";
import { ClientList } from "@/components/clients/ClientList";
import { MeetingListDialog } from "@/components/clients/MeetingListDialog";
import useAppStore from "@/store/appStore";
import { useNavigate } from "react-router-dom";

const Clients = () => {
  const { clients, deleteClient } = useAppStore();
  const [isMeetingListOpen, setIsMeetingListOpen] = useState(false);
  const navigate = useNavigate();

  const handleMeetingsClick = () => {
    setIsMeetingListOpen(true);
  };

  const handleAddClientClick = () => {
    navigate("/clients/add");
  };

  return (
    <div className="space-y-8 animate-fade-in smooth-scroll">
      <ClientsHeader />
      <StatsCards clients={clients} onMeetingsClick={handleMeetingsClick} />
      <ClientList 
        clients={clients} 
        onDeleteClient={deleteClient}
        onAddClientClick={handleAddClientClick}
      />
      <MeetingListDialog 
        open={isMeetingListOpen}
        onOpenChange={setIsMeetingListOpen}
      />
    </div>
  );
};

export default Clients;
