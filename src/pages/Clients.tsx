
import { useState } from "react";
import { ClientsHeader } from "@/components/clients/ClientsHeader";
import { StatsCards } from "@/components/clients/StatsCards";
import { ClientList } from "@/components/clients/ClientList";
import { MeetingListDialog } from "@/components/clients/MeetingListDialog";
import useAppStore from "@/store/appStore";

const Clients = () => {
  const { clients, deleteClient } = useAppStore();
  const [isMeetingListOpen, setIsMeetingListOpen] = useState(false);

  const handleMeetingsClick = () => {
    setIsMeetingListOpen(true);
  };

  return (
    <div className="space-y-8 animate-fade-in smooth-scroll">
      <ClientsHeader />
      <StatsCards clients={clients} onMeetingsClick={handleMeetingsClick} />
      <ClientList 
        clients={clients} 
        onDeleteClient={deleteClient}
      />
      <MeetingListDialog 
        open={isMeetingListOpen}
        onOpenChange={setIsMeetingListOpen}
      />
    </div>
  );
};

export default Clients;
